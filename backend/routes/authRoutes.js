const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  buyerSignup, verifySignupOTP, login,
  forgotPassword, resetPassword,
  getProfile, updateProfile,
} = require('../controllers/authController');

router.post('/signup', buyerSignup);
router.post('/verify-otp', verifySignupOTP);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;