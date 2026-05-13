const mongoose = require('mongoose');

const distractionSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  category: {
    type: String,
    enum: ['notification', 'phone', 'internal', 'environment', 'social', 'other'],
    required: true,
  },
  source: {
    type: String,
    required: true,
  },
  duration: {
    type: Number, // in seconds
    default: 0,
  },
  severity: {
    type: Number,
    min: 1,
    max: 5,
    default: 1,
  },
  notes: {
    type: String,
  },
  resolvedAt: {
    type: Date,
  },
});

// Calculate distraction duration
distractionSchema.virtual('isResolved').get(function() {
  return !!this.resolvedAt;
});

distractionSchema.virtual('distractionDuration').get(function() {
  if (!this.resolvedAt) return 0;
  return Math.round((this.resolvedAt - this.timestamp) / 1000); // in seconds
});

module.exports = mongoose.model('Distraction', distractionSchema);