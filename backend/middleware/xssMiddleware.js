const sanitizeHtml = require('sanitize-html');

/**
 * Middleware to sanitize user input to prevent XSS attacks.
 * Replaces xss-clean which is incompatible with Express 5.
 *
 * Sanitizes req.body, req.query, and req.params.
 * Note: req.query and req.params are read-only in Express 5,
 * so we only sanitize req.body directly.
 * For query and params, we can't easily modify them in place.
 * However, we can attach a sanitized version or validate them.
 *
 * Since we can't modify req.query/req.params, this middleware focuses on req.body.
 * For query/params, validation (Zod) is the primary defense.
 */
const xssSanitizer = (req, res, next) => {
    if (req.body) {
        req.body = sanitizeObject(req.body);
    }

    // We can't modify req.query in Express 5 easily as it's a getter.
    // However, we can create a sanitized copy if needed, but
    // it's better to rely on input validation (Zod) for query params.

    next();
};

const sanitizeObject = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map(v => sanitizeObject(v));
    }

    if (obj !== null && typeof obj === 'object') {
        const cleanObj = {};
        for (const [key, value] of Object.entries(obj)) {
            cleanObj[key] = sanitizeObject(value);
        }
        return cleanObj;
    }

    if (typeof obj === 'string') {
        return sanitizeHtml(obj, {
            allowedTags: [], // Remove all tags
            allowedAttributes: {}
        });
    }

    return obj;
};

module.exports = xssSanitizer;
