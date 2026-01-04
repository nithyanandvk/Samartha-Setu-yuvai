const mongoose = require('mongoose');
require('dotenv').config();
const Fridge = require('../models/Fridge');

// Indian cities with coordinates [longitude, latitude]
const cities = [
  { name: 'Mumbai', coords: [72.8777, 19.0760], state: 'Maharashtra' },
  { name: 'Delhi', coords: [77.2090, 28.6139], state: 'Delhi' },
  { name: 'Bangalore', coords: [77.5946, 12.9716], state: 'Karnataka' },
  { name: 'Hyderabad', coords: [78.4867, 17.3850], state: 'Telangana' },
  { name: 'Chennai', coords: [80.2707, 13.0827], state: 'Tamil Nadu' },
  { name: 'Kolkata', coords: [88.3639, 22.5726], state: 'West Bengal' },
  { name: 'Pune', coords: [73.8567, 18.5204], state: 'Maharashtra' },
  { name: 'Ahmedabad', coords: [72.5714, 23.0225], state: 'Gujarat' },
  { name: 'Jaipur', coords: [75.7873, 26.9124], state: 'Rajasthan' },
  { name: 'Surat', coords: [72.8311, 21.1702], state: 'Gujarat' }
];

// Generate random coordinates within a city (small offset)
const getRandomCoords = (baseCoords) => {
  const offset = 0.05; // ~5km offset
  return [
    baseCoords[0] + (Math.random() - 0.5) * offset,
    baseCoords[1] + (Math.random() - 0.5) * offset
  ];
};

// Fridge names
const fridgeNames = [
  'Community Fridge',
  'Food Hub',
  'Sharing Point',
  'Community Kitchen',
  'Food Bank',
  'Neighborhood Fridge',
  'Community Pantry',
  'Food Sharing Hub'
];

// Animal farm names
const farmNames = [
  'Green Pastures Farm',
  'Happy Animals Farm',
  'Eco Farm',
  'Sustainable Livestock Farm',
  'Organic Animal Farm',
  'Community Animal Farm',
  'Green Valley Farm',
  'Nature\'s Farm'
];

// Compost center names
const compostNames = [
  'Eco Compost Center',
  'Green Waste Hub',
  'Organic Recycling Center',
  'Sustainable Compost Hub',
  'Bio Waste Center',
  'Green Compost Facility',
  'Organic Waste Center',
  'Eco Recycling Hub'
];

async function seedFridges() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/samartha-setu');
    console.log('Connected to MongoDB');

    // Clear existing fridges
    await Fridge.deleteMany({});
    console.log('Cleared existing fridges');

    const fridges = [];

    // Create 10 Community Fridges
    for (let i = 0; i < 10; i++) {
      const city = cities[i % cities.length];
      const coords = getRandomCoords(city.coords);
      fridges.push({
        name: `${fridgeNames[i % fridgeNames.length]} ${i + 1} - ${city.name}`,
        location: {
          type: 'Point',
          coordinates: coords,
          address: `Street ${i + 1}, ${city.name}`,
          city: city.name,
          state: city.state
        },
        type: 'community-fridge',
        capacity: Math.floor(Math.random() * 500) + 100, // 100-600 kg
        currentInventory: Math.floor(Math.random() * 200),
        isActive: true,
        contactInfo: {
          phone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          email: `fridge${i + 1}@samarthasetu.in`
        }
      });
    }

    // Create 10 Animal Farms
    for (let i = 0; i < 10; i++) {
      const city = cities[i % cities.length];
      const coords = getRandomCoords(city.coords);
      fridges.push({
        name: `${farmNames[i % farmNames.length]} - ${city.name}`,
        location: {
          type: 'Point',
          coordinates: coords,
          address: `Farm Road ${i + 1}, ${city.name}`,
          city: city.name,
          state: city.state
        },
        type: 'animal-farm',
        capacity: Math.floor(Math.random() * 1000) + 500, // 500-1500 kg
        currentInventory: Math.floor(Math.random() * 500),
        isActive: true,
        contactInfo: {
          phone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          email: `farm${i + 1}@samarthasetu.in`
        }
      });
    }

    // Create 10 Compost Centers
    for (let i = 0; i < 10; i++) {
      const city = cities[i % cities.length];
      const coords = getRandomCoords(city.coords);
      fridges.push({
        name: `${compostNames[i % compostNames.length]} - ${city.name}`,
        location: {
          type: 'Point',
          coordinates: coords,
          address: `Recycling Street ${i + 1}, ${city.name}`,
          city: city.name,
          state: city.state
        },
        type: 'compost-center',
        capacity: Math.floor(Math.random() * 2000) + 1000, // 1000-3000 kg
        currentInventory: Math.floor(Math.random() * 1000),
        isActive: true,
        contactInfo: {
          phone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          email: `compost${i + 1}@samarthasetu.in`
        }
      });
    }

    await Fridge.insertMany(fridges);
    console.log(`✅ Created ${fridges.length} fridges/hubs:`);
    console.log(`   - 10 Community Fridges`);
    console.log(`   - 10 Animal Farms`);
    console.log(`   - 10 Compost Centers`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding fridges:', error);
    process.exit(1);
  }
}

seedFridges();

