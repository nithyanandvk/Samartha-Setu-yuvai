const express = require('express');
const { matchListingToReceivers, findFallbackRoutes } = require('../utils/matching');
const Listing = require('../models/Listing');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/matching/match/:listingId
// @desc    Get AI-powered matches for a listing
// @access  Private
router.post('/match/:listingId', auth, async (req, res) => {
  try {
    const result = await matchListingToReceivers(req.params.listingId);
    
    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Matching error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/matching/fallback/:listingId
// @desc    Get fallback routes for a listing
// @access  Private
router.get('/fallback/:listingId', auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.listingId);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const fallbackRoutes = await findFallbackRoutes(listing);
    res.json(fallbackRoutes);
  } catch (error) {
    console.error('Fallback routes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

