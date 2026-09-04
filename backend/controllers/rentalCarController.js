const RentalCar = require('../models/RentalCar');

const rentalFields = [
  'makeModel', 'variant', 'year', 'category', 'transmission', 'fuelType', 'seats',
  'mileage', 'description', 'dailyRate', 'city', 'pickupArea', 'availableFrom',
  'availableUntil', 'driverAvailable', 'driverCharges', 'minRentalDays',
  'maxRentalDays', 'status',
];

const getRentalData = (body) => Object.fromEntries(
  rentalFields.filter((field) => body[field] !== undefined).map((field) => [field, body[field]])
);

const hasInvalidAvailability = (rental) => (
  rental.availableFrom && rental.availableUntil
  && new Date(rental.availableFrom) > new Date(rental.availableUntil)
) || (
  rental.minRentalDays && rental.maxRentalDays
  && Number(rental.minRentalDays) > Number(rental.maxRentalDays)
);

const parseExistingImages = (value) => {
  if (Array.isArray(value)) return value;
  return JSON.parse(value);
};

const createRental = async (req, res) => {
  try {
    const rental = new RentalCar({
      ...getRentalData(req.body),
      seller: req.user.id,
      images: req.files ? req.files.map((file) => file.filename) : [],
    });
    if (hasInvalidAvailability(rental)) {
      return res.status(400).json({ message: 'Check availability dates and rental-day limits' });
    }
    await rental.save();
    res.status(201).json(rental);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getRentals = async (req, res) => {
  try {
    const { city, category, minPrice, maxPrice, driverAvailable } = req.query;
    const filter = { status: 'active' };
    if (city) filter.city = { $regex: city, $options: 'i' };
    if (category && category !== 'All') filter.category = category;
    if (minPrice || maxPrice) {
      filter.dailyRate = {};
      if (minPrice) filter.dailyRate.$gte = Number(minPrice);
      if (maxPrice) filter.dailyRate.$lte = Number(maxPrice);
    }
    if (driverAvailable === 'true' || driverAvailable === 'false') {
      filter.driverAvailable = driverAvailable === 'true';
    }
    const rentals = await RentalCar.find(filter).populate('seller', 'name businessName');
    res.json(rentals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMyRentals = async (req, res) => {
  try {
    const rentals = await RentalCar.find({ seller: req.user.id }).sort({ createdAt: -1 });
    res.json(rentals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getRentalById = async (req, res) => {
  try {
    const rental = await RentalCar.findById(req.params.id).populate('seller', 'name businessName');
    if (!rental) return res.status(404).json({ message: 'Rental car not found' });
    res.json(rental);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateRental = async (req, res) => {
  try {
    const rental = await RentalCar.findById(req.params.id);
    if (!rental) return res.status(404).json({ message: 'Rental car not found' });
    if (rental.seller.toString() !== req.user.id) return res.status(403).json({ message: 'Not your rental listing' });

    Object.assign(rental, getRentalData(req.body));
    if (req.body.existingImages !== undefined) {
      let existingImages;
      try { existingImages = parseExistingImages(req.body.existingImages); }
      catch (err) { return res.status(400).json({ message: 'Existing images must be a valid list' }); }
      if (!Array.isArray(existingImages)) return res.status(400).json({ message: 'Existing images must be a valid list' });

      const keptImages = existingImages.filter((image) => rental.images.includes(image));
      const uploadedImages = req.files?.map((file) => file.filename) || [];
      if (keptImages.length + uploadedImages.length > 10) {
        return res.status(400).json({ message: 'A rental listing can have at most 10 images' });
      }
      rental.images = [...keptImages, ...uploadedImages];
    } else if (req.files?.length) rental.images = req.files.map((file) => file.filename);
    if (hasInvalidAvailability(rental)) {
      return res.status(400).json({ message: 'Check availability dates and rental-day limits' });
    }
    await rental.save();
    res.json(rental);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteRental = async (req, res) => {
  try {
    const rental = await RentalCar.findById(req.params.id);
    if (!rental) return res.status(404).json({ message: 'Rental car not found' });
    if (rental.seller.toString() !== req.user.id) return res.status(403).json({ message: 'Not your rental listing' });
    await rental.deleteOne();
    res.json({ message: 'Rental listing deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createRental, getRentals, getMyRentals, getRentalById, updateRental, deleteRental };
