const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { sendInquiry, getMyInquiries } = require('../controllers/inquiryController');

router.post('/', protect, sendInquiry);
router.get('/mine', protect, getMyInquiries);

module.exports = router;