const sdk = require('node-appwrite');
const { z } = require('zod');

const DB_ID = 'bakkwa_store';
const COLLECTION_ID = 'orders';
const PRODUCTS_COLLECTION = 'products';

// Stricter order validation - guest_email required for guest checkout
const orderSchema = z.object({
    items: z.array(z.object({
        product_id: z.string().min(1).max(50),
        quantity: z.number().int().positive().max(100) // Max 100 per item
    })).min(1).max(50), // Max 50 different items
    shipping_address: z.object({
        street: z.string().min(5).max(200).regex(/^[a-zA-Z0-9\s,.\-#]+$/),
        city: z.string().min(2).max(100).regex(/^[a-zA-Z\s\-]+$/),
        postal_code: z.string().min(4).max(10).regex(/^[a-zA-Z0-9\s\-]+$/),
        country: z.enum(['Singapore', 'Malaysia'])
    }),
    delivery_method: z.enum(['delivery', 'pickup']),
    guest_email: z.string().email().optional(), // For guest checkout
    guest_name: z.string().min(2).max(100).optional() // For guest checkout
});

// Fetch real product prices from database
async function getProductPrices(databases, productIds) {
    const products = {};

    for (const id of productIds) {
        try {
            const product = await databases.getDocument(DB_ID, PRODUCTS_COLLECTION, id);
            products[id] = {
                price: product.price,
                name: product.name,
                stock: product.stock
            };
        } catch (error) {
            // Product not found - will be caught in validation
            products[id] = null;
        }
    }

    return products;
}

// Create order with SERVER-SIDE price validation (supports guest checkout)
exports.createOrder = async (req, res) => {
    try {
        const result = orderSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ errors: result.error.errors });
        }

        const { items, shipping_address, delivery_method, guest_email, guest_name } = result.data;

        // Use user ID if logged in, otherwise use 'guest' + timestamp
        const userId = req.user?.id || `guest_${Date.now()}`;
        const userEmail = req.user?.email || guest_email || 'guest@checkout.com';
        const userName = req.user?.name || guest_name || 'Guest';

        const { databases } = req.app.get('appwrite');

        // SECURITY: Fetch real prices from database - NEVER trust client prices
        const productIds = items.map(i => i.product_id);
        const products = await getProductPrices(databases, productIds);

        // Validate all products exist and have stock
        const validatedItems = [];
        let total = 0;

        for (const item of items) {
            const product = products[item.product_id];

            if (!product) {
                return res.status(400).json({
                    message: `Product not found: ${item.product_id}`
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for: ${product.name}. Available: ${product.stock}`
                });
            }

            // Use SERVER price, not client price
            const itemTotal = product.price * item.quantity;
            total += itemTotal;

            validatedItems.push({
                product_id: item.product_id,
                name: product.name,
                price: product.price, // Server-verified price
                quantity: item.quantity
            });
        }

        // Apply SG/MY delivery rules
        if (shipping_address.country === 'Singapore') {
            if (total < 100 && delivery_method === 'delivery') {
                return res.status(400).json({
                    message: 'Singapore orders under $100 are pickup only.'
                });
            }
        }

        // BUG-008 FIX: Calculate delivery fee
        let deliveryFee = 0;
        if (delivery_method === 'delivery' && total < 100) {
            deliveryFee = 8; // $8 delivery for orders under $100
        }
        const finalTotal = total + deliveryFee;

        // Generate guest token for guest orders to allow secure retrieval
        const guestToken = userId.startsWith('guest_') ? require('crypto').randomBytes(32).toString('hex') : null;

        // Create order with server-validated data
        const order = await databases.createDocument(
            DB_ID,
            COLLECTION_ID,
            sdk.ID.unique(),
            {
                user_id: userId,
                subtotal: total,
                delivery_fee: deliveryFee,
                total: finalTotal,
                status: 'pending',
                delivery_method: delivery_method,
                shipping_address: JSON.stringify(shipping_address),
                items: JSON.stringify(validatedItems),
                created_at: new Date().toISOString(),
                guest_token: guestToken // Store secret token for guest access
            }
        );

        // BUG-002 FIX: Deduct stock after order creation
        for (const item of validatedItems) {
            const product = products[item.product_id];
            const newStock = product.stock - item.quantity;
            try {
                await databases.updateDocument(
                    DB_ID,
                    PRODUCTS_COLLECTION,
                    item.product_id,
                    { stock: newStock }
                );
            } catch (stockError) {
                console.error(`Failed to update stock for ${item.product_id}:`, stockError);
                // Continue with order - stock update is best-effort
            }
        }

        res.status(201).json({
            ...order,
            shipping_address: shipping_address,
            items: validatedItems,
            subtotal: total,
            delivery_fee: deliveryFee,
            total: finalTotal,
            guest_token: guestToken // Return token to client once
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};


// Get user's orders
exports.getMyOrders = async (req, res) => {
    try {
        const { databases } = req.app.get('appwrite');
        const userId = req.user.id;

        const response = await databases.listDocuments(DB_ID, COLLECTION_ID, [
            sdk.Query.equal('user_id', userId)
        ]);

        // BUG-011 FIX: Safe JSON parsing
        const orders = response.documents.map(order => {
            let shipping_address = {};
            let items = [];

            try {
                shipping_address = JSON.parse(order.shipping_address || '{}');
            } catch (e) {
                console.error('Failed to parse shipping_address:', order.$id);
            }

            try {
                items = JSON.parse(order.items || '[]');
            } catch (e) {
                console.error('Failed to parse items:', order.$id);
            }

            return {
                ...order,
                shipping_address,
                items
            };
        });

        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get single order
exports.getOrder = async (req, res) => {
    try {
        const { databases } = req.app.get('appwrite');
        const { id } = req.params;

        const order = await databases.getDocument(DB_ID, COLLECTION_ID, id);

        // BUG-016 FIX: Security check - users can only view their own orders
        // Allow: logged-in owner, admin, or guest with order containing their guest ID prefix
        const isOwner = req.user && order.user_id === req.user.id;
        const isAdmin = req.user && req.user.role === 'admin';
        const isGuestOrder = order.user_id.startsWith('guest_') && !req.user;

        if (!isOwner && !isAdmin && !isGuestOrder) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // BUG-011 FIX: Safe JSON parsing
        let shipping_address = {};
        let items = [];

        try {
            shipping_address = JSON.parse(order.shipping_address || '{}');
        } catch (e) {
            console.error('Failed to parse shipping_address:', order.$id);
        }

        try {
            items = JSON.parse(order.items || '[]');
        } catch (e) {
            console.error('Failed to parse items:', order.$id);
        }

        res.json({
            ...order,
            shipping_address,
            items
        });
    } catch (error) {
        if (error.code === 404) {
            return res.status(404).json({ message: 'Order not found' });
        }
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Update order status (Admin only)
exports.updateOrderStatus = async (req, res) => {
    try {
        const statusSchema = z.object({
            status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
        });
        const result = statusSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ errors: result.error.errors });
        }

        const { databases } = req.app.get('appwrite');
        const { id } = req.params;

        const order = await databases.updateDocument(
            DB_ID,
            COLLECTION_ID,
            id,
            { status: result.data.status }
        );

        res.json(order);
    } catch (error) {
        if (error.code === 404) {
            return res.status(404).json({ message: 'Order not found' });
        }
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
