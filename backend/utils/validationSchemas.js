const { z } = require('zod');

// Custom email transform to normalize and validate
const emailSchema = z.string()
    .email('Invalid email address')
    .toLowerCase()
    .trim()
    .max(254, 'Email too long');

// Strong password requirements
const passwordSchema = z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Name validation - prevent XSS and injection
const nameSchema = z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name too long')
    .trim()
    .regex(/^[a-zA-Z\s\-']+$/, 'Name contains invalid characters');

const registerSchema = z.object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema
});

const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required').max(128)
});

// Product ID validation
const productIdSchema = z.string()
    .min(1)
    .max(50)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid product ID format');

// Address validation
const addressSchema = z.object({
    street: z.string()
        .min(5, 'Street address too short')
        .max(200, 'Street address too long')
        .regex(/^[a-zA-Z0-9\s,.\-#]+$/, 'Street contains invalid characters'),
    city: z.string()
        .min(2, 'City name too short')
        .max(100, 'City name too long')
        .regex(/^[a-zA-Z\s\-]+$/, 'City contains invalid characters'),
    postal_code: z.string()
        .min(4, 'Postal code too short')
        .max(10, 'Postal code too long')
        .regex(/^[a-zA-Z0-9\s\-]+$/, 'Invalid postal code format'),
    country: z.enum(['Singapore', 'Malaysia'])
});

module.exports = {
    registerSchema,
    loginSchema,
    productIdSchema,
    addressSchema,
    emailSchema,
    nameSchema
};

