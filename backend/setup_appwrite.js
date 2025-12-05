const sdk = require('node-appwrite');
require('dotenv').config();

// Config
const client = new sdk.Client();
client
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new sdk.Databases(client);

const DB_ID = 'bakkwa_store';

async function setupAppwrite() {
    try {
        console.log('Creating Database...');
        try {
            await databases.create({
                databaseId: DB_ID,
                name: 'Bakkwa Store'
            });
            console.log('Database created.');
        } catch (e) {
            console.log('Database might already exist:', e.message);
        }

        // 1. Products Collection
        console.log('Creating Products Collection...');
        try {
            await databases.createCollection({
                databaseId: DB_ID,
                collectionId: 'products',
                name: 'Products'
            });
            await databases.createStringAttribute({
                databaseId: DB_ID,
                collectionId: 'products',
                key: 'name',
                size: 255,
                required: true
            });
            await databases.createFloatAttribute({
                databaseId: DB_ID,
                collectionId: 'products',
                key: 'price',
                required: true
            });
            await databases.createStringAttribute({
                databaseId: DB_ID,
                collectionId: 'products',
                key: 'category',
                size: 100,
                required: true
            });
            await databases.createIntegerAttribute({
                databaseId: DB_ID,
                collectionId: 'products',
                key: 'stock',
                required: true
            });
            await databases.createStringAttribute({
                databaseId: DB_ID,
                collectionId: 'products',
                key: 'description',
                size: 5000,
                required: false
            });
            await databases.createStringAttribute({
                databaseId: DB_ID,
                collectionId: 'products',
                key: 'images',
                size: 1000,
                required: false,
                array: true
            });
            console.log('Products Collection setup complete.');
        } catch (e) {
            console.log('Products Collection error:', e.message);
        }

        // 2. Orders Collection
        console.log('Creating Orders Collection...');
        try {
            await databases.createCollection({
                databaseId: DB_ID,
                collectionId: 'orders',
                name: 'Orders'
            });
            await databases.createStringAttribute({
                databaseId: DB_ID,
                collectionId: 'orders',
                key: 'user_id',
                size: 255,
                required: true
            });
            await databases.createFloatAttribute({
                databaseId: DB_ID,
                collectionId: 'orders',
                key: 'total',
                required: true
            });
            // New fields for delivery tracking
            await databases.createFloatAttribute({
                databaseId: DB_ID,
                collectionId: 'orders',
                key: 'subtotal',
                required: false
            });
            await databases.createFloatAttribute({
                databaseId: DB_ID,
                collectionId: 'orders',
                key: 'delivery_fee',
                required: false
            });
            await databases.createStringAttribute({
                databaseId: DB_ID,
                collectionId: 'orders',
                key: 'status',
                size: 50,
                required: true,
                default: 'pending'
            });
            await databases.createStringAttribute({
                databaseId: DB_ID,
                collectionId: 'orders',
                key: 'delivery_method',
                size: 50,
                required: true
            });
            await databases.createStringAttribute({
                databaseId: DB_ID,
                collectionId: 'orders',
                key: 'shipping_address',
                size: 5000,
                required: true
            });
            await databases.createStringAttribute({
                databaseId: DB_ID,
                collectionId: 'orders',
                key: 'items',
                size: 5000,
                required: true
            });
            await databases.createStringAttribute({
                databaseId: DB_ID,
                collectionId: 'orders',
                key: 'created_at',
                size: 50,
                required: false
            });
            console.log('Orders Collection setup complete.');
        } catch (e) {
            console.log('Orders Collection error:', e.message);
        }

        // 3. Addresses Collection
        console.log('Creating Addresses Collection...');
        try {
            await databases.createCollection({
                databaseId: DB_ID,
                collectionId: 'addresses',
                name: 'Addresses'
            });
            await databases.createStringAttribute({
                databaseId: DB_ID,
                collectionId: 'addresses',
                key: 'user_id',
                size: 255,
                required: true
            });
            await databases.createStringAttribute({
                databaseId: DB_ID,
                collectionId: 'addresses',
                key: 'street',
                size: 255,
                required: true
            });
            await databases.createStringAttribute({
                databaseId: DB_ID,
                collectionId: 'addresses',
                key: 'city',
                size: 100,
                required: true
            });
            await databases.createStringAttribute({
                databaseId: DB_ID,
                collectionId: 'addresses',
                key: 'postal_code',
                size: 20,
                required: true
            });
            await databases.createStringAttribute({
                databaseId: DB_ID,
                collectionId: 'addresses',
                key: 'country',
                size: 50,
                required: true
            });
            console.log('Addresses Collection setup complete.');
        } catch (e) {
            console.log('Addresses Collection error:', e.message);
        }

        // 4. User Auth Collection (for secure password storage)
        console.log('Creating User Auth Collection...');
        try {
            await databases.createCollection({
                databaseId: DB_ID,
                collectionId: 'user_auth',
                name: 'User Auth'
            });
            await databases.createStringAttribute({
                databaseId: DB_ID,
                collectionId: 'user_auth',
                key: 'user_id',
                size: 255,
                required: true
            });
            await databases.createStringAttribute({
                databaseId: DB_ID,
                collectionId: 'user_auth',
                key: 'password_hash',
                size: 255,
                required: true
            });
            await databases.createStringAttribute({
                databaseId: DB_ID,
                collectionId: 'user_auth',
                key: 'created_at',
                size: 50,
                required: true
            });
            await databases.createIntegerAttribute({
                databaseId: DB_ID,
                collectionId: 'user_auth',
                key: 'failed_attempts',
                required: false,
                default: 0
            });
            await databases.createStringAttribute({
                databaseId: DB_ID,
                collectionId: 'user_auth',
                key: 'lockout_until',
                size: 50,
                required: false
            });
            console.log('User Auth Collection setup complete.');
        } catch (e) {
            console.log('User Auth Collection error:', e.message);
        }

        console.log('Appwrite Setup Finished!');

        // Seed sample products
        await seedProducts();

    } catch (error) {
        console.error('Setup failed:', error);
    }
}

// Seed sample products for testing
async function seedProducts() {
    console.log('Seeding sample products...');

    const sampleProducts = [
        { name: 'Signature Sliced Bakkwa', price: 38.00, category: 'classic', stock: 50, description: 'Our best-selling classic sliced bakkwa, perfect for CNY gifting.', images: [] },
        { name: 'Minced Pork Bakkwa', price: 35.00, category: 'classic', stock: 40, description: 'Tender minced pork bakkwa with a sweet and savory glaze.', images: [] },
        { name: 'Spicy Bakkwa', price: 40.00, category: 'spicy', stock: 30, description: 'For those who like it hot! Infused with chili for an extra kick.', images: [] },
        { name: 'Chicken Bakkwa', price: 36.00, category: 'chicken', stock: 35, description: 'Leaner alternative made with premium chicken meat.', images: [] },
        { name: 'CNY Gift Box (500g)', price: 58.00, category: 'gift', stock: 20, description: 'Beautifully packaged gift set, perfect for visiting relatives.', images: [] },
        { name: 'Premium Gift Hamper', price: 128.00, category: 'gift', stock: 15, description: 'Luxurious hamper with assorted bakkwa and CNY treats.', images: [] },
        { name: 'Beef Bakkwa', price: 45.00, category: 'beef', stock: 25, description: 'Premium beef bakkwa with a rich, savory flavor.', images: [] },
        { name: 'Mini Bakkwa Rolls', price: 32.00, category: 'snacks', stock: 45, description: 'Bite-sized bakkwa rolls, perfect for snacking.', images: [] },
    ];

    for (const product of sampleProducts) {
        try {
            await databases.createDocument(
                DB_ID,
                'products',
                sdk.ID.unique(),
                product
            );
            console.log(`  Created: ${product.name}`);
        } catch (e) {
            // Product might already exist
            console.log(`  Skipped: ${product.name} (${e.message})`);
        }
    }
    console.log('Product seeding complete!');
}

setupAppwrite();

