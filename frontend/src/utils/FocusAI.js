// AI Prediction Engine for FOCUSLOOM
class FocusAI {
  constructor() {
    this.userPatterns = {
      focusScores: [],
      distractionTimes: [],
      sessionDurations: [],
      biometricData: [],
      environmentalFactors: []
    };
    this.predictions = {
      nextDistraction: null,
      optimalSessionLength: 25,
      peakHours: [],
      riskFactors: []
    };
    this.learningEnabled = true;
    this.confidenceThreshold = 0.7;
  }

  // Learn from user behavior patterns
  learnFromSession(sessionData) {
    if (!this.learningEnabled) return;

    const {
      duration,
      focusScore,
      distractions,
      biometrics,
      timeOfDay,
      dayOfWeek,
      environment
    } = sessionData;

    // Store pattern data
    this.userPatterns.focusScores.push({
      score: focusScore,
      duration,
      timeOfDay,
      dayOfWeek,
      timestamp: Date.now()
    });

    this.userPatterns.distractionTimes.push(...distractions.map(d => ({
      time: d.timestamp,
      type: d.type,
      timeOfDay: new Date(d.timestamp).getHours(),
      dayOfWeek: new Date(d.timestamp).getDay(),
      sessionDuration: duration
    })));

    this.userPatterns.biometricData.push({
      heartRate: biometrics.heartRate,
      stress: biometrics.stress,
      eyeStrain: biometrics.eyeStrain,
      focusScore,
      timeOfDay,
      timestamp: Date.now()
    });

    // Keep only recent data (last 30 days)
    this.pruneOldData();
    
    // Update predictions
    this.updatePredictions();
    
    console.log('🧠 AI learned from session, predictions updated');
  }

  // Predict when user is likely to get distracted
  predictNextDistraction() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();
    
    // Analyze historical distraction patterns
    const recentDistractions = this.userPatterns.distractionTimes
      .filter(d => Date.now() - d.time < 7 * 24 * 60 * 60 * 1000) // Last 7 days
      .sort((a, b) => b.time - a.time);

    if (recentDistractions.length < 5) {
      return { prediction: null, confidence: 0, reason: 'Insufficient data' };
    }

    // Find patterns by hour and day
    const hourlyPatterns = this.groupBy(recentDistractions, 'timeOfDay');
    const dailyPatterns = this.groupBy(recentDistractions, 'dayOfWeek');

    // Calculate probability for current time
    const hourlyRisk = (hourlyPatterns[currentHour] || []).length / recentDistractions.length;
    const dailyRisk = (dailyPatterns[currentDay] || []).length / recentDistractions.length;
    
    // Combined risk score
    const riskScore = (hourlyRisk + dailyRisk) / 2;
    const confidence = Math.min(riskScore * 2, 1);

    // Predict next likely distraction time
    const mostCommonHour = Object.entries(hourlyPatterns)
      .sort((a, b) => b[1].length - a[1].length)[0];

    if (confidence > this.confidenceThreshold) {
      const nextDistractionHour = parseInt(mostCommonHour[0]);
      const minutesUntil = this.calculateMinutesUntil(nextDistractionHour);
      
      return {
        prediction: `High distraction risk at ${nextDistractionHour}:00`,
        minutesUntil,
        confidence: Math.round(confidence * 100),
        reason: `You typically get distracted at this time on ${this.getDayName(currentDay)}s`,
        riskLevel: riskScore > 0.7 ? 'high' : riskScore > 0.4 ? 'medium' : 'low'
      };
    }

