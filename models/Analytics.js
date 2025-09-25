const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  link: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Link',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: String,
  referrer: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

analyticsSchema.index({ link: 1, timestamp: 1 });
analyticsSchema.index({ user: 1, timestamp: 1 });

module.exports = mongoose.model('Analytics', analyticsSchema);