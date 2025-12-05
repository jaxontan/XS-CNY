const sdk = require('node-appwrite');
require('dotenv').config();

const client = new sdk.Client();
client
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new sdk.Databases(client);
const DB_ID = 'bakkwa_store';
const COLLECTION_ID = 'user_auth';

async function migrate() {
    console.log('Starting migration: Add lockout fields to user_auth...');

    try {
        // Add failed_attempts
        console.log('Adding failed_attempts attribute...');
        try {
            await databases.createIntegerAttribute(
                DB_ID,
                COLLECTION_ID,
                'failed_attempts',
                false, // required
                0, // min
                1000, // max
                0 // default
            );
            console.log('failed_attempts attribute created.');
        } catch (e) {
            console.log('failed_attempts might already exist:', e.message);
        }

        // Add lockout_until
        console.log('Adding lockout_until attribute...');
        try {
            await databases.createStringAttribute(
                DB_ID,
                COLLECTION_ID,
                'lockout_until',
                50, // size
                false // required
            );
            console.log('lockout_until attribute created.');
        } catch (e) {
            console.log('lockout_until might already exist:', e.message);
        }

        console.log('Migration complete. Please wait a few seconds for attributes to be available.');
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

migrate();
