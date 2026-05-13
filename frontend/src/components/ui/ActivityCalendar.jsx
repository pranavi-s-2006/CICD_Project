import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { streakAPI } from '../../services/api';

const ActivityCalendar = ({ days = 90 }) => {
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivityData();
  }, [days]);

  const fetchActivityData = async () => {
    try {
      const response = await streakAPI.getActivityHistory(days);
      setActivityData(response.data);
    } catch (error) {
      console.error('Failed to fetch activity data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCalendarData = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    const calendarData = [];
    const activityMap = {};
    
    // Create activity map for quick lookup
    activityData.forEach(activity => {
      const dateKey = new Date(activity.date).toDateString();
      activityMap[dateKey] = activity;
    });
    
    // Generate calendar grid
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toDateString();
      const activity = activityMap[dateKey];
      
      calendarData.push({
        date: new Date(d),
        hasActivity: !!activity?.hasCompletedSession,
        sessionsCompleted: activity?.sessionsCompleted || 0,
        totalFocusTime: activity?.totalFocusTime || 0,
        loginCount: activity?.loginTimes?.length || 0
      });
    }
    
    return calendarData;
  };

  const getIntensityClass = (day) => {
    if (!day.hasActivity) return 'bg-calm-100 dark:bg-calm-800';
    
    const sessions = day.sessionsCompleted;
    if (sessions >= 5) return 'bg-green-600';
    if (sessions >= 3) return 'bg-green-500';
    if (sessions >= 2) return 'bg-green-400';
    if (sessions >= 1) return 'bg-green-300';
    return 'bg-calm-100 dark:bg-calm-800';
  };

  const formatTooltip = (day) => {
    const date = day.date.toLocaleDateString();
    if (!day.hasActivity) {
      return `${date}: No activity`;
    }
    return `${date}: ${day.sessionsCompleted} sessions, ${Math.round(day.totalFocusTime)} min focus time`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Calendar</CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <div className="animate-spin w-6 h-6 border-2 border-focus-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-calm-600 dark:text-calm-400">Loading activity...</p>
        </CardContent>
      </Card>
    );
  }

  const calendarData = generateCalendarData();
  const weeks = [];
  
  // Group days into weeks
  for (let i = 0; i < calendarData.length; i += 7) {
    weeks.push(calendarData.slice(i, i + 7));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>📊</span>
          Activity Calendar
        </CardTitle>
        <p className="text-sm text-calm-600 dark:text-calm-400">
          Your focus session activity over the last {days} days
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex gap-1">
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`w-3 h-3 rounded-sm ${getIntensityClass(day)} cursor-pointer transition-all hover:scale-110`}
                  title={formatTooltip(day)}
                />
              ))}
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-between mt-4 text-xs text-calm-600 dark:text-calm-400">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-calm-100 dark:bg-calm-800"></div>
            <div className="w-3 h-3 rounded-sm bg-green-300"></div>
            <div className="w-3 h-3 rounded-sm bg-green-400"></div>
            <div className="w-3 h-3 rounded-sm bg-green-500"></div>
            <div className="w-3 h-3 rounded-sm bg-green-600"></div>
          </div>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityCalendar;