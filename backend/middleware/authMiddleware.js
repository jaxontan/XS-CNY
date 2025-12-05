const jwt = require('jsonwebtoken');
const sdk = require('node-appwrite');

// BUG-001 FIX: Get JWT secret with validation - no fallback allowed
const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) {
        throw new Error('JWT_SECRET must be set and at least 32 characters');
    }
    return secret;
};

const protect = async (req, res, next) => {
    let token;

    if (req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        // BUG-001 FIX: Use validated secret, no fallback
        const decoded = jwt.verify(token, getJwtSecret());

        // Fetch user from Appwrite
        const { client } = req.app.get('appwrite');
        const users = new sdk.Users(client);
        const user = await users.get(decoded.id);

        req.user = {
            id: user.$id,
            email: user.email,
            name: user.name,
            role: user.labels?.includes('admin') ? 'admin' : 'user'
        };
        next();
    } catch (error) {
        console.error('Auth error:', error.message);
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

// Optional auth - allows guests but attaches user if authenticated
const optionalAuth = async (req, res, next) => {
    let token;

    if (req.cookies.token) {
        token = req.cookies.token;
    }

    // No token = guest, proceed without user
    if (!token) {
        req.user = null;
        return next();
    }

    try {
        // BUG-001 FIX: Use validated secret, no fallback
        const decoded = jwt.verify(token, getJwtSecret());

        // Fetch user from Appwrite
        const { client } = req.app.get('appwrite');
        const users = new sdk.Users(client);
        const user = await users.get(decoded.id);

        req.user = {
            id: user.$id,
            email: user.email,
            name: user.name,
            role: user.labels?.includes('admin') ? 'admin' : 'user'
        };
        next();
    } catch (error) {
        // Token invalid = treat as guest
        req.user = null;
        next();
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, optionalAuth, admin };

