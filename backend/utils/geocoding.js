// Simple geocoding utility using OpenStreetMap Nominatim API
// For production, consider using Google Maps Geocoding API or Mapbox

const axios = require('axios');

const geocodeAddress = async (address, city, state) => {
  try {
    // Construct full address
    const fullAddress = [address, city, state, 'India'].filter(Boolean).join(', ');
    
    // Use Nominatim (OpenStreetMap) geocoding - free but rate-limited
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: fullAddress,
        format: 'json',
        limit: 1,
        addressdetails: 1
      },
      headers: {
        'User-Agent': 'Samartha-Setu-Food-Platform/1.0' // Required by Nominatim
      }
    });

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      return {
        coordinates: [parseFloat(result.lon), parseFloat(result.lat)], // [lng, lat] for MongoDB
        formattedAddress: result.display_name,
        city: result.address?.city || result.address?.town || city,
        state: result.address?.state || state
      };
    }

    // Fallback: Return default coordinates (Mumbai) if geocoding fails
    console.warn(`Geocoding failed for: ${fullAddress}, using default location`);
    return {
      coordinates: [72.8777, 19.0760], // Mumbai default
      formattedAddress: fullAddress,
      city: city || 'Mumbai',
      state: state || 'Maharashtra'
    };
  } catch (error) {
    console.error('Geocoding error:', error.message);
    // Return default coordinates on error
    return {
      coordinates: [72.8777, 19.0760], // Mumbai default
      formattedAddress: [address, city, state].filter(Boolean).join(', '),
      city: city || 'Mumbai',
      state: state || 'Maharashtra'
    };
  }
};

module.exports = {
  geocodeAddress
};

