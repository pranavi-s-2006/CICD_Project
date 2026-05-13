import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import AttentionFingerprint from '../components/ui/AttentionFingerprint';
import SmartInsights from '../components/ui/SmartInsights';
import ReflectionModal from '../components/ui/ReflectionModal';
import ModernFocusTimer from '../components/ModernFocusTimer';
import { analyticsAPI } from '../services/api';

const EnhancedDashboard = () => {
  const navigate = useNavigate();
  const [showReflection, setShowReflection] = useState(false);
  const [lastSession, setLastSession] = useState(null);
  const [userInsights, setUserInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // In real app, fetch from API
      // const response = await analyticsAPI.getDashboardInsights();
      
      // Mock data for demo
      setUserInsights({
        totalSessions: 47,
        averageFocusScore: 78,
        topDistraction: { reason: 'Phone notifications', percentage: 34 },
        bestFocusTime: { period: 'Morning (9-11 AM)', score: 87 },
        recoveryTime: 3.2,
        focusPattern: 'Deep Thinker',
        morningScore: 85,
        afternoonScore: 68,
        eveningScore: 72,
        phoneDistractions: 12,
        totalDistractions: 25,
        shortSessionScore: 82,
        longSessionScore: 71,
        weekdayScore: 79,
        weekendScore: 65,
        longestStreak: 12
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch insights:', error);
      setLoading(false);
    }
  };

  const handleSessionComplete = (sessionData) => {
    setLastSession(sessionData);
    setShowReflection(true);
  };

  const handleReflectionSubmit = (reflection) => {
    console.log('Reflection submitted:', reflection);
    // In real app: save to database and update insights
    // updateUserInsights(reflection);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-calm-50 via-white to-focus-50 dark:from-calm-900 dark:via-calm-800 dark:to-focus-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-focus-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-calm-600 dark:text-calm-400 font-medium">Building your attention profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-calm-50 via-white to-focus-50 dark:from-calm-900 dark:via-calm-800 dark:to-focus-900">
      <div className="container mx-auto px-6 py-8 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold font-display text-gradient">
            Welcome back, Focus Champion! 🎯
          </h1>
          <p className="text-lg text-calm-600 dark:text-calm-400 max-w-2xl mx-auto">
            FOCUSLOOM doesn't try to control your attention. It helps you understand it.
          </p>
        </div>

        {/* Attention Fingerprint - The Star Feature */}
        <AttentionFingerprint data={userInsights} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Focus Timer */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>🎯</span>
                  Start Your Focus Journey
                </CardTitle>
                <CardDescription>
                  Every session helps us understand your attention patterns better
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ModernFocusTimer onSessionComplete={handleSessionComplete} />
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📊 Today's Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-calm-600 dark:text-calm-400">Sessions</span>
                  <span className="font-bold text-2xl text-focus-600">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-calm-600 dark:text-calm-400">Focus Time</span>
                  <span className="font-bold text-2xl text-green-600">1h 15m</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-calm-600 dark:text-calm-400">Avg Score</span>
                  <span className="font-bold text-2xl text-purple-600">82%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-calm-600 dark:text-calm-400">Streak</span>
                  <span className="font-bold text-2xl text-red-500">12 🔥</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Insight */}
            <Card className="bg-gradient-to-br from-focus-50 to-purple-50 dark:from-focus-900/20 dark:to-purple-900/20 border-focus-200 dark:border-focus-800">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-3">💡</div>
                <h3 className="font-semibold text-focus-900 dark:text-focus-100 mb-2">
                  Today's Insight
                </h3>
                <p className="text-sm text-focus-700 dark:text-focus-300">
                  Your morning sessions are 17% more focused than afternoon ones. 
                  Consider scheduling important work before 11 AM.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Smart Insights */}
        <SmartInsights userData={userInsights} />

        {/* Secure Test Platform Promotion */}
        <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-800">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-4xl">🔒</div>
                  <div>
                    <h3 className="text-2xl font-bold text-red-900 dark:text-red-100">
                      Secure Test Platform
                    </h3>
                    <p className="text-red-700 dark:text-red-300">
                      Take tests from HackerRank, LeetCode, SkillRack in lockdown mode
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-xs font-medium text-red-700 dark:text-red-300">
                    ✅ Screenshot Blocking
                  </span>
                  <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-xs font-medium text-red-700 dark:text-red-300">
                    ✅ Tab Switch Detection
                  </span>
                  <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-xs font-medium text-red-700 dark:text-red-300">
                    ✅ Violation Tracking
                  </span>
                  <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-xs font-medium text-red-700 dark:text-red-300">
                    ✅ Fullscreen Lockdown
                  </span>
                </div>
                <Button 
                  onClick={() => navigate('/secure-test')} 
                  className="bg-red-600 hover:bg-red-700 text-white"
                  size="lg"
                >
                  🚀 Start Secure Test
                </Button>
              </div>
              <div className="hidden lg:block text-8xl opacity-20">
                🔒
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Reflections */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🤔</span>
              Your Recent Reflections
            </CardTitle>
            <CardDescription>
              Self-awareness insights from your session reflections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { date: 'Today', reason: 'Phone notifications', recovery: '2 min', quality: 4 },
                { date: 'Yesterday', reason: 'Mind wandering', recovery: '4 min', quality: 3 },
                { date: '2 days ago', reason: 'Environmental noise', recovery: '3 min', quality: 4 }
              ].map((reflection, index) => (
                <div key={index} className="p-4 rounded-xl bg-calm-50 dark:bg-calm-800 border border-calm-200 dark:border-calm-700">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-calm-500">{reflection.date}</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-xs">
                          {i < reflection.quality ? '⭐' : '☆'}
                        </span>
                      ))}
                    </div>
                  </div>
                  <h4 className="font-medium text-calm-900 dark:text-calm-100 mb-1">
                    {reflection.reason}
                  </h4>
                  <p className="text-xs text-calm-600 dark:text-calm-400">
                    Recovery: {reflection.recovery}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Focus Recovery Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>⚡</span>
                Focus Recovery Analysis
              </CardTitle>
              <CardDescription>
                How quickly you bounce back from distractions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <div>
                    <div className="font-semibold text-green-900 dark:text-green-100">Average Recovery</div>
                    <div className="text-sm text-green-700 dark:text-green-300">Time to refocus</div>
                  </div>
                  <div className="text-2xl font-bold text-green-600">3.2 min</div>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <div>
                    <div className="font-semibold text-blue-900 dark:text-blue-100">Best Recovery</div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">Your fastest bounce-back</div>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">1.5 min</div>
                </div>
                
                <div className="p-3 rounded-lg bg-calm-50 dark:bg-calm-800">
                  <p className="text-sm text-calm-600 dark:text-calm-400">
                    <strong>💡 Insight:</strong> You recover 40% faster than average users. 
                    Your brain is good at context switching - focus on preventing distractions instead.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🎯</span>
                Focus Quality Trends
              </CardTitle>
              <CardDescription>
                Your attention patterns over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-calm-600 dark:text-calm-400">This Week</span>
                  <span className="font-bold text-green-600">↗ +12%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-calm-600 dark:text-calm-400">This Month</span>
                  <span className="font-bold text-green-600">↗ +8%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-calm-600 dark:text-calm-400">Best Streak</span>
                  <span className="font-bold text-purple-600">12 days 🔥</span>
                </div>
                
                <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    <strong>🚀 Prediction:</strong> Based on your patterns, you're likely to have 
                    an excellent focus session tomorrow morning around 9:30 AM.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="text-center bg-gradient-to-r from-focus-500 to-purple-600 text-white">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4">Ready to Understand Your Attention Better?</h2>
            <p className="mb-6 opacity-90">
              Start a focus session and discover new insights about your unique attention patterns.
            </p>
            <Button variant="secondary" size="lg" onClick={() => navigate('/real-time-session')}>
              <span className="mr-2">🚀</span>
              Start Focus Session
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Reflection Modal */}
      <ReflectionModal
        isOpen={showReflection}
        onClose={() => setShowReflection(false)}
        onSubmit={handleReflectionSubmit}
        sessionData={lastSession}
      />
    </div>
  );
};

export default EnhancedDashboard;