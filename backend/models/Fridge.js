const mongoose = require('mongoose');

const fridgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
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
    city: String,
    state: String
  },
  type: {
    type: String,
    enum: ['community-fridge', 'food-hub', 'compost-center', 'animal-farm'],
    required: true
  },
  capacity: {
    type: Number, // in kg
    default: 0
  },
  currentInventory: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  managedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  contactInfo: {
    phone: String,
    email: String
  }
}, {
  timestamps: true
});

fridgeSchema.index({ location: '2dsphere' });
fridgeSchema.index({ type: 1, isActive: 1 });

module.exports = mongoose.model('Fridge', fridgeSchema);

