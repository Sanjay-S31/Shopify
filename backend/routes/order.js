const express = require('express');
const router = express.Router();
const { 
    createOrder, 
    getUserOrders, 
    getOrderById, 
    cancelOrder,
    updateOrderStatus,
    getAllOrders
} = require('../controllers/orderController');
const requireAuth = require('../middleware/requireAuth');

// Middleware to ensure all routes require authentication
router.use(requireAuth);

// Create a new order
router.post('/create', createOrder);

// Get all orders for the logged-in or current user
router.get('/current_user', getUserOrders);

// Get a specific order by ID
router.get('/:id', getOrderById);

// Cancel an order
router.put('/cancel/:id', cancelOrder);

// Admin routes
router.get('/admin/all', getAllOrders);
router.put('/admin/status/:id', updateOrderStatus);

module.exports = router;