const mongoose = require('mongoose');

const Car = require('../models/car');

const carFields = [
  'makeModel',
  'year',
  'price',
  'category',
  'description',
  'mileage',
  'fuelType',
  'transmission',
  'ownerCount',
  'registrationCity',
  'color',
  'variant',
  'engineCapacity',
  'isRegistered',
  'condition',
  'hasAccidentHistory',
  'accidentNotes',
  'isNegotiable',
  'status',
];

const requiredFields = [
  'makeModel',
  'year',
  'price',
  'category',
  'mileage',
  'fuelType',
  'transmission',
  'ownerCount',
  'registrationCity',
  'condition',
];

const getCarData = (body) =>
  Object.fromEntries(
    carFields
      .filter(
        (field) =>
          body[field] !== undefined
      )
      .map((field) => [
        field,
        body[field],
      ])
  );

const validCarData = (data) =>
  requiredFields.every(
    (field) =>
      data[field] !== undefined &&
      data[field] !== ''
  ) &&
  Number(data.mileage) >= 0 &&
  Number(data.ownerCount) >= 1 &&
  [
    'Petrol',
    'Diesel',
    'Electric',
    'Hybrid',
  ].includes(data.fuelType) &&
  [
    'Manual',
    'Automatic',
  ].includes(data.transmission) &&
  [
    'Excellent',
    'Good',
    'Fair',
  ].includes(data.condition);

// @route POST /api/cars
// Sirf seller
const addCar = async (req, res) => {
  try {
    const carData = getCarData(req.body);

    if (!validCarData(carData)) {
      return res.status(400).json({
        message:
          'Please complete all required vehicle details',
      });
    }

    const imageFilenames = req.files
      ? req.files.map(
          (file) => file.filename
        )
      : [];

    const car = await Car.create({
      seller: req.user.id,

      ...carData,

      accidentNotes:
        carData.hasAccidentHistory === 'true' ||
        carData.hasAccidentHistory === true
          ? carData.accidentNotes
          : undefined,

      status: 'pending',

      images: imageFilenames,

      // Pehli image ko purane field mein bhi rakho
      // fallback ke liye
      image: imageFilenames[0] || '',
    });

    res.status(201).json(car);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// @route GET /api/cars
// Buyer ke liye — sirf active cars, filters ke sath
const getCars = async (req, res) => {
  try {
    const {
      category,
      search,
      sort,
    } = req.query;

    const filter = {
      status: 'active',
    };

    if (
      category &&
      category !== 'All'
    ) {
      filter.category = category;
    }

    if (search) {
      filter.makeModel = {
        $regex: search,
        $options: 'i',
      };
    }

    // Default: newest first
    let sortOption = {
      createdAt: -1,
    };

    if (sort === 'price_asc') {
      sortOption = {
        price: 1,
      };
    } else if (
      sort === 'price_desc'
    ) {
      sortOption = {
        price: -1,
      };
    } else if (
      sort === 'most_viewed'
    ) {
      sortOption = {
        views: -1,
      };
    }

    const cars = await Car.find(filter)
      .populate(
        'seller',
        'name businessName'
      )
      .sort(sortOption);

    res.json(cars);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// @route GET /api/cars/mine
// Seller apni saari cars dekhe
// Chahe active, pending ya sold ho
const getMyCars = async (req, res) => {
  try {
    const cars = await Car.find({
      seller: req.user.id,
    }).sort({
      createdAt: -1,
    });

    res.json(cars);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// @route GET /api/cars/:id
// Single car detail — buyer "View Details" par
const getCarById = async (
  req,
  res
) => {
  try {
    if (
      !mongoose.isValidObjectId(
        req.params.id
      )
    ) {
      return res.status(400).json({
        message: 'Invalid car ID',
      });
    }

    // Increment only the counter:
    // legacy listings may lack newer required fields.
    //
    // $inc also initializes views when it is absent
    // and avoids lost concurrent views.

    const car =
      await Car.findByIdAndUpdate(
        req.params.id,
        {
          $inc: {
            views: 1,
          },
        },
        {
          returnDocument: 'after',
        }
      ).populate(
        'seller',
        'name businessName'
      );

    if (!car) {
      return res.status(404).json({
        message: 'Car not found',
      });
    }

    res.json(car);
  } catch (err) {
    console.error(
      `Failed to load car ${req.params.id}:`,
      err
    );

    res.status(500).json({
      message: err.message,
    });
  }
};

// @route PUT /api/cars/:id
// Sirf woh seller jiski car hai
const updateCar = async (
  req,
  res
) => {
  try {
    const car = await Car.findById(
      req.params.id
    );

    if (!car) {
      return res.status(404).json({
        message: 'Car not found',
      });
    }

    if (
      car.seller.toString() !==
      req.user.id
    ) {
      return res.status(403).json({
        message: 'Not your listing',
      });
    }

    const carData = getCarData(
      req.body
    );

    Object.assign(
      car,
      carData
    );

    const hasNonStatusChanges =
      Object.keys(carData).some(
        (field) =>
          field !== 'status'
      );

    if (
      hasNonStatusChanges &&
      !validCarData(car)
    ) {
      return res.status(400).json({
        message:
          'Please complete all required vehicle details',
      });
    }

    if (!car.hasAccidentHistory) {
      car.accidentNotes =
        undefined;
    }

    if (
      req.files &&
      req.files.length > 0
    ) {
      const imageFilenames =
        req.files.map(
          (file) => file.filename
        );

      // Nayi images purani images ko replace karengi
      car.images =
        imageFilenames;

      car.image =
        imageFilenames[0];
    }

    await car.save();

    res.json(car);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// @route DELETE /api/cars/:id
// Sirf woh seller jiski car hai
const deleteCar = async (
  req,
  res
) => {
  try {
    const car = await Car.findById(
      req.params.id
    );

    if (!car) {
      return res.status(404).json({
        message: 'Car not found',
      });
    }

    if (
      car.seller.toString() !==
      req.user.id
    ) {
      return res.status(403).json({
        message: 'Not your listing',
      });
    }

    await car.deleteOne();

    res.json({
      message: 'Car deleted',
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  addCar,
  getCars,
  getMyCars,
  getCarById,
  updateCar,
  deleteCar,
};