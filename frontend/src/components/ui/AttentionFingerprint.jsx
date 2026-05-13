import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './Card';
import Badge from './Badge';

const AttentionFingerprint = ({ data }) => {
  const {
    topDistraction = { reason: 'Phone notifications', percentage: 34 },
    bestFocusTime = { period: 'Morning (9-11 AM)', score: 87 },
    averageFocusScore = 78,
    recoveryTime = 3.2,
    focusPattern = 'Deep Thinker',
    totalSessions = 47
  } = data || {};

  // Generate unique visual pattern based on user data
  const generatePattern = () => {
    const patterns = [];
    const baseSize = averageFocusScore / 10;
    
    for (let i = 0; i < 6; i++) {
      const size = baseSize + (i * 2);
      const opacity = (averageFocusScore - i * 10) / 100;
      patterns.push({
        size,
        opacity: Math.max(0.2, opacity),
        color: i < 2 ? '#0ea5e9' : i < 4 ? '#8b5cf6' : '#10b981'
      });
    }
    return patterns;
  };

  const patterns = generatePattern();

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-focus-50 to-purple-50 dark:from-focus-900/20 dark:to-purple-900/20 border-focus-200 dark:border-focus-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-focus-900 dark:text-focus-100">
          <span>🧬</span>
          Your Attention Fingerprint
        </CardTitle>
        <CardDescription className="text-focus-700 dark:text-focus-300">
          The unique DNA of your focus patterns - based on {totalSessions} sessions
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Visual Fingerprint */}
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48 mb-4">
              {/* Background circles */}
              <div className="absolute inset-0 rounded-full border-2 border-focus-200 dark:border-focus-700 opacity-20"></div>
              <div className="absolute inset-4 rounded-full border border-focus-300 dark:border-focus-600 opacity-30"></div>
              
              {/* Dynamic pattern based on user data */}
              {patterns.map((pattern, index) => (
                <div
                  key={index}
                  className="absolute rounded-full animate-pulse-soft"
                  style={{
                    width: `${pattern.size}px`,
                    height: `${pattern.size}px`,
                    backgroundColor: pattern.color,
                    opacity: pattern.opacity,
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, -50%) rotate(${index * 60}deg) translateY(-${20 + index * 8}px)`,
                    animationDelay: `${index * 0.2}s`
                  }}
                />
              ))}
              
              {/* Center core */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-focus-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {averageFocusScore}
              </div>
            </div>
            
            <Badge variant="focus" className="text-sm font-semibold">
              {focusPattern} Pattern
            </Badge>
          </div>

          {/* Fingerprint Insights */}
          <div className="space-y-6">
            
            {/* Top Distraction */}
            <div className="p-4 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20 dark:border-gray-700/30">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Primary Distraction</h4>
              </div>
              <div className="text-2xl font-bold text-red-600 mb-1">{topDistraction.reason}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {topDistraction.percentage}% of all distractions
              </div>
            </div>

            {/* Best Focus Time */}
            <div className="p-4 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20 dark:border-gray-700/30">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Peak Performance</h4>
              </div>
              <div className="text-2xl font-bold text-green-600 mb-1">{bestFocusTime.period}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Average {bestFocusTime.score}% focus score
              </div>
            </div>

            {/* Recovery Metric */}
            <div className="p-4 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20 dark:border-gray-700/30">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Recovery Speed</h4>
              </div>
              <div className="text-2xl font-bold text-purple-600 mb-1">{recoveryTime} min</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Average time to refocus after distraction
              </div>
            </div>
          </div>
        </div>

        {/* Fingerprint Summary */}
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-focus-100 to-purple-100 dark:from-focus-900/30 dark:to-purple-900/30 border border-focus-200 dark:border-focus-700">
          <h4 className="font-semibold text-focus-900 dark:text-focus-100 mb-2">
            🔍 Your Attention DNA Summary
          </h4>
          <p className="text-sm text-focus-700 dark:text-focus-300 leading-relaxed">
            You're a <strong>{focusPattern}</strong> with strongest focus during <strong>{bestFocusTime.period.toLowerCase()}</strong>. 
            Your main challenge is <strong>{topDistraction.reason.toLowerCase()}</strong>, but you recover quickly in just <strong>{recoveryTime} minutes</strong>. 
            With an average focus score of <strong>{averageFocusScore}%</strong>, you're building strong attention habits.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttentionFingerprint;