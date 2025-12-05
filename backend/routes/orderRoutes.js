const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrder, updateOrderStatus } = require('../controllers/orderController');
const { protect, optionalAuth, admin } = require('../middleware/authMiddleware');

// Guest checkout allowed - createOrder uses optional auth
router.post('/', optionalAuth, createOrder);

// These routes require authentication
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', optionalAuth, getOrder);  // Allow guests to view their order by ID
router.put('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;

