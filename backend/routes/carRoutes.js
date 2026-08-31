const express = require('express');
const router = express.Router();
const { protect, sellerOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  addCar, getCars, getMyCars, getCarById, updateCar, deleteCar
} = require('../controllers/carController');

router.get('/', getCars);
router.get('/mine', protect, sellerOnly, getMyCars);
router.get('/:id', getCarById);
router.post('/', protect, sellerOnly, upload.single('image'), addCar);
router.put('/:id', protect, sellerOnly, upload.single('image'), updateCar);
router.delete('/:id', protect, sellerOnly, deleteCar);

module.exports = router;