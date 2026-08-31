const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { signup, login, getProfile, updateProfile } = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;