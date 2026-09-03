const express = require('express');
const router = express.Router();
const { protect, sellerOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  createRental, getRentals, getMyRentals, getRentalById, updateRental, deleteRental,
} = require('../controllers/rentalCarController');

router.get('/', getRentals);
router.get('/mine', protect, sellerOnly, getMyRentals);
router.get('/:id', getRentalById);
router.post('/', protect, sellerOnly, upload.array('images', 10), createRental);
router.put('/:id', protect, sellerOnly, upload.array('images', 10), updateRental);
router.delete('/:id', protect, sellerOnly, deleteRental);

module.exports = router;
