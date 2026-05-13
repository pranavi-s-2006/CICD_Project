import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { streakAPI } from '../../services/api';

const StreakDisplay = () => {
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStreakData();
    recordLogin();
  }, []);

  const recordLogin = async () => {
    try {
      await streakAPI.recordLogin();
    } catch (error) {
      console.error('Failed to record login:', error);
    }
  };

  const fetchStreakData = async () => {
    try {
      const response = await streakAPI.getStreak();
      setStreakData(response.data);
    } catch (error) {
      console.error('Failed to fetch streak data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin w-6 h-6 border-2 border-focus-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-calm-600 dark:text-calm-400">Loading streak...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Current Streak */}
      <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
        <CardContent className="p-6 text-center">
          <div className="text-4xl mb-2">🔥</div>
          <div className="text-3xl font-bold text-green-600 mb-1">
            {streakData?.currentStreak || 0}
          </div>
          <div className="text-sm font-medium text-green-700 dark:text-green-300">
            Current Streak
          </div>
          <div className="text-xs text-green-600 dark:text-green-400 mt-1">
            {streakData?.currentStreak === 1 ? 'day' : 'days'}
          </div>
        </CardContent>
      </Card>

      {/* Longest Streak */}
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
        <CardContent className="p-6 text-center">
          <div className="text-4xl mb-2">🏆</div>
          <div className="text-3xl font-bold text-purple-600 mb-1">
            {streakData?.longestStreak || 0}
          </div>
          <div className="text-sm font-medium text-purple-700 dark:text-purple-300">
            Longest Streak
          </div>
          <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
            Personal best
          </div>
        </CardContent>
      </Card>

      {/* Total Active Days */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6 text-center">
          <div className="text-4xl mb-2">📅</div>
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {streakData?.totalActiveDays || 0}
          </div>
          <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
            Total Active Days
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Sessions completed
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StreakDisplay;