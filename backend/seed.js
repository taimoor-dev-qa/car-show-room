require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Car = require('./models/Car');
const categoryImages = {
  Sedan: ['1788275413259-406073865.webp'],
  SUV: ['1788275413259-406073865.webp'],
  Hatchback: ['1788275413259-406073865.webp'],
  Electric: ['1788275413259-406073865.webp'],
  Luxury: ['1788275413259-406073865.webp'],
  'Pickup Truck': ['1788275413259-406073865.webp'],
};

const seedCars = [
    // ===== SEDAN =====
    { makeModel: 'Toyota Corolla Altis', year: 2022, price: 5200000, category: 'Sedan', description: '18,000 km driven, 1st owner, full option.' },
    { makeModel: 'Honda City Aspire', year: 2021, price: 4800000, category: 'Sedan', description: '24,500 km driven, well maintained.' },
    { makeModel: 'Suzuki Ciaz', year: 2023, price: 4300000, category: 'Sedan', description: 'Brand new condition, 5,000 km driven.' },

    // ===== SUV =====
    { makeModel: 'Toyota Fortuner', year: 2023, price: 12500000, category: 'SUV', description: 'Low mileage, single owner, full service history.' },
    { makeModel: 'Honda BR-V', year: 2022, price: 6200000, category: 'SUV', description: '7-seater, family friendly, 1st owner.' },
    { makeModel: 'KIA Sportage', year: 2023, price: 9800000, category: 'SUV', description: 'Top of the line variant, like new.' },

    // ===== HATCHBACK =====
    { makeModel: 'Suzuki Alto VXR', year: 2022, price: 2300000, category: 'Hatchback', description: '15,000 km driven, 1st owner, economical.' },
    { makeModel: 'Suzuki Cultus', year: 2021, price: 2800000, category: 'Hatchback', description: 'Well maintained, good for city driving.' },
    { makeModel: 'Toyota Vitz', year: 2020, price: 3100000, category: 'Hatchback', description: 'Imported, excellent fuel average.' },

    // ===== ELECTRIC =====
    { makeModel: 'Tesla Model 3', year: 2023, price: 18900000, category: 'Electric', description: '5,000 km driven, autopilot enabled.' },
    { makeModel: 'BYD Atto 3', year: 2023, price: 11500000, category: 'Electric', description: 'Brand new, long range battery.' },
    { makeModel: 'MG ZS EV', year: 2022, price: 9900000, category: 'Electric', description: '1st owner, showroom condition.' },

    // ===== LUXURY =====
    { makeModel: 'Audi A4 Premium', year: 2021, price: 14200000, category: 'Luxury', description: '22,000 km driven, 2nd owner.' },
    { makeModel: 'Mercedes C-Class', year: 2022, price: 19500000, category: 'Luxury', description: 'Full option, excellent condition.' },
    { makeModel: 'BMW 3 Series', year: 2021, price: 16800000, category: 'Luxury', description: 'Well maintained, sunroof edition.' },

    // ===== PICKUP TRUCK =====
    { makeModel: 'Toyota Hilux Revo', year: 2020, price: 9800000, category: 'Pickup Truck', description: '35,000 km driven, 2nd owner.' },
    { makeModel: 'Isuzu D-Max', year: 2021, price: 8700000, category: 'Pickup Truck', description: '4x4, good for off-road use.' },
    { makeModel: 'Toyota Hilux Vigo', year: 2019, price: 7200000, category: 'Pickup Truck', description: 'Well maintained, single owner.' },
];

const runSeed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected');

        // Pehla seller dhundo (jo bhi database me maujood hai)
        const seller = await User.findOne({ role: 'seller' });

        if (!seller) {
            console.log('❌ Koi seller account nahi mila. Pehle ek seller account banao, phir seed chalao.');
            process.exit(1);
        }

        console.log(`📦 Seeding cars under seller: ${seller.name} (${seller.email})`);

        const now = new Date();
        const result = await Car.bulkWrite(
            seedCars.map((car) => ({
                updateMany: {
                    filter: {
                        seller: seller._id,
                        makeModel: car.makeModel,
                        year: car.year,
                        category: car.category,
                    },
                    update: {
                        $set: {
                            images: categoryImages[car.category] || [],
                        },
                        $setOnInsert: {
                            ...car,
                            seller: seller._id,
                            status: 'active',
                            views: Math.floor(Math.random() * 100),
                            createdAt: now,
                            updatedAt: now,
                        },
                    },
                    upsert: true,
                    timestamps: false,
                },
            }))
        );

        console.log(`✅ Updated ${result.modifiedCount} existing demo cars.`);
        console.log(`✅ Added ${result.upsertedCount} missing demo cars.`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err.message);
        process.exit(1);
    }
};

runSeed();
