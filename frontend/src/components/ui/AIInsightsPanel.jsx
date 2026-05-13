import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import Badge from './Badge';
import CircularProgress from './CircularProgress';

const AIInsightsPanel = ({ focusAI, isActive }) => {
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (focusAI) {
      const updatePredictions = () => {
        const newPredictions = focusAI.getPredictions();
        setPredictions(newPredictions);
        setLoading(false);
      };

      updatePredictions();
      
      // Update predictions every 5 minutes
      const interval = setInterval(updatePredictions, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [focusAI]);

  if (loading || !predictions) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-focus-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-calm-600">AI analyzing your patterns...</p>
        </CardContent>
      </Card>
    );
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'success';
    if (confidence >= 60) return 'warning';
    return 'danger';
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'focus';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Session Quality Prediction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎯 Session Quality Prediction
            <Badge variant={getConfidenceColor(predictions.sessionQuality?.confidence || 0)}>
              {predictions.sessionQuality?.confidence || 0}% confidence
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 mb-4">
            <CircularProgress 
              value={predictions.sessionQuality?.predictedScore || 75} 
              size={80}
              strokeWidth={8}
              className="flex-shrink-0"
            >
              <div className="text-center">
                <div className="text-xl font-bold text-calm-900 dark:text-calm-100">
                  {predictions.sessionQuality?.predictedScore || 75}
                </div>
                <div className="text-xs text-calm-500">Score</div>
              </div>
            </CircularProgress>
            
            <div className="flex-1">
              <h4 className="font-semibold text-calm-900 dark:text-calm-100 mb-2">
                Predicted Focus Quality
              </h4>
              <div className="space-y-1">
                {predictions.sessionQuality?.factors?.slice(0, 3).map((factor, index) => (
                  <div key={index} className="text-sm text-calm-600 dark:text-calm-400 flex items-start gap-2">
                    <span className="text-focus-500 mt-0.5">•</span>
                    {factor}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {predictions.sessionQuality?.recommendations && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                🤖 AI Recommendations:
              </h5>
              <div className="space-y-1">
                {predictions.sessionQuality.recommendations.map((rec, index) => (
                  <div key={index} className="text-sm text-blue-700 dark:text-blue-300">
                    • {rec}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Distraction Prediction */}
      {predictions.nextDistraction?.prediction && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ⚠️ Distraction Alert
              <Badge variant={getRiskColor(predictions.nextDistraction.riskLevel)}>
                {predictions.nextDistraction.riskLevel} risk
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-calm-900 dark:text-calm-100">
                    {predictions.nextDistraction.prediction}
                  </p>
                  <p className="text-sm text-calm-600 dark:text-calm-400">
                    {predictions.nextDistraction.reason}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-orange-600">
                    {predictions.nextDistraction.minutesUntil}m
                  </div>
                  <div className="text-xs text-calm-500">until risk</div>
                </div>
              </div>
              
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  💡 <strong>Tip:</strong> Consider scheduling a break or enabling Do Not Disturb mode around this time.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Optimal Session Length */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ⏱️ Optimal Session Length
            <Badge variant={getConfidenceColor(predictions.optimalSessionLength?.confidence || 0)}>
              {predictions.optimalSessionLength?.confidence || 0}% confidence
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-2xl font-bold text-focus-600">
                {predictions.optimalSessionLength?.duration || 25} minutes
              </div>
              <p className="text-sm text-calm-600 dark:text-calm-400">
                {predictions.optimalSessionLength?.reason}
              </p>
            </div>
            <div className="text-4xl">⏰</div>
          </div>
          
          {predictions.optimalSessionLength?.adjustment && (
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
              <p className="text-sm text-purple-700 dark:text-purple-300">
                🔧 <strong>Adjustment:</strong> {predictions.optimalSessionLength.adjustment}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Peak Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🌟 Your Peak Hours
            <Badge variant={getConfidenceColor(predictions.peakHours?.confidence || 0)}>
              {predictions.peakHours?.confidence || 0}% confidence
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {predictions.peakHours?.peakHours?.map((hour, index) => (
              <div key={index} className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-green-700 dark:text-green-300">
                  {hour}:00 - {hour + 1}:00
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">
                  Peak Focus
                </div>
              </div>
            ))}
          </div>
          
          <p className="text-sm text-calm-600 dark:text-calm-400 mb-3">
            {predictions.peakHours?.reason}
          </p>

          {predictions.peakHours?.details && (
            <div className="space-y-2">
              <h5 className="font-medium text-calm-900 dark:text-calm-100">Performance by Hour:</h5>
              {predictions.peakHours.details.slice(0, 4).map((detail, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-calm-600 dark:text-calm-400">
                    {detail.hour}:00
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-calm-200 dark:bg-calm-700 rounded-full h-2">
                      <div 
                        className="bg-focus-500 h-2 rounded-full" 
                        style={{ width: `${detail.score}%` }}
                      ></div>
                    </div>
                    <span className="text-calm-900 dark:text-calm-100 font-medium w-8">
                      {detail.score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Learning Status */}
      <Card>
        <CardHeader>
          <CardTitle>🧠 AI Learning Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-focus-600">
                {focusAI?.userPatterns?.focusScores?.length || 0}
              </div>
              <div className="text-sm text-calm-600">Sessions Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {focusAI?.userPatterns?.distractionTimes?.length || 0}
              </div>
              <div className="text-sm text-calm-600">Distractions Learned</div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-calm-50 dark:bg-calm-800 rounded-lg">
            <p className="text-sm text-calm-600 dark:text-calm-400">
              💡 The more you use FOCUSLOOM, the smarter the AI becomes at predicting your focus patterns and providing personalized recommendations.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIInsightsPanel;