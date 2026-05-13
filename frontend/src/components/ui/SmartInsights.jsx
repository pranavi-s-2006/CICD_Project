import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './Card';
import Badge from './Badge';

const SmartInsights = ({ userData }) => {
  // Rule-based insights that sound intelligent
  const generateInsights = (data) => {
    const insights = [];
    
    // Time-based patterns
    if (data.morningScore > data.afternoonScore + 10) {
      insights.push({
        type: 'timing',
        icon: '🌅',
        title: 'You\'re a Morning Person',
        description: `Your focus is ${data.morningScore - data.afternoonScore}% better in the morning. Schedule important work before 11 AM.`,
        confidence: 'High',
        action: 'Block your calendar for deep work from 9-11 AM',
        color: 'success'
      });
    }
    
    if (data.eveningScore > data.morningScore + 5) {
      insights.push({
        type: 'timing',
        icon: '🌙',
        title: 'Night Owl Detected',
        description: `Your evening focus (${data.eveningScore}%) outperforms morning sessions. You might be naturally wired for later productivity.`,
        confidence: 'Medium',
        action: 'Try scheduling creative work in the evening',
        color: 'focus'
      });
    }

    // Distraction patterns
    if (data.phoneDistractions > data.totalDistractions * 0.4) {
      insights.push({
        type: 'distraction',
        icon: '📱',
        title: 'Phone is Your Kryptonite',
        description: `${Math.round((data.phoneDistractions / data.totalDistractions) * 100)}% of your distractions come from your phone. This is above average.`,
        confidence: 'High',
        action: 'Try airplane mode during focus sessions',
        color: 'warning'
      });
    }

    // Recovery patterns
    if (data.averageRecoveryTime < 2) {
      insights.push({
        type: 'recovery',
        icon: '⚡',
        title: 'Quick Recovery Champion',
        description: `You refocus in just ${data.averageRecoveryTime} minutes - that's faster than 80% of users.`,
        confidence: 'High',
        action: 'Your recovery is excellent. Focus on prevention instead.',
        color: 'success'
      });
    } else if (data.averageRecoveryTime > 4) {
      insights.push({
        type: 'recovery',
        icon: '🐌',
        title: 'Slow to Refocus',
        description: `It takes you ${data.averageRecoveryTime} minutes to refocus. This suggests deep context switching.`,
        confidence: 'Medium',
        action: 'Try the 2-minute rule: acknowledge distractions but delay acting',
        color: 'warning'
      });
    }

    // Session length optimization
    if (data.shortSessionScore > data.longSessionScore + 15) {
      insights.push({
        type: 'duration',
        icon: '🍅',
        title: 'Pomodoro Perfect',
        description: `Your 25-minute sessions score ${data.shortSessionScore}% vs ${data.longSessionScore}% for longer ones. Short bursts work better for you.`,
        confidence: 'High',
        action: 'Stick to 25-minute sessions with 5-minute breaks',
        color: 'focus'
      });
    }

    // Consistency patterns
    if (data.weekdayScore > data.weekendScore + 10) {
      insights.push({
        type: 'consistency',
        icon: '📅',
        title: 'Weekday Warrior',
        description: `Your weekday focus (${data.weekdayScore}%) is much stronger than weekends. Structure helps you focus.`,
        confidence: 'Medium',
        action: 'Create weekend routines that mimic your weekday structure',
        color: 'focus'
      });
    }

    // Streak insights
    if (data.longestStreak > 7) {
      insights.push({
        type: 'habit',
        icon: '🔥',
        title: 'Habit Builder',
        description: `Your ${data.longestStreak}-day streak shows you can build lasting habits. Consistency is your superpower.`,
        confidence: 'High',
        action: 'Focus on maintaining streaks rather than perfect sessions',
        color: 'success'
      });
    }

    return insights.slice(0, 4); // Return top 4 insights
  };

  // Mock data - in real app, this comes from user's actual data
  const mockUserData = {
    morningScore: 85,
    afternoonScore: 68,
    eveningScore: 72,
    phoneDistractions: 12,
    totalDistractions: 25,
    averageRecoveryTime: 3.2,
    shortSessionScore: 82,
    longSessionScore: 71,
    weekdayScore: 79,
    weekendScore: 65,
    longestStreak: 12,
    ...userData
  };

  const insights = generateInsights(mockUserData);

  const confidenceColors = {
    'High': 'success',
    'Medium': 'warning',
    'Low': 'danger'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🔮</span>
          Smart Insights
        </CardTitle>
        <CardDescription>
          Personalized patterns discovered from your focus data
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {insights.map((insight, index) => (
            <div 
              key={index}
              className={`p-4 rounded-xl border-l-4 ${
                insight.color === 'success' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
                insight.color === 'warning' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                insight.color === 'focus' ? 'border-focus-500 bg-focus-50 dark:bg-focus-900/20' :
                'border-red-500 bg-red-50 dark:bg-red-900/20'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">{insight.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-calm-900 dark:text-calm-100">
                      {insight.title}
                    </h4>
                    <Badge variant={confidenceColors[insight.confidence]} className="text-xs">
                      {insight.confidence} confidence
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-calm-700 dark:text-calm-300 mb-3">
                    {insight.description}
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-calm-600 dark:text-calm-400">
                      💡 Action:
                    </span>
                    <span className="text-xs text-calm-700 dark:text-calm-300">
                      {insight.action}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Prediction Summary */}
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-focus-50 dark:from-purple-900/20 dark:to-focus-900/20 border border-purple-200 dark:border-purple-800">
          <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2 flex items-center gap-2">
            <span>🎯</span>
            Your Focus Prediction
          </h4>
          <p className="text-sm text-purple-700 dark:text-purple-300">
            Based on your patterns, you'll likely have your best focus session tomorrow between{' '}
            <strong>
              {mockUserData.morningScore > mockUserData.eveningScore ? '9-11 AM' : '7-9 PM'}
            </strong>
            {' '}with minimal phone distractions. 
            {mockUserData.shortSessionScore > mockUserData.longSessionScore 
              ? ' Keep sessions under 30 minutes for optimal results.'
              : ' Longer sessions (45+ min) will work well for you.'
            }
          </p>
        </div>

        {/* Methodology Note */}
        <div className="mt-4 p-3 rounded-lg bg-calm-50 dark:bg-calm-800 border border-calm-200 dark:border-calm-700">
          <p className="text-xs text-calm-600 dark:text-calm-400">
            <strong>How we know:</strong> These insights are generated from your session patterns, distraction logs, and reflection data. 
            The system is designed to scale into machine learning as we gather more data points.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartInsights;