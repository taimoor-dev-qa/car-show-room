const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String },
  surname: { type: String },
  age: { type: Number },
  name: { type: String },   // backward-compatible field (firstName + surname combine ho kar yahan save hoga)
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['buyer', 'seller'], required: true },
  businessName: { type: String },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpiry: { type: Date },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Car' }],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);