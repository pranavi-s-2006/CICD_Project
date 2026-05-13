import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import CircularProgress from '../components/ui/CircularProgress';
import DistractionAlertPanel from '../components/ui/DistractionAlertPanel';
import VoiceControls from '../components/ui/VoiceControls';
import EducationalChatbot from '../components/chat/EducationalChatbot';
import BiometricCollector from '../utils/BiometricCollector';
import DistractionAlertSystem from '../utils/DistractionAlertSystem';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, AreaChart, Area } from 'recharts';

const RealTimeSession = () => {
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(0);
  const [sessionData, setSessionData] = useState([]);
  const [currentFocusScore, setCurrentFocusScore] = useState(100);
  const [distractions, setDistractions] = useState([]);
  const [biometrics, setBiometrics] = useState({
    heartRate: 72,
    ambientNoise: 35,
    eyeStrain: 20,
    notifications: 0
  });
  const intervalRef = useRef();
  const biometricCollector = useRef(new BiometricCollector());
  const alertSystem = useRef(new DistractionAlertSystem());

  // Real-time data collection
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTime(prev => prev + 1);
        
        // Get real biometric readings
        const readings = biometricCollector.current.getCurrentReadings();
        
        setBiometrics({
          heartRate: readings.heartRate,
          heartRateConfidence: readings.heartRateConfidence,
          ambientNoise: readings.ambientNoise,
          noiseConfidence: readings.noiseConfidence,
          eyeStrain: readings.eyeStrain,
          eyeStrainConfidence: readings.eyeStrainConfidence,
          notifications: readings.notificationDistractions
        });
        
        setCurrentFocusScore(readings.focusScore);

        // Add data point for charts
        setSessionData(prev => {
          const newData = [...prev, {
            time: prev.length,
            focus: readings.focusScore,
            heartRate: readings.heartRate,
            noise: readings.ambientNoise
          }];
          return newData.slice(-50); // Keep last 50 points
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive]);

  const startSession = async () => {
    setIsActive(true);
    setTime(0);
    setSessionData([]);
    setDistractions([]);
    setCurrentFocusScore(100);
    
    // Start real biometric monitoring
    await biometricCollector.current.startMonitoring();
    
    // Start distraction alert system with proper initialization
    await alertSystem.current.initializeNotifications();
    await alertSystem.current.startMonitoring();
    
    console.log('🔴 Real biometric monitoring started');
    console.log('🚨 Distraction alerts active');
  };

  const endSession = () => {
    setIsActive(false);
    clearInterval(intervalRef.current);
    
    // Save session data to localStorage for AI insights
    const sessionData = {
      startTime: Date.now() - (time * 1000),
      endTime: Date.now(),
      duration: time * 1000,
      focusScore: currentFocusScore,
      distractions: distractions,
      biometrics: biometrics
    };
    
    const existingSessions = JSON.parse(localStorage.getItem('focusSessionData') || '[]');
    existingSessions.push(sessionData);
    localStorage.setItem('focusSessionData', JSON.stringify(existingSessions));
    
    // Stop biometric monitoring
    biometricCollector.current.stopMonitoring();
    
    // Stop distraction alerts
    alertSystem.current.stopMonitoring();
    
    console.log('⏹️ Biometric monitoring stopped');
    console.log('🚨 Distraction alerts stopped');
    console.log('💾 Session data saved for AI analysis');
  };

  const handleVoiceCommand = (action, transcript) => {
    switch (action) {
      case 'start':
        if (!isActive) {
          startSession();
        }
        break;
      case 'stop':
        if (isActive) {
          endSession();
        }
        break;
      case 'status':
        alert(`Focus Score: ${currentFocusScore}%, Session Time: ${formatTime(time)}`);
        break;
      case 'break':
        if (isActive) {
          alert('Break time! Session paused.');
        }
        break;
      case 'distraction':
        if (isActive) {
          logDistraction('Voice', 'medium');
        }
        break;
    }
  };

  const logDistraction = (type, severity = 'medium') => {
    const distraction = {
      id: Date.now(),
      type,
      severity,
      timestamp: time,
      impact: severity === 'high' ? 15 : severity === 'medium' ? 10 : 5
    };
    
    setDistractions(prev => [...prev, distraction]);
    setCurrentFocusScore(prev => Math.max(40, prev - distraction.impact));
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hrs > 0 
      ? `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  const getBiometricStatus = (value, type) => {
    if (type === 'heartRate') {
      if (value < 70) return { status: 'Relaxed', color: 'success' };
      if (value < 85) return { status: 'Normal', color: 'focus' };
      return { status: 'Elevated', color: 'warning' };
    }
    if (type === 'noise') {
      if (value < 40) return { status: 'Quiet', color: 'success' };
      if (value < 60) return { status: 'Moderate', color: 'warning' };
      return { status: 'Noisy', color: 'danger' };
    }
    if (type === 'eyeStrain') {
      if (value < 30) return { status: 'Low', color: 'success' };
      if (value < 60) return { status: 'Moderate', color: 'warning' };
      return { status: 'High', color: 'danger' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-calm-50 via-white to-focus-50 dark:from-calm-900 dark:via-calm-800 dark:to-focus-900">
      <div className="container mx-auto px-6 py-8 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold font-display text-gradient">
            ⚡ Real-Time Focus Session
          </h1>
          <p className="text-lg text-calm-600 dark:text-calm-400 max-w-2xl mx-auto">
            Advanced biometric monitoring and real-time focus analysis with AI-powered insights
          </p>
        </div>

        {/* Main Session Display */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Timer & Controls */}
          <Card className="lg:col-span-2">
            <CardContent className="p-8 text-center">
              <div className="mb-8">
                <CircularProgress 
                  value={isActive ? (currentFocusScore) : 0} 
                  size={200}
                  strokeWidth={12}
                  color={getScoreColor(currentFocusScore)}
                  className="mx-auto mb-6"
                >
                  <div className="text-center">
                    <div className="text-4xl font-bold font-display text-calm-900 dark:text-calm-100 mb-1">
                      {formatTime(time)}
                    </div>
                    <div className="text-sm text-calm-500">
                      {isActive ? `${currentFocusScore}% Focus` : 'Ready to Focus'}
                    </div>
                  </div>
                </CircularProgress>
                
                {isActive && (
                  <div className="flex items-center justify-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-calm-600 dark:text-calm-400">Live Monitoring</span>
                    </div>
                    <Badge variant={getScoreColor(currentFocusScore)}>
                      {currentFocusScore >= 80 ? 'Deep Focus' : currentFocusScore >= 60 ? 'Focused' : 'Distracted'}
                    </Badge>
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-4 mb-8">
                {!isActive ? (
                  <Button onClick={startSession} size="lg" className="px-8">
                    <span className="mr-2">🚀</span>
                    Start Real-Time Session
                  </Button>
                ) : (
                  <div className="flex gap-4">
                    <Button onClick={endSession} variant="destructive" size="lg" className="px-8">
                      <span className="mr-2">⏹️</span>
                      End Session
                    </Button>
                    <Button 
                      onClick={() => alertSystem.current.playAlarmSound('warning')} 
                      variant="outline" 
                      size="sm"
                      className="px-4"
                    >
                      🔊 Test Sound
                    </Button>
                  </div>
                )}
              </div>

              {/* Quick Distraction Logging */}
              {isActive && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { type: 'Phone', icon: '📱', severity: 'high' },
                    { type: 'Email', icon: '📧', severity: 'medium' },
                    { type: 'Noise', icon: '🔊', severity: 'medium' },
                    { type: 'Thoughts', icon: '💭', severity: 'low' }
                  ].map(distraction => (
                    <button
                      key={distraction.type}
                      onClick={() => logDistraction(distraction.type, distraction.severity)}
                      className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
                    >
                      <div className="text-2xl mb-1">{distraction.icon}</div>
                      <div className="text-xs font-medium text-red-700 dark:text-red-300">
                        {distraction.type}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Biometric Monitoring */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">💓 Biometric Data</CardTitle>
                <CardDescription>Real-time physiological monitoring</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-calm-50 dark:bg-calm-800">
                  <div>
                    <div className="font-semibold text-calm-900 dark:text-calm-100">Heart Rate</div>
                    <div className="text-sm text-calm-600 dark:text-calm-400">
                      {getBiometricStatus(biometrics.heartRate, 'heartRate').status}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-red-500">{Math.round(biometrics.heartRate)}</div>
                    <div className="text-xs text-calm-500">BPM</div>
                    <div className="text-xs text-green-600">{biometrics.heartRateConfidence || 72}% confidence</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-calm-50 dark:bg-calm-800">
                  <div>
                    <div className="font-semibold text-calm-900 dark:text-calm-100">Ambient Noise</div>
                    <div className="text-sm text-calm-600 dark:text-calm-400">
                      {getBiometricStatus(biometrics.ambientNoise, 'noise').status}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-500">{Math.round(biometrics.ambientNoise)}</div>
                    <div className="text-xs text-calm-500">dB</div>
                    <div className="text-xs text-green-600">{biometrics.noiseConfidence || 90}% confidence</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-calm-50 dark:bg-calm-800">
                  <div>
                    <div className="font-semibold text-calm-900 dark:text-calm-100">Eye Strain</div>
                    <div className="text-sm text-calm-600 dark:text-calm-400">
                      {getBiometricStatus(biometrics.eyeStrain, 'eyeStrain').status}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-yellow-500">{Math.round(biometrics.eyeStrain)}</div>
                    <div className="text-xs text-calm-500">%</div>
                    <div className="text-xs text-green-600">{biometrics.eyeStrainConfidence || 80}% confidence</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🤖 AI Coach</CardTitle>
                <CardDescription>Real-time optimization tips</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentFocusScore < 70 && (
                    <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                      <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        💡 Focus dropping - try deep breathing
                      </div>
                    </div>
                  )}
                  
                  {biometrics.heartRate > 85 && (
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                      <div className="text-sm font-medium text-red-800 dark:text-red-200">
                        ❤️ Heart rate elevated - take a moment to relax
                      </div>
                    </div>
                  )}
                  
                  {biometrics.ambientNoise > 60 && (
                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                      <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        🔇 Environment noisy - consider noise-canceling
                      </div>
                    </div>
                  )}
                  
                  {currentFocusScore > 90 && (
                    <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                      <div className="text-sm font-medium text-green-800 dark:text-green-200">
                        🎯 Excellent focus! You're in the zone
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Distraction Alert Panel */}
          <DistractionAlertPanel alertSystem={alertSystem.current} />
          
          {/* Voice Controls */}
          <VoiceControls onVoiceCommand={handleVoiceCommand} />
        </div>

        {/* Real-Time Charts */}
        {isActive && sessionData.length > 5 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            <Card>
              <CardHeader>
                <CardTitle>📈 Focus Trend</CardTitle>
                <CardDescription>Real-time focus score over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sessionData}>
                      <defs>
                        <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" hide />
                      <YAxis domain={[40, 100]} hide />
                      <Area 
                        type="monotone" 
                        dataKey="focus" 
                        stroke="#0ea5e9" 
                        strokeWidth={2}
                        fill="url(#focusGradient)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>💓 Biometric Trends</CardTitle>
                <CardDescription>Heart rate and environmental factors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sessionData}>
                      <XAxis dataKey="time" hide />
                      <YAxis hide />
                      <Line type="monotone" dataKey="heartRate" stroke="#ef4444" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="noise" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Session Summary */}
        {distractions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>📊 Session Analysis</CardTitle>
              <CardDescription>Real-time distraction tracking and impact analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div>
                  <h4 className="font-semibold text-calm-900 dark:text-calm-100 mb-3">Distractions</h4>
                  <div className="space-y-2">
                    {distractions.slice(-5).map(distraction => (
                      <div key={distraction.id} className="flex items-center justify-between p-2 rounded-lg bg-calm-50 dark:bg-calm-800">
                        <div className="flex items-center gap-2">
                          <Badge variant="danger" className="text-xs">{distraction.type}</Badge>
                          <span className="text-sm text-calm-600 dark:text-calm-400">
                            {formatTime(distraction.timestamp)}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-red-600">
                          -{distraction.impact}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-calm-900 dark:text-calm-100 mb-3">Performance</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-calm-600 dark:text-calm-400">Average Focus</span>
                      <span className="font-semibold">
                        {Math.round(sessionData.reduce((acc, d) => acc + d.focus, 0) / sessionData.length || 0)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-calm-600 dark:text-calm-400">Peak Focus</span>
                      <span className="font-semibold text-green-600">
                        {Math.max(...sessionData.map(d => d.focus) || [0])}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-calm-600 dark:text-calm-400">Total Distractions</span>
                      <span className="font-semibold text-red-600">{distractions.length}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-calm-900 dark:text-calm-100 mb-3">Insights</h4>
                  <div className="space-y-2 text-sm text-calm-600 dark:text-calm-400">
                    <p>• Focus quality: {currentFocusScore >= 80 ? 'Excellent' : currentFocusScore >= 60 ? 'Good' : 'Needs improvement'}</p>
                    <p>• Distraction rate: {(distractions.length / Math.max(time / 60, 1)).toFixed(1)}/min</p>
                    <p>• Session efficiency: {Math.round((1 - distractions.length * 0.05) * 100)}%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Educational Chatbot */}
      <EducationalChatbot isSessionActive={isActive} />
    </div>
  );
};

export default RealTimeSession;