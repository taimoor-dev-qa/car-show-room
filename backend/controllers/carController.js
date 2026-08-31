const Car = require('../models/car');

// @route POST /api/cars   (sirf seller)
const addCar = async (req, res) => {
  try {
    const { makeModel, year, price, category, description } = req.body;

    const car = await Car.create({
      seller: req.user.id,
      makeModel,
      year,
      price,
      category,
      description,
      status: 'pending',
      image: req.file ? req.file.filename : '',   // <-- naya
    });

    res.status(201).json(car);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/cars   (buyer ke liye — sirf active cars, filters ke sath)
const getCars = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = { status: 'active' };

    if (category && category !== 'All') filter.category = category;

    if (search) {
      filter.makeModel = { $regex: search, $options: 'i' }; // case-insensitive search
    }

    const cars = await Car.find(filter).populate('seller', 'name businessName');
    res.json(cars);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/cars/mine   (seller apni saari cars dekhe, chahe active/pending/sold ho)
const getMyCars = async (req, res) => {
  try {
    const cars = await Car.find({ seller: req.user.id }).sort({ createdAt: -1 });
    res.json(cars);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/cars/:id   (single car detail — buyer "View Details" pe)
const getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id).populate('seller', 'name businessName');
    if (!car) return res.status(404).json({ message: 'Car not found' });

    car.views += 1;
    await car.save();

    res.json(car);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/cars/:id   (sirf wo seller jiski car hai)
const updateCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: 'Car not found' });

    if (car.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not your listing' });
    }

    Object.assign(car, req.body);
    if (req.file) {
      car.image = req.file.filename;   // <-- naya, agar nayi image upload hui
    }
    await car.save();

    res.json(car);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route DELETE /api/cars/:id   (sirf wo seller jiski car hai)
const deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: 'Car not found' });

    if (car.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not your listing' });
    }

    await car.deleteOne();
    res.json({ message: 'Car deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { addCar, getCars, getMyCars, getCarById, updateCar, deleteCar };