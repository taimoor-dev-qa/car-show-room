const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  makeModel: { type: String, required: true },
  year: { type: Number, required: true },
  price: { type: Number, required: true },
  category: { type: String, enum: ['Sedan', 'SUV', 'Hatchback', 'Electric', 'Luxury', 'Pickup Truck'], required: true },
  description: { type: String },
  mileage: { type: Number, required: true, min: 0 },
  fuelType: { type: String, enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'], required: true },
  transmission: { type: String, enum: ['Manual', 'Automatic'], required: true },
  ownerCount: { type: Number, required: true, min: 1 },
  registrationCity: { type: String, trim: true, required: true },
  color: { type: String, trim: true },
  variant: { type: String, trim: true },
  engineCapacity: { type: Number },
  isRegistered: { type: Boolean, default: true },
  condition: { type: String, enum: ['Excellent', 'Good', 'Fair'], required: true },
  hasAccidentHistory: { type: Boolean, default: false },
  accidentNotes: { type: String, trim: true },
  isNegotiable: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'pending', 'sold'], default: 'pending' },
  views: { type: Number, default: 0 },
  image: { type: String, default: '' },
  images: { type: [String], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Car', carSchema);
