const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Listing = require('../models/Listing');
const Fridge = require('../models/Fridge');

async function createIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/samartha-setu');
    console.log('Connected to MongoDB');

    // Create geospatial indexes
    console.log('Creating geospatial indexes...');
    
    // User location index
    await User.collection.createIndex({ location: '2dsphere' });
    console.log('✅ User location index created');

    // Listing location index
    await Listing.collection.createIndex({ location: '2dsphere' });
    console.log('✅ Listing location index created');

    // Fridge location index
    await Fridge.collection.createIndex({ location: '2dsphere' });
    console.log('✅ Fridge location index created');

    // Other indexes
    await Listing.collection.createIndex({ status: 1, createdAt: -1 });
    await Listing.collection.createIndex({ donorId: 1, status: 1 });
    await User.collection.createIndex({ email: 1 }, { unique: true });
    
    console.log('✅ All indexes created successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    process.exit(1);
  }
}

createIndexes();

