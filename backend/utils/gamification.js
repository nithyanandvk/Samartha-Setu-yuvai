const User = require('../models/User');
const Leaderboard = require('../models/Leaderboard');

// Points calculation
const POINTS_PER_KG_DONATED = 10;
const POINTS_PER_KG_RECEIVED = 5;
const POINTS_PER_CO2_KG = 2;
const POINTS_FIRST_DONATION = 50;
const POINTS_DISASTER_RELIEF = 25;

const calculatePoints = (action, quantity = 0, co2Reduced = 0) => {
  let points = 0;
  
  switch (action) {
    case 'donate':
      points = quantity * POINTS_PER_KG_DONATED;
      break;
    case 'receive':
      points = quantity * POINTS_PER_KG_RECEIVED;
      break;
    case 'co2_reduction':
      points = co2Reduced * POINTS_PER_CO2_KG;
      break;
    case 'first_donation':
      points = POINTS_FIRST_DONATION;
      break;
    case 'disaster_relief':
      points = POINTS_DISASTER_RELIEF;
      break;
  }
  
  return Math.round(points);
};

// Level calculation (exponential growth)
const calculateLevel = (totalPoints) => {
  // Level formula: level = floor(sqrt(points / 100)) + 1
  return Math.floor(Math.sqrt(totalPoints / 100)) + 1;
};

// Badge system
const checkBadges = async (userId) => {
  const user = await User.findById(userId);
  const badges = user.badges || [];
  const newBadges = [];

  // First Donation
  if (user.totalFoodDonated > 0 && !badges.includes('first_donation')) {
    newBadges.push('first_donation');
  }

  // Hero (100kg donated)
  if (user.totalFoodDonated >= 100 && !badges.includes('hero')) {
    newBadges.push('hero');
  }

  // Champion (500kg donated)
  if (user.totalFoodDonated >= 500 && !badges.includes('champion')) {
    newBadges.push('champion');
  }

  // Earth Saver (1000kg CO₂ reduced)
  if (user.totalCO2Reduced >= 1000 && !badges.includes('earth_saver')) {
    newBadges.push('earth_saver');
  }

  // Disaster Hero
  if (user.disasterModeEnabled && !badges.includes('disaster_hero')) {
    newBadges.push('disaster_hero');
  }

  // Level 10
  if (user.level >= 10 && !badges.includes('level_10')) {
    newBadges.push('level_10');
  }

  if (newBadges.length > 0) {
    user.badges = [...badges, ...newBadges];
    await user.save();
  }

  return newBadges;
};

// Update leaderboard
const updateLeaderboard = async (userId) => {
  const user = await User.findById(userId);
  if (!user || !user.location) return;

  const city = user.location.city || 'Unknown';
  const state = user.location.state || 'Unknown';

  let leaderboard = await Leaderboard.findOne({ userId });
  
  if (!leaderboard) {
    leaderboard = new Leaderboard({
      userId,
      city,
      state
    });
  }

  leaderboard.points = user.points;
  leaderboard.foodDonated = user.totalFoodDonated;
  leaderboard.co2Reduced = user.totalCO2Reduced;
  leaderboard.city = city;
  leaderboard.state = state;
  leaderboard.lastUpdated = new Date();

  await leaderboard.save();

  // Update ranks
  await updateRanks(userId, city, state);
};

const updateRanks = async (userId, city, state) => {
  // City rank
  const cityRank = await Leaderboard.countDocuments({
    city,
    points: { $gt: (await Leaderboard.findOne({ userId })).points }
  }) + 1;

  // State rank
  const stateRank = await Leaderboard.countDocuments({
    state,
    points: { $gt: (await Leaderboard.findOne({ userId })).points }
  }) + 1;

  // National rank
  const nationalRank = await Leaderboard.countDocuments({
    points: { $gt: (await Leaderboard.findOne({ userId })).points }
  }) + 1;

  await Leaderboard.updateOne(
    { userId },
    { $set: { rank: { cityRank, stateRank, nationalRank } } }
  );
};

module.exports = {
  calculatePoints,
  calculateLevel,
  checkBadges,
  updateLeaderboard,
  POINTS_PER_KG_DONATED,
  POINTS_PER_KG_RECEIVED
};

