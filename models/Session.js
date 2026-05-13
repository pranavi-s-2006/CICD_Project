const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now,
  },
  endTime: {
    type: Date,
  },
  intendedDuration: {
    type: Number, // in minutes
    required: true,
  },
  category: {
    type: String,
    enum: ['work', 'study', 'creative', 'reading', 'coding', 'other'],
    default: 'work',
  },
  tags: [{
    type: String,
  }],
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned', 'paused'],
    default: 'active',
  },
  focusScore: {
    type: Number,
    min: 0,
    max: 100,
  },
}, {
  timestamps: true,
});

// Calculate duration in minutes
sessionSchema.virtual('actualDuration').get(function() {
  if (!this.endTime) return 0;
  const diffMs = this.endTime - this.startTime;
  return Math.round(diffMs / 60000); // Convert to minutes
});

module.exports = mongoose.model('Session', sessionSchema);