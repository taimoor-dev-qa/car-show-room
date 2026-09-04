const mongoose = require('mongoose');

const rentalRequestSchema = new mongoose.Schema({
  rentalCar: { type: mongoose.Schema.Types.ObjectId, ref: 'RentalCar', required: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalDays: { type: Number, required: true },
  estimatedTotal: { type: Number, required: true },
  driverRequested: { type: Boolean, default: false },
  pickupNotes: { type: String, trim: true },
  passengerCount: { type: Number, required: true, min: 1 },
  pickupAddress: { type: String, required: true, trim: true },
  returnSameAsPickup: { type: Boolean, default: true },
  returnAddress: { type: String, trim: true },
  contactPhone: { type: String, required: true, trim: true },
  contactName: { type: String, trim: true },
  cnicNumber: { type: String, required: true, trim: true },
  rentalPurpose: {
    type: String,
    enum: ['Personal', 'Business', 'Wedding', 'Trip/Vacation', 'Other'],
    required: true,
  },
  estimatedDistance: { type: Number },
  depositAcknowledged: { type: Boolean, required: true },
  paymentMethod: { type: String, enum: ['Cash', 'Bank Transfer'], required: true },
  termsAccepted: { type: Boolean, required: true },
  licenseConfirmed: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed'],
    default: 'pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('RentalRequest', rentalRequestSchema);
