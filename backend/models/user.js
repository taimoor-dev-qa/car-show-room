const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed hoga, plain text nahi
  role: { type: String, enum: ['buyer', 'seller'], required: true },
  businessName: { type: String }, // sirf seller ke liye (jaise "Ali Motors")
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);