const mongoose = require('mongoose');

const rentalCarSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  makeModel: { type: String, required: true, trim: true },
  variant: { type: String, trim: true },
  year: { type: Number, required: true },
  category: { type: String, required: true, trim: true },
  transmission: { type: String, required: true, trim: true },
  fuelType: { type: String, required: true, trim: true },
  seats: { type: Number, required: true },
  mileage: { type: Number, required: true },
  description: { type: String, trim: true },
  dailyRate: { type: Number, default: 2000, min: 0 },
  images: { type: [String], default: [] },
  city: { type: String, required: true, trim: true },
  pickupArea: { type: String, required: true, trim: true },
  availableFrom: { type: Date, required: true },
  availableUntil: { type: Date, required: true },
  driverAvailable: { type: Boolean, default: false },
  driverCharges: { type: Number, min: 0 },
  minRentalDays: { type: Number, default: 1, min: 1 },
  maxRentalDays: { type: Number, default: 30, min: 1 },
  status: {
    type: String,
    enum: ['draft', 'active', 'reserved', 'rented', 'unavailable', 'archived'],
    default: 'draft',
  },
}, { timestamps: true });

module.exports = mongoose.model('RentalCar', rentalCarSchema);
