const Listing = require('../models/Listing');
const Notification = require('../models/Notification');
const { findFallbackRoutes } = require('./matching');

// Check and process expired listings
const processExpiredListings = async (io) => {
  try {
    const now = new Date();
    
    // Find listings that have expired and are still active or pending approval
    const expiredListings = await Listing.find({
      expiryTime: { $lt: now },
      status: { $in: ['active', 'pending_approval'] }
    }).populate('donorId', 'name email');

    console.log(`Processing ${expiredListings.length} expired listings...`);

    for (const listing of expiredListings) {
      try {
        // Find nearest fallback route
        const fallbackRoutes = await findFallbackRoutes(listing);
        
        // Priority: animal-farm > community-fridge > compost-center
        let selectedFallback = null;
        let fallbackType = 'none';

        if (fallbackRoutes['animal-farm'] && fallbackRoutes['animal-farm'].length > 0) {
          selectedFallback = fallbackRoutes['animal-farm'][0];
          fallbackType = 'animal-farm';
        } else if (fallbackRoutes['community-fridge'] && fallbackRoutes['community-fridge'].length > 0) {
          selectedFallback = fallbackRoutes['community-fridge'][0];
          fallbackType = 'community-fridge';
        } else if (fallbackRoutes['compost-center'] && fallbackRoutes['compost-center'].length > 0) {
          selectedFallback = fallbackRoutes['compost-center'][0];
          fallbackType = 'compost-center';
        }

        // Update listing status
        listing.status = 'fallback';
        listing.fallbackRoute = fallbackType;
        
        // Reject all pending claim requests
        listing.claimRequests.forEach(req => {
          if (req.status === 'pending') {
            req.status = 'rejected';
          }
        });

        await listing.save();

        // Notify donor
        await Notification.create({
          userId: listing.donorId._id,
          type: 'listing_expired',
          title: 'Listing Expired - Routed to Fallback',
          message: `Your listing "${listing.title}" has expired and has been automatically routed to ${fallbackType.replace('-', ' ')}.`,
          relatedId: listing._id,
          priority: 'medium'
        });

        // Notify all pending claim requesters
        const pendingRequests = listing.claimRequests.filter(req => req.status === 'pending');
        for (const request of pendingRequests) {
          await Notification.create({
            userId: request.receiverId,
            type: 'listing_expired',
            title: 'Listing Expired',
            message: `The listing "${listing.title}" you requested has expired and was routed to fallback.`,
            relatedId: listing._id,
            priority: 'low'
          });
        }

        // Emit real-time event
        if (io) {
          io.emit('listing-expired', { 
            listing,
            fallbackType,
            fallbackLocation: selectedFallback
          });
        }

        console.log(`Processed expired listing: ${listing._id} -> ${fallbackType}`);
      } catch (error) {
        console.error(`Error processing expired listing ${listing._id}:`, error);
      }
    }

    return { processed: expiredListings.length };
  } catch (error) {
    console.error('Error in processExpiredListings:', error);
    return { processed: 0, error: error.message };
  }
};

// Run expiry check every 5 minutes
const startExpiryJob = (io) => {
  // Run immediately on start
  processExpiredListings(io);
  
  // Then run every 5 minutes
  setInterval(() => {
    processExpiredListings(io);
  }, 5 * 60 * 1000); // 5 minutes

  console.log('✅ Expiry job started - checking every 5 minutes');
};

module.exports = {
  processExpiredListings,
  startExpiryJob
};

