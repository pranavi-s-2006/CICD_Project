const UserActivity = require('../models/UserActivity');

class StreakTracker {
  // Record user login
  static async recordLogin(userId, ipAddress, userAgent) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      const activity = await UserActivity.findOneAndUpdate(
        { userId, date: today },
        {
          $push: {
            loginTimes: {
              timestamp: new Date(),
              ipAddress,
              userAgent,
            }
          }
        },
        { upsert: true, new: true }
      );

      return activity;
    } catch (error) {
      console.error('Error recording login:', error);
      throw error;
    }
  }

  // Record session completion
  static async recordSessionCompletion(userId, focusTimeMinutes) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      const activity = await UserActivity.findOneAndUpdate(
        { userId, date: today },
        {
          $inc: { 
            sessionsCompleted: 1,
            totalFocusTime: focusTimeMinutes 
          },
          $set: { hasCompletedSession: true }
        },
        { upsert: true, new: true }
      );

      return activity;
    } catch (error) {
      console.error('Error recording session completion:', error);
      throw error;
    }
  }

  // Calculate current streak
  static async calculateStreak(userId) {
    try {
      const activities = await UserActivity.find({ userId })
        .sort({ date: -1 })
        .limit(365); // Check last year

      if (activities.length === 0) {
        return { currentStreak: 0, longestStreak: 0, lastActivity: null };
      }

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Check if user has activity today or yesterday (to maintain streak)
      const latestActivity = activities[0];
      const daysDiff = Math.floor((today - latestActivity.date) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 1 && latestActivity.hasCompletedSession) {
        currentStreak = 1;
        
        // Count consecutive days backwards
        for (let i = 1; i < activities.length; i++) {
          const prevActivity = activities[i];
          const currentActivity = activities[i - 1];
          
          const daysBetween = Math.floor((currentActivity.date - prevActivity.date) / (1000 * 60 * 60 * 24));
          
          if (daysBetween === 1 && prevActivity.hasCompletedSession) {
            currentStreak++;
          } else {
            break;
          }
        }
      }

      // Calculate longest streak
      tempStreak = 0;
      for (let i = 0; i < activities.length; i++) {
        if (activities[i].hasCompletedSession) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
          
          // Check if next day is consecutive
          if (i < activities.length - 1) {
            const daysBetween = Math.floor((activities[i].date - activities[i + 1].date) / (1000 * 60 * 60 * 24));
            if (daysBetween !== 1) {
              tempStreak = 0;
            }
          }
        } else {
          tempStreak = 0;
        }
      }

      return {
        currentStreak,
        longestStreak,
        lastActivity: latestActivity.date,
        totalActiveDays: activities.filter(a => a.hasCompletedSession).length
      };
    } catch (error) {
      console.error('Error calculating streak:', error);
      throw error;
    }
  }

  // Get activity history
  static async getActivityHistory(userId, days = 30) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);

      const activities = await UserActivity.find({
        userId,
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: 1 });

      return activities;
    } catch (error) {
      console.error('Error getting activity history:', error);
      throw error;
    }
  }
}

module.exports = StreakTracker;