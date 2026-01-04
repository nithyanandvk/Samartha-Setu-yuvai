const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  points: {
    type: Number,
    default: 0
  },
  foodDonated: {
    type: Number,
    default: 0
  },
  co2Reduced: {
    type: Number,
    default: 0
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  rank: {
    cityRank: Number,
    stateRank: Number,
    nationalRank: Number
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

leaderboardSchema.index({ points: -1 });
leaderboardSchema.index({ city: 1, points: -1 });
leaderboardSchema.index({ state: 1, points: -1 });

module.exports = mongoose.model('Leaderboard', leaderboardSchema);

