/**
 * Environment Configuration Validator
 * BUG-105 FIX: Validates all required environment variables at startup
 */

const requiredEnvVars = [
    'APPWRITE_ENDPOINT',
    'APPWRITE_PROJECT_ID',
    'APPWRITE_API_KEY',
    'JWT_SECRET'
];

const optionalEnvVars = [
    { name: 'NODE_ENV', default: 'development' },
    { name: 'PORT', default: '5000' },
    { name: 'FRONTEND_URL', default: 'http://localhost:3000' }
];

function validateEnv() {
    const errors = [];
    const warnings = [];

    // Check required variables
    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            errors.push(`Missing required environment variable: ${envVar}`);
        }
    }

    // BUG-001 FIX: Enforce strong JWT secret
    if (process.env.JWT_SECRET) {
        if (process.env.JWT_SECRET.length < 32) {
            errors.push('JWT_SECRET must be at least 32 characters long');
        }
        if (process.env.JWT_SECRET === 'fallback_secret_change_me' ||
            process.env.JWT_SECRET === 'your-secret-key' ||
            process.env.JWT_SECRET === 'secret') {
            errors.push('JWT_SECRET is using an insecure default value');
        }
    }

    // Set defaults for optional variables
    for (const { name, default: defaultValue } of optionalEnvVars) {
        if (!process.env[name]) {
            process.env[name] = defaultValue;
            warnings.push(`${name} not set, using default: ${defaultValue}`);
        }
    }

    // Production-specific checks
    if (process.env.NODE_ENV === 'production') {
        if (!process.env.FRONTEND_URL || process.env.FRONTEND_URL.includes('localhost')) {
            errors.push('FRONTEND_URL must be set to production URL in production mode');
        }
    }

    // Log warnings
    if (warnings.length > 0) {
        console.warn('⚠️  Environment Warnings:');
        warnings.forEach(w => console.warn(`   - ${w}`));
    }

    // Exit on errors in production
    if (errors.length > 0) {
        console.error('❌ Environment Validation Failed:');
        errors.forEach(e => console.error(`   - ${e}`));

        if (process.env.NODE_ENV === 'production') {
            console.error('Exiting due to configuration errors in production mode');
            process.exit(1);
        } else {
            console.warn('⚠️  Continuing in development mode despite configuration errors');
        }
    } else {
        console.log('✅ Environment validation passed');
    }

    return { errors, warnings };
}

module.exports = { validateEnv };
