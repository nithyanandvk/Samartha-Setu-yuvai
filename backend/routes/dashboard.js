const express = require('express');
const User = require('../models/User');
const Listing = require('../models/Listing');
const { calculateTotalImpact } = require('../utils/co2Calculator');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // User's listings with error handling
    let userListings = [];
    let activeListings = 0;
    let distributedListings = 0;
    let recentListings = [];

    try {
      userListings = await Listing.find({ donorId: userId });
      activeListings = await Listing.countDocuments({ donorId: userId, status: 'active' });
      distributedListings = await Listing.countDocuments({ donorId: userId, status: 'distributed' });
      recentListings = await Listing.find({ donorId: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('claimedBy', 'name');
    } catch (dbError) {
      console.warn('Error fetching listings:', dbError.message);
      // Continue with empty arrays
    }

    // Calculate impact
    const impact = calculateTotalImpact(userListings);

    res.json({
      user: {
        points: user.points || 0,
        level: user.level || 1,
        badges: user.badges || [],
        totalFoodDonated: user.totalFoodDonated || 0,
        totalCO2Reduced: user.totalCO2Reduced || 0
      },
      listings: {
        total: userListings.length,
        active: activeListings,
        distributed: distributedListings
      },
      impact,
      recentListings
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    // Return default stats instead of error
    res.json({
      user: {
        points: 0,
        level: 1,
        badges: [],
        totalFoodDonated: 0,
        totalCO2Reduced: 0
      },
      listings: {
        total: 0,
        active: 0,
        distributed: 0
      },
      impact: {
        totalFoodSaved: 0,
        totalCO2Reduced: 0,
        treesEquivalent: 0,
        mealsEquivalent: 0
      },
      recentListings: []
    });
  }
});

// @route   GET /api/dashboard/global-stats
// @desc    Get global platform statistics
// @access  Public
router.get('/global-stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalListings = await Listing.countDocuments();
    const activeListings = await Listing.countDocuments({ status: 'active' });
    const distributedListings = await Listing.countDocuments({ status: 'distributed' });

    const allListings = await Listing.find({ status: 'distributed' });
    const globalImpact = calculateTotalImpact(allListings);

    // City-wise stats
    const cityStats = await Listing.aggregate([
      { $match: { status: 'distributed' } },
      {
        $group: {
          _id: '$location.city',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      totalUsers,
      totalListings,
      activeListings,
      distributedListings,
      globalImpact,
      topCities: cityStats
    });
  } catch (error) {
    console.error('Global stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/impact-timeline
// @desc    Get impact data over time
// @access  Private
router.get('/impact-timeline', auth, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const timeline = await Listing.aggregate([
      {
        $match: {
          donorId: req.user._id,
          status: 'distributed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          foodSaved: { $sum: '$quantity' },
          co2Reduced: { $sum: '$estimatedCO2Reduction' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(timeline);
  } catch (error) {
    console.error('Impact timeline error:', error);
    // Return empty timeline instead of error
    res.json([]);
  }
});

module.exports = router;

