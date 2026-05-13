const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const StreakTracker = require('../utils/StreakTracker');

// Record login
router.post('/login', auth, async (req, res) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    const activity = await StreakTracker.recordLogin(req.user.id, ipAddress, userAgent);
    res.json({ success: true, activity });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get streak data
router.get('/streak', auth, async (req, res) => {
  try {
    const streakData = await StreakTracker.calculateStreak(req.user.id);
    res.json(streakData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get activity history
router.get('/history', auth, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const history = await StreakTracker.getActivityHistory(req.user.id, days);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;