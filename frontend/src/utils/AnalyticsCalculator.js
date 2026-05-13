// Analytics Calculator - Calculate real metrics from session data
class AnalyticsCalculator {
  
  // Calculate primary distraction source and percentage
  static calculatePrimaryDistraction(sessions) {
    if (!sessions || sessions.length === 0) return null;
    
    const distractionCounts = {};
    let totalDistractions = 0;
    
    sessions.forEach(session => {
      if (session.distractions) {
        session.distractions.forEach(distraction => {
          const source = distraction.source || 'Unknown';
          distractionCounts[source] = (distractionCounts[source] || 0) + 1;
          totalDistractions++;
        });
      }
    });
    
    if (totalDistractions === 0) return null;
    
    const primarySource = Object.keys(distractionCounts).reduce((a, b) => 
      distractionCounts[a] > distractionCounts[b] ? a : b
    );
    
    const percentage = Math.round((distractionCounts[primarySource] / totalDistractions) * 100);
    
    return {
      source: primarySource,
      percentage,
      count: distractionCounts[primarySource],
      totalDistractions
    };
  }
  
  // Calculate peak performance time and average focus score
  static calculatePeakPerformance(sessions) {
    if (!sessions || sessions.length === 0) return null;
    
    const hourlyData = {};
    
    sessions.forEach(session => {
      if (session.startTime && session.focusScore) {
        const hour = new Date(session.startTime).getHours();
        if (!hourlyData[hour]) {
          hourlyData[hour] = { scores: [], count: 0 };
        }
        hourlyData[hour].scores.push(session.focusScore);
        hourlyData[hour].count++;
      }
    });
    
    let bestHour = null;
    let bestScore = 0;
    
    Object.keys(hourlyData).forEach(hour => {
      const avgScore = hourlyData[hour].scores.reduce((a, b) => a + b, 0) / hourlyData[hour].scores.length;
      if (avgScore > bestScore && hourlyData[hour].count >= 2) { // At least 2 sessions
        bestScore = avgScore;
        bestHour = parseInt(hour);
      }
    });
    
    if (!bestHour) return null;
    
    const formatHour = (hour) => {
      const nextHour = (hour + 2) % 24;
      const formatTime = (h) => h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`;
      return `${formatTime(hour)}-${formatTime(nextHour)}`;
    };
    
    return {
      timeRange: formatHour(bestHour),
      averageScore: Math.round(bestScore),
      sessionCount: hourlyData[bestHour].count
    };
  }
  
  // Calculate recovery speed (time to refocus after distraction)
  static calculateRecoverySpeed(sessions) {
    if (!sessions || sessions.length === 0) return null;
    
    const recoveryTimes = [];
    
    sessions.forEach(session => {
      if (session.distractions && session.distractions.length > 0) {
        session.distractions.forEach((distraction, index) => {
          const distractionTime = new Date(distraction.timestamp);
          
          // Find next focus event or end of session
          let nextFocusTime = null;
          
          // Check if there's a next distraction to calculate recovery between
          if (index < session.distractions.length - 1) {
            nextFocusTime = new Date(session.distractions[index + 1].timestamp);
          } else if (session.endTime) {
            nextFocusTime = new Date(session.endTime);
          }
          
          if (nextFocusTime) {
            const recoveryMinutes = (nextFocusTime - distractionTime) / (1000 * 60);
            if (recoveryMinutes > 0 && recoveryMinutes < 30) { // Filter reasonable recovery times
              recoveryTimes.push(recoveryMinutes);
            }
          }
        });
      }
    });
    
    if (recoveryTimes.length === 0) return null;
    
    const averageRecovery = recoveryTimes.reduce((a, b) => a + b, 0) / recoveryTimes.length;
    
    return {
      averageMinutes: Math.round(averageRecovery * 10) / 10, // Round to 1 decimal
      sampleSize: recoveryTimes.length,
      fastestRecovery: Math.min(...recoveryTimes),
      slowestRecovery: Math.max(...recoveryTimes)
    };
  }
  
  // Calculate all insights at once
  static calculateInsights(sessions) {
    return {
      primaryDistraction: this.calculatePrimaryDistraction(sessions),
      peakPerformance: this.calculatePeakPerformance(sessions),
      recoverySpeed: this.calculateRecoverySpeed(sessions)
    };
  }
}

export default AnalyticsCalculator;