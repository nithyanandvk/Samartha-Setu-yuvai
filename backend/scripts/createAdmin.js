const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/samartha-setu');
    console.log('Connected to MongoDB');

    // Default admin credentials
    const adminEmail = 'admin@samarthasetu.in';
    const adminPassword = 'Admin@123'; // Default password - should be changed in production
    const adminName = 'System Administrator';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: ${adminPassword}`);
      process.exit(0);
    }

    // Create admin user
    // Note: Don't hash password here - User model's pre-save hook will handle it
    const admin = new User({
      name: adminName,
      email: adminEmail,
      password: adminPassword, // Let the model's pre-save hook hash it
      role: 'admin',
      phone: '+91 9999999999',
      location: {
        type: 'Point',
        coordinates: [77.2090, 28.6139], // Delhi coordinates
        address: 'Admin Office',
        city: 'Delhi',
        state: 'Delhi'
      },
      verificationStatus: 'verified',
      isActive: true,
      points: 0,
      level: 1
    });

    await admin.save();
    console.log('✅ Default admin user created successfully!');
    console.log('\n📋 Admin Credentials:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();

