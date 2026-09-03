require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user');
const RentalCar = require('./models/RentalCar');

const image = '1788275413259-406073865.webp';
const now = new Date();
const availableUntil = new Date(now);
availableUntil.setMonth(availableUntil.getMonth() + 2);

const rentalData = [
  ['Toyota Corolla', 'Altis Grande', 2022, 'Sedan', 'Automatic', 'Petrol', 5, 22000, 3500, 'Lahore', 'Gulberg', 'Comfortable sedan for city and intercity travel.'],
  ['Honda Civic', 'Oriel', 2021, 'Sedan', 'Automatic', 'Petrol', 5, 31000, 4200, 'Karachi', 'Clifton', 'Well-maintained executive sedan with a smooth drive.'],
  ['Toyota Fortuner', 'Sigma 4', 2023, 'SUV', 'Automatic', 'Diesel', 7, 14000, 11000, 'Lahore', 'DHA Phase 6', 'Premium 4x4 SUV for family trips and events.'],
  ['KIA Sportage', 'Alpha', 2022, 'SUV', 'Automatic', 'Petrol', 5, 19000, 7000, 'Islamabad', 'F-7', 'Spacious SUV with modern comfort and safety features.'],
  ['Suzuki Alto', 'VXL AGS', 2023, 'Hatchback', 'Automatic', 'Petrol', 4, 9000, 1800, 'Karachi', 'PECHS', 'Fuel-efficient compact car for daily city use.'],
  ['Suzuki Swift', 'GLX CVT', 2022, 'Hatchback', 'Automatic', 'Petrol', 5, 17000, 2800, 'Lahore', 'Johar Town', 'Stylish hatchback, ideal for short trips and errands.'],
  ['MG ZS EV', 'Essence', 2023, 'Electric', 'Automatic', 'Electric', 5, 8000, 6500, 'Islamabad', 'Blue Area', 'Quiet electric SUV with excellent range for urban travel.'],
  ['BYD Atto 3', 'Comfort', 2024, 'Electric', 'Automatic', 'Electric', 5, 5000, 7500, 'Lahore', 'Model Town', 'New electric crossover with a premium cabin.'],
  ['Mercedes-Benz C-Class', 'C200', 2022, 'Luxury', 'Automatic', 'Petrol', 5, 16000, 10000, 'Karachi', 'DHA Phase 8', 'Elegant luxury sedan for business meetings and weddings.'],
  ['BMW 3 Series', '320i', 2021, 'Luxury', 'Automatic', 'Petrol', 5, 24000, 9500, 'Islamabad', 'E-11', 'Sporty premium sedan with refined performance.'],
  ['Toyota Hilux Revo', 'Rocco', 2022, 'Pickup Truck', 'Automatic', 'Diesel', 5, 27000, 8000, 'Lahore', 'Thokar Niaz Baig', 'Capable pickup for travel, work, and off-road adventures.'],
  ['Isuzu D-Max', 'V-Cross', 2021, 'Pickup Truck', 'Automatic', 'Diesel', 5, 33000, 6500, 'Karachi', 'Korangi', 'Reliable double-cabin pickup with generous cargo space.'],
];

const rentals = rentalData.map((data) => {
  const [makeModel, variant, year, category, transmission, fuelType, seats, mileage, dailyRate, city, pickupArea, description] = data;
  const driverAvailable = Math.random() >= 0.5;
  return {
    makeModel, variant, year, category, transmission, fuelType, seats, mileage, dailyRate,
    city, pickupArea, description, availableFrom: now, availableUntil,
    driverAvailable, driverCharges: driverAvailable ? 2000 : 0,
    minRentalDays: 1, maxRentalDays: 14, status: 'active', images: [image],
  };
});

const runSeed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
    const seller = await User.findOne({ role: 'seller' });
    if (!seller) {
      console.error('No seller account found. Create a seller account before running this seed.');
      process.exit(1);
    }
    const result = await RentalCar.insertMany(rentals.map((rental) => ({ ...rental, seller: seller._id })));
    console.log(`Successfully inserted ${result.length} rental car listings for ${seller.name || seller.email}.`);
    process.exit(0);
  } catch (err) {
    console.error('Rental seeding failed:', err.message);
    process.exit(1);
  }
};

runSeed();
