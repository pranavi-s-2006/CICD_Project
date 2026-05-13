import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import CircularProgress from '../components/ui/CircularProgress';
import { analyticsAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ModernDashboard = () => {
  const [dailySummary, setDailySummary] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [summaryResponse, weeklyResponse] = await Promise.all([
        analyticsAPI.getDailySummary(),
        analyticsAPI.getWeeklyTrends()
      ]);
      
      setDailySummary(summaryResponse.data);
      setWeeklyData(weeklyResponse.data.dailyData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const distractionData = [
    { name: 'Phone', value: 35, color: '#ef4444' },
    { name: 'Social Media', value: 25, color: '#f97316' },
    { name: 'Email', value: 20, color: '#eab308' },
    { name: 'Mind Wandering', value: 15, color: '#8b5cf6' },
    { name: 'Other', value: 5, color: '#6b7280' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-calm-50 via-white to-focus-50 dark:from-calm-900 dark:via-calm-800 dark:to-focus-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-focus-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-calm-600 dark:text-calm-400 font-medium">Loading your focus insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-calm-50 via-white to-focus-50 dark:from-calm-900 dark:via-calm-800 dark:to-focus-900">
      <div className="container mx-auto px-6 py-8 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-4xl font-bold font-display text-gradient">
            Welcome back, Focus Champion! 🎯
          </h1>
          <p className="text-lg text-calm-600 dark:text-calm-400 max-w-2xl mx-auto">
            Track your attention, understand your patterns, and build better focus habits
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
          
          {/* Focus Score Card */}
          <Card className="relative overflow-hidden">
            <CardContent className="p-6 text-center">
              <CircularProgress 
                value={dailySummary?.focusScore || 0} 
                size={100}
                className="mx-auto mb-4"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-focus-600">
                    {dailySummary?.focusScore || 0}
                  </div>
                  <div className="text-xs text-calm-500">Score</div>
                </div>
              </CircularProgress>
              <h3 className="font-semibold text-calm-900 dark:text-calm-100">Focus Score</h3>
              <p className="text-sm text-green-600 flex items-center justify-center gap-1 mt-1">
                <span>↗</span> +5% from yesterday
              </p>
            </CardContent>
          </Card>

          {/* Focus Time Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-focus-100 dark:bg-focus-900 flex items-center justify-center">
                  <span className="text-xl">⏱️</span>
                </div>
                <div>
                  <h3 className="font-semibold text-calm-900 dark:text-calm-100">Focus Time</h3>
                  <p className="text-xs text-calm-500">{dailySummary?.totalSessions || 0} sessions</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-focus-600">
                {formatTime(dailySummary?.totalFocusTime || 0)}
              </div>
            </CardContent>
          </Card>

          {/* Distractions Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900 flex items-center justify-center">
                  <span className="text-xl">⚠️</span>
                </div>
                <div>
                  <h3 className="font-semibold text-calm-900 dark:text-calm-100">Distractions</h3>
                  <p className="text-xs text-calm-500">Today</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-red-500">
                {dailySummary?.distractionCount || 0}
              </div>
            </CardContent>
          </Card>

          {/* Average Session Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <span className="text-xl">📊</span>
                </div>
                <div>
                  <h3 className="font-semibold text-calm-900 dark:text-calm-100">Avg Session</h3>
                  <p className="text-xs text-calm-500">Duration</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(dailySummary?.avgSessionDuration || 0)}m
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Focus Session Card */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  Start Your Focus Session
                </CardTitle>
                <CardDescription>
                  Ready to dive deep? Let's track your attention and build better focus habits.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                      Session Type
                    </label>
                    <select className="w-full px-4 py-3 rounded-xl border border-calm-200 dark:border-calm-700 bg-white dark:bg-calm-800 focus:ring-2 focus:ring-focus-500 focus:border-transparent">
                      <option>🔬 Deep Work</option>
                      <option>📚 Study</option>
                      <option>💻 Coding</option>
                      <option>🎨 Creative</option>
                      <option>📖 Reading</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                      Duration
                    </label>
                    <select className="w-full px-4 py-3 rounded-xl border border-calm-200 dark:border-calm-700 bg-white dark:bg-calm-800 focus:ring-2 focus:ring-focus-500 focus:border-transparent">
                      <option>25 minutes (Pomodoro)</option>
                      <option>45 minutes</option>
                      <option>60 minutes</option>
                      <option>90 minutes</option>
                    </select>
                  </div>
                </div>
                <Button size="lg" className="w-full">
                  <span className="mr-2">🚀</span>
                  Start Focus Session
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Distraction Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Distraction Breakdown</CardTitle>
              <CardDescription>Your top focus breakers this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {distractionData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm font-medium text-calm-700 dark:text-calm-300">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-calm-900 dark:text-calm-100">
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Focus Trends</CardTitle>
            <CardDescription>Your focus patterns over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={Object.values(weeklyData).slice(-7)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                    stroke="#64748b"
                  />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'focusTime' ? `${Math.round(value)}m` : value,
                      name === 'focusTime' ? 'Focus Time' : 'Distractions'
                    ]}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Bar dataKey="focusTime" name="Focus Time" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="distractionCount" name="Distractions" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Focus Tips */}
        <Card>
          <CardHeader>
            <CardTitle>💡 Focus Tips for Today</CardTitle>
            <CardDescription>Personalized insights based on your patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800">
                <div className="text-2xl mb-2">🍅</div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Try Pomodoro</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">25min focus + 5min break works best for your pattern</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800">
                <div className="text-2xl mb-2">📵</div>
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">Phone-Free Zone</h4>
                <p className="text-sm text-green-700 dark:text-green-300">Your #1 distraction. Try airplane mode during sessions</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800">
                <div className="text-2xl mb-2">🎯</div>
                <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">Peak Hours</h4>
                <p className="text-sm text-purple-700 dark:text-purple-300">You focus best between 9-11 AM. Schedule deep work then</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ModernDashboard;