const Session = require('../models/Session');
const Distraction = require('../models/Distraction');

class AnalyticsEngine {
  static calculateFocusScore(session, distractions) {
    if (!session.endTime || !session.startTime) return 0;

    const totalSeconds = (session.endTime - session.startTime) / 1000;
    const distractionSeconds = distractions.reduce((sum, d) => sum + (d.duration || 0), 0);
    const productiveSeconds = totalSeconds - distractionSeconds;

    let score = (productiveSeconds / totalSeconds) * 100;

    // Apply severity penalties
    const severityPenalty = distractions.reduce((penalty, d) => {
      return penalty + (d.severity * 2); // Each severity point reduces score by 2%
    }, 0);

    score = Math.max(0, score - severityPenalty);
    return Math.round(score);
  }

  static analyzePatterns(distractions) {
    const patterns = {
      byHour: {},
      byDay: {},
      byCategory: {},
      commonSources: {},
      averageDuration: 0,
      totalCount: distractions.length,
    };

    if (distractions.length === 0) return patterns;

    let totalDuration = 0;

    distractions.forEach(distraction => {
      // Hourly analysis
      const hour = new Date(distraction.timestamp).getHours();
      patterns.byHour[hour] = (patterns.byHour[hour] || 0) + 1;

      // Daily analysis
      const day = new Date(distraction.timestamp).getDay();
      patterns.byDay[day] = (patterns.byDay[day] || 0) + 1;

      // Category analysis
      patterns.byCategory[distraction.category] = 
        (patterns.byCategory[distraction.category] || 0) + 1;

      // Source analysis
      patterns.commonSources[distraction.source] = 
        (patterns.commonSources[distraction.source] || 0) + 1;

      // Duration
      totalDuration += distraction.duration || 0;
    });

    patterns.averageDuration = Math.round(totalDuration / distractions.length);
    
    // Sort categories by frequency
    patterns.byCategory = Object.entries(patterns.byCategory)
      .sort((a, b) => b[1] - a[1])
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});

    return patterns;
  }

  static generateInsights(patterns, userPreferences) {
    const insights = [];
    
    // Time-based insights
    const peakDistractionHour = Object.entries(patterns.byHour)
      .sort((a, b) => b[1] - a[1])[0];
    
    if (peakDistractionHour && peakDistractionHour[1] > 3) {
      insights.push({
        type: 'time_based',
        message: `You're most distracted around ${peakDistractionHour[0]}:00. Consider scheduling focused work before or after this time.`,
        priority: 'high',
      });
    }

    // Category-based insights
    const topCategory = Object.keys(patterns.byCategory)[0];
    if (topCategory) {
      switch (topCategory) {
        case 'notification':
          insights.push({
            type: 'category_based',
            message: 'Notifications are your primary distraction. Try enabling Do Not Disturb during focus sessions.',
            priority: 'medium',
            action: 'enable_dnd',
          });
          break;
        case 'internal':
          insights.push({
            type: 'category_based',
            message: 'Internal thoughts frequently interrupt your focus. Consider using a "worry journal" to note down thoughts before sessions.',
            priority: 'low',
            action: 'use_journal',
          });
          break;
      }
    }

    // Duration insights
    if (patterns.averageDuration > 300) { // More than 5 minutes
      insights.push({
        type: 'duration_based',
        message: `Your average distraction lasts ${Math.round(patterns.averageDuration / 60)} minutes. Try setting a 2-minute limit for distractions.`,
        priority: 'medium',
      });
    }

    return insights;
  }

  static async calculateDailySummary(userId, date = new Date()) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const sessions = await Session.find({
      userId,
      startTime: { $gte: startOfDay, $lte: endOfDay }
    }).populate('distractions');

    const allDistractions = sessions.reduce((acc, session) => {
      return acc.concat(session.distractions || []);
    }, []);

    const totalFocusTime = sessions.reduce((sum, session) => {
      const endTime = session.endTime || new Date();
      return sum + (endTime - session.startTime) / 60000;
    }, 0);

    const totalDistractionTime = allDistractions.reduce((sum, d) => 
      sum + (d.duration || 0) / 60, 0
    );

    const avgSessionDuration = sessions.length > 0 
      ? totalFocusTime / sessions.length 
      : 0;

    // Calculate real focus score
    const focusScore = sessions.length > 0 
      ? sessions.reduce((sum, session) => {
          const sessionDistractions = session.distractions || [];
          return sum + this.calculateFocusScore(session, sessionDistractions);
        }, 0) / sessions.length
      : 0;

    return {
      date: startOfDay,
      totalSessions: sessions.length,
      totalFocusTime: Math.round(totalFocusTime),
      totalDistractionTime: Math.round(totalDistractionTime),
      distractionCount: allDistractions.length,
      avgSessionDuration: Math.round(avgSessionDuration),
      focusScore: Math.round(focusScore),
    };
  }

  static async getWeeklyTrends(userId) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);

    const sessions = await Session.find({
      userId,
      startTime: { $gte: startDate, $lte: endDate }
    }).populate('distractions');

    const dailyData = {};
    
    // Initialize all days
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      dailyData[dateKey] = {
        date: dateKey,
        focusTime: 0,
        distractionCount: 0,
        sessionCount: 0,
        focusScore: 0
      };
    }

    // Populate with real data
    sessions.forEach(session => {
      const dateKey = session.startTime.toISOString().split('T')[0];
      if (dailyData[dateKey]) {
        const endTime = session.endTime || new Date();
        const focusTime = (endTime - session.startTime) / 60000;
        
        dailyData[dateKey].focusTime += focusTime;
        dailyData[dateKey].distractionCount += (session.distractions || []).length;
        dailyData[dateKey].sessionCount += 1;
        dailyData[dateKey].focusScore += this.calculateFocusScore(session, session.distractions || []);
      }
    });

    // Calculate average focus scores
    Object.keys(dailyData).forEach(dateKey => {
      if (dailyData[dateKey].sessionCount > 0) {
        dailyData[dateKey].focusScore = Math.round(
          dailyData[dateKey].focusScore / dailyData[dateKey].sessionCount
        );
        dailyData[dateKey].focusTime = Math.round(dailyData[dateKey].focusTime);
      }
    });

    return { dailyData };
  }

  static async getInsights(userId, days = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const sessions = await Session.find({
      userId,
      startTime: { $gte: startDate, $lte: endDate }
    }).populate('distractions');

    // Calculate primary distraction
    const allDistractions = sessions.reduce((acc, session) => {
      return acc.concat(session.distractions || []);
    }, []);

    const distractionCounts = {};
    allDistractions.forEach(d => {
      const source = d.source || 'Unknown';
      distractionCounts[source] = (distractionCounts[source] || 0) + 1;
    });

    const primaryDistraction = allDistractions.length > 0 ? {
      source: Object.keys(distractionCounts).reduce((a, b) => 
        distractionCounts[a] > distractionCounts[b] ? a : b
      ),
      percentage: Math.round((Math.max(...Object.values(distractionCounts)) / allDistractions.length) * 100),
      count: Math.max(...Object.values(distractionCounts)),
      totalDistractions: allDistractions.length
    } : null;

    // Calculate peak performance
    const hourlyData = {};
    sessions.forEach(session => {
      const hour = session.startTime.getHours();
      if (!hourlyData[hour]) {
        hourlyData[hour] = { scores: [], count: 0 };
      }
      const score = this.calculateFocusScore(session, session.distractions || []);
      hourlyData[hour].scores.push(score);
      hourlyData[hour].count++;
    });

    let peakPerformance = null;
    let bestScore = 0;
    Object.keys(hourlyData).forEach(hour => {
      if (hourlyData[hour].count >= 2) {
        const avgScore = hourlyData[hour].scores.reduce((a, b) => a + b, 0) / hourlyData[hour].scores.length;
        if (avgScore > bestScore) {
          bestScore = avgScore;
          const h = parseInt(hour);
          const formatTime = (h) => h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`;
          peakPerformance = {
            timeRange: `${formatTime(h)}-${formatTime((h + 2) % 24)}`,
            averageScore: Math.round(avgScore),
            sessionCount: hourlyData[hour].count
          };
        }
      }
    });

    // Calculate recovery speed
    const recoveryTimes = [];
    sessions.forEach(session => {
      const distractions = session.distractions || [];
      for (let i = 0; i < distractions.length - 1; i++) {
        const current = new Date(distractions[i].timestamp);
        const next = new Date(distractions[i + 1].timestamp);
        const recoveryMinutes = (next - current) / (1000 * 60);
        if (recoveryMinutes > 0 && recoveryMinutes < 30) {
          recoveryTimes.push(recoveryMinutes);
        }
      }
    });

    const recoverySpeed = recoveryTimes.length > 0 ? {
      averageMinutes: Math.round((recoveryTimes.reduce((a, b) => a + b, 0) / recoveryTimes.length) * 10) / 10,
      sampleSize: recoveryTimes.length,
      fastestRecovery: Math.min(...recoveryTimes),
      slowestRecovery: Math.max(...recoveryTimes)
    } : null;

    return {
      primaryDistraction,
      peakPerformance,
      recoverySpeed
    };
  }
}

module.exports = AnalyticsEngine;