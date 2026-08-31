const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  makeModel: { type: String, required: true },
  year: { type: Number, required: true },
  price: { type: Number, required: true },
  category: { type: String, enum: ['Sedan', 'SUV', 'Hatchback', 'Electric', 'Luxury', 'Pickup Truck'], required: true },
  description: { type: String },
  status: { type: String, enum: ['active', 'pending', 'sold'], default: 'pending' },
  views: { type: Number, default: 0 },
  image: { type: String, default: '' },   // <-- naya field, image ka filename/path save hoga
}, { timestamps: true });



module.exports = mongoose.model('Car', carSchema);