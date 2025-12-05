/**
 * Bakkwa CNY E-Commerce - Automated Test Suite
 * 
 * Run with: npx playwright test
 * 
 * Prerequisites:
 * - npm install -D @playwright/test
 * - npx playwright install
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

// ============================================
// HOMEPAGE TESTS
// ============================================

test.describe('Homepage', () => {
    test('should load with CNY theming', async ({ page }) => {
        await page.goto(BASE_URL);

        // Check title
        await expect(page).toHaveTitle(/Bakkwa/);

        // Check CNY hero section
        const hero = page.locator('section').first();
        await expect(hero).toBeVisible();
    });

    test('should have navigation links', async ({ page }) => {
        await page.goto(BASE_URL);

        await expect(page.getByRole('link', { name: 'Shop' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'About' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Contact' })).toBeVisible();
    });

    test('should have cart icon with count', async ({ page }) => {
        await page.goto(BASE_URL);

        const cartLink = page.locator('a[href="/cart"]');
        await expect(cartLink).toBeVisible();
    });

    test('should have login button', async ({ page }) => {
        await page.goto(BASE_URL);

        await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
    });
});

// ============================================
// SHOP PAGE TESTS
// ============================================

test.describe('Shop Page', () => {
    test('should display products', async ({ page }) => {
        await page.goto(`${BASE_URL}/shop`);

        // Wait for products to load
        await page.waitForSelector('[class*="card"]');

        // Should have multiple products
        const products = page.locator('[class*="card"]');
        await expect(products).toHaveCount.greaterThan(0);
    });

    test('should have category filters', async ({ page }) => {
        await page.goto(`${BASE_URL}/shop`);

        await expect(page.getByText('Categories')).toBeVisible();
        await expect(page.getByText('All Products')).toBeVisible();
        await expect(page.getByText('Classic')).toBeVisible();
    });

    test('should add item to cart', async ({ page }) => {
        await page.goto(`${BASE_URL}/shop`);

        // Get initial cart count
        const cartCount = page.locator('[class*="cartCount"]');
        const initialCount = await cartCount.textContent();

        // Click add to cart
        await page.getByRole('button', { name: /Add/ }).first().click();

        // Cart count should increase
        await expect(cartCount).not.toHaveText(initialCount!);
    });

    test('product links should navigate to detail page', async ({ page }) => {
        await page.goto(`${BASE_URL}/shop`);

        // Click on first product name
        await page.locator('a[href^="/product/"]').first().click();

        // Should be on product page
        await expect(page).toHaveURL(/\/product\//);
    });
});

// ============================================
// CART PAGE TESTS
// ============================================

test.describe('Cart Page', () => {
    test.beforeEach(async ({ page }) => {
        // Add item to cart first
        await page.goto(`${BASE_URL}/shop`);
        await page.getByRole('button', { name: /Add/ }).first().click();
        await page.goto(`${BASE_URL}/cart`);
    });

    test('should show added items', async ({ page }) => {
        await expect(page.getByText('Your Cart')).toBeVisible();
        await expect(page.locator('[class*="item"]').first()).toBeVisible();
    });

    test('should update quantity with + button', async ({ page }) => {
        const initialTotal = await page.locator('[class*="total"]').last().textContent();

        // Click + button
        await page.getByRole('button', { name: '+' }).click();

        // Total should change
        const newTotal = await page.locator('[class*="total"]').last().textContent();
        expect(newTotal).not.toBe(initialTotal);
    });

    test('should remove item with - button when quantity is 1', async ({ page }) => {
        await page.getByRole('button', { name: '−' }).click();

        // Should show empty cart
        await expect(page.getByText('Your Cart is Empty')).toBeVisible();
    });

    test('should have checkout button', async ({ page }) => {
        await expect(page.getByRole('link', { name: /Checkout/ })).toBeVisible();
    });
});

// ============================================
// CHECKOUT PAGE TESTS
// ============================================

test.describe('Checkout Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(`${BASE_URL}/shop`);
        await page.getByRole('button', { name: /Add/ }).first().click();
        await page.goto(`${BASE_URL}/checkout`);
    });

    test('should have country selection', async ({ page }) => {
        await expect(page.getByRole('button', { name: /Singapore/ })).toBeVisible();
        await expect(page.getByRole('button', { name: /Malaysia/ })).toBeVisible();
    });

    test('should have delivery method options', async ({ page }) => {
        await expect(page.getByRole('button', { name: /Delivery/ })).toBeVisible();
        await expect(page.getByRole('button', { name: /Pickup/ })).toBeVisible();
    });

    test('should have address form fields', async ({ page }) => {
        await expect(page.getByLabel('Street Address')).toBeVisible();
        await expect(page.getByLabel('City')).toBeVisible();
        await expect(page.getByLabel('Postal Code')).toBeVisible();
    });

    test('should show order summary', async ({ page }) => {
        await expect(page.getByText('Order Summary')).toBeVisible();
        await expect(page.getByText('Subtotal')).toBeVisible();
    });

    test('should show $100 pickup rule for Singapore', async ({ page }) => {
        // Singapore should be selected by default
        await expect(page.getByText(/under \$100.*pickup only/i)).toBeVisible();
    });
});

// ============================================
// PRODUCT DETAIL PAGE TESTS
// ============================================

test.describe('Product Detail Page', () => {
    test('should display product information', async ({ page }) => {
        await page.goto(`${BASE_URL}/product/1`);

        // Check product elements
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.getByText(/\$/)).toBeVisible(); // Price
        await expect(page.getByText(/Stock/i)).toBeVisible();
    });

    test('should have quantity controls', async ({ page }) => {
        await page.goto(`${BASE_URL}/product/1`);

        await expect(page.getByRole('button', { name: '−' })).toBeVisible();
        await expect(page.getByRole('button', { name: '+' })).toBeVisible();
    });

    test('should have add to cart button', async ({ page }) => {
        await page.goto(`${BASE_URL}/product/1`);

        await expect(page.getByRole('button', { name: /Add to Cart/ })).toBeVisible();
    });

    test('should show delivery information', async ({ page }) => {
        await page.goto(`${BASE_URL}/product/1`);

        await expect(page.getByText(/Delivery Information/i)).toBeVisible();
    });
});

// ============================================
// LOGIN PAGE TESTS
// ============================================

test.describe('Login Page', () => {
    test('should have login form', async ({ page }) => {
        await page.goto(`${BASE_URL}/login`);

        await expect(page.getByLabel('Email')).toBeVisible();
        await expect(page.getByLabel('Password')).toBeVisible();
        await expect(page.getByRole('button', { name: /Sign In/ })).toBeVisible();
    });

    test('should have register link', async ({ page }) => {
        await page.goto(`${BASE_URL}/login`);

        await expect(page.getByRole('link', { name: /Create Account/ })).toBeVisible();
    });

    test('should show error on invalid login', async ({ page }) => {
        await page.goto(`${BASE_URL}/login`);

        await page.getByLabel('Email').fill('test@test.com');
        await page.getByLabel('Password').fill('wrongpassword');
        await page.getByRole('button', { name: /Sign In/ }).click();

        // Should show error (may take time due to API call)
        await expect(page.locator('[class*="error"]')).toBeVisible({ timeout: 10000 });
    });
});

// ============================================
// NAVIGATION TESTS
// ============================================

test.describe('Navigation', () => {
    test('should navigate from home to shop', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.getByRole('link', { name: 'Shop' }).click();
        await expect(page).toHaveURL(/\/shop/);
    });

    test('should navigate from shop to product', async ({ page }) => {
        await page.goto(`${BASE_URL}/shop`);
        await page.locator('a[href^="/product/"]').first().click();
        await expect(page).toHaveURL(/\/product\//);
    });

    test('should navigate from cart to checkout', async ({ page }) => {
        await page.goto(`${BASE_URL}/shop`);
        await page.getByRole('button', { name: /Add/ }).first().click();
        await page.goto(`${BASE_URL}/cart`);
        await page.getByRole('link', { name: /Checkout/ }).click();
        await expect(page).toHaveURL(/\/checkout/);
    });
});
