const mongoose = require('mongoose');
require('dotenv').config();
const Disaster = require('../models/Disaster');
const User = require('../models/User');

async function seedDisasters() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/samartha-setu');
    console.log('✅ Connected to MongoDB');

    // Find admin user
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.error('❌ Admin user not found. Please create an admin user first.');
      process.exit(1);
    }

    // Check if disasters already exist
    const existingDisasters = await Disaster.countDocuments();
    if (existingDisasters > 0) {
      console.log('✅ Disasters already exist. Skipping seed.');
      process.exit(0);
    }

    // Sample Disaster 1: Flood in Assam
    const disaster1 = new Disaster({
      title: 'Severe Flooding in Assam - Urgent Relief Needed',
      description: 'Heavy monsoon rains have caused severe flooding in multiple districts of Assam. Thousands of families have been displaced and are in urgent need of food, clean water, and essential supplies. The flood situation is critical with many areas still underwater.',
      type: 'flood',
      severity: 'critical',
      location: {
        type: 'Point',
        coordinates: [91.7500, 26.1500], // Guwahati, Assam
        address: 'Multiple districts affected',
        city: 'Guwahati',
        state: 'Assam',
        pincode: '781001'
      },
      affectedAreas: [
        { city: 'Dhemaji', state: 'Assam', coordinates: [94.5333, 27.4833] },
        { city: 'Barpeta', state: 'Assam', coordinates: [91.0000, 26.3167] },
        { city: 'Morigaon', state: 'Assam', coordinates: [92.3500, 26.2500] }
      ],
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      status: 'active',
      requiredItems: [
        { item: 'Rice', quantity: 5000, unit: 'kg', priority: 'critical' },
        { item: 'Clean Water', quantity: 10000, unit: 'liters', priority: 'critical' },
        { item: 'Blankets', quantity: 2000, unit: 'pieces', priority: 'high' },
        { item: 'Medicines', quantity: 500, unit: 'packets', priority: 'high' },
        { item: 'Dry Food Items', quantity: 3000, unit: 'kg', priority: 'critical' },
        { item: 'Clothing', quantity: 1500, unit: 'pieces', priority: 'medium' }
      ],
      createdBy: admin._id,
      officialSources: [
        { name: 'Assam State Disaster Management Authority', url: 'https://asdma.assam.gov.in' },
        { name: 'NDMA India', url: 'https://ndma.gov.in' }
      ],
      contactInfo: {
        phone: '+91-361-2234567',
        email: 'relief.assam@gov.in',
        website: 'https://asdma.assam.gov.in'
      }
    });

    // Sample Disaster 2: Cyclone in Odisha
    const disaster2 = new Disaster({
      title: 'Cyclone Relief - Coastal Odisha Districts',
      description: 'A severe cyclonic storm has made landfall in coastal Odisha, causing widespread damage to infrastructure, homes, and agricultural fields. Coastal districts are severely affected with power outages and communication disruptions. Immediate assistance required for affected communities.',
      type: 'cyclone',
      severity: 'high',
      location: {
        type: 'Point',
        coordinates: [85.8245, 20.2961], // Bhubaneswar, Odisha
        address: 'Coastal districts affected',
        city: 'Bhubaneswar',
        state: 'Odisha',
        pincode: '751001'
      },
      affectedAreas: [
        { city: 'Puri', state: 'Odisha', coordinates: [85.8333, 19.8000] },
        { city: 'Cuttack', state: 'Odisha', coordinates: [85.8833, 20.4667] },
        { city: 'Kendrapara', state: 'Odisha', coordinates: [86.5000, 20.5000] },
        { city: 'Jagatsinghpur', state: 'Odisha', coordinates: [86.3333, 20.2667] }
      ],
      startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      status: 'active',
      requiredItems: [
        { item: 'Ready-to-Eat Food', quantity: 8000, unit: 'packets', priority: 'critical' },
        { item: 'Tarpaulin Sheets', quantity: 5000, unit: 'pieces', priority: 'high' },
        { item: 'Water Purification Tablets', quantity: 10000, unit: 'strips', priority: 'critical' },
        { item: 'Candles & Matchboxes', quantity: 3000, unit: 'packets', priority: 'medium' },
        { item: 'First Aid Kits', quantity: 1000, unit: 'pieces', priority: 'high' },
        { item: 'Biscuits & Dry Snacks', quantity: 5000, unit: 'kg', priority: 'high' }
      ],
      createdBy: admin._id,
      officialSources: [
        { name: 'Odisha State Disaster Management Authority', url: 'https://osdma.org' },
        { name: 'IMD Bhubaneswar', url: 'https://mausam.imd.gov.in' }
      ],
      contactInfo: {
        phone: '+91-674-2531100',
        email: 'controlroom.osdma@gov.in',
        website: 'https://osdma.org'
      }
    });

    await disaster1.save();
    await disaster2.save();

    console.log('✅ Successfully seeded 2 disasters:');
    console.log('   1. Severe Flooding in Assam');
    console.log('   2. Cyclone Relief - Coastal Odisha Districts');
    console.log('\n📋 Disasters are now visible in the Disaster Management Platform');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding disasters:', error);
    process.exit(1);
  }
}

seedDisasters();

