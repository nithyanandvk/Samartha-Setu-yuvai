const express = require('express');
const Disaster = require('../models/Disaster');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { auth, adminAuth } = require('../middleware/auth');
const { geocodeAddress } = require('../utils/geocoding');

const router = express.Router();

// @route   GET /api/disasters
// @desc    Get all active disasters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { status, type, state } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    } else {
      // Default to active disasters
      query.status = { $in: ['active', 'monitoring'] };
    }

    if (type) query.type = type;
    if (state) query['location.state'] = state;

    const disasters = await Disaster.find(query)
      .populate('createdBy', 'name email')
      .sort({ severity: -1, createdAt: -1 });

    res.json(disasters);
  } catch (error) {
    console.error('Get disasters error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/disasters/:id
// @desc    Get single disaster details
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const disaster = await Disaster.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('donations.donorId', 'name email phone location');

    if (!disaster) {
      return res.status(404).json({ message: 'Disaster not found' });
    }

    res.json(disaster);
  } catch (error) {
    console.error('Get disaster error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/disasters
// @desc    Create a new disaster (Admin only)
// @access  Private (Admin)
router.post('/', adminAuth, async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      severity,
      city,
      state,
      pincode,
      address,
      affectedAreas,
      startDate,
      endDate,
      requiredItems,
      images,
      officialSources,
      contactInfo
    } = req.body;

    // Geocode location
    const coordinates = await geocodeAddress({ address, city, state, pincode });
    if (!coordinates) {
      return res.status(400).json({ message: 'Could not geocode location' });
    }

    const disaster = new Disaster({
      title,
      description,
      type,
      severity: severity || 'medium',
      location: {
        type: 'Point',
        coordinates,
        address,
        city,
        state,
        pincode
      },
      affectedAreas: affectedAreas || [],
      startDate: startDate || new Date(),
      endDate,
      requiredItems: requiredItems || [],
      images: images || [],
      officialSources: officialSources || [],
      contactInfo: contactInfo || {},
      createdBy: req.user._id,
      status: 'active'
    });

    await disaster.save();

    // Notify all users about new disaster
    const users = await User.find({ isActive: true });
    const notifications = users.map(user => ({
      userId: user._id,
      type: 'disaster_alert',
      title: `🚨 New Disaster Alert: ${title}`,
      message: `A ${type} disaster has been reported in ${city}, ${state}. Help is needed!`,
      relatedId: disaster._id,
      priority: severity === 'critical' ? 'critical' : 'high'
    }));

    await Notification.insertMany(notifications);

    // Emit real-time event
    const io = req.app.get('io');
    io.emit('new-disaster', { disaster });

    res.status(201).json(disaster);
  } catch (error) {
    console.error('Create disaster error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/disasters/:id/donate
// @desc    Donate items to a disaster
// @access  Private
router.post('/:id/donate', auth, async (req, res) => {
  try {
    const { items, notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items are required' });
    }

    const disaster = await Disaster.findById(req.params.id);
    if (!disaster) {
      return res.status(404).json({ message: 'Disaster not found' });
    }

    if (disaster.status !== 'active' && disaster.status !== 'monitoring') {
      return res.status(400).json({ message: 'Disaster is not accepting donations' });
    }

    // Add donation
    const donation = {
      donorId: req.user._id,
      items,
      status: 'pending',
      notes: notes || ''
    };

    disaster.donations.push(donation);

    // Update total donations
    items.forEach(item => {
      const current = disaster.totalDonations.get(item.item) || 0;
      disaster.totalDonations.set(item.item, current + (item.quantity || 0));
    });

    await disaster.save();

    // Notify admin
    const admins = await User.find({ role: 'admin' });
    const notifications = admins.map(admin => ({
      userId: admin._id,
      type: 'disaster_donation',
      title: 'New Disaster Donation',
      message: `${req.user.name} has donated items to "${disaster.title}"`,
      relatedId: disaster._id,
      priority: 'medium'
    }));

    await Notification.insertMany(notifications);

    // Emit real-time event
    const io = req.app.get('io');
    io.emit('disaster-donation', { disasterId: disaster._id, donation });

    res.status(201).json({ message: 'Donation submitted successfully', donation });
  } catch (error) {
    console.error('Donate to disaster error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/disasters/:id/status
// @desc    Update disaster status (Admin only)
// @access  Private (Admin)
router.put('/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['active', 'resolved', 'monitoring'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const disaster = await Disaster.findById(req.params.id);
    if (!disaster) {
      return res.status(404).json({ message: 'Disaster not found' });
    }

    disaster.status = status;
    if (status === 'resolved') {
      disaster.endDate = new Date();
    }

    await disaster.save();

    res.json({ message: 'Disaster status updated', disaster });
  } catch (error) {
    console.error('Update disaster status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/disasters/:id/donations/:donationId/approve
// @desc    Approve a donation (Admin only)
// @access  Private (Admin)
router.put('/:id/donations/:donationId/approve', adminAuth, async (req, res) => {
  try {
    const disaster = await Disaster.findById(req.params.id);
    if (!disaster) {
      return res.status(404).json({ message: 'Disaster not found' });
    }

    const donation = disaster.donations.id(req.params.donationId);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    donation.status = 'approved';
    await disaster.save();

    // Notify donor
    await Notification.create({
      userId: donation.donorId,
      type: 'disaster_donation_approved',
      title: 'Donation Approved',
      message: `Your donation to "${disaster.title}" has been approved!`,
      relatedId: disaster._id,
      priority: 'medium'
    });

    res.json({ message: 'Donation approved', donation });
  } catch (error) {
    console.error('Approve donation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

