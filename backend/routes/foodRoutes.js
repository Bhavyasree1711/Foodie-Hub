const express = require('express');
const router = express.Router();
const {
  getFoodItems, getAllFoodItems, getFoodById, createFoodItem, updateFoodItem, deleteFoodItem
} = require('../controllers/foodController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.get('/', getFoodItems);
router.get('/all', protect, adminOnly, getAllFoodItems);
router.get('/:id', getFoodById);
router.post('/', protect, adminOnly, upload.single('image'), createFoodItem);
router.put('/:id', protect, adminOnly, upload.single('image'), updateFoodItem);
router.delete('/:id', protect, adminOnly, deleteFoodItem);

module.exports = router;
