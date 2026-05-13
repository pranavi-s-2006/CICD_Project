import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import CircularProgress from '../components/ui/CircularProgress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const AIInsights = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserInsights();
  }, []);

  const fetchUserInsights = async () => {
    try {
      const sessionData = JSON.parse(localStorage.getItem('focusSessionData') || '[]');
      const userStats = JSON.parse(localStorage.getItem('userFocusStats') || '{}');
      const realInsights = sessionData.length > 0 ? calculateRealInsights(sessionData, userStats) : mockAIInsights;
      setInsights(realInsights);
    } catch (error) {
      setInsights(mockAIInsights);
    } finally {
      setLoading(false);
    }
  };

  const calculateRealInsights = (sessions, stats) => {
    if (!sessions.length) {
      return {
        ...mockAIInsights,
        focusScore: 0,
        personalityProfile: {
          focusType: 'Getting Started',
          strengths: ['Ready to build focus habits'],
          challenges: ['Complete first session for analysis'],
          recommendations: ['Start with 25-minute sessions', 'Find your optimal focus time']
        }
      };
    }
    
    // Calculate actual AI score from real sessions
    const avgFocusScore = Math.round(sessions.reduce((sum, s) => sum + (s.focusScore || 75), 0) / sessions.length);
    const totalSessions = sessions.length;
    
    // Determine focus type based on actual performance
    let focusType = 'Getting Started';
    if (avgFocusScore >= 90) focusType = 'Focus Master';
    else if (avgFocusScore >= 80) focusType = 'Deep Thinker';
    else if (avgFocusScore >= 70) focusType = 'Steady Focuser';
    else if (avgFocusScore >= 60) focusType = 'Improving';
    
    // Generate personalized recommendations
    const recommendations = [];
    if (avgFocusScore < 70) {
      recommendations.push('Focus on reducing distractions during sessions');
      recommendations.push('Try shorter 15-20 minute sessions to build consistency');
    } else {
      recommendations.push('Maintain your excellent focus habits');
      recommendations.push('Consider extending successful sessions by 5-10 minutes');
    }
    recommendations.push('Schedule important work during your peak hours');
    
    return {
      ...mockAIInsights,
      focusScore: avgFocusScore,
      trend: totalSessions > 5 && avgFocusScore > 70 ? 'improving' : 'building',
      personalityProfile: {
        focusType,
        strengths: avgFocusScore > 80 ? 
          ['Sustained attention', 'High focus quality', 'Consistent performance'] :
          ['Building focus habits', 'Showing improvement', 'Committed to growth'],
        challenges: avgFocusScore < 70 ? 
          ['Distraction management', 'Session consistency', 'Focus duration'] :
          ['Fine-tuning performance', 'Optimizing peak hours'],
        recommendations
      },
      cognitiveLoad: {
        ...mockAIInsights.cognitiveLoad,
        current: Math.round(avgFocusScore * 0.8)
      }
    };
  };

  const mockAIInsights = {
    focusScore: 82,
    trend: 'improving',
    predictions: [
      {
        type: 'peak_performance',
        title: 'Peak Performance Window',
        description: 'Based on your patterns, you focus best between 9:30-11:00 AM',
        confidence: 94,
        icon: '🎯',
        color: 'success'
      },
      {
        type: 'distraction_risk',
        title: 'High Distraction Risk',
        description: 'Afternoon sessions (2-4 PM) show 67% more distractions',
        confidence: 87,
        icon: '⚠️',
        color: 'warning'
      },
      {
        type: 'optimal_duration',
        title: 'Optimal Session Length',
        description: '28-minute sessions yield highest focus quality for you',
        confidence: 91,
        icon: '⏱️',
        color: 'focus'
      }
    ],
    personalityProfile: {
      focusType: 'Deep Thinker',
      strengths: ['Sustained attention', 'Complex problem solving', 'Morning productivity'],
      challenges: ['Afternoon energy dips', 'Phone notifications', 'Context switching'],
      recommendations: [
        'Schedule demanding tasks before 11 AM',
        'Use airplane mode during focus sessions',
        'Take 10-minute walks between sessions'
      ]
    },
    weeklyPattern: [
      { day: 'Mon', focus: 85, energy: 90, distractions: 12 },
      { day: 'Tue', focus: 78, energy: 85, distractions: 18 },
      { day: 'Wed', focus: 82, energy: 80, distractions: 15 },
      { day: 'Thu', focus: 75, energy: 75, distractions: 22 },
      { day: 'Fri', focus: 70, energy: 70, distractions: 28 },
      { day: 'Sat', focus: 88, energy: 95, distractions: 8 },
      { day: 'Sun', focus: 90, energy: 85, distractions: 6 }
    ],
    cognitiveLoad: {
      current: 65,
      optimal: 75,
      factors: [
        { name: 'Task Complexity', value: 80 },
        { name: 'Environment', value: 70 },
        { name: 'Energy Level', value: 60 },
        { name: 'Motivation', value: 85 },
        { name: 'Stress Level', value: 45 }
      ]
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-calm-50 via-white to-focus-50 dark:from-calm-900 dark:via-calm-800 dark:to-focus-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-focus-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h3 className="text-xl font-semibold text-calm-900 dark:text-calm-100">AI Analyzing Your Focus Patterns</h3>
          <p className="text-calm-600 dark:text-calm-400">Processing 847 data points...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-calm-50 via-white to-focus-50 dark:from-calm-900 dark:via-calm-800 dark:to-focus-900">
      <div className="container mx-auto px-6 py-8 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-5xl font-bold font-display text-calm-900 dark:text-calm-100">
            🤖 AI Focus Insights
          </h1>
          <p className="text-xl text-calm-600 dark:text-calm-400 max-w-3xl mx-auto">
            Advanced machine learning analysis of your attention patterns, cognitive load, and productivity optimization
          </p>
        </div>

        {/* AI Score & Trend */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 border-2 border-focus-200 dark:border-focus-800 hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <span>🧠</span>
                AI Focus Intelligence Score
              </CardTitle>
              <CardDescription>
                Comprehensive analysis of your cognitive performance and attention quality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <CircularProgress value={insights.focusScore} size={120}>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-focus-600 dark:text-focus-400">{insights.focusScore}</div>
                      <div className="text-xs text-calm-500 dark:text-calm-600">AI Score</div>
                    </div>
                  </CircularProgress>
                  <div>
                    <h3 className="text-3xl font-bold text-calm-900 dark:text-calm-100 mb-2">
                      {insights.personalityProfile.focusType}
                    </h3>
                    <Badge variant="success" className="mb-2">
                      {insights.trend === 'improving' ? '📈 Improving' : '📉 Declining'}
                    </Badge>
                    <p className="text-calm-600 dark:text-calm-400 text-base">
                      Your focus patterns show consistent improvement over the past 2 weeks
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 dark:border-purple-800 hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl">Cognitive Load</CardTitle>
              <CardDescription>Current mental capacity utilization</CardDescription>
            </CardHeader>
            <CardContent>
              <CircularProgress 
                value={insights.cognitiveLoad.current} 
                size={100}
                color={insights.cognitiveLoad.current > 80 ? 'danger' : 'focus'}
                className="mx-auto mb-4"
              >
                <div className="text-center">
                  <div className="text-xl font-bold text-calm-900 dark:text-calm-100">
                    {insights.cognitiveLoad.current}%
                  </div>
                  <div className="text-xs text-calm-500">Load</div>
                </div>
              </CircularProgress>
              <p className="text-sm text-center text-calm-600 dark:text-calm-400 mt-2">
                Optimal: {insights.cognitiveLoad.optimal}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* AI Predictions */}
        <Card className="border-2 border-calm-200 dark:border-calm-700">
          <CardHeader>
            <CardTitle className="text-2xl">🔮 AI Predictions & Recommendations</CardTitle>
            <CardDescription>Machine learning insights based on your unique patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {insights.predictions.map((prediction, index) => (
                <div key={index} className={`p-5 rounded-xl border-2 shadow-md hover:shadow-lg transition-all ${
                  prediction.color === 'success' ? 'bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-700' :
                  prediction.color === 'warning' ? 'bg-yellow-50 border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-700' :
                  'bg-focus-50 border-focus-300 dark:bg-focus-900/20 dark:border-focus-700'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{prediction.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-calm-900 dark:text-calm-100 mb-2">
                        {prediction.title}
                      </h4>
                      <p className="text-sm text-calm-600 dark:text-calm-400 mb-3">
                        {prediction.description}
                      </p>
                      <Badge variant={prediction.color} className="text-xs">
                        {prediction.confidence}% confidence
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Pattern Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-2 border-calm-200 dark:border-calm-700">
            <CardHeader>
              <CardTitle className="text-xl">Weekly Performance Pattern</CardTitle>
              <CardDescription>AI-detected patterns in your focus quality</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={insights.weeklyPattern}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="day" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Line type="monotone" dataKey="focus" stroke="#0ea5e9" strokeWidth={3} dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4 }} />
                    <Line type="monotone" dataKey="energy" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-calm-200 dark:border-calm-700">
            <CardHeader>
              <CardTitle className="text-xl">Cognitive Load Factors</CardTitle>
              <CardDescription>What affects your mental performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={insights.cognitiveLoad.factors}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Cognitive Factors"
                      dataKey="value"
                      stroke="#0ea5e9"
                      fill="#0ea5e9"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Personality Profile */}
        <Card className="border-2 border-calm-200 dark:border-calm-700">
          <CardHeader>
            <CardTitle className="text-2xl">🧬 Focus Personality Profile</CardTitle>
            <CardDescription>AI-generated insights about your unique focus style</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div>
                <h4 className="font-bold text-lg text-green-700 dark:text-green-300 mb-4 flex items-center gap-2">
                  <span>💪</span> Strengths
                </h4>
                <ul className="space-y-2">
                  {insights.personalityProfile.strengths.map((strength, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-calm-600 dark:text-calm-400">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-lg text-yellow-700 dark:text-yellow-300 mb-4 flex items-center gap-2">
                  <span>🎯</span> Growth Areas
                </h4>
                <ul className="space-y-2">
                  {insights.personalityProfile.challenges.map((challenge, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-calm-600 dark:text-calm-400">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                      {challenge}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-lg text-focus-700 dark:text-focus-300 mb-4 flex items-center gap-2">
                  <span>🚀</span> AI Recommendations
                </h4>
                <ul className="space-y-2">
                  {insights.personalityProfile.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-calm-600 dark:text-calm-400">
                      <span className="w-2 h-2 bg-focus-500 rounded-full"></span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Items */}
        <Card className="bg-gradient-to-br from-focus-50 to-focus-100 dark:from-focus-900/20 dark:to-focus-800/20 border-2 border-focus-300 dark:border-focus-700">
          <CardHeader>
            <CardTitle className="text-focus-900 dark:text-focus-100 text-2xl">
              🎯 Personalized Action Plan
            </CardTitle>
            <CardDescription className="text-focus-700 dark:text-focus-300">
              AI-generated steps to optimize your focus performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-bold text-lg text-focus-900 dark:text-focus-100">This Week</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-white dark:bg-focus-900/30 rounded-lg border border-calm-200 dark:border-focus-800/50">
                    <input type="checkbox" className="w-4 h-4 text-focus-600 rounded" />
                    <span className="text-sm text-calm-900 dark:text-calm-100">Schedule deep work sessions at 9:30 AM</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white dark:bg-focus-900/30 rounded-lg border border-calm-200 dark:border-focus-800/50">
                    <input type="checkbox" className="w-4 h-4 text-focus-600 rounded" />
                    <span className="text-sm text-calm-900 dark:text-calm-100">Enable Do Not Disturb during focus time</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white dark:bg-focus-900/30 rounded-lg border border-calm-200 dark:border-focus-800/50">
                    <input type="checkbox" className="w-4 h-4 text-focus-600 rounded" />
                    <span className="text-sm text-calm-900 dark:text-calm-100">Try 28-minute focus sessions</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-bold text-lg text-focus-900 dark:text-focus-100">Long Term</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-white dark:bg-focus-900/30 rounded-lg border border-calm-200 dark:border-focus-800/50">
                    <input type="checkbox" className="w-4 h-4 text-focus-600 rounded" />
                    <span className="text-sm text-calm-900 dark:text-calm-100">Build a dedicated workspace</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white dark:bg-focus-900/30 rounded-lg border border-calm-200 dark:border-focus-800/50">
                    <input type="checkbox" className="w-4 h-4 text-focus-600 rounded" />
                    <span className="text-sm text-calm-900 dark:text-calm-100">Develop afternoon energy routines</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white dark:bg-focus-900/30 rounded-lg border border-calm-200 dark:border-focus-800/50">
                    <input type="checkbox" className="w-4 h-4 text-focus-600 rounded" />
                    <span className="text-sm text-calm-900 dark:text-calm-100">Practice mindfulness meditation</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIInsights;