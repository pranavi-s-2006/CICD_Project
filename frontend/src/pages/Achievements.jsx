import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import CircularProgress from '../components/ui/CircularProgress';
import HeatmapCalendar from '../components/ui/HeatmapCalendar';

const SAMPLE_LOGS = (() => {
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
        topic: ['Deep Work', 'Study Session', 'Coding Sprint', 'Reading'][j % 4],
        duration: (25 + (i % 4) * 15) * 60,
        notes: j % 3 === 0 ? [{ text: 'Sample note', time: '10:00 AM' }] : [],
        date: date.toLocaleDateString(),
        time: `${9 + j}:00 AM`,
        category: categories[(i + j) % categories.length]
      });
    }
  }
  return logs;
})();

const Achievements = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    if (!localStorage.getItem('sessionLogs')) {
      localStorage.setItem('sessionLogs', JSON.stringify(SAMPLE_LOGS));
    }
  }, []);

  // Calculate user stats from localStorage
  const calculateUserStats = () => {
    const sessions = JSON.parse(localStorage.getItem('sessionLogs') || '[]');
    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    const completedSessions = sessions.length; // All logged sessions are completed
    
    // Calculate streak based on dates
    let currentStreak = 0;
    let longestStreak = 0;
    
    if (sessions.length > 0) {
      const dates = [...new Set(sessions.map(s => s.date))].sort((a, b) => new Date(b) - new Date(a));
      const today = new Date().toLocaleDateString();
      
      // Current streak
      for (let i = 0; i < dates.length; i++) {
        const date = new Date(dates[i]);
        const expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() - i);
        
        if (date.toLocaleDateString() === expectedDate.toLocaleDateString()) {
          currentStreak++;
        } else {
          break;
        }
      }
      
      // Longest streak
      let tempStreak = 1;
      for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(dates[i-1]);
        const currDate = new Date(dates[i]);
        const dayDiff = Math.floor((prevDate - currDate) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak, currentStreak);
    }
    
    const level = Math.floor(totalSessions / 5) + 1;
    const totalXP = completedSessions * 50;
    const nextLevelXP = level * 200;
    
    return {
      totalSessions,
      completedSessions,
      totalMinutes,
      avgFocusScore: 0, // Not tracked in current implementation
      currentStreak,
      longestStreak,
      level,
      totalXP,
      nextLevelXP
    };
  };

  const userStats = calculateUserStats();

  // Calculate real achievements based on user data
  const calculateAchievements = () => {
    const sessions = JSON.parse(localStorage.getItem('sessionLogs') || '[]');
    const totalSessions = sessions.length;
    const longSessions = sessions.filter(s => s.duration >= 90).length;
    
    return [
      {
        id: 1,
        title: 'First Steps',
        description: 'Complete your first focus session',
        icon: '👶',
        category: 'milestone',
        unlocked: totalSessions >= 1,
        unlockedAt: totalSessions >= 1 ? sessions[0]?.date : null,
        rarity: 'common',
        points: 10,
        progress: Math.min(totalSessions, 1),
        total: 1
      },
      {
        id: 2,
        title: 'Focus Warrior',
        description: 'Complete 10 focus sessions',
        icon: '⚔️',
        category: 'milestone',
        unlocked: totalSessions >= 10,
        unlockedAt: totalSessions >= 10 ? sessions[9]?.date : null,
        rarity: 'common',
        points: 50,
        progress: Math.min(totalSessions, 10),
        total: 10
      },
      {
        id: 3,
        title: 'Deep Diver',
        description: 'Complete a 90-minute focus session',
        icon: '🏊♂️',
        category: 'duration',
        unlocked: longSessions >= 1,
        unlockedAt: longSessions >= 1 ? sessions.find(s => s.duration >= 90)?.date : null,
        rarity: 'rare',
        points: 100,
        progress: Math.min(longSessions, 1),
        total: 1
      },
      {
        id: 4,
        title: 'Streak Master',
        description: 'Maintain a 7-day focus streak',
        icon: '🔥',
        category: 'streak',
        unlocked: userStats.currentStreak >= 7 || userStats.longestStreak >= 7,
        unlockedAt: userStats.currentStreak >= 7 || userStats.longestStreak >= 7 ? sessions[6]?.date : null,
        rarity: 'epic',
        points: 200,
        progress: Math.min(Math.max(userStats.currentStreak, userStats.longestStreak), 7),
        total: 7
      },
      {
        id: 5,
        title: 'Note Taker',
        description: 'Take notes in 5 sessions',
        icon: '📝',
        category: 'quality',
        unlocked: sessions.filter(s => s.notes && s.notes.length > 0).length >= 5,
        unlockedAt: sessions.filter(s => s.notes && s.notes.length > 0)[4]?.date || null,
        rarity: 'rare',
        points: 150,
        progress: Math.min(sessions.filter(s => s.notes && s.notes.length > 0).length, 5),
        total: 5
      },
      {
        id: 6,
        title: 'Study Marathon',
        description: 'Complete a study session',
        icon: '📚',
        category: 'time',
        unlocked: sessions.filter(s => s.category === 'study').length >= 1,
        unlockedAt: sessions.find(s => s.category === 'study')?.date || null,
        rarity: 'uncommon',
        points: 75,
        progress: Math.min(sessions.filter(s => s.category === 'study').length, 1),
        total: 1
      },
      {
        id: 7,
        title: 'Century Club',
        description: 'Complete 100 focus sessions',
        icon: '💯',
        category: 'milestone',
        unlocked: totalSessions >= 100,
        unlockedAt: totalSessions >= 100 ? sessions[99]?.date : null,
        rarity: 'legendary',
        points: 500,
        progress: Math.min(totalSessions, 100),
        total: 100
      },
      {
        id: 8,
        title: 'Productive Week',
        description: 'Complete 20 sessions',
        icon: '🎯',
        category: 'quality',
        unlocked: totalSessions >= 20,
        unlockedAt: totalSessions >= 20 ? sessions[19]?.date : null,
        rarity: 'epic',
        points: 300,
        progress: Math.min(totalSessions, 20),
        total: 20
      }
    ];
  };

  const achievements = calculateAchievements();

  const categories = [
    { id: 'all', name: 'All', icon: '🏆' },
    { id: 'milestone', name: 'Milestones', icon: '🎯' },
    { id: 'streak', name: 'Streaks', icon: '🔥' },
    { id: 'quality', name: 'Quality', icon: '⭐' },
    { id: 'duration', name: 'Duration', icon: '⏱️' },
    { id: 'time', name: 'Time-based', icon: '🕐' }
  ];

  const rarityColors = {
    common: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    uncommon: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    rare: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    epic: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    legendary: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  };

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-calm-50 via-white to-focus-50 dark:from-calm-900 dark:via-calm-800 dark:to-focus-900">
      <div className="container mx-auto px-6 py-8 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-5xl font-bold font-display text-calm-900 dark:text-calm-100">
            🏆 Achievements & Progress
          </h1>
          <p className="text-xl text-calm-600 dark:text-calm-400 max-w-2xl mx-auto">
            Track your focus journey, unlock achievements, and celebrate your productivity milestones
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-2 border-focus-200 dark:border-focus-800 hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-focus-600 dark:text-focus-400 mb-2">{userStats?.level || 1}</div>
              <h3 className="font-bold text-lg text-calm-900 dark:text-calm-100 mb-3">Level</h3>
              <ProgressBar 
                value={userStats?.totalXP || 0} 
                max={userStats?.nextLevelXP || 200} 
                showLabel={false}
                className="mt-2"
              />
              <p className="text-xs text-calm-500 dark:text-calm-600 mt-1">
                {(userStats?.nextLevelXP || 200) - (userStats?.totalXP || 0)} XP to next level
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 dark:border-purple-800 hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">{userStats?.totalXP || 0}</div>
              <h3 className="font-bold text-lg text-calm-900 dark:text-calm-100 mb-3">Total XP</h3>
              <Badge variant="purple" className="mt-2">Focus Points</Badge>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 dark:border-green-800 hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                {achievements.filter(a => a.unlocked).length}/{achievements.length}
              </div>
              <h3 className="font-bold text-lg text-calm-900 dark:text-calm-100 mb-3">Achievements</h3>
              <ProgressBar 
                value={achievements.filter(a => a.unlocked).length} 
                max={achievements.length} 
                showLabel={false}
                color="success"
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card className="border-2 border-red-200 dark:border-red-800 hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-red-500 dark:text-red-400 mb-2">{userStats?.currentStreak || 0}</div>
              <h3 className="font-bold text-lg text-calm-900 dark:text-calm-100 mb-3">Current Streak</h3>
              <p className="text-sm text-calm-600 dark:text-calm-400 mt-2">
                Best: {userStats?.longestStreak || 0} days 🔥
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Streak Progress */}
        <Card className="border-2 border-calm-200 dark:border-calm-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <span>📅</span>
              Focus Activity Heatmap
            </CardTitle>
            <CardDescription>Your daily focus activity over the past year</CardDescription>
          </CardHeader>
          <CardContent>
            <HeatmapCalendar />
          </CardContent>
        </Card>

        {/* Streak Progress */}
        <Card className="border-2 border-calm-200 dark:border-calm-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <span>🔥</span>
              Focus Streaks & Goals
            </CardTitle>
            <CardDescription>Keep the momentum going!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-calm-900 dark:text-calm-100 mb-4">Weekly Goal</h4>
                <div className="flex items-center gap-4">
                  <CircularProgress value={(userStats?.currentStreak || 0) / 7 * 100} size={80}>
                    <div className="text-center">
                      <div className="text-lg font-bold text-focus-600 dark:text-focus-400">{userStats?.currentStreak || 0}</div>
                      <div className="text-xs text-calm-500 dark:text-calm-600">days</div>
                    </div>
                  </CircularProgress>
                  <div>
                    <p className="text-sm text-calm-600 dark:text-calm-400 mb-2">
                      {7 - ((userStats?.currentStreak || 0) % 7)} days until weekly milestone
                    </p>
                    <ProgressBar 
                      value={(userStats?.currentStreak || 0) % 7} 
                      max={7} 
                      color="success"
                      className="w-48"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-calm-900 dark:text-calm-100 mb-4">Monthly Challenge</h4>
                <div className="flex items-center gap-4">
                  <CircularProgress value={(userStats?.currentStreak || 0) / 30 * 100} size={80} color="purple">
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{userStats?.currentStreak || 0}</div>
                      <div className="text-xs text-calm-500 dark:text-calm-600">of 30</div>
                    </div>
                  </CircularProgress>
                  <div>
                    <p className="text-sm text-calm-600 dark:text-calm-400 mb-2">
                      {30 - (userStats?.currentStreak || 0)} days to complete monthly challenge
                    </p>
                    <ProgressBar 
                      value={userStats?.currentStreak || 0} 
                      max={30} 
                      color="purple"
                      className="w-48"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 justify-center">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg ${
                selectedCategory === category.id
                  ? 'bg-focus-600 text-white scale-110 shadow-xl'
                  : 'bg-white dark:bg-calm-800 text-calm-700 dark:text-calm-300 hover:bg-focus-50 dark:hover:bg-calm-700 border-2 border-calm-200 dark:border-calm-700'
              }`}
            >
              <span className="text-lg">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map(achievement => (
            <Card 
              key={achievement.id} 
              className={`relative overflow-hidden transition-all hover:scale-105 hover:shadow-2xl border-2 ${
                achievement.unlocked 
                  ? 'bg-gradient-to-br from-white to-green-50 dark:from-calm-800 dark:to-green-900/20 border-green-300 dark:border-green-700' 
                  : 'border-calm-300 dark:border-calm-700 opacity-75'
              }`}
            >
              {achievement.unlocked && (
                <div className="absolute top-4 right-4">
                  <Badge variant="success">✓ Unlocked</Badge>
                </div>
              )}
              
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <div className={`text-6xl mb-3 ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                    {achievement.icon}
                  </div>
                  <h3 className="text-xl font-bold text-calm-900 dark:text-calm-100 mb-2">
                    {achievement.title}
                  </h3>
                  <p className="text-sm text-calm-600 dark:text-calm-400 mb-3">
                    {achievement.description}
                  </p>
                  
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Badge className={rarityColors[achievement.rarity]}>
                      {achievement.rarity.toUpperCase()}
                    </Badge>
                    <Badge variant="focus">
                      {achievement.points} XP
                    </Badge>
                  </div>
                </div>

                {!achievement.unlocked && achievement.progress !== undefined && (
                  <div>
                    <ProgressBar 
                      value={achievement.progress} 
                      max={achievement.total}
                      color={achievement.rarity === 'legendary' ? 'warning' : 'focus'}
                    />
                  </div>
                )}

                {achievement.unlocked && achievement.unlockedAt && (
                  <div className="text-center">
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                      Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Leaderboard Preview */}
        <Card className="border-2 border-calm-200 dark:border-calm-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <span>🏅</span>
              Global Leaderboard
            </CardTitle>
            <CardDescription>See how you rank among other focus champions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { rank: 1, name: 'FocusNinja', points: 2847, streak: 45, badge: '👑' },
                { rank: 2, name: 'DeepThought', points: 2634, streak: 32, badge: '🥈' },
                { rank: 3, name: 'ZenMaster', points: 2401, streak: 28, badge: '🥉' },
                { rank: 47, name: 'You', points: userStats?.totalXP || 0, streak: userStats?.currentStreak || 0, badge: '🎯', isUser: true },
              ].map((user, index) => (
                <div 
                  key={index} 
                  className={`flex items-center justify-between p-5 rounded-xl border-2 transition-all hover:shadow-lg ${
                    user.isUser 
                      ? 'bg-focus-50 dark:bg-focus-900/20 border-focus-300 dark:border-focus-700 shadow-md' 
                      : 'bg-white dark:bg-calm-800 border-calm-200 dark:border-calm-700'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{user.badge}</div>
                    <div>
                      <div className="font-semibold text-calm-900 dark:text-calm-100">
                        #{user.rank} {user.name}
                      </div>
                      <div className="text-sm text-calm-600 dark:text-calm-400">
                        {user.streak} day streak
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-focus-600 dark:text-focus-400">{user.points.toLocaleString()}</div>
                    <div className="text-xs text-calm-500 dark:text-calm-600">XP</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Achievements;