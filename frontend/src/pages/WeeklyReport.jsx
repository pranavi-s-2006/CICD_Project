import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import CircularProgress from '../components/ui/CircularProgress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const WeeklyReport = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeeks, setSelectedWeeks] = useState(1);

  useEffect(() => {
    fetchWeeklyReport();
  }, [selectedWeeks]);

  const fetchWeeklyReport = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/biometric/weekly-report?weeks=${selectedWeeks}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      }
    } catch (error) {
      console.error('Failed to fetch weekly report:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-calm-50 via-white to-focus-50 dark:from-calm-900 dark:via-calm-800 dark:to-focus-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-focus-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-calm-600 dark:text-calm-400 font-medium">Analyzing your focus journey...</p>
        </div>
      </div>
    );
  }

  if (!reportData || reportData.analytics.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-calm-50 via-white to-focus-50 dark:from-calm-900 dark:via-calm-800 dark:to-focus-900">
        <div className="container mx-auto px-6 py-8">
          <Card className="text-center">
            <CardContent className="p-12">
              <div className="text-6xl mb-4">📊</div>
              <h2 className="text-2xl font-bold text-calm-900 dark:text-calm-100 mb-4">
                No Data Yet
              </h2>
              <p className="text-calm-600 dark:text-calm-400 mb-6">
                Complete some focus sessions to see your personalized weekly report with insights and recommendations.
              </p>
              <Button onClick={() => window.location.href = '/real-time'}>
                Start Your First Session
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { analytics, insights, period } = reportData;

  // Calculate summary stats
  const totalDataPoints = analytics.reduce((sum, d) => sum + d.dataPoints, 0);
  const avgFocusScore = analytics.reduce((sum, d) => sum + d.avgFocusScore, 0) / analytics.length;
  const totalDistractions = analytics.reduce((sum, d) => sum + d.totalTabSwitches + d.totalPhoneDistractions + d.totalEmailDistractions, 0);
  const avgHeartRate = analytics.reduce((sum, d) => sum + d.avgHeartRate, 0) / analytics.length;

  // Prepare chart data
  const dailyData = analytics.map(d => ({
    day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d._id.day - 1],
    hour: d._id.hour,
    focusScore: Math.round(d.avgFocusScore),
    distractions: d.totalTabSwitches + d.totalPhoneDistractions + d.totalEmailDistractions,
    heartRate: Math.round(d.avgHeartRate),
    eyeStrain: Math.round(d.avgEyeStrain)
  }));

  const getInsightIcon = (type) => {
    switch (type) {
      case 'success': return '🎉';
      case 'warning': return '⚠️';
      case 'alert': return '🚨';
      case 'health': return '❤️';
      case 'tip': return '💡';
      default: return 'ℹ️';
    }
  };

  const getInsightColor = (type) => {
    switch (type) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'alert': return 'danger';
      case 'health': return 'purple';
      case 'tip': return 'focus';
      default: return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-calm-50 via-white to-focus-50 dark:from-calm-900 dark:via-calm-800 dark:to-focus-900">
      <div className="container mx-auto px-6 py-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold font-display text-gradient">
              📊 Your Focus Journey
            </h1>
            <p className="text-lg text-calm-600 dark:text-calm-400 mt-2">
              {selectedWeeks === 1 ? 'This Week' : `Past ${selectedWeeks} Weeks`} • {totalDataPoints} data points analyzed
            </p>
          </div>
          
          <div className="flex gap-2">
            {[1, 2, 4].map(weeks => (
              <button
                key={weeks}
                onClick={() => setSelectedWeeks(weeks)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedWeeks === weeks
                    ? 'bg-focus-500 text-white shadow-lg'
                    : 'bg-calm-100 dark:bg-calm-800 text-calm-600 dark:text-calm-400 hover:bg-calm-200 dark:hover:bg-calm-700'
                }`}
              >
                {weeks === 1 ? 'This Week' : `${weeks} Weeks`}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <CircularProgress value={avgFocusScore} size={80} className="mx-auto mb-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-focus-600">{Math.round(avgFocusScore)}</div>
                  <div className="text-xs text-calm-500">Score</div>
                </div>
              </CircularProgress>
              <h3 className="font-semibold text-calm-900 dark:text-calm-100">Average Focus</h3>
              <p className="text-sm text-calm-600 dark:text-calm-400">
                {avgFocusScore >= 80 ? 'Excellent!' : avgFocusScore >= 60 ? 'Good progress' : 'Room to improve'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-red-500 mb-2">{totalDistractions}</div>
              <h3 className="font-semibold text-calm-900 dark:text-calm-100">Total Distractions</h3>
              <p className="text-sm text-calm-600 dark:text-calm-400">
                {totalDistractions < 20 ? 'Great control!' : totalDistractions < 50 ? 'Moderate' : 'High activity'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-500 mb-2">{Math.round(avgHeartRate)}</div>
              <h3 className="font-semibold text-calm-900 dark:text-calm-100">Avg Heart Rate</h3>
              <p className="text-sm text-calm-600 dark:text-calm-400">
                {avgHeartRate < 70 ? 'Very calm' : avgHeartRate < 85 ? 'Normal' : 'Elevated'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-500 mb-2">{Math.round(totalDataPoints / 60)}h</div>
              <h3 className="font-semibold text-calm-900 dark:text-calm-100">Focus Time</h3>
              <p className="text-sm text-calm-600 dark:text-calm-400">
                Total monitored time
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Personalized Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🎯</span>
              Your Personalized Insights
            </CardTitle>
            <CardDescription>
              AI-powered analysis of your focus patterns and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {insights.map((insight, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-xl border-l-4 ${
                    insight.type === 'success' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
                    insight.type === 'warning' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                    insight.type === 'alert' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                    insight.type === 'health' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' :
                    'border-focus-500 bg-focus-50 dark:bg-focus-900/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{getInsightIcon(insight.type)}</div>
                    <div className="flex-1">
                      <Badge variant={getInsightColor(insight.type)} className="mb-2">
                        {insight.priority.toUpperCase()} PRIORITY
                      </Badge>
                      <p className="font-medium text-calm-900 dark:text-calm-100 mb-2">
                        {insight.message}
                      </p>
                      {insight.recommendation && (
                        <p className="text-sm text-calm-600 dark:text-calm-400">
                          💡 <strong>Recommendation:</strong> {insight.recommendation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Focus Score Trends</CardTitle>
              <CardDescription>Your focus quality over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="day" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip />
                    <Line type="monotone" dataKey="focusScore" stroke="#0ea5e9" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distraction Patterns</CardTitle>
              <CardDescription>When distractions occur most</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="hour" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip />
                    <Bar dataKey="distractions" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Motivational Section */}
        <Card className="bg-gradient-to-r from-focus-500 to-purple-600 text-white">
          <CardContent className="p-8 text-center">
            <div className="text-4xl mb-4">🚀</div>
            <h2 className="text-2xl font-bold mb-4">Keep Building Your Focus Muscle!</h2>
            <p className="text-lg opacity-90 mb-6">
              {avgFocusScore >= 80 
                ? "You're doing amazing! Your focus skills are getting stronger every day."
                : avgFocusScore >= 60
                ? "Great progress! You're building solid focus habits. Keep it up!"
                : "Every expert was once a beginner. Your focus journey is just getting started!"
              }
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="secondary" onClick={() => window.location.href = '/real-time'}>
                Start New Session
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-focus-600">
                Share Progress
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WeeklyReport;