import React, { useEffect, useState } from 'react';

const HeatmapCalendar = () => {
  const [stats, setStats] = useState({ totalSessions: 0, currentStreak: 0 });
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    // Seed sample logs if none exist
    if (!localStorage.getItem('sessionLogs')) {
      const categories = ['work', 'study', 'coding', 'reading'];
      const logs = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const count = 1 + (i % 3);
        for (let j = 0; j < count; j++) {
          logs.push({
            id: Date.now() - i * 1000 - j,
            userId: 'demo',
            topic: 'Focus Session',
            duration: (25 + (i % 4) * 15) * 60,
            notes: [],
            date: date.toLocaleDateString(),
            time: `${9 + j}:00 AM`,
            category: categories[(i + j) % categories.length]
          });
        }
      }
      localStorage.setItem('sessionLogs', JSON.stringify(logs));
    }
    const sessions = JSON.parse(localStorage.getItem('sessionLogs') || '[]');
    const validDates = sessions
      .filter(s => s.date)
      .map(s => {
        try {
          const d = new Date(s.date);
          return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
        } catch {
          return null;
        }
      })
      .filter(d => d !== null);
    
    const uniqueDates = [...new Set(validDates)].sort((a, b) => new Date(b) - new Date(a));
    
    let streak = 0;
    const now = new Date();
    for (let i = 0; i < uniqueDates.length; i++) {
      const date = new Date(uniqueDates[i]);
      const expectedDate = new Date(now);
      expectedDate.setDate(now.getDate() - i);
      
      if (date.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
        streak++;
      } else {
        break;
      }
    }
    
    setStats({ totalSessions: sessions.length, currentStreak: streak });
  }, []);

  const getSessionsData = () => {
    const sessions = JSON.parse(localStorage.getItem('sessionLogs') || '[]');
    const dataMap = {};
    
    sessions.forEach(session => {
      if (session.date) {
        try {
          const d = new Date(session.date);
          if (!isNaN(d.getTime())) {
            const dateStr = d.toISOString().split('T')[0];
            if (!dataMap[dateStr]) {
              dataMap[dateStr] = { count: 0, totalMinutes: 0 };
            }
            dataMap[dateStr].count++;
            dataMap[dateStr].totalMinutes += session.duration || 0;
          }
        } catch (e) {
          // Skip invalid dates
        }
      }
    });
    
    return dataMap;
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const sessionsData = getSessionsData();
    const today = new Date();
    const days = [];

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateStr = date.toISOString().split('T')[0];
      const data = sessionsData[dateStr] || { count: 0, totalMinutes: 0 };
      const isToday = date.toDateString() === today.toDateString();
      const hasActivity = data.count > 0;

      days.push({
        day,
        dateStr,
        isToday,
        hasActivity,
        count: data.count,
        minutes: data.totalMinutes
      });
    }

    return days;
  };

  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const calendarDays = generateCalendarDays();
  const today = new Date();
  const dayOfMonth = today.getDate();

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Stats Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-calm-900 dark:text-calm-100">{stats.totalSessions}</div>
            <div className="text-sm text-calm-600 dark:text-calm-400">Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-500 flex items-center gap-2">
              🔥 {stats.currentStreak}
            </div>
            <div className="text-sm text-calm-600 dark:text-calm-400">Streak</div>
          </div>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="bg-white dark:bg-calm-800 rounded-3xl shadow-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-bold text-calm-900 dark:text-calm-100">Day {dayOfMonth}</h3>
            <span className="text-sm text-gray-400">of {monthNames[currentMonth]}</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigateMonth('prev')} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-calm-700 transition-colors">
              <svg className="w-5 h-5 text-calm-600 dark:text-calm-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button onClick={() => navigateMonth('next')} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-calm-700 transition-colors">
              <svg className="w-5 h-5 text-calm-600 dark:text-calm-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <div className="ml-2 px-3 py-1 bg-focus-100 dark:bg-focus-900 text-focus-700 dark:text-focus-300 rounded-lg text-sm font-semibold">
              {monthShort[currentMonth]} {currentYear}
            </div>
          </div>
        </div>

        {/* Week Days */}
        <div className="grid grid-cols-7 gap-2 mb-3">
          {weekDays.map((day, idx) => (
            <div key={idx} className="text-center text-sm font-semibold text-gray-400">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((dayData, idx) => (
            <div key={idx} className="aspect-square flex items-center justify-center">
              {dayData ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                      dayData.isToday
                        ? 'bg-green-500 text-white shadow-lg scale-110'
                        : dayData.hasActivity
                        ? 'border-2 border-blue-500 text-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'text-gray-400 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-calm-700'
                    }`}
                    title={dayData.hasActivity ? `${dayData.count} session${dayData.count !== 1 ? 's' : ''} • ${dayData.minutes} min` : dayData.dateStr}
                  >
                    {dayData.hasActivity && !dayData.isToday && (
                      <svg className="absolute w-3 h-3 text-blue-500" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {!dayData.hasActivity && dayData.day}
                  </div>
                  {dayData.hasActivity && (
                    <div className="absolute bottom-0 w-1 h-1 bg-red-500 rounded-full"></div>
                  )}
                </div>
              ) : (
                <div></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeatmapCalendar;
