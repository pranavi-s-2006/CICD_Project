const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const AnalyticsEngine = require('../utils/analyticsEngine');

// Get daily summary
router.get('/daily-summary', auth, async (req, res) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const summary = await AnalyticsEngine.calculateDailySummary(req.user.id, date);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get weekly trends
router.get('/weekly-trends', auth, async (req, res) => {
  try {
    const trends = await AnalyticsEngine.getWeeklyTrends(req.user.id);
    res.json(trends);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get insights (primary distraction, peak performance, recovery speed)
router.get('/insights', auth, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const insights = await AnalyticsEngine.getInsights(req.user.id, days);
    res.json(insights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;