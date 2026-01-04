const express = require('express');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Notification = require('../models/Notification');
const Leaderboard = require('../models/Leaderboard');
const Fridge = require('../models/Fridge');
const { auth, adminAuth } = require('../middleware/auth');
const { calculateTotalImpact } = require('../utils/co2Calculator');

const router = express.Router();

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/stats', adminAuth, async (req, res) => {
  try {
    // Total users by role (updated roles)
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Total listings by status
    const listingsByStatus = await Listing.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Total food donated and CO₂ reduced
    const totalImpact = await Listing.aggregate([
      { $match: { status: 'distributed' } },
      {
        $group: {
          _id: null,
          totalFood: { $sum: '$quantity' },
          totalCO2: { $sum: '$estimatedCO2Reduction' },
          totalListings: { $sum: 1 }
        }
      }
    ]);

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = {
      newUsers: await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      newListings: await Listing.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      completedTransactions: await Listing.countDocuments({ 
        status: 'distributed', 
        distributedAt: { $gte: sevenDaysAgo } 
      })
    };

    // City-wise distribution
    const cityStats = await Listing.aggregate([
      { $match: { status: 'distributed' } },
      {
        $group: {
          _id: '$location.city',
          count: { $sum: 1 },
          totalFood: { $sum: '$quantity' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Daily activity (last 30 days)
    const dailyActivity = await Listing.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          foodDonated: { $sum: '$quantity' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      usersByRole,
      listingsByStatus,
      totalImpact: totalImpact[0] || { totalFood: 0, totalCO2: 0, totalListings: 0 },
      recentActivity,
      cityStats,
      dailyActivity,
      totalUsers: await User.countDocuments(),
      totalListings: await Listing.countDocuments(),
      activeListings: await Listing.countDocuments({ status: 'active' }),
      pendingApprovals: await Listing.countDocuments({ status: 'pending_approval' })
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with filters
// @access  Private (Admin only)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 50 } = req.query;
    
    let query = {};
    if (role) query.role = role;
    if (status) query.isActive = status === 'active';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/listings
// @desc    Get all listings with filters
// @access  Private (Admin only)
router.get('/listings', adminAuth, async (req, res) => {
  try {
    const { status, donorId, city, page = 1, limit = 50 } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (donorId) query.donorId = donorId;
    if (city) query['location.city'] = city;

    const listings = await Listing.find(query)
      .populate('donorId', 'name email phone organizationName')
      .populate('claimedBy', 'name email phone')
      .populate('claimRequests.receiverId', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Listing.countDocuments(query);

    res.json({
      listings,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Admin get listings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/volunteers
// @desc    Get all volunteers
// @access  Private (Admin only)
router.get('/volunteers', adminAuth, async (req, res) => {
  try {
    const volunteers = await User.find({ role: 'volunteer' })
      .select('-password')
      .populate('location')
      .sort({ points: -1 });

    res.json(volunteers);
  } catch (error) {
    console.error('Admin get volunteers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/map-data
// @desc    Get all data for admin map view
// @access  Private (Admin only)
router.get('/map-data', adminAuth, async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = {};
    if (status) query.status = status;

    const listings = await Listing.find(query)
      .populate('donorId', 'name email')
      .populate('claimedBy', 'name email')
      .select('title location status quantity unit expiryTime donorId claimedBy');

    const users = await User.find({ isActive: true })
      .select('name role location organizationName')
      .where('location.coordinates').exists();

    const fridges = await Fridge.find({ isActive: true })
      .select('name type location capacity currentInventory');

    res.json({
      listings,
      users,
      fridges
    });
  } catch (error) {
    console.error('Admin map data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id/ban
// @desc    Ban/unban a user
// @access  Private (Admin only)
router.put('/users/:id/ban', adminAuth, async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = isActive !== undefined ? isActive : !user.isActive;
    await user.save();

    await Notification.create({
      userId: user._id,
      type: 'system',
      title: user.isActive ? 'Account Activated' : 'Account Banned',
      message: user.isActive 
        ? 'Your account has been activated by an administrator.'
        : 'Your account has been banned. Please contact support.',
      priority: 'high'
    });

    res.json({ message: `User ${user.isActive ? 'activated' : 'banned'} successfully`, user });
  } catch (error) {
    console.error('Admin ban user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id/verify
// @desc    Verify/reject a user
// @access  Private (Admin only)
router.put('/users/:id/verify', adminAuth, async (req, res) => {
  try {
    const { verificationStatus } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!['pending', 'verified', 'rejected'].includes(verificationStatus)) {
      return res.status(400).json({ message: 'Invalid verification status' });
    }

    user.verificationStatus = verificationStatus;
    await user.save();

    await Notification.create({
      userId: user._id,
      type: 'system',
      title: `Verification ${verificationStatus}`,
      message: `Your account verification status has been updated to: ${verificationStatus}`,
      priority: 'high'
    });

    res.json({ message: 'User verification status updated', user });
  } catch (error) {
    console.error('Admin verify user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/listings/:id
// @desc    Delete a listing (admin)
// @access  Private (Admin only)
router.delete('/listings/:id', adminAuth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    await listing.deleteOne();

    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Admin delete listing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/transactions
// @desc    Get all food transactions
// @access  Private (Admin only)
router.get('/transactions', adminAuth, async (req, res) => {
  try {
    const { status, startDate, endDate, page = 1, limit = 50 } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const transactions = await Listing.find(query)
      .populate('donorId', 'name email phone organizationName')
      .populate('claimedBy', 'name email phone')
      .populate('claimRequests.receiverId', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Listing.countDocuments(query);

    // Calculate totals
    const totals = await Listing.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: '$quantity' },
          totalCO2: { $sum: '$estimatedCO2Reduction' }
        }
      }
    ]);

    res.json({
      transactions,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
      totals: totals[0] || { totalQuantity: 0, totalCO2: 0 }
    });
  } catch (error) {
    console.error('Admin transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/insights
// @desc    Get database insights and analytics
// @access  Private (Admin only)
router.get('/insights', adminAuth, async (req, res) => {
  try {
    // Top donors (users and organizations)
    const topDonors = await User.aggregate([
      { $match: { role: { $in: ['user', 'organization'] } } },
      { $sort: { totalFoodDonated: -1 } },
      { $limit: 10 },
      {
        $project: {
          name: 1,
          email: 1,
          totalFoodDonated: 1,
          totalCO2Reduced: 1,
          points: 1,
          level: 1
        }
      }
    ]);

    // Top receivers
    const topReceivers = await Listing.aggregate([
      { $match: { status: 'distributed', claimedBy: { $exists: true } } },
      {
        $group: {
          _id: '$claimedBy',
          count: { $sum: 1 },
          totalFood: { $sum: '$quantity' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          name: '$user.name',
          email: '$user.email',
          count: 1,
          totalFood: 1
        }
      }
    ]);

    // Food type distribution
    const foodTypeDistribution = await Listing.aggregate([
      { $match: { status: 'distributed' } },
      {
        $group: {
          _id: '$foodType',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' }
        }
      }
    ]);

    // Status distribution over time
    const statusOverTime = await Listing.aggregate([
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    // Claim approval rate
    const claimStats = await Listing.aggregate([
      {
        $group: {
          _id: null,
          totalClaims: {
            $sum: {
              $cond: [
                { $isArray: '$claimRequests' },
                { $size: '$claimRequests' },
                0
              ]
            }
          },
          approvedClaims: {
            $sum: {
              $cond: [
                { $isArray: '$claimRequests' },
                {
                  $size: {
                    $filter: {
                      input: '$claimRequests',
                      as: 'req',
                      cond: { $eq: ['$$req.status', 'approved'] }
                    }
                  }
                },
                0
              ]
            }
          }
        }
      }
    ]);

    // Fallback routing stats
    const fallbackStats = await Listing.aggregate([
      { $match: { status: 'fallback' } },
      {
        $group: {
          _id: '$fallbackRoute',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' }
        }
      }
    ]);

    res.json({
      topDonors,
      topReceivers,
      foodTypeDistribution,
      statusOverTime,
      claimStats: claimStats[0] || { totalClaims: 0, approvedClaims: 0 },
      fallbackStats
    });
  } catch (error) {
    console.error('Admin insights error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

