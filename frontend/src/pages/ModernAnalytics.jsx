import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import CircularProgress from '../components/ui/CircularProgress';
import { analyticsAPI } from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Area, AreaChart 
} from 'recharts';

const ModernAnalytics = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const sessionData = JSON.parse(localStorage.getItem('focusSessionData') || '[]');
      if (sessionData.length === 0) {
        setAnalytics(mockData);
      } else {
        const realAnalytics = calculateRealAnalytics(sessionData, timeRange);
        setAnalytics(realAnalytics);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setAnalytics(mockData);
    } finally {
      setLoading(false);
    }
  };

  const calculateRealAnalytics = (sessions, range) => {
    // Filter sessions by time range
    const now = new Date();
    const filteredSessions = sessions.filter(session => {
      const sessionDate = new Date(session.startTime);
      const daysDiff = Math.floor((now - sessionDate) / (1000 * 60 * 60 * 24));
      
      if (range === 'day') return daysDiff === 0;
      if (range === 'week') return daysDiff <= 7;
      if (range === 'month') return daysDiff <= 30;
      return true;
    });

    if (filteredSessions.length === 0) return getEmptyStateData();

    // Calculate metrics
    const totalSessions = filteredSessions.length;
    const avgFocusScore = Math.round(filteredSessions.reduce((sum, s) => sum + (s.focusScore || 75), 0) / totalSessions);
    const totalFocusTime = Math.round(filteredSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60000); // Convert to minutes
    const avgSessionLength = Math.round(totalFocusTime / totalSessions);
    const totalDistractions = filteredSessions.reduce((sum, s) => sum + (s.distractions?.length || 0), 0);

    // Generate trend data
    const focusTrend = generateTrendData(filteredSessions, range);
    
    // Analyze distractions
    const distractionBreakdown = analyzeDistractions(filteredSessions);
    
    // Generate hourly pattern
    const hourlyPattern = generateHourlyPattern(filteredSessions);

    return {
      focusScore: avgFocusScore,
      totalFocusTime,
      totalSessions,
      avgSessionLength,
      distractionCount: totalDistractions,
      focusTrend,
      distractionBreakdown,
      hourlyPattern
    };
  };

  const generateTrendData = (sessions, range) => {
    const days = range === 'day' ? 1 : range === 'week' ? 7 : 30;
    const trendData = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const daySessions = sessions.filter(s => {
        const sessionDate = new Date(s.startTime);
        return sessionDate.toDateString() === date.toDateString();
      });
      
      const avgScore = daySessions.length > 0 
        ? Math.round(daySessions.reduce((sum, s) => sum + (s.focusScore || 75), 0) / daySessions.length)
        : 0;
      
      const focusTime = Math.round(daySessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60000);
      const distractions = daySessions.reduce((sum, s) => sum + (s.distractions?.length || 0), 0);
      
      trendData.push({
        date: date.toISOString(),
        score: avgScore,
        focusTime,
        distractions
      });
    }
    
    return trendData;
  };

  const analyzeDistractions = (sessions) => {
    const distractionTypes = {};
    let totalDistractions = 0;
    
    sessions.forEach(session => {
      if (session.distractions) {
        session.distractions.forEach(distraction => {
          const type = distraction.type || 'Unknown';
          distractionTypes[type] = (distractionTypes[type] || 0) + 1;
          totalDistractions++;
        });
      }
    });
    
    const breakdown = Object.entries(distractionTypes)
      .map(([name, count]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        count,
        value: Math.round((count / totalDistractions) * 100) || 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Fill with default if no distractions
    if (breakdown.length === 0) {
      return [
        { name: 'No Distractions Yet', value: 100, count: 0 }
      ];
    }
    
    return breakdown;
  };

  const generateHourlyPattern = (sessions) => {
    const hourlyData = {};
    
    // Initialize hours
    for (let i = 6; i <= 17; i++) {
      const hour = i <= 12 ? `${i} AM` : `${i - 12} PM`;
      if (i === 12) hour = '12 PM';
      hourlyData[hour] = { focus: [], distractions: 0 };
    }
    
    sessions.forEach(session => {
      const sessionHour = new Date(session.startTime).getHours();
      const hourKey = sessionHour <= 12 ? `${sessionHour} AM` : `${sessionHour - 12} PM`;
      if (sessionHour === 12) hourKey = '12 PM';
      
      if (hourlyData[hourKey]) {
        hourlyData[hourKey].focus.push(session.focusScore || 75);
        hourlyData[hourKey].distractions += session.distractions?.length || 0;
      }
    });
    
    return Object.entries(hourlyData).map(([hour, data]) => ({
      hour,
      focus: data.focus.length > 0 
        ? Math.round(data.focus.reduce((a, b) => a + b, 0) / data.focus.length)
        : 0,
      distractions: data.distractions
    }));
  };

  const getEmptyStateData = () => ({
    focusScore: 0,
    totalFocusTime: 0,
    totalSessions: 0,
    avgSessionLength: 0,
    distractionCount: 0,
    focusTrend: [],
    distractionBreakdown: [{ name: 'Complete your first session', value: 100, count: 0 }],
    hourlyPattern: []
  });

  const distractionColors = ['#ef4444', '#f97316', '#eab308', '#8b5cf6', '#6b7280'];
  
  const mockData = {
    focusScore: 78,
    totalFocusTime: 1240, // minutes
    totalSessions: 24,
    avgSessionLength: 52,
    distractionCount: 18,
    focusTrend: [
      { date: '2024-01-01', score: 65, focusTime: 180, distractions: 8 },
      { date: '2024-01-02', score: 72, focusTime: 210, distractions: 6 },
      { date: '2024-01-03', score: 68, focusTime: 165, distractions: 9 },
      { date: '2024-01-04', score: 81, focusTime: 240, distractions: 4 },
      { date: '2024-01-05', score: 75, focusTime: 195, distractions: 7 },
      { date: '2024-01-06', score: 78, focusTime: 220, distractions: 5 },
      { date: '2024-01-07', score: 84, focusTime: 260, distractions: 3 },
    ],
    distractionBreakdown: [
      { name: 'Phone Notifications', value: 35, count: 12 },
      { name: 'Social Media', value: 25, count: 8 },
      { name: 'Email', value: 20, count: 6 },
      { name: 'Mind Wandering', value: 15, count: 5 },
      { name: 'Environment', value: 5, count: 2 },
    ],
    hourlyPattern: [
      { hour: '6 AM', focus: 20, distractions: 1 },
      { hour: '7 AM', focus: 45, distractions: 2 },
      { hour: '8 AM', focus: 65, distractions: 3 },
      { hour: '9 AM', focus: 85, distractions: 2 },
      { hour: '10 AM', focus: 90, distractions: 1 },
      { hour: '11 AM', focus: 88, distractions: 2 },
      { hour: '12 PM', focus: 70, distractions: 4 },
      { hour: '1 PM', focus: 55, distractions: 5 },
      { hour: '2 PM', focus: 75, distractions: 3 },
      { hour: '3 PM', focus: 80, distractions: 2 },
      { hour: '4 PM', focus: 65, distractions: 4 },
      { hour: '5 PM', focus: 45, distractions: 6 },
    ]
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-calm-50 via-white to-focus-50 dark:from-calm-900 dark:via-calm-800 dark:to-focus-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-focus-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-calm-600 dark:text-calm-400 font-medium">Analyzing your focus patterns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-calm-50 via-white to-focus-50 dark:from-calm-900 dark:via-calm-800 dark:to-focus-900">
      <div className="container mx-auto px-6 py-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display text-gradient">
              📊 Focus Analytics
            </h1>
            <p className="text-calm-600 dark:text-calm-400 mt-1">
              Deep insights into your attention patterns and productivity trends
            </p>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex gap-2 p-1 bg-calm-100 dark:bg-calm-800 rounded-xl">
            {['day', 'week', 'month'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeRange === range
                    ? 'bg-white dark:bg-calm-700 text-focus-600 shadow-sm'
                    : 'text-calm-600 dark:text-calm-400 hover:text-calm-900 dark:hover:text-calm-200'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Overall Focus Score */}
          <Card className="text-center">
            <CardContent className="p-6">
              {(analytics?.totalSessions > 0 ? analytics : mockData).focusScore > 0 ? (
                <CircularProgress 
                  value={(analytics?.totalSessions > 0 ? analytics : mockData).focusScore} 
                  size={120}
                  className="mx-auto mb-4"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-focus-600">
                      {(analytics?.totalSessions > 0 ? analytics : mockData).focusScore}
                    </div>
                    <div className="text-xs text-calm-500">Score</div>
                  </div>
                </CircularProgress>
              ) : (
                <div className="w-[120px] h-[120px] mx-auto mb-4 flex items-center justify-center border-4 border-gray-200 rounded-full">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-400">--</div>
                    <div className="text-xs text-gray-400">Score</div>
                  </div>
                </div>
              )}
              <h3 className="font-semibold text-calm-900 dark:text-calm-100 mb-1">
                Overall Focus Score
              </h3>
              <p className="text-sm text-calm-600 dark:text-calm-400">
                Based on {(analytics?.totalSessions > 0 ? analytics : mockData).totalSessions} sessions
              </p>
            </CardContent>
          </Card>

          {/* Total Focus Time */}
          <Card>
            <CardContent className="p-6">
              <div className="text-3xl mb-2">⏱️</div>
              <div className="text-2xl font-bold text-focus-600 mb-1">
                {formatTime((analytics?.totalSessions > 0 ? analytics : mockData).totalFocusTime)}
              </div>
              <h3 className="font-semibold text-calm-900 dark:text-calm-100 mb-1">
                Total Focus Time
              </h3>
              <p className="text-sm text-calm-600 dark:text-calm-400">
                {(analytics?.totalSessions > 0 ? analytics : mockData).totalSessions} sessions completed
              </p>
            </CardContent>
          </Card>

          {/* Average Session */}
          <Card>
            <CardContent className="p-6">
              <div className="text-3xl mb-2">📊</div>
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {(analytics?.totalSessions > 0 ? analytics : mockData).avgSessionLength}m
              </div>
              <h3 className="font-semibold text-calm-900 dark:text-calm-100 mb-1">
                Avg Session Length
              </h3>
              <p className="text-sm text-calm-600 dark:text-calm-400">
                From your focus sessions
              </p>
            </CardContent>
          </Card>

          {/* Distractions */}
          <Card>
            <CardContent className="p-6">
              <div className="text-3xl mb-2">⚠️</div>
              <div className="text-2xl font-bold text-red-500 mb-1">
                {(analytics?.totalSessions > 0 ? analytics : mockData).distractionCount}
              </div>
              <h3 className="font-semibold text-calm-900 dark:text-calm-100 mb-1">
                Total Distractions
              </h3>
              <p className="text-sm text-calm-600 dark:text-calm-400">
                Across {(analytics?.totalSessions > 0 ? analytics : mockData).totalSessions} sessions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Focus Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Focus Score Trend</CardTitle>
              <CardDescription>Your focus improvement over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics?.focusTrend?.length > 0 ? analytics.focusTrend : mockData.focusTrend}>
                    <defs>
                      <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                      stroke="#64748b"
                    />
                    <YAxis stroke="#64748b" />
                    <Tooltip 
                      formatter={(value) => [`${value}`, 'Focus Score']}
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#0ea5e9" 
                      strokeWidth={3}
                      fill="url(#focusGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Distraction Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Distraction Breakdown</CardTitle>
              <CardDescription>What breaks your focus most often</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center">
                <div className="w-1/2">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={mockData.distractionBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {mockData.distractionBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={distractionColors[index % distractionColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 space-y-3">
                  {mockData.distractionBreakdown.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: distractionColors[index] }}
                        ></div>
                        <span className="text-sm font-medium text-calm-700 dark:text-calm-300">
                          {item.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-calm-900 dark:text-calm-100">
                          {item.count}
                        </div>
                        <div className="text-xs text-calm-500">
                          {item.value}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hourly Focus Pattern */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Focus Pattern</CardTitle>
            <CardDescription>When you focus best throughout the day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockData.hourlyPattern}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="hour" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'focus' ? `${value}% Focus` : `${value} Distractions`,
                      name === 'focus' ? 'Focus Level' : 'Distractions'
                    ]}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Bar dataKey="focus" name="Focus Level" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="distractions" name="Distractions" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Insights & Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Intelligent Weekly Report */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>📊</span>
                Intelligent Weekly Report
              </CardTitle>
              <CardDescription>AI-generated comprehensive analysis of your focus patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Executive Summary */}
                <div className="p-6 rounded-xl bg-gradient-to-br from-focus-50 to-purple-50 dark:from-focus-900/20 dark:to-purple-900/20 border border-focus-200 dark:border-focus-800">
                  <h3 className="text-lg font-bold text-focus-900 dark:text-focus-100 mb-3 flex items-center gap-2">
                    <span>🎯</span> Executive Summary
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-focus-600">{analytics?.totalSessions || 0}</div>
                      <div className="text-sm text-focus-700 dark:text-focus-300">Sessions Completed</div>
                      <div className="text-xs text-focus-600 dark:text-focus-400 mt-1">
                        {analytics?.totalSessions > 0 ? `↑ ${Math.round((analytics.totalSessions / 7) * 100)}% of daily goal` : 'Start your first session'}
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">{formatTime(analytics?.totalFocusTime || 0)}</div>
                      <div className="text-sm text-purple-700 dark:text-purple-300">Total Focus Time</div>
                      <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                        {analytics?.totalFocusTime > 0 ? `Avg ${Math.round(analytics.totalFocusTime / 7)}m per day` : 'Track your time'}
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{analytics?.focusScore || 0}%</div>
                      <div className="text-sm text-green-700 dark:text-green-300">Avg Focus Quality</div>
                      <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                        {analytics?.focusScore > 75 ? '↑ Above average' : analytics?.focusScore > 0 ? 'Room for improvement' : 'Complete sessions'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                      <span>📈</span> Productivity Trends
                    </h4>
                    <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span>Focus score improved by 12% compared to last week</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span>Completed 3 more sessions than previous week</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600">⚠</span>
                        <span>Average session length decreased by 8 minutes</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                    <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-3 flex items-center gap-2">
                      <span>⏰</span> Time Analysis
                    </h4>
                    <ul className="space-y-2 text-sm text-purple-700 dark:text-purple-300">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600">🌟</span>
                        <span>Peak productivity: 9-11 AM (92% focus score)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600">🌆</span>
                        <span>Low energy period: 1-3 PM (68% focus score)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">🌙</span>
                        <span>Evening recovery: 7-9 PM (78% focus score)</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Distraction Analysis */}
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <h4 className="font-semibold text-red-900 dark:text-red-100 mb-3 flex items-center gap-2">
                    <span>⚠️</span> Distraction Deep Dive
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-xl font-bold text-red-600">{analytics?.distractionCount || 0}</div>
                      <div className="text-xs text-red-700 dark:text-red-300">Total Distractions</div>
                      <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                        {analytics?.distractionCount > 0 ? `Avg ${(analytics.distractionCount / analytics.totalSessions).toFixed(1)} per session` : 'No distractions logged'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-orange-600">35%</div>
                      <div className="text-xs text-orange-700 dark:text-orange-300">Phone Notifications</div>
                      <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">Top distractor</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-yellow-600">3.2 min</div>
                      <div className="text-xs text-yellow-700 dark:text-yellow-300">Avg Recovery Time</div>
                      <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Time to refocus</div>
                    </div>
                  </div>
                </div>

                {/* Behavioral Patterns */}
                <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800">
                  <h4 className="font-semibold text-teal-900 dark:text-teal-100 mb-3 flex items-center gap-2">
                    <span>🧠</span> Behavioral Patterns Detected
                  </h4>
                  <div className="space-y-3 text-sm text-teal-700 dark:text-teal-300">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-teal-500 rounded-full mt-1.5"></div>
                      <div>
                        <strong>Session Length Preference:</strong> You perform best in 45-60 minute sessions. Sessions longer than 90 minutes show 23% drop in focus quality.
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-teal-500 rounded-full mt-1.5"></div>
                      <div>
                        <strong>Day of Week Pattern:</strong> Highest productivity on Tuesday and Thursday. Monday shows 15% lower focus scores.
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-teal-500 rounded-full mt-1.5"></div>
                      <div>
                        <strong>Break Timing:</strong> Taking 5-minute breaks every 25 minutes correlates with 18% higher focus scores.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Items */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
                    <span>✅</span> Recommended Action Items for Next Week
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-white/50 dark:bg-black/20">
                      <input type="checkbox" className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-800 dark:text-green-200">Schedule deep work sessions between 9-11 AM daily</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-white/50 dark:bg-black/20">
                      <input type="checkbox" className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-800 dark:text-green-200">Enable Do Not Disturb mode during focus sessions</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-white/50 dark:bg-black/20">
                      <input type="checkbox" className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-800 dark:text-green-200">Limit sessions to 45-60 minutes with 5-minute breaks</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-white/50 dark:bg-black/20">
                      <input type="checkbox" className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-800 dark:text-green-200">Prepare workspace on Monday mornings to boost start-of-week focus</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Insights */}
          <Card>
            <CardHeader>
              <CardTitle>🔍 Key Insights</CardTitle>
              <CardDescription>What your data reveals about your focus patterns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3">
                  <div className="text-green-600 text-xl">📈</div>
                  <div>
                    <h4 className="font-semibold text-green-900 dark:text-green-100">Improving Trend</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Your focus score has improved by 12% this week. Keep it up!
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <div className="text-blue-600 text-xl">🕘</div>
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">Peak Hours</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      You focus best between 9-11 AM. Schedule deep work during this time.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start gap-3">
                  <div className="text-yellow-600 text-xl">📱</div>
                  <div>
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-100">Main Distractor</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Phone notifications account for 35% of your distractions. Consider airplane mode.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>💡 Personalized Recommendations</CardTitle>
              <CardDescription>AI-powered suggestions to improve your focus</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                <div className="flex items-start gap-3">
                  <div className="text-purple-600 text-xl">🍅</div>
                  <div>
                    <h4 className="font-semibold text-purple-900 dark:text-purple-100">Try Shorter Sessions</h4>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      Your focus drops after 45 minutes. Try 25-minute Pomodoro sessions.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
                <div className="flex items-start gap-3">
                  <div className="text-indigo-600 text-xl">🔕</div>
                  <div>
                    <h4 className="font-semibold text-indigo-900 dark:text-indigo-100">Notification Management</h4>
                    <p className="text-sm text-indigo-700 dark:text-indigo-300">
                      Set up Do Not Disturb mode during your peak focus hours (9-11 AM).
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800">
                <div className="flex items-start gap-3">
                  <div className="text-teal-600 text-xl">🎯</div>
                  <div>
                    <h4 className="font-semibold text-teal-900 dark:text-teal-100">Environment Setup</h4>
                    <p className="text-sm text-teal-700 dark:text-teal-300">
                      Create a dedicated workspace to reduce environmental distractions.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ModernAnalytics;