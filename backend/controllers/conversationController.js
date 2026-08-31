const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Car = require('../models/car');
const mongoose = require('mongoose');

// @route POST /api/conversations   (buyer "Chat with Seller" dabaye to ye call hoga)
// Agar is car pe pehle se conversation ban chuki hai to wahi return karo, warna nayi banao
const startConversation = async (req, res) => {
  try {
    const { carId } = req.body;
    const buyerId = req.user.id;

    if (!mongoose.isValidObjectId(carId)) {
      return res.status(400).json({ message: 'A valid carId is required' });
    }

    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ message: 'Car not found' });

    let conversation = await Conversation.findOne({
      car: carId,
      buyer: buyerId,
      seller: car.seller,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        car: carId,
        buyer: buyerId,
        seller: car.seller,
      });
    }

    res.status(201).json(conversation);
  } catch (err) {
    console.error('Start conversation error:', err);
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/conversations   (logged-in user ki saari conversations — chahe buyer ho ya seller)
const getMyConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({
      $or: [{ buyer: userId }, { seller: userId }],
    })
      .populate('car', 'makeModel image')
      .populate('buyer', 'name')
      .populate('seller', 'name businessName')
      .sort({ lastMessageAt: -1 });

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/conversations/:id/messages   (kisi conversation ke saare purane messages)
const getMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

    // Security check: sirf wahi dekh sake jo isme buyer ya seller hai
    const userId = req.user.id;
    if (conversation.buyer.toString() !== userId && conversation.seller.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const messages = await Message.find({ conversation: req.params.id })
      .populate('sender', 'name role')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { startConversation, getMyConversations, getMessages };
