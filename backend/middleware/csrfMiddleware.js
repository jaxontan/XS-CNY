/**
 * CSRF Protection Middleware
 * Validates CSRF tokens for state-changing requests (POST, PUT, DELETE)
 */

const verifyCsrf = (req, res, next) => {
    // Skip CSRF for GET, HEAD, OPTIONS (safe methods)
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }

    // Skip CSRF for auth endpoints (login/register don't have tokens yet)
    if (req.path.includes('/auth/login') || req.path.includes('/auth/register')) {
        return next();
    }

    // Skip CSRF for guest checkout (no auth token = guest)
    // Server-side validation still applies via order schema
    if (req.path.includes('/orders') && !req.cookies.token) {
        return next();
    }

    // Get CSRF token from header or body
    const csrfToken = req.headers['x-csrf-token'] || req.body._csrf;
    const cookieToken = req.cookies.csrf_token;

    if (!csrfToken || !cookieToken) {
        return res.status(403).json({
            message: 'CSRF token missing',
            code: 'CSRF_MISSING'
        });
    }

    // Constant-time comparison to prevent timing attacks
    if (!timingSafeEqual(csrfToken, cookieToken)) {
        return res.status(403).json({
            message: 'CSRF token invalid',
            code: 'CSRF_INVALID'
        });
    }

    next();
};

// Constant-time string comparison
function timingSafeEqual(a, b) {
    if (a.length !== b.length) {
        return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
}

module.exports = { verifyCsrf };
