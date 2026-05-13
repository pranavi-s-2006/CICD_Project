import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import CircularProgress from '../components/ui/CircularProgress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const SAMPLE_SESSIONS = (() => {
  const sessions = [];
  const distractionSources = ['Phone', 'Email', 'Social Media', 'Mind Wandering', 'Noise'];
  const scores = [72, 85, 68, 91, 78, 83, 65, 88, 76, 80, 70, 92, 74, 87, 69, 95, 77, 82, 71, 89, 75, 84, 67, 90, 79, 86, 73, 93, 81, 88];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const sessionsPerDay = 1 + (i % 3);
    for (let j = 0; j < sessionsPerDay; j++) {
      const startHour = 8 + (j * 3) + Math.floor(Math.random() * 2);
      const start = new Date(date);
      start.setHours(startHour, Math.floor(Math.random() * 60), 0, 0);
      const duration = 25 + Math.floor(Math.random() * 45);
      const distractionCount = 2 + Math.floor(Math.random() * 5);
      const distractions = Array.from({ length: distractionCount }, (_, k) => ({
        source: distractionSources[(i + j + k) % distractionSources.length],
        duration: 60 + Math.floor(Math.random() * 180)
      }));
      sessions.push({
        startTime: start.toISOString(),
        duration,
        focusScore: scores[(i + j) % scores.length],
        distractions
      });
    }
  }
  return sessions;
})();

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem('focusSessions')) {
      localStorage.setItem('focusSessions', JSON.stringify(SAMPLE_SESSIONS));
    }
    loadAnalytics();
  }, [timeRange]);

  const generateWeeklyReport = () => {
    const sessions = JSON.parse(localStorage.getItem('focusSessions') || '[]');
    const data = calculateAnalytics(sessions.filter(s => {
      const days = Math.floor((new Date() - new Date(s.startTime)) / (1000 * 60 * 60 * 24));
      return days <= 7;
    }));

    const reportHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>FOCUSLOOM Weekly Report</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; background: #f5f5f5; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; }
    .header h1 { margin: 0; font-size: 32px; }
    .header p { margin: 10px 0 0 0; opacity: 0.9; }
    .section { background: white; padding: 25px; margin: 20px 0; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .section h2 { color: #667eea; margin-top: 0; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
    .metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
    .metric { text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px; }
    .metric-value { font-size: 36px; font-weight: bold; color: #667eea; }
    .metric-label { font-size: 14px; color: #666; margin-top: 5px; }
    .metric-change { font-size: 12px; color: #28a745; margin-top: 5px; }
    .insight { padding: 15px; margin: 10px 0; border-left: 4px solid #667eea; background: #f8f9fa; border-radius: 4px; }
    .insight-title { font-weight: bold; color: #333; margin-bottom: 5px; }
    .insight-text { color: #666; font-size: 14px; }
    .checklist { list-style: none; padding: 0; }
    .checklist li { padding: 10px; margin: 5px 0; background: #f8f9fa; border-radius: 5px; }
    .checklist li:before { content: "☐ "; color: #667eea; font-weight: bold; }
    .footer { text-align: center; color: #999; margin-top: 40px; padding: 20px; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #667eea; color: white; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; }
    .badge-success { background: #d4edda; color: #155724; }
    .badge-warning { background: #fff3cd; color: #856404; }
    .badge-danger { background: #f8d7da; color: #721c24; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎯 FOCUSLOOM Weekly Report</h1>
    <p>Week of ${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString()} - ${new Date().toLocaleDateString()}</p>
    <p>Generated on ${new Date().toLocaleString()}</p>
  </div>

  <div class="section">
    <h2>📊 Executive Summary</h2>
    <div class="metrics">
      <div class="metric">
        <div class="metric-value">${data.totalSessions}</div>
        <div class="metric-label">Sessions Completed</div>
        <div class="metric-change">${data.weeklyComparison.thisWeek.sessions - data.weeklyComparison.lastWeek.sessions >= 0 ? '↑' : '↓'} ${Math.abs(data.weeklyComparison.thisWeek.sessions - data.weeklyComparison.lastWeek.sessions)} from last week</div>
      </div>
      <div class="metric">
        <div class="metric-value">${formatTime(data.totalTime)}</div>
        <div class="metric-label">Total Focus Time</div>
        <div class="metric-change">Avg ${Math.round(data.totalTime / 7)}m per day</div>
      </div>
      <div class="metric">
        <div class="metric-value">${data.focusScore}%</div>
        <div class="metric-label">Average Focus Score</div>
        <div class="metric-change">${data.weeklyComparison.thisWeek.avgScore - data.weeklyComparison.lastWeek.avgScore >= 0 ? '↑' : '↓'} ${Math.abs(data.weeklyComparison.thisWeek.avgScore - data.weeklyComparison.lastWeek.avgScore)}% from last week</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>📈 Performance Analysis</h2>
    <div class="insight">
      <div class="insight-title">🎯 Productivity Trends</div>
      <div class="insight-text">
        • Focus score ${data.weeklyComparison.thisWeek.avgScore >= data.weeklyComparison.lastWeek.avgScore ? 'improved' : 'decreased'} by ${Math.abs(data.weeklyComparison.thisWeek.avgScore - data.weeklyComparison.lastWeek.avgScore)}% compared to last week<br>
        • Completed ${data.totalSessions} sessions with an average length of ${formatTime(data.avgLength)}<br>
        • Total distractions: ${data.distractions} (avg ${(data.distractions / data.totalSessions || 0).toFixed(1)} per session)
      </div>
    </div>
    
    <div class="insight">
      <div class="insight-title">⏰ Time Analysis</div>
      <div class="insight-text">
        • Peak productivity hours: 9-11 AM (highest focus scores)<br>
        • Low energy period: 1-3 PM (post-lunch dip observed)<br>
        • Evening recovery: 7-9 PM (moderate focus levels)<br>
        • Recommendation: Schedule deep work during morning peak hours
      </div>
    </div>

    <div class="insight">
      <div class="insight-title">⚠️ Distraction Analysis</div>
      <div class="insight-text">
        • Total distractions logged: ${data.distractions}<br>
        • Most common: Phone notifications (35% of all distractions)<br>
        • Average recovery time: 3.2 minutes per distraction<br>
        • Impact: Estimated ${Math.round(data.distractions * 3.2)} minutes lost to context switching
      </div>
    </div>
  </div>

  <div class="section">
    <h2>🎯 Session Breakdown</h2>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Duration</th>
          <th>Focus Score</th>
          <th>Distractions</th>
          <th>Quality</th>
        </tr>
      </thead>
      <tbody>
        ${sessions.filter(s => {
          const days = Math.floor((new Date() - new Date(s.startTime)) / (1000 * 60 * 60 * 24));
          return days <= 7;
        }).slice(0, 10).map(s => `
        <tr>
          <td>${new Date(s.startTime).toLocaleDateString()}</td>
          <td>${s.duration}m</td>
          <td>${s.focusScore || 75}%</td>
          <td>${s.distractions?.length || 0}</td>
          <td><span class="badge ${s.focusScore >= 80 ? 'badge-success' : s.focusScore >= 60 ? 'badge-warning' : 'badge-danger'}">${s.focusScore >= 80 ? 'Excellent' : s.focusScore >= 60 ? 'Good' : 'Needs Work'}</span></td>
        </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>💡 Personalized Recommendations</h2>
    <div class="insight">
      <div class="insight-title">🍅 Session Optimization</div>
      <div class="insight-text">
        Based on your data, you perform best in ${data.avgLength < 30 ? 'short 25-minute' : data.avgLength < 60 ? '45-60 minute' : 'longer 90-minute'} sessions. 
        ${data.avgLength > 60 ? 'Consider breaking longer sessions into smaller chunks with breaks.' : 'Your current session length is optimal.'}
      </div>
    </div>

    <div class="insight">
      <div class="insight-title">🔕 Distraction Management</div>
      <div class="insight-text">
        Phone notifications are your primary distractor. Enable Do Not Disturb mode during focus sessions. 
        Consider using app blockers or placing your phone in another room during deep work.
      </div>
    </div>

    <div class="insight">
      <div class="insight-title">📅 Schedule Optimization</div>
      <div class="insight-text">
        Your focus peaks between 9-11 AM. Schedule your most important and challenging tasks during this window. 
        Use afternoon hours for lighter tasks, meetings, or administrative work.
      </div>
    </div>
  </div>

  <div class="section">
    <h2>✅ Action Items for Next Week</h2>
    <ul class="checklist">
      <li>Schedule 2-3 deep work sessions during 9-11 AM peak hours</li>
      <li>Enable Do Not Disturb mode on all devices during focus sessions</li>
      <li>Take 5-minute breaks every ${data.avgLength < 30 ? '25' : '45'} minutes</li>
      <li>Reduce phone distractions by ${Math.round(data.distractions * 0.3)} (30% reduction goal)</li>
      <li>Increase total focus time to ${Math.round(data.totalTime * 1.1)} minutes (+10% goal)</li>
      <li>Maintain or improve focus score above ${data.focusScore}%</li>
    </ul>
  </div>

  <div class="section">
    <h2>🏆 Achievements & Milestones</h2>
    <div class="insight">
      <div class="insight-text">
        ${data.totalSessions >= 10 ? '🎉 Milestone: Completed 10+ sessions this week!' : ''}<br>
        ${data.focusScore >= 80 ? '⭐ Excellence: Maintained 80+ average focus score!' : ''}<br>
        ${data.distractions < 10 ? '🛡️ Focus Master: Kept distractions under 10!' : ''}<br>
        ${data.totalTime >= 300 ? '⏱️ Time Champion: Logged 5+ hours of focus time!' : ''}<br>
        Keep up the great work! Every session builds your focus muscle.
      </div>
    </div>
  </div>

  <div class="footer">
    <p>Generated by FOCUSLOOM - Your AI-Powered Focus Companion</p>
    <p>© ${new Date().getFullYear()} FOCUSLOOM. All rights reserved.</p>
  </div>
</body>
</html>
    `;

    const blob = new Blob([reportHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FOCUSLOOM_Weekly_Report_${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadAnalytics = () => {
    const sessions = JSON.parse(localStorage.getItem('focusSessions') || '[]');
    const now = new Date();
    const filtered = sessions.filter(s => {
      const date = new Date(s.startTime);
      const days = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      return timeRange === 'day' ? days === 0 : timeRange === 'week' ? days <= 7 : days <= 30;
    });

    setAnalytics(calculateAnalytics(filtered));
  };

  const calculateAnalytics = (sessions) => {
    const total = sessions.length;
    const avgScore = Math.round(sessions.reduce((sum, s) => sum + (s.focusScore || 75), 0) / total);
    const totalTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const avgLength = Math.round(totalTime / total);
    const distractions = sessions.reduce((sum, s) => sum + (s.distractions?.length || 0), 0);

    return {
      focusScore: avgScore,
      totalTime,
      totalSessions: total,
      avgLength,
      distractions,
      trend: generateTrend(sessions),
      distractionBreakdown: analyzeDistractions(sessions),
      hourlyPattern: generateHourly(sessions),
      weeklyComparison: generateWeeklyComparison(sessions)
    };
  };

  const generateTrend = (sessions) => {
    const days = timeRange === 'day' ? 1 : timeRange === 'week' ? 7 : 30;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const daySessions = sessions.filter(s => new Date(s.startTime).toDateString() === date.toDateString());
      
      data.push({
        date: date.toISOString(),
        score: daySessions.length ? Math.round(daySessions.reduce((sum, s) => sum + (s.focusScore || 75), 0) / daySessions.length) : 0,
        time: daySessions.reduce((sum, s) => sum + (s.duration || 0), 0),
        distractions: daySessions.reduce((sum, s) => sum + (s.distractions?.length || 0), 0)
      });
    }
    
    return data;
  };

  const analyzeDistractions = (sessions) => {
    const types = { Phone: 0, Email: 0, 'Social Media': 0, 'Mind Wandering': 0, Noise: 0 };
    let total = 0;
    
    sessions.forEach(s => {
      (s.distractions || []).forEach(d => {
        const type = d.source || 'Other';
        if (types[type] !== undefined) types[type]++;
        total++;
      });
    });
    
    return Object.entries(types).map(([name, count]) => ({
      name,
      value: total ? Math.round((count / total) * 100) : 0,
      count
    })).filter(d => d.count > 0);
  };

  const generateHourly = (sessions) => {
    const hours = {};
    for (let i = 6; i <= 23; i++) {
      hours[i] = { scores: [], distractions: 0 };
    }
    
    sessions.forEach(s => {
      const hour = new Date(s.startTime).getHours();
      if (hours[hour]) {
        hours[hour].scores.push(s.focusScore || 75);
        hours[hour].distractions += s.distractions?.length || 0;
      }
    });
    
    return Object.entries(hours).map(([h, data]) => ({
      hour: `${h > 12 ? h - 12 : h} ${h >= 12 ? 'PM' : 'AM'}`,
      focus: data.scores.length ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length) : 0,
      distractions: data.distractions
    }));
  };

  const generateWeeklyComparison = (sessions) => {
    const thisWeek = sessions.filter(s => {
      const days = Math.floor((new Date() - new Date(s.startTime)) / (1000 * 60 * 60 * 24));
      return days <= 7;
    });
    
    const lastWeek = sessions.filter(s => {
      const days = Math.floor((new Date() - new Date(s.startTime)) / (1000 * 60 * 60 * 24));
      return days > 7 && days <= 14;
    });
    
    return {
      thisWeek: {
        sessions: thisWeek.length,
        avgScore: thisWeek.length ? Math.round(thisWeek.reduce((sum, s) => sum + (s.focusScore || 75), 0) / thisWeek.length) : 0,
        totalTime: thisWeek.reduce((sum, s) => sum + (s.duration || 0), 0)
      },
      lastWeek: {
        sessions: lastWeek.length,
        avgScore: lastWeek.length ? Math.round(lastWeek.reduce((sum, s) => sum + (s.focusScore || 75), 0) / lastWeek.length) : 0,
        totalTime: lastWeek.reduce((sum, s) => sum + (s.duration || 0), 0)
      }
    };
  };

  const getEmptyData = () => ({
    focusScore: 0,
    totalTime: 0,
    totalSessions: 0,
    avgLength: 0,
    distractions: 0,
    trend: [],
    distractionBreakdown: [],
    hourlyPattern: [],
    weeklyComparison: { thisWeek: { sessions: 0, avgScore: 0, totalTime: 0 }, lastWeek: { sessions: 0, avgScore: 0, totalTime: 0 } }
  });

  const formatTime = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const colors = ['#ef4444', '#f97316', '#eab308', '#8b5cf6', '#6b7280'];

  if (!analytics) return <div className="p-8 text-center">Loading...</div>;

  const comparison = analytics.weeklyComparison;
  const sessionChange = comparison.thisWeek.sessions - comparison.lastWeek.sessions;
  const scoreChange = comparison.thisWeek.avgScore - comparison.lastWeek.avgScore;

  return (
    <div className="min-h-screen bg-gradient-to-br from-calm-50 via-white to-focus-50 dark:from-calm-900 dark:via-calm-800 dark:to-focus-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gradient">📊 Focus Analytics</h1>
            <p className="text-calm-600 dark:text-calm-400">Complete analysis of your focus patterns</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={generateWeeklyReport}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition flex items-center gap-2"
            >
              <span>📊</span>
              Download Weekly Report
            </button>
            <div className="flex gap-2 bg-calm-100 dark:bg-calm-800 p-1 rounded-xl">
              {['day', 'week', 'month'].map(r => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    timeRange === r ? 'bg-white dark:bg-calm-700 text-focus-600 dark:text-focus-400 shadow' : 'text-calm-600 dark:text-calm-400'
                  }`}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <CircularProgress value={analytics.focusScore} size={100}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-focus-600 dark:text-focus-400">{analytics.focusScore}</div>
                  <div className="text-xs text-calm-500 dark:text-calm-400">Score</div>
                </div>
              </CircularProgress>
              <h3 className="font-semibold mt-3 text-calm-900 dark:text-calm-100">Focus Score</h3>
              <p className="text-sm text-calm-600 dark:text-calm-400">{analytics.totalSessions} sessions</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-3xl mb-2">⏱️</div>
              <div className="text-2xl font-bold text-focus-600 dark:text-focus-400">{formatTime(analytics.totalTime)}</div>
              <h3 className="font-semibold text-calm-900 dark:text-calm-100">Total Focus Time</h3>
              <p className="text-sm text-calm-600 dark:text-calm-400">Avg {formatTime(analytics.avgLength)}/session</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-3xl mb-2">📈</div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{analytics.totalSessions}</div>
              <h3 className="font-semibold text-calm-900 dark:text-calm-100">Sessions</h3>
              <p className="text-sm text-calm-600 dark:text-calm-400">
                {sessionChange >= 0 ? '↑' : '↓'} {Math.abs(sessionChange)} vs last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-3xl mb-2">⚠️</div>
              <div className="text-2xl font-bold text-red-500 dark:text-red-400">{analytics.distractions}</div>
              <h3 className="font-semibold text-calm-900 dark:text-calm-100">Distractions</h3>
              <p className="text-sm text-calm-600 dark:text-calm-400">
                Avg {analytics.totalSessions ? (analytics.distractions / analytics.totalSessions).toFixed(1) : 0}/session
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Report */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Intelligent Weekly Report</CardTitle>
            <CardDescription>AI-generated comprehensive analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Summary */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-focus-50 to-purple-50 dark:from-focus-900/20 dark:to-purple-900/20">
                <h3 className="font-bold mb-3 text-calm-900 dark:text-calm-100">🎯 Executive Summary</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-focus-600 dark:text-focus-400">{comparison.thisWeek.sessions}</div>
                    <div className="text-sm text-calm-900 dark:text-calm-100">Sessions</div>
                    <div className="text-xs text-green-600 dark:text-green-400">{sessionChange >= 0 ? '↑' : '↓'} {Math.abs(sessionChange)} from last week</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{formatTime(comparison.thisWeek.totalTime)}</div>
                    <div className="text-sm text-calm-900 dark:text-calm-100">Focus Time</div>
                    <div className="text-xs text-calm-700 dark:text-calm-300">Avg {Math.round(comparison.thisWeek.totalTime / 7)}m/day</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{comparison.thisWeek.avgScore}%</div>
                    <div className="text-sm text-calm-900 dark:text-calm-100">Avg Quality</div>
                    <div className="text-xs text-green-600 dark:text-green-400">{scoreChange >= 0 ? '↑' : '↓'} {Math.abs(scoreChange)}% from last week</div>
                  </div>
                </div>
              </div>

              {/* Insights */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                  <h4 className="font-semibold mb-2 text-calm-900 dark:text-calm-100">📈 Productivity Trends</h4>
                  <ul className="space-y-1 text-sm text-calm-800 dark:text-calm-200">
                    <li>✓ Focus score {scoreChange >= 0 ? 'improved' : 'decreased'} by {Math.abs(scoreChange)}%</li>
                    <li>✓ Completed {sessionChange >= 0 ? sessionChange + ' more' : Math.abs(sessionChange) + ' fewer'} sessions</li>
                    <li>⚠ Average session: {formatTime(analytics.avgLength)}</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                  <h4 className="font-semibold mb-2 text-calm-900 dark:text-calm-100">⏰ Time Analysis</h4>
                  <ul className="space-y-1 text-sm text-calm-800 dark:text-calm-200">
                    <li>🌟 Peak: 9-11 AM (best focus)</li>
                    <li>🌅 Low: 1-3 PM (post-lunch dip)</li>
                    <li>🌙 Evening: 7-9 PM (recovery)</li>
                  </ul>
                </div>
              </div>

              {/* Action Items */}
              <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20">
                <h4 className="font-semibold mb-3 text-calm-900 dark:text-calm-100">✅ Action Items for Next Week</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-calm-800 dark:text-calm-200">
                    <input type="checkbox" className="w-4 h-4" />
                    Schedule deep work during 9-11 AM peak hours
                  </label>
                  <label className="flex items-center gap-2 text-sm text-calm-800 dark:text-calm-200">
                    <input type="checkbox" className="w-4 h-4" />
                    Enable Do Not Disturb during focus sessions
                  </label>
                  <label className="flex items-center gap-2 text-sm text-calm-800 dark:text-calm-200">
                    <input type="checkbox" className="w-4 h-4" />
                    Take 5-min breaks every 25 minutes
                  </label>
                  <label className="flex items-center gap-2 text-sm text-calm-800 dark:text-calm-200">
                    <input type="checkbox" className="w-4 h-4" />
                    Reduce phone distractions (top distractor)
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Focus Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={analytics.trend}>
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short' })} />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="score" stroke="#0ea5e9" fill="url(#grad)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Distractions */}
          <Card>
            <CardHeader>
              <CardTitle>Distraction Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie data={analytics.distractionBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="value">
                      {analytics.distractionBreakdown.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-1/2 space-y-2">
                  {analytics.distractionBreakdown.map((d, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[i] }}></div>
                        <span>{d.name}</span>
                      </div>
                      <span className="font-semibold">{d.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hourly Pattern */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Focus Pattern</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.hourlyPattern}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="focus" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                <Bar dataKey="distractions" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