    return { prediction: null, confidence: Math.round(confidence * 100), reason: 'Low risk detected' };
  }

  // Predict optimal session length for current conditions
  predictOptimalSessionLength() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();

    // Analyze successful sessions (focus score > 70)
    const successfulSessions = this.userPatterns.focusScores
      .filter(s => s.score > 70 && Date.now() - s.timestamp < 14 * 24 * 60 * 60 * 1000)
      .sort((a, b) => b.timestamp - a.timestamp);

    if (successfulSessions.length < 3) {
      return { 
        duration: 25, 
        confidence: 30, 
        reason: 'Using default Pomodoro length - need more data' 
      };
    }

    // Find sessions at similar times
    const similarTimeSessions = successfulSessions.filter(s => 
      Math.abs(s.timeOfDay - currentHour) <= 2 && s.dayOfWeek === currentDay
    );

    const relevantSessions = similarTimeSessions.length >= 2 ? similarTimeSessions : successfulSessions;
    
    // Calculate average duration of successful sessions
    const avgDuration = relevantSessions.reduce((sum, s) => sum + s.duration, 0) / relevantSessions.length;
    const confidence = Math.min((relevantSessions.length / 10) * 100, 95);

    // Adjust based on current biometric state
    const currentStress = this.getCurrentStressLevel();
    let adjustedDuration = avgDuration;

    if (currentStress > 0.7) {
      adjustedDuration *= 0.8; // Shorter sessions when stressed
    } else if (currentStress < 0.3) {
      adjustedDuration *= 1.2; // Longer sessions when relaxed
    }

    return {
      duration: Math.round(Math.max(15, Math.min(90, adjustedDuration))),
      confidence: Math.round(confidence),
      reason: `Based on ${relevantSessions.length} similar successful sessions`,
      adjustment: currentStress > 0.7 ? 'Shortened due to stress' : 
                 currentStress < 0.3 ? 'Extended due to good conditions' : 'No adjustment'
    };
  }

  // Predict peak performance hours
  predictPeakHours() {
    const focusData = this.userPatterns.focusScores
      .filter(s => Date.now() - s.timestamp < 21 * 24 * 60 * 60 * 1000); // Last 3 weeks

    if (focusData.length < 10) {
      return { 
        peakHours: [9, 10, 14, 15], 
        confidence: 20, 
        reason: 'Using typical peak hours - need more data' 
      };
    }

    // Group by hour and calculate average focus score
    const hourlyPerformance = {};
    focusData.forEach(session => {
      const hour = session.timeOfDay;
      if (!hourlyPerformance[hour]) {
        hourlyPerformance[hour] = { scores: [], count: 0 };
      }
      hourlyPerformance[hour].scores.push(session.score);
      hourlyPerformance[hour].count++;
    });

    // Calculate average scores per hour
    const hourlyAverages = Object.entries(hourlyPerformance)
      .map(([hour, data]) => ({
        hour: parseInt(hour),
        avgScore: data.scores.reduce((a, b) => a + b, 0) / data.scores.length,
        sessionCount: data.count
      }))
      .filter(h => h.sessionCount >= 2) // Only hours with sufficient data
      .sort((a, b) => b.avgScore - a.avgScore);

    // Top 3-4 hours with score > 75
    const peakHours = hourlyAverages
      .filter(h => h.avgScore > 75)
      .slice(0, 4)
      .map(h => h.hour)
      .sort((a, b) => a - b);

    const confidence = Math.min((focusData.length / 30) * 100, 95);

    return {
      peakHours,
      confidence: Math.round(confidence),
      reason: `Based on ${focusData.length} sessions over 3 weeks`,
      details: hourlyAverages.slice(0, 6).map(h => ({
        hour: h.hour,
        score: Math.round(h.avgScore),
        sessions: h.sessionCount
      }))
    };
  }

  // Predict focus quality for upcoming session
  predictSessionQuality(plannedDuration = 25) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();

    // Get recent biometric baseline
    const recentBiometrics = this.userPatterns.biometricData
      .filter(b => Date.now() - b.timestamp < 24 * 60 * 60 * 1000) // Last 24 hours
      .slice(-5); // Last 5 readings

    if (recentBiometrics.length === 0) {
      return { 
        predictedScore: 75, 
        confidence: 30, 
        factors: ['No recent biometric data available'] 
      };
    }

    let predictedScore = 75; // Base score
    const factors = [];
    
    // Factor 1: Time of day performance
    const peakHours = this.predictPeakHours();
    if (peakHours.peakHours.includes(currentHour)) {
      predictedScore += 10;
      factors.push(`Peak hour (${currentHour}:00) - expect higher focus`);
    } else if (currentHour < 8 || currentHour > 22) {
      predictedScore -= 15;
      factors.push(`Off-peak hour (${currentHour}:00) - focus may be lower`);
    }

    // Factor 2: Recent stress levels
    const avgStress = recentBiometrics.reduce((sum, b) => sum + (b.stress || 0.5), 0) / recentBiometrics.length;
    if (avgStress > 0.7) {
      predictedScore -= 12;
      factors.push('High stress levels detected - consider shorter session');
    } else if (avgStress < 0.3) {
      predictedScore += 8;
      factors.push('Low stress levels - good conditions for focus');
    }

    // Factor 3: Session length vs optimal
    const optimalLength = this.predictOptimalSessionLength();
    const lengthDiff = Math.abs(plannedDuration - optimalLength.duration);
    if (lengthDiff > 15) {
      predictedScore -= Math.min(lengthDiff * 0.5, 10);
      factors.push(`Session length differs from optimal (${optimalLength.duration}min)`);
    }

    // Factor 4: Distraction risk
    const distractionRisk = this.predictNextDistraction();
    if (distractionRisk.riskLevel === 'high') {
      predictedScore -= 15;
      factors.push('High distraction risk period');
    } else if (distractionRisk.riskLevel === 'low') {
      predictedScore += 5;
      factors.push('Low distraction risk period');
    }

    // Factor 5: Day of week patterns
    const weekdayPerformance = this.userPatterns.focusScores
      .filter(s => s.dayOfWeek === currentDay)
      .map(s => s.score);
    
    if (weekdayPerformance.length > 3) {
      const avgWeekdayScore = weekdayPerformance.reduce((a, b) => a + b, 0) / weekdayPerformance.length;
      const weekdayAdjustment = (avgWeekdayScore - 75) * 0.3;
      predictedScore += weekdayAdjustment;
      
      if (Math.abs(weekdayAdjustment) > 3) {
        factors.push(`${this.getDayName(currentDay)} typically ${avgWeekdayScore > 75 ? 'above' : 'below'} average`);
      }
    }

    // Ensure score is within bounds
    predictedScore = Math.max(40, Math.min(95, predictedScore));
    
    const confidence = Math.min(
      (this.userPatterns.focusScores.length / 20) * 100, 
      85
    );

    return {
      predictedScore: Math.round(predictedScore),
      confidence: Math.round(confidence),
      factors,
      recommendations: this.generateRecommendations(predictedScore, factors)
    };
  }

  // Generate AI recommendations
  generateRecommendations(predictedScore, factors) {
    const recommendations = [];

    if (predictedScore < 60) {
      recommendations.push('Consider a shorter 15-minute session to build momentum');
      recommendations.push('Try some deep breathing exercises before starting');
    } else if (predictedScore > 85) {
      recommendations.push('Great conditions! Consider a longer 45-60 minute session');
      recommendations.push('This is perfect timing for your most challenging tasks');
    }

    if (factors.some(f => f.includes('stress'))) {
      recommendations.push('Take 5 minutes to meditate or do breathing exercises');
    }

    if (factors.some(f => f.includes('distraction risk'))) {
      recommendations.push('Enable Do Not Disturb mode and close unnecessary tabs');
    }

    return recommendations;
  }

  // Update all predictions
  updatePredictions() {
    this.predictions = {
      nextDistraction: this.predictNextDistraction(),
      optimalSessionLength: this.predictOptimalSessionLength(),
      peakHours: this.predictPeakHours(),
      sessionQuality: this.predictSessionQuality()
    };
  }

  // Get current predictions
  getPredictions() {
    return this.predictions;
  }

  // Utility functions
  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const group = item[key];
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {});
  }

  calculateMinutesUntil(targetHour) {
    const now = new Date();
    const target = new Date();
    target.setHours(targetHour, 0, 0, 0);
    
    if (target <= now) {
      target.setDate(target.getDate() + 1);
    }
    
    return Math.round((target - now) / (1000 * 60));
  }

  getDayName(dayIndex) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex];
  }

  getCurrentStressLevel() {
    const recent = this.userPatterns.biometricData.slice(-3);
    if (recent.length === 0) return 0.5;
    
    return recent.reduce((sum, b) => sum + (b.stress || 0.5), 0) / recent.length;
  }

  pruneOldData() {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    this.userPatterns.focusScores = this.userPatterns.focusScores
      .filter(s => s.timestamp > thirtyDaysAgo);
    
    this.userPatterns.distractionTimes = this.userPatterns.distractionTimes
      .filter(d => d.time > thirtyDaysAgo);
    
    this.userPatterns.biometricData = this.userPatterns.biometricData
      .filter(b => b.timestamp > thirtyDaysAgo);
  }

  // Export learning data for analysis
  exportLearningData() {
    return {
      patterns: this.userPatterns,
      predictions: this.predictions,
      metadata: {
        totalSessions: this.userPatterns.focusScores.length,
        totalDistractions: this.userPatterns.distractionTimes.length,
        learningPeriod: '30 days',
        lastUpdate: new Date().toISOString()
      }
    };
  }
}

export default FocusAI;