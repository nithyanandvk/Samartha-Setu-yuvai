const mongoose = require('mongoose');

const disasterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['flood', 'cyclone', 'earthquake', 'drought', 'pandemic', 'fire', 'other'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
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
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: String
  },
  affectedAreas: [{
    city: String,
    state: String,
    coordinates: [Number]
  }],
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date,
  status: {
    type: String,
    enum: ['active', 'resolved', 'monitoring'],
    default: 'active'
  },
  requiredItems: [{
    item: String,
    quantity: Number,
    unit: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    }
  }],
  donations: [{
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    items: [{
      item: String,
      quantity: Number,
      unit: String
    }],
    status: {
      type: String,
      enum: ['pending', 'approved', 'dispatched', 'delivered'],
      default: 'pending'
    },
    donatedAt: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],
  totalDonations: {
    type: Map,
    of: Number,
    default: {}
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  images: [String],
  officialSources: [{
    name: String,
    url: String
  }],
  contactInfo: {
    phone: String,
    email: String,
    website: String
  }
}, {
  timestamps: true
});

// Geospatial index for location-based queries
disasterSchema.index({ 'location.coordinates': '2dsphere' });
disasterSchema.index({ status: 1, severity: 1 });
disasterSchema.index({ type: 1, status: 1 });

module.exports = mongoose.model('Disaster', disasterSchema);

