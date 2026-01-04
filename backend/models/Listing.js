const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  foodType: {
    type: String,
    enum: ['cooked', 'raw', 'packaged', 'beverages', 'other'],
    required: true
  },
  quantity: {
    type: Number,
    required: true // in kg or units
  },
  unit: {
    type: String,
    enum: ['kg', 'plates', 'packets', 'liters', 'units'],
    default: 'kg'
  },
  expiryTime: {
    type: Date,
    required: true
  },
  images: [{
    type: String // Cloudinary URLs
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    address: String,
    city: String,
    state: String
  },
  status: {
    type: String,
    enum: ['active', 'pending_approval', 'approved', 'collected', 'distributed', 'expired', 'fallback'],
    default: 'active'
  },
  claimRequests: [{
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    message: String
  }],
  claimedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  claimedAt: {
    type: Date,
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  collectedAt: {
    type: Date,
    default: null
  },
  distributedAt: {
    type: Date,
    default: null
  },
  fallbackRoute: {
    type: String,
    enum: ['animal-farm', 'community-fridge', 'compost-center', 'none'],
    default: 'none'
  },
  isDisasterRelief: {
    type: Boolean,
    default: false
  },
  disasterZone: {
    type: String,
    default: ''
  },
  estimatedCO2Reduction: {
    type: Number,
    default: 0 // in kg
  },
  nutritionInfo: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fats: Number,
    vitamins: [String],
    allergens: [String]
  }
}, {
  timestamps: true
});

// Geospatial index
listingSchema.index({ location: '2dsphere' });
listingSchema.index({ status: 1, createdAt: -1 });
listingSchema.index({ donorId: 1, status: 1 });

module.exports = mongoose.model('Listing', listingSchema);

