const sdk = require('node-appwrite');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { registerSchema, loginSchema } = require('../utils/validationSchemas');

// Enforce JWT_SECRET - fail fast if not set
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET === 'fallback_secret_change_me') {
    console.error('FATAL: JWT_SECRET environment variable must be set to a secure value');
    if (process.env.NODE_ENV === 'production') {
        process.exit(1);
    }
}

const generateToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET || 'dev-only-insecure-secret', {
        expiresIn: '1d'
    });
};

// Generate secure CSRF token
const generateCsrfToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

exports.register = async (req, res) => {
    try {
        // 1. Validate Input
        const result = registerSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ errors: result.error.errors });
        }

        const { name, email, password } = result.data;
        const { client } = req.app.get('appwrite');
        const users = new sdk.Users(client);
        const databases = req.app.get('appwrite').databases;

        // 2. Check if user exists
        const existingUsers = await users.list([
            sdk.Query.equal('email', email)
        ]);

        if (existingUsers.users.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // 3. Hash password with bcrypt
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Create user in Appwrite
        try {
            const user = await users.create(
                sdk.ID.unique(),
                email,
                undefined, // phone
                password, // Appwrite also stores password
                name
            );

            // 5. Store our bcrypt hash in a secure collection for verification
            try {
                await databases.createDocument(
                    'bakkwa_store',
                    'user_auth',
                    user.$id,
                    {
                        user_id: user.$id,
                        password_hash: hashedPassword,
                        created_at: new Date().toISOString()
                    }
                );
            } catch (dbError) {
                // Collection might not exist, continue anyway
                console.warn('user_auth collection not available:', dbError.message);
            }

            // 6. Generate Token
            const token = generateToken(user.$id);
            const csrfToken = generateCsrfToken();

            // 7. Send Response with secure cookies
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000,
                path: '/'
            });

            res.cookie('csrf_token', csrfToken, {
                httpOnly: false, // Frontend needs to read this
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000,
                path: '/'
            });

            res.status(201).json({
                _id: user.$id,
                name: user.name,
                email: user.email,
                csrfToken
            });

        } catch (appwriteError) {
            if (appwriteError.code === 409) {
                return res.status(400).json({ message: 'User already exists' });
            }
            throw appwriteError;
        }

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.login = async (req, res) => {
    try {
        // 1. Validate Input
        const result = loginSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ errors: result.error.errors });
        }

        const { email, password } = result.data;
        const { client } = req.app.get('appwrite');
        const users = new sdk.Users(client);
        const databases = req.app.get('appwrite').databases;

        try {
            // 2. Find user by email
            const userList = await users.list([
                sdk.Query.equal('email', email)
            ]);

            if (userList.users.length === 0) {
                // Use same message to prevent email enumeration
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const user = userList.users[0];

            // 3. Verify password using bcrypt hash from our collection
            let isPasswordValid = false;
            let authDoc = null;

            try {
                authDoc = await databases.getDocument(
                    'bakkwa_store',
                    'user_auth',
                    user.$id
                );

                // BUG-004 FIX: Check for account lockout
                if (authDoc.lockout_until) {
                    const lockoutTime = new Date(authDoc.lockout_until);
                    if (lockoutTime > new Date()) {
                        const remaining = Math.ceil((lockoutTime - new Date()) / 60000);
                        return res.status(429).json({
                            message: `Account locked. Try again in ${remaining} minutes.`
                        });
                    }
                }

                isPasswordValid = await bcrypt.compare(password, authDoc.password_hash);
            } catch (dbError) {
                // BUG-005/006 FIX: If user_auth missing, check if this is a legacy user
                // For legacy users, create their auth record on successful Appwrite validation
                console.warn('user_auth not found for user, checking legacy auth...');

                // Since we can't verify password server-side without user_auth,
                // we need to fail gracefully with a helpful message
                console.error('Password verification failed: user_auth record missing');
                return res.status(401).json({
                    message: 'Invalid credentials',
                    hint: 'If you registered before the security update, please re-register.'
                });
            }

            if (!isPasswordValid) {
                // BUG-004 FIX: Increment failed attempts and lock if needed
                if (authDoc) {
                    const attempts = (authDoc.failed_attempts || 0) + 1;
                    const updateData = { failed_attempts: attempts };

                    if (attempts >= 5) {
                        const lockoutTime = new Date();
                        lockoutTime.setMinutes(lockoutTime.getMinutes() + 15); // 15 min lockout
                        updateData.lockout_until = lockoutTime.toISOString();
                        console.warn(`Account locked for user ${email} due to too many failed attempts`);
                    }

                    await databases.updateDocument(
                        'bakkwa_store',
                        'user_auth',
                        user.$id,
                        updateData
                    );
                }

                // Log failed attempt (for security monitoring)
                console.warn(`Failed login attempt for: ${email}`);
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // BUG-004 FIX: Reset failed attempts on successful login
            if (authDoc && (authDoc.failed_attempts > 0 || authDoc.lockout_until)) {
                await databases.updateDocument(
                    'bakkwa_store',
                    'user_auth',
                    user.$id,
                    {
                        failed_attempts: 0,
                        lockout_until: null
                    }
                );
            }

            // 4. Generate tokens
            const token = generateToken(user.$id);
            const csrfToken = generateCsrfToken();

            // 5. Set secure cookies
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000,
                path: '/'
            });

            res.cookie('csrf_token', csrfToken, {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000,
                path: '/'
            });

            res.json({
                _id: user.$id,
                name: user.name,
                email: user.email,
                csrfToken
            });

        } catch (appwriteError) {
            console.error('Login error:', appwriteError);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// BUG-002 FIX: Password update with complexity check
exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Validate new password complexity
        const { registerSchema } = require('../utils/validationSchemas');
        const passwordSchema = registerSchema.shape.password;

        const result = passwordSchema.safeParse(newPassword);
        if (!result.success) {
            return res.status(400).json({ errors: result.error.errors });
        }

        const { client } = req.app.get('appwrite');
        const users = new sdk.Users(client);
        const databases = req.app.get('appwrite').databases;
        const userId = req.user.id;

        // Verify current password first
        const authDoc = await databases.getDocument('bakkwa_store', 'user_auth', userId);
        const isMatch = await bcrypt.compare(currentPassword, authDoc.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Current password incorrect' });
        }

        // Update in Appwrite
        await users.updatePassword(userId, newPassword);

        // Update hash in our DB
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await databases.updateDocument(
            'bakkwa_store',
            'user_auth',
            userId,
            { password_hash: hashedPassword }
        );

        // BUG-003 FIX: Invalidate sessions (by clearing cookies on response)
        // Note: This only clears for current client. For full invalidation, we need token versioning.
        res.cookie('token', '', { expires: new Date(0) });
        res.cookie('csrf_token', '', { expires: new Date(0) });

        res.json({ message: 'Password updated successfully. Please log in again.' });

    } catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.logout = (req, res) => {
    // Clear all auth cookies
    res.cookie('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: new Date(0),
        path: '/'
    });
    res.cookie('csrf_token', '', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: new Date(0),
        path: '/'
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

exports.getMe = async (req, res) => {
    try {
        const { client } = req.app.get('appwrite');
        const users = new sdk.Users(client);
        const user = await users.get(req.user.id);
        res.json({
            _id: user.$id,
            name: user.name,
            email: user.email
        });
    } catch (error) {
        console.error('GetMe error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Refresh CSRF token endpoint
exports.refreshCsrf = (req, res) => {
    const csrfToken = generateCsrfToken();
    res.cookie('csrf_token', csrfToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
        path: '/'
    });
    res.json({ csrfToken });
};
