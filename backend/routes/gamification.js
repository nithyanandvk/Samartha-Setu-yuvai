const express = require('express');
const Leaderboard = require('../models/Leaderboard');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/gamification/leaderboard
// @desc    Get leaderboard
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    const { type = 'national', city, state } = req.query;

    let query = {};
    if (type === 'city' && city) {
      query.city = city;
    } else if (type === 'state' && state) {
      query.state = state;
    }

    const leaderboard = await Leaderboard.find(query)
      .populate('userId', 'name email profileImage role')
      .sort({ points: -1 })
      .limit(100);

    res.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/gamification/user-stats
// @desc    Get user gamification stats
// @access  Private
router.get('/user-stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const leaderboard = await Leaderboard.findOne({ userId: req.user._id });

    // Calculate next level points
    const currentLevelPoints = Math.pow((user.level - 1), 2) * 100;
    const nextLevelPoints = Math.pow(user.level, 2) * 100;
    const progress = ((user.points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;

    res.json({
      points: user.points,
      level: user.level,
      badges: user.badges,
      progress: Math.min(100, Math.max(0, progress)),
      nextLevelPoints,
      rank: leaderboard?.rank || null,
      totalFoodDonated: user.totalFoodDonated,
      totalCO2Reduced: user.totalCO2Reduced
    });
  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/gamification/badges
// @desc    Get all available badges
// @access  Public
router.get('/badges', async (req, res) => {
  const badges = [
    {
      id: 'first_donation',
      name: 'First Step',
      description: 'Made your first donation',
      icon: '🌟'
    },
    {
      id: 'hero',
      name: 'Food Hero',
      description: 'Donated 100kg of food',
      icon: '🦸'
    },
    {
      id: 'champion',
      name: 'Champion',
      description: 'Donated 500kg of food',
      icon: '🏆'
    },
    {
      id: 'earth_saver',
      name: 'Earth Saver',
      description: 'Reduced 1000kg of CO₂',
      icon: '🌍'
    },
    {
      id: 'disaster_hero',
      name: 'Disaster Hero',
      description: 'Participated in disaster relief',
      icon: '🚨'
    },
    {
      id: 'level_10',
      name: 'Level 10 Master',
      description: 'Reached level 10',
      icon: '⭐'
    }
  ];

  res.json(badges);
});

module.exports = router;

