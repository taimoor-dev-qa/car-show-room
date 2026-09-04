const Car = require('../models/car');

const carFields = ['makeModel', 'year', 'price', 'category', 'description', 'mileage', 'fuelType',
  'transmission', 'ownerCount', 'registrationCity', 'color', 'variant', 'engineCapacity',
  'isRegistered', 'condition', 'hasAccidentHistory', 'accidentNotes', 'isNegotiable', 'status'];
const requiredFields = ['makeModel', 'year', 'price', 'category', 'mileage', 'fuelType', 'transmission',
  'ownerCount', 'registrationCity', 'condition'];
const getCarData = (body) => Object.fromEntries(carFields.filter((field) => body[field] !== undefined).map((field) => [field, body[field]]));
const validCarData = (data) => requiredFields.every((field) => data[field] !== undefined && data[field] !== '')
  && Number(data.mileage) >= 0 && Number(data.ownerCount) >= 1
  && ['Petrol', 'Diesel', 'Electric', 'Hybrid'].includes(data.fuelType)
  && ['Manual', 'Automatic'].includes(data.transmission)
  && ['Excellent', 'Good', 'Fair'].includes(data.condition);

// @route POST /api/cars   (sirf seller)
const addCar = async (req, res) => {
  try {
    const carData = getCarData(req.body);
    if (!validCarData(carData)) return res.status(400).json({ message: 'Please complete all required vehicle details' });

    const imageFilenames = req.files ? req.files.map((f) => f.filename) : [];

    const car = await Car.create({
      seller: req.user.id,
      ...carData,
      accidentNotes: carData.hasAccidentHistory === 'true' || carData.hasAccidentHistory === true ? carData.accidentNotes : undefined,
      status: 'pending',
      images: imageFilenames,
      image: imageFilenames[0] || '',   // pehli image ko purane field me bhi rakho (fallback ke liye)
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

    const carData = getCarData(req.body);
    Object.assign(car, carData);
    if (Object.keys(carData).some((field) => field !== 'status') && !validCarData(car)) {
      return res.status(400).json({ message: 'Please complete all required vehicle details' });
    }
    if (!car.hasAccidentHistory) car.accidentNotes = undefined;

    if (req.files && req.files.length > 0) {
      const imageFilenames = req.files.map((f) => f.filename);
      car.images = imageFilenames;         // nayi images purani ko replace karengi
      car.image = imageFilenames[0];
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
