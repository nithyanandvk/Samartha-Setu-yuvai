const Listing = require('../models/Listing');
const User = require('../models/User');
const Fridge = require('../models/Fridge');

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
};

// Find nearest receivers for a listing
const findNearestReceivers = async (listing, maxDistance = 10) => {
  const [longitude, latitude] = listing.location.coordinates;

  try {
    // Find receivers - any user can receive, plus volunteers and organizations
    const receivers = await User.find({
      role: { $in: ['user', 'organization', 'volunteer'] },
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: maxDistance * 1000 // Convert km to meters
        }
      },
      isActive: true,
      verificationStatus: 'verified'
    }).limit(10);

    // Calculate distances and sort
    const receiversWithDistance = receivers.map(receiver => {
      const [recLon, recLat] = receiver.location.coordinates;
      const distance = calculateDistance(latitude, longitude, recLat, recLon);
      return {
        ...receiver.toObject(),
        distance: Math.round(distance * 10) / 10 // Round to 1 decimal
      };
    }).sort((a, b) => a.distance - b.distance);

    return receiversWithDistance;
  } catch (error) {
    // Fallback: if geospatial index doesn't exist, use regular query with distance calculation
    console.warn('Geospatial index not found, using fallback query:', error.message);
    const allReceivers = await User.find({
      role: { $in: ['user', 'organization', 'volunteer'] },
      isActive: true,
      verificationStatus: 'verified',
      'location.coordinates': { $exists: true, $ne: null }
    }).limit(50);

    const receiversWithDistance = allReceivers
      .map(receiver => {
        if (!receiver.location?.coordinates) return null;
        const [recLon, recLat] = receiver.location.coordinates;
        const distance = calculateDistance(latitude, longitude, recLat, recLon);
        return {
          ...receiver.toObject(),
          distance: Math.round(distance * 10) / 10
        };
      })
      .filter(r => r && r.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10);

    return receiversWithDistance;
  }
};

// Find fallback routes (animal farms, fridges, compost centers)
const findFallbackRoutes = async (listing) => {
  const [longitude, latitude] = listing.location.coordinates;
  const maxDistance = 15; // km

  try {
    const fallbackOptions = await Fridge.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: maxDistance * 1000
        }
      },
      isActive: true
    }).limit(5);

    const optionsWithDistance = fallbackOptions.map(option => {
      const [optLon, optLat] = option.location.coordinates;
      const distance = calculateDistance(latitude, longitude, optLat, optLon);
      return {
        ...option.toObject(),
        distance: Math.round(distance * 10) / 10
      };
    }).sort((a, b) => a.distance - b.distance);

    // Group by type
    const grouped = {
      'animal-farm': optionsWithDistance.filter(o => o.type === 'animal-farm'),
      'community-fridge': optionsWithDistance.filter(o => o.type === 'community-fridge'),
      'compost-center': optionsWithDistance.filter(o => o.type === 'compost-center')
    };

    return grouped;
  } catch (error) {
    // Fallback if geospatial index doesn't exist
    console.warn('Geospatial index not found for fridges, using fallback:', error.message);
    const allFridges = await Fridge.find({
      isActive: true,
      'location.coordinates': { $exists: true, $ne: null }
    }).limit(20);

    const optionsWithDistance = allFridges
      .map(option => {
        if (!option.location?.coordinates) return null;
        const [optLon, optLat] = option.location.coordinates;
        const distance = calculateDistance(latitude, longitude, optLat, optLon);
        return {
          ...option.toObject(),
          distance: Math.round(distance * 10) / 10
        };
      })
      .filter(o => o && o.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);

    const grouped = {
      'animal-farm': optionsWithDistance.filter(o => o.type === 'animal-farm'),
      'community-fridge': optionsWithDistance.filter(o => o.type === 'community-fridge'),
      'compost-center': optionsWithDistance.filter(o => o.type === 'compost-center')
    };

    return grouped;
  }
};

// AI-powered matching algorithm
const matchListingToReceivers = async (listingId) => {
  const listing = await Listing.findById(listingId).populate('donorId');
  if (!listing || listing.status !== 'active') {
    return { success: false, message: 'Listing not found or not active' };
  }

  // Find nearest receivers
  const receivers = await findNearestReceivers(listing, 10);
  
  // Find fallback routes
  const fallbackRoutes = await findFallbackRoutes(listing);

    // Priority scoring (can be enhanced with ML)
    const scoredReceivers = receivers.map((receiver, index) => {
      let score = 100 - (index * 5); // Distance-based score
      if (receiver.role === 'organization') score += 15; // Prefer organizations
      if (receiver.role === 'volunteer') score += 10; // Prefer volunteers
      if (listing.isDisasterRelief && receiver.disasterModeEnabled) score += 20;
      return { ...receiver, matchScore: score };
    }).sort((a, b) => b.matchScore - a.matchScore);

  return {
    success: true,
    listing: listing,
    matches: scoredReceivers,
    fallbackRoutes: fallbackRoutes,
    recommendedMatch: scoredReceivers[0] || null
  };
};

module.exports = {
  calculateDistance,
  findNearestReceivers,
  findFallbackRoutes,
  matchListingToReceivers
};
