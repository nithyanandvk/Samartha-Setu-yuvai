const express = require('express');
const Fridge = require('../models/Fridge');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/fridges
// @desc    Create a fridge/hub checkpoint
// @access  Private (Admin or Volunteer)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'volunteer') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { name, location, type, capacity, contactInfo } = req.body;

    const fridge = new Fridge({
      name,
      location: {
        type: 'Point',
        coordinates: location.coordinates,
        address: location.address || '',
        city: location.city || '',
        state: location.state || ''
      },
      type,
      capacity: capacity || 0,
      contactInfo: contactInfo || {},
      managedBy: req.user._id
    });

    await fridge.save();

    res.status(201).json(fridge);
  } catch (error) {
    console.error('Create fridge error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/fridges
// @desc    Get all fridges/hubs
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { type, city, lat, lng, maxDistance } = req.query;

    let query = { isActive: true };
    if (type) {
      query.type = type;
    }
    if (city) {
      query['location.city'] = city;
    }

    let fridges;

    if (lat && lng) {
      fridges = await Fridge.find({
        ...query,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            $maxDistance: (maxDistance || 20) * 1000
          }
        }
      }).populate('managedBy', 'name email');
    } else {
      fridges = await Fridge.find(query).populate('managedBy', 'name email');
    }

    res.json(fridges);
  } catch (error) {
    console.error('Get fridges error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/fridges/:id/inventory
// @desc    Update fridge inventory
// @access  Private
router.put('/:id/inventory', auth, async (req, res) => {
  try {
    const { inventory } = req.body;
    const fridge = await Fridge.findById(req.params.id);

    if (!fridge) {
      return res.status(404).json({ message: 'Fridge not found' });
    }

    if (fridge.managedBy?.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    fridge.currentInventory = Math.max(0, Math.min(fridge.capacity, inventory));
    await fridge.save();

    res.json(fridge);
  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

