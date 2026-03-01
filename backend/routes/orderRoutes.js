const express = require('express');
const router = express.Router();
const { placeOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus, payOrder, assignDelivery } = require('../controllers/orderController');
const { protect, adminOnly, staffOrAdmin } = require('../middleware/authMiddleware');

router.post('/', protect, placeOrder);
router.get('/my', protect, getMyOrders);
router.get('/', protect, staffOrAdmin, getAllOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/pay', protect, payOrder);
router.put('/:id/delivery', protect, staffOrAdmin, assignDelivery);
router.put('/:id/status', protect, staffOrAdmin, updateOrderStatus);

module.exports = router;
