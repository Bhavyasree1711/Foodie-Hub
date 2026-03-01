const express = require('express');
const router = express.Router();
const { getDashboard, getUsers, getUserOrders, updateUserRole, getDailyReport, getMonthlyReport } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, adminOnly, getDashboard);
router.get('/users', protect, adminOnly, getUsers);
router.get('/users/:id/orders', protect, adminOnly, getUserOrders);
router.put('/users/:id/role', protect, adminOnly, updateUserRole);
router.get('/reports/daily', protect, adminOnly, getDailyReport);
router.get('/reports/monthly', protect, adminOnly, getMonthlyReport);

module.exports = router;
