const sdk = require('node-appwrite');
const { z } = require('zod');

const DB_ID = 'bakkwa_store';
const COLLECTION_ID = 'products';

const productSchema = z.object({
    name: z.string().min(1).max(255),
    price: z.number().positive(),
    category: z.string().min(1).max(100),
    stock: z.number().int().min(0),
    description: z.string().max(5000).optional(),
    images: z.array(z.string()).optional()
});

// Get all products (with optional filters)
exports.getProducts = async (req, res) => {
    try {
        const { databases } = req.app.get('appwrite');
        const { category, minPrice, maxPrice } = req.query;

        let queries = [];

        if (category) {
            queries.push(sdk.Query.equal('category', category));
        }
        if (minPrice) {
            queries.push(sdk.Query.greaterThanEqual('price', parseFloat(minPrice)));
        }
        if (maxPrice) {
            queries.push(sdk.Query.lessThanEqual('price', parseFloat(maxPrice)));
        }

        const response = await databases.listDocuments(DB_ID, COLLECTION_ID, queries);
        res.json(response.documents);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get single product
exports.getProduct = async (req, res) => {
    try {
        const { databases } = req.app.get('appwrite');
        const { id } = req.params;

        const product = await databases.getDocument(DB_ID, COLLECTION_ID, id);
        res.json(product);
    } catch (error) {
        if (error.code === 404) {
            return res.status(404).json({ message: 'Product not found' });
        }
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Create product (Admin only)
exports.createProduct = async (req, res) => {
    try {
        const result = productSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ errors: result.error.errors });
        }

        const { databases } = req.app.get('appwrite');
        const product = await databases.createDocument(
            DB_ID,
            COLLECTION_ID,
            sdk.ID.unique(),
            result.data
        );
        res.status(201).json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Update product (Admin only)
exports.updateProduct = async (req, res) => {
    try {
        const result = productSchema.partial().safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ errors: result.error.errors });
        }

        const { databases } = req.app.get('appwrite');
        const { id } = req.params;

        const product = await databases.updateDocument(
            DB_ID,
            COLLECTION_ID,
            id,
            result.data
        );
        res.json(product);
    } catch (error) {
        if (error.code === 404) {
            return res.status(404).json({ message: 'Product not found' });
        }
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Delete product (Admin only)
exports.deleteProduct = async (req, res) => {
    try {
        const { databases } = req.app.get('appwrite');
        const { id } = req.params;

        await databases.deleteDocument(DB_ID, COLLECTION_ID, id);
        res.json({ message: 'Product deleted' });
    } catch (error) {
        if (error.code === 404) {
            return res.status(404).json({ message: 'Product not found' });
        }
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
