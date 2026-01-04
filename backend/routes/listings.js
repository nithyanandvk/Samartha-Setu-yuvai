const express = require('express');
const Listing = require('../models/Listing');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Fridge = require('../models/Fridge');
const { auth } = require('../middleware/auth');
const { calculateCO2Reduction } = require('../utils/co2Calculator');
const { matchListingToReceivers } = require('../utils/matching');
const { calculatePoints, calculateLevel, checkBadges, updateLeaderboard } = require('../utils/gamification');
const { geocodeAddress } = require('../utils/geocoding');

const router = express.Router();

// @route   POST /api/listings
// @desc    Create a new food listing
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      description,
      foodType,
      quantity,
      unit,
      expiryTime,
      images,
      location,
      isDisasterRelief,
      disasterZone,
      nutritionInfo
    } = req.body;

    // Parse quantity as number (ensure it's not a string)
    const quantityNum = typeof quantity === 'string' ? parseFloat(quantity) : Number(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }

    // Geocode the address from form (not user location)
    let geocodedLocation;
    if (location && location.city && location.state) {
      geocodedLocation = await geocodeAddress(
        location.address || '',
        location.city,
        location.state
      );
    } else {
      // Fallback to user location if form location not provided
      const user = await User.findById(req.user._id);
      if (user && user.location && user.location.coordinates) {
        geocodedLocation = {
          coordinates: user.location.coordinates,
          formattedAddress: user.location.address || '',
          city: user.location.city || '',
          state: user.location.state || ''
        };
      } else {
        // Default to Mumbai
        geocodedLocation = {
          coordinates: [72.8777, 19.0760],
          formattedAddress: 'Mumbai, Maharashtra, India',
          city: 'Mumbai',
          state: 'Maharashtra'
        };
      }
    }

    const listing = new Listing({
      donorId: req.user._id,
      title,
      description,
      foodType,
      quantity: quantityNum, // Ensure it's a number
      unit: unit || 'kg',
      expiryTime: new Date(expiryTime),
      images: images || [],
      location: {
        type: 'Point',
        coordinates: geocodedLocation.coordinates, // Use geocoded coordinates from form
        address: location.address || geocodedLocation.formattedAddress,
        city: location.city || geocodedLocation.city,
        state: location.state || geocodedLocation.state
      },
      isDisasterRelief: isDisasterRelief || false,
      disasterZone: disasterZone || '',
      nutritionInfo: nutritionInfo || {},
      estimatedCO2Reduction: calculateCO2Reduction(quantityNum) // Use parsed number
    });

    await listing.save();

    // Update donor stats (ensure numbers, not strings)
    const donor = await User.findById(req.user._id);
    const isFirstDonation = (donor.totalFoodDonated || 0) === 0;
    
    donor.totalFoodDonated = (donor.totalFoodDonated || 0) + quantityNum;
    donor.totalCO2Reduced = (donor.totalCO2Reduced || 0) + listing.estimatedCO2Reduction;
    
    // Award points (use parsed number)
    let pointsEarned = calculatePoints('donate', quantityNum, listing.estimatedCO2Reduction);
    if (isFirstDonation) {
      pointsEarned += calculatePoints('first_donation');
    }
    if (isDisasterRelief) {
      pointsEarned += calculatePoints('disaster_relief');
    }
    
    donor.points += pointsEarned;
    donor.level = calculateLevel(donor.points);
    await donor.save();

    // Check for new badges
    const newBadges = await checkBadges(req.user._id);
    
    // Update leaderboard
    await updateLeaderboard(req.user._id);

    // Find matches and notify receivers
    const matchResult = await matchListingToReceivers(listing._id);
    
    // Emit real-time event
    const io = req.app.get('io');
    io.emit('new-listing', {
      listing: await Listing.findById(listing._id).populate('donorId', 'name email'),
      matches: matchResult.matches
    });

    // Create notifications for potential receivers
    if (matchResult.matches && matchResult.matches.length > 0) {
      const notifications = matchResult.matches.slice(0, 5).map(match => ({
        userId: match._id,
        type: 'match_found',
        title: 'New Food Listing Near You!',
        message: `${donor.name} has listed ${quantityNum} ${unit} of ${title} nearby`,
        relatedId: listing._id,
        priority: 'high'
      }));
      await Notification.insertMany(notifications);
    }

    res.status(201).json({
      listing,
      pointsEarned,
      newBadges,
      matches: matchResult.matches
    });
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/listings
// @desc    Get all active listings
// @access  Public (myListings requires auth)
router.get('/', async (req, res) => {
  try {
    const { status, isDisasterRelief, city, maxDistance, lat, lng } = req.query;
    
    let query = { status: status || 'active' };
    
    if (isDisasterRelief === 'true') {
      query.isDisasterRelief = true;
    }
    
    if (city) {
      query['location.city'] = city;
    }

    let listings;
    
    if (lat && lng) {
      // Geospatial query
      listings = await Listing.find({
        ...query,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            $maxDistance: (maxDistance || 10) * 1000
          }
        }
      }).populate('donorId', 'name email organizationName profileImage')
        .populate('claimRequests.receiverId', 'name email profileImage')
        .populate('claimedBy', 'name email profileImage')
        .sort({ createdAt: -1 });
    } else {
      listings = await Listing.find(query)
        .populate('donorId', 'name email organizationName profileImage')
        .populate('claimRequests.receiverId', 'name email profileImage')
        .populate('claimedBy', 'name email profileImage')
        .sort({ createdAt: -1 });
    }

    res.json(listings);
  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/listings/map-data
// @desc    Get map data for regular users
// @access  Public
router.get('/map-data', async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = { status: status || 'active' };

    const listings = await Listing.find(query)
      .populate('donorId', 'name email')
      .select('title location status quantity unit expiryTime donorId')
      .limit(1000); // Limit for performance

    const fridges = await Fridge.find({ isActive: true })
      .select('name type location capacity currentInventory')
      .limit(500);

    res.json({
      listings,
      users: [], // Regular users don't see other users
      fridges
    });
  } catch (error) {
    console.error('Get map data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/listings/:id
// @desc    Get single listing
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('donorId', 'name email phone organizationName profileImage location')
      .populate('claimedBy', 'name email phone profileImage location')
      .populate('claimRequests.receiverId', 'name email phone profileImage location');
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    res.json(listing);
  } catch (error) {
    console.error('Get listing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/listings/:id/claim
// @desc    Request to claim a listing (adds to queue)
// @access  Private
router.put('/:id/claim', auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.status !== 'active' && listing.status !== 'pending_approval') {
      return res.status(400).json({ message: 'Listing is not available for claiming' });
    }

    // Check if user already has a pending request
    const existingRequest = listing.claimRequests.find(
      req => req.receiverId.toString() === req.user._id.toString() && req.status === 'pending'
    );

    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a pending claim request' });
    }

    // Add claim request to queue (first come first serve)
    listing.claimRequests.push({
      receiverId: req.user._id,
      requestedAt: new Date(),
      status: 'pending',
      message: req.body.message || ''
    });

    // Update status if first request
    if (listing.claimRequests.length === 1) {
      listing.status = 'pending_approval';
    }

    await listing.save();

    const receiver = await User.findById(req.user._id);

    // Notify donor about new claim request
    await Notification.create({
      userId: listing.donorId,
      type: 'claim_requested',
      title: 'New Claim Request!',
      message: `${receiver.name} has requested to claim your listing: ${listing.title}`,
      relatedId: listing._id,
      priority: 'high'
    });

    // Notify receiver
    await Notification.create({
      userId: req.user._id,
      type: 'claim_requested',
      title: 'Claim Request Submitted',
      message: `Your claim request for "${listing.title}" has been sent to the donor. Waiting for approval.`,
      relatedId: listing._id,
      priority: 'medium'
    });

    // Emit real-time event
    const io = req.app.get('io');
    io.to(listing.donorId.toString()).emit('new-claim-request', {
      listing: await Listing.findById(listing._id).populate('claimRequests.receiverId', 'name email profileImage'),
      receiver: receiver
    });

    res.json({ 
      message: 'Claim request submitted successfully. Waiting for donor approval.',
      listing: await Listing.findById(listing._id).populate('claimRequests.receiverId', 'name email profileImage')
    });
  } catch (error) {
    console.error('Claim listing error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/listings/:id/approve-claim/:requestId
// @desc    Donor approves a claim request (first come first serve)
// @access  Private
router.put('/:id/approve-claim/:requestId', auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if user is the donor
    if (listing.donorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the donor can approve claims' });
    }

    const claimRequest = listing.claimRequests.id(req.params.requestId);
    if (!claimRequest) {
      return res.status(404).json({ message: 'Claim request not found' });
    }

    // Approve the first request (first come first serve)
    claimRequest.status = 'approved';
    listing.status = 'approved';
    listing.claimedBy = claimRequest.receiverId;
    listing.claimedAt = new Date();
    listing.approvedAt = new Date();

    // Reject all other pending requests
    const approvedRequestId = req.params.requestId;
    listing.claimRequests.forEach(claimReq => {
      if (claimReq._id.toString() !== approvedRequestId && claimReq.status === 'pending') {
        claimReq.status = 'rejected';
        
        // Notify rejected receivers
        Notification.create({
          userId: claimReq.receiverId,
          type: 'claim_rejected',
          title: 'Claim Request Rejected',
          message: `Your claim request for "${listing.title}" was rejected as another request was approved.`,
          relatedId: listing._id,
          priority: 'medium'
        }).catch(err => console.error('Error creating rejection notification:', err));
      }
    });

    await listing.save();

    const receiver = await User.findById(claimRequest.receiverId);
    const donor = await User.findById(req.user._id);

    // Notify approved receiver
    await Notification.create({
      userId: claimRequest.receiverId,
      type: 'claim_approved',
      title: 'Claim Approved! 🎉',
      message: `${donor.name} has approved your claim request for "${listing.title}". Please collect it soon!`,
      relatedId: listing._id,
      priority: 'high'
    });

    // Notify rejected receivers
    const rejectedRequests = listing.claimRequests.filter(
      req => req.status === 'rejected' && req._id.toString() !== req.params.requestId
    );
    
    for (const rejectedReq of rejectedRequests) {
      await Notification.create({
        userId: rejectedReq.receiverId,
        type: 'claim_rejected',
        title: 'Claim Request Not Selected',
        message: `Another receiver was selected for "${listing.title}". Keep trying!`,
        relatedId: listing._id,
        priority: 'low'
      });
    }

    // Emit real-time events
    const io = req.app.get('io');
    io.to(claimRequest.receiverId.toString()).emit('claim-approved', { listing });
    io.emit('listing-approved', { listing });

    res.json({ 
      message: 'Claim approved successfully',
      listing: await Listing.findById(listing._id)
        .populate('claimRequests.receiverId', 'name email profileImage')
        .populate('claimedBy', 'name email phone profileImage')
    });
  } catch (error) {
    console.error('Approve claim error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/listings/:id/confirm-collection
// @desc    Receiver confirms they collected the food
// @access  Private
router.put('/:id/confirm-collection', auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if user is the approved receiver
    if (listing.claimedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the approved receiver can confirm collection' });
    }

    if (listing.status !== 'approved') {
      return res.status(400).json({ message: 'Listing must be approved before collection' });
    }

    listing.status = 'collected';
    listing.collectedAt = new Date();
    await listing.save();

    const receiver = await User.findById(req.user._id);
    const donor = await User.findById(listing.donorId);

    // Award points to receiver
    receiver.points += calculatePoints('receive', listing.quantity);
    receiver.level = calculateLevel(receiver.points);
    await receiver.save();

    await checkBadges(req.user._id);
    await updateLeaderboard(req.user._id);

    // Notify donor
    await Notification.create({
      userId: listing.donorId,
      type: 'collection_confirmed',
      title: 'Food Collected! ✅',
      message: `${receiver.name} has confirmed collection of "${listing.title}". Please mark as done when ready.`,
      relatedId: listing._id,
      priority: 'high'
    });

    // Emit real-time event
    const io = req.app.get('io');
    io.to(listing.donorId.toString()).emit('collection-confirmed', { listing });

    res.json({ 
      message: 'Collection confirmed successfully',
      listing: await Listing.findById(listing._id).populate('claimedBy', 'name email')
    });
  } catch (error) {
    console.error('Confirm collection error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/listings/:id/complete
// @desc    Donor marks listing as done/distributed
// @access  Private
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Only donor can mark as done
    if (listing.donorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the donor can mark listing as done' });
    }

    if (listing.status !== 'collected' && listing.status !== 'approved') {
      return res.status(400).json({ message: 'Listing must be collected or approved before marking as done' });
    }

    listing.status = 'distributed';
    listing.distributedAt = new Date();
    await listing.save();

    const donor = await User.findById(req.user._id);
    const receiver = listing.claimedBy ? await User.findById(listing.claimedBy) : null;

    // Notify receiver if exists
    if (receiver) {
      await Notification.create({
        userId: listing.claimedBy,
        type: 'listing_completed',
        title: 'Transaction Completed! 🎉',
        message: `The transaction for "${listing.title}" has been marked as complete. Thank you for your contribution!`,
        relatedId: listing._id,
        priority: 'medium'
      });
    }

    // Emit real-time event
    const io = req.app.get('io');
    io.emit('listing-completed', { listing });

    res.json({ 
      message: 'Listing marked as completed successfully',
      listing: await Listing.findById(listing._id).populate('claimedBy', 'name email')
    });
  } catch (error) {
    console.error('Complete listing error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/listings/:id
// @desc    Delete a listing
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.donorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await listing.deleteOne();

    res.json({ message: 'Listing deleted' });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

