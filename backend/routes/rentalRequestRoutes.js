const express = require('express');
const { protect, sellerOnly } = require('../middleware/authMiddleware');
const {
  createRequest, getMyRequests, getSellerRequests, getSellerRequestById, updateRequestStatus, cancelRequest,
} = require('../controllers/rentalRequestController');

const router = express.Router();

router.post('/', protect, createRequest);
router.get('/mine', protect, getMyRequests);
router.get('/seller', protect, sellerOnly, getSellerRequests);
router.get('/seller/:id', protect, sellerOnly, getSellerRequestById);
router.patch('/:id/status', protect, sellerOnly, updateRequestStatus);
router.patch('/:id/cancel', protect, cancelRequest);

module.exports = router;
