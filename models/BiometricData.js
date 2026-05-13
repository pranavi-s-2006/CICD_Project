const mongoose = require('mongoose');

const biometricDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  // Biometric readings
  heartRate: {
    type: Number,
    min: 40,
    max: 200
  },
  ambientNoise: {
    type: Number,
    min: 0,
    max: 120 // decibels
  },
  eyeStrain: {
    type: Number,
    min: 0,
    max: 100 // percentage
  },
  // Behavioral data
  tabSwitches: {
    type: Number,
    default: 0
  },
  phoneDistractions: {
    type: Number,
    default: 0
  },
  emailDistractions: {
    type: Number,
    default: 0
  },
  focusScore: {
    type: Number,
    min: 0,
    max: 100
  },
  // Activity patterns
  mouseMovements: {
    type: Number,
    default: 0
  },
  keystrokes: {
    type: Number,
    default: 0
  },
  scrollEvents: {
    type: Number,
    default: 0
  },
  // Context data
  timeOfDay: {
    type: Number, // Hour of day (0-23)
    min: 0,
    max: 23
  },
  dayOfWeek: {
    type: Number, // 0=Sunday, 6=Saturday
    min: 0,
    max: 6
  }
}, {
  timestamps: true,
  // Create indexes for efficient queries
  indexes: [
    { userId: 1, timestamp: -1 },
    { sessionId: 1, timestamp: 1 },
    { userId: 1, dayOfWeek: 1, timeOfDay: 1 }
  ]
});

// Weekly aggregation helper
biometricDataSchema.statics.getWeeklyAnalytics = async function(userId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          day: { $dayOfWeek: '$timestamp' },
          hour: { $hour: '$timestamp' }
        },
        avgHeartRate: { $avg: '$heartRate' },
        avgNoise: { $avg: '$ambientNoise' },
        avgEyeStrain: { $avg: '$eyeStrain' },
        avgFocusScore: { $avg: '$focusScore' },
        totalTabSwitches: { $sum: '$tabSwitches' },
        totalPhoneDistractions: { $sum: '$phoneDistractions' },
        totalEmailDistractions: { $sum: '$emailDistractions' },
        dataPoints: { $sum: 1 }
      }
    },
    { $sort: { '_id.day': 1, '_id.hour': 1 } }
  ]);
};

module.exports = mongoose.model('BiometricData', biometricDataSchema);