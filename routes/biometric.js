const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const BiometricData = require('../models/BiometricData');

// Store biometric data point
router.post('/biometric', auth, async (req, res) => {
  try {
    const {
      sessionId,
      heartRate,
      ambientNoise,
      eyeStrain,
      tabSwitches,
      phoneDistractions,
      emailDistractions,
      focusScore,
      mouseMovements,
      keystrokes,
      scrollEvents
    } = req.body;

    const now = new Date();
    const biometricData = new BiometricData({
      userId: req.user._id,
      sessionId,
      heartRate,
      ambientNoise,
      eyeStrain,
      tabSwitches,
      phoneDistractions,
      emailDistractions,
      focusScore,
      mouseMovements,
      keystrokes,
      scrollEvents,
      timeOfDay: now.getHours(),
      dayOfWeek: now.getDay()
    });

    await biometricData.save();
    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error storing biometric data:', error);
    res.status(500).json({ error: 'Failed to store biometric data' });
  }
});

// Get weekly analytics
router.get('/weekly-report', auth, async (req, res) => {
  try {
    const { weeks = 1 } = req.query;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - (weeks * 7));

    const analytics = await BiometricData.getWeeklyAnalytics(
      req.user._id,
      startDate,
      endDate
    );

    // Calculate insights
    const insights = await generateWeeklyInsights(req.user._id, analytics);
    
    res.json({
      analytics,
      insights,
      period: { startDate, endDate, weeks }
    });
  } catch (error) {
    console.error('Error fetching weekly report:', error);
    res.status(500).json({ error: 'Failed to generate weekly report' });
  }
});

// Generate personalized insights
async function generateWeeklyInsights(userId, analytics) {
  const insights = [];
  
  if (analytics.length === 0) {
    return [{ 
      type: 'info', 
      message: 'Start using FOCUSLOOM to get personalized insights!',
      priority: 'low'
    }];
  }

  // Calculate averages
  const avgFocusScore = analytics.reduce((sum, d) => sum + d.avgFocusScore, 0) / analytics.length;
  const totalDistractions = analytics.reduce((sum, d) => sum + d.totalTabSwitches + d.totalPhoneDistractions + d.totalEmailDistractions, 0);
  const avgHeartRate = analytics.reduce((sum, d) => sum + d.avgHeartRate, 0) / analytics.length;

  // Focus score insights
  if (avgFocusScore >= 80) {
    insights.push({
      type: 'success',
      message: `Excellent focus! Your average score is ${Math.round(avgFocusScore)}%. Keep up the great work!`,
      priority: 'high',
      recommendation: 'Try extending your focus sessions by 10 minutes.'
    });
  } else if (avgFocusScore < 60) {
    insights.push({
      type: 'warning',
      message: `Focus score is ${Math.round(avgFocusScore)}%. Let's work on improving your concentration.`,
      priority: 'high',
      recommendation: 'Try shorter 15-minute sessions and gradually increase duration.'
    });
  }

  // Distraction insights
  if (totalDistractions > 50) {
    insights.push({
      type: 'alert',
      message: `${totalDistractions} distractions this week. Phone and email are your biggest challenges.`,
      priority: 'high',
      recommendation: 'Enable Do Not Disturb mode during focus sessions.'
    });
  }

  // Heart rate insights
  if (avgHeartRate > 85) {
    insights.push({
      type: 'health',
      message: `Average heart rate is ${Math.round(avgHeartRate)} BPM. Consider stress management techniques.`,
      priority: 'medium',
      recommendation: 'Try deep breathing exercises before focus sessions.'
    });
  }

  // Peak performance insights
  const bestHour = analytics.reduce((best, current) => 
    current.avgFocusScore > best.avgFocusScore ? current : best
  );
  
  insights.push({
    type: 'tip',
    message: `Your peak focus time is ${bestHour._id.hour}:00. Schedule important work then!`,
    priority: 'medium',
    recommendation: `Block your calendar from ${bestHour._id.hour}:00-${bestHour._id.hour + 2}:00 for deep work.`
  });

  return insights;
}

module.exports = router;