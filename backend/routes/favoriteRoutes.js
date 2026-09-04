const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { toggleFavorite, getFavorites } = require('../controllers/favoriteController');

router.post('/:carId', protect, toggleFavorite);
router.get('/', protect, getFavorites);

module.exports = router;