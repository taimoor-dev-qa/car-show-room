const Inquiry = require('../models/Inquiry');

// @route POST /api/inquiries   (buyer bhejta hai)
const sendInquiry = async (req, res) => {
  try {
    const { carId, message } = req.body;

    const inquiry = await Inquiry.create({
      car: carId,
      buyer: req.user.id,
      message,
    });

    res.status(201).json(inquiry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/inquiries/mine   (seller apni cars ki inquiries dekhe)
const getMyInquiries = async (req, res) => {
  try {
    const Car = require('../models/car');
    const myCars = await Car.find({ seller: req.user.id }).select('_id');
    const carIds = myCars.map(c => c._id);

    const inquiries = await Inquiry.find({ car: { $in: carIds } })
      .populate('buyer', 'name email')
      .populate('car', 'makeModel')
      .sort({ createdAt: -1 });

    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { sendInquiry, getMyInquiries };