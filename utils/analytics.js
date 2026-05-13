const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Session = require('../models/Session');
const Distraction = require('../models/Distraction');
const AnalyticsEngine = require('../utils/analyticsEngine');

// Get daily summary
router.get('/daily-summary', auth, async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const [sessions, distractions] = await Promise.all([
      Session.find({
        userId: req.user._id,
        startTime: { $gte: targetDate, $lt: nextDay },
      }),
      Distraction.find({
        userId: req.user._id,
        timestamp: { $gte: targetDate, $lt: nextDay },
      }),
    ]);

    const summary = AnalyticsEngine.calculateDailySummary(sessions, distractions);
    res.json(summary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch daily summary' });
  }
});

// Get weekly trends
router.get('/weekly-trends', auth, async (req, res) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const sessions = await Session.find({
      userId: req.user._id,
      startTime: { $gte: startDate, $lte: endDate },
      status: 'completed',
    });

    const distractions = await Distraction.find({
      userId: req.user._id,
      timestamp: { $gte: startDate, $lte: endDate },
    });

    // Group by day
    const dailyData = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const daySessions = sessions.filter(s => 
        s.startTime.toDateString() === date.toDateString()
      );
      const dayDistractions = distractions.filter(d => 
        d.timestamp.toDateString() === date.toDateString()
      );

      dailyData[date.toISOString().split('T')[0]] = {
        date,
        sessionCount: daySessions.length,
        focusTime: daySessions.reduce((sum, s) => 
          sum + ((s.endTime ? s.endTime : new Date()) - s.startTime) / 60000, 0
        ),
        distractionCount: dayDistractions.length,
      };
    }

    // Calculate patterns
    const patterns = AnalyticsEngine.analyzePatterns(distractions);
    const insights = AnalyticsEngine.generateInsights(patterns, req.user.preferences);

    res.json({
      dailyData,
      patterns,
      insights,
      summary: {
        totalSessions: sessions.length,
        totalFocusTime: sessions.reduce((sum, s) => 
          sum + ((s.endTime ? s.endTime : new Date()) - s.startTime) / 60000, 0
        ),
        totalDistractions: distractions.length,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch weekly trends' });
  }
});

// Get distraction patterns
router.get('/distraction-patterns', auth, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const distractions = await Distraction.find({
      userId: req.user._id,
      timestamp: { $gte: startDate },
    });

    const patterns = AnalyticsEngine.analyzePatterns(distractions);
    res.json(patterns);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch patterns' });
  }
});

module.exports = router;