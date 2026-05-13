const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Session = require('../models/Session');
const Distraction = require('../models/Distraction');
const StreakTracker = require('../utils/StreakTracker');

// Start a new session
router.post('/start', auth, async (req, res) => {
  try {
    const { intendedDuration, category, tags } = req.body;

    const session = new Session({
      userId: req.user._id,
      intendedDuration: intendedDuration || 25, // Default 25 minutes
      category: category || 'work',
      tags: tags || [],
    });

    await session.save();
    res.status(201).json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to start session' });
  }
});

// End a session
router.post('/:id/end', auth, async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    session.endTime = new Date();
    session.status = 'completed';
    await session.save();

    // Record session completion for streak tracking
    const focusTimeMinutes = Math.round((session.endTime - session.startTime) / 60000);
    await StreakTracker.recordSessionCompletion(req.user._id, focusTimeMinutes);

    res.json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to end session' });
  }
});

// Log a distraction
router.post('/:id/distractions', auth, async (req, res) => {
  try {
    const { category, source, severity, notes } = req.body;

    const distraction = new Distraction({
      sessionId: req.params.id,
      userId: req.user._id,
      category,
      source,
      severity: severity || 1,
      notes,
    });

    await distraction.save();
    res.status(201).json(distraction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to log distraction' });
  }
});

// Resolve a distraction
router.patch('/distractions/:id/resolve', auth, async (req, res) => {
  try {
    const distraction = await Distraction.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!distraction) {
      return res.status(404).json({ error: 'Distraction not found' });
    }

    distraction.resolvedAt = new Date();
    distraction.duration = Math.round(
      (distraction.resolvedAt - distraction.timestamp) / 1000
    );
    await distraction.save();

    res.json(distraction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to resolve distraction' });
  }
});

// Get user sessions
router.get('/', auth, async (req, res) => {
  try {
    const { limit = 50, page = 1, status } = req.query;
    const skip = (page - 1) * limit;

    const query = { userId: req.user._id };
    if (status) query.status = status;

    const sessions = await Session.find(query)
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('distractions');

    const total = await Session.countDocuments(query);

    res.json({
      sessions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

module.exports = router;