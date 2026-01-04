const express = require('express');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone, location, organizationName, profileImage, disasterModeEnabled, role } = req.body;
    const { geocodeAddress } = require('../utils/geocoding');
    
    const user = await User.findById(req.user._id);
    
    if (name) user.name = name;
    if (phone) user.phone = phone;
    
    // Allow role change (except admin role can only be set by admin)
    if (role && role !== 'admin') {
      // Users can change between user, organization, volunteer
      if (['user', 'organization', 'volunteer'].includes(role)) {
        user.role = role;
        // If changing to organization, ensure organizationName is set
        if (role === 'organization' && !organizationName && !user.organizationName) {
          user.organizationName = user.name; // Default to user name
        }
      }
    }
    
    if (location) {
      // Preserve existing coordinates if new ones aren't provided
      let coordinates = location.coordinates;
      
      // If coordinates not provided, try to geocode from address
      if (!coordinates && (location.city || location.state || location.address)) {
        try {
          const geocoded = await geocodeAddress({
            address: location.address || user.location?.address || '',
            city: location.city || user.location?.city || '',
            state: location.state || user.location?.state || '',
            pincode: location.pincode || user.location?.pincode || ''
          });
          if (geocoded) {
            coordinates = geocoded;
          }
        } catch (geocodeError) {
          console.warn('Geocoding failed, using existing coordinates:', geocodeError.message);
          // Fall back to existing coordinates
          coordinates = user.location?.coordinates;
        }
      }
      
      // If still no coordinates, use existing or default (Mumbai)
      if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
        coordinates = user.location?.coordinates || [72.8777, 19.0760]; // Mumbai default
      }
      
      user.location = {
        type: 'Point',
        coordinates: coordinates,
        address: location.address !== undefined ? (location.address || '') : (user.location?.address || ''),
        city: location.city !== undefined ? (location.city || '') : (user.location?.city || ''),
        state: location.state !== undefined ? (location.state || '') : (user.location?.state || ''),
        pincode: location.pincode !== undefined ? (location.pincode || '') : (user.location?.pincode || '')
      };
    }
    if (organizationName !== undefined) user.organizationName = organizationName;
    if (profileImage) user.profileImage = profileImage;
    if (disasterModeEnabled !== undefined) user.disasterModeEnabled = disasterModeEnabled;

    await user.save();

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -email -phone');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

