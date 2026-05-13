import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import Button from './ui/Button';
import CircularProgress from './ui/CircularProgress';
import { sessionAPI } from '../services/api';
import DistractionAlertSystem from '../utils/DistractionAlertSystem';
import BiometricCollector from '../utils/BiometricCollector';
import VoiceController from '../utils/VoiceController';
import FocusAI from '../utils/FocusAI';
import AIInsightsPanel from './ui/AIInsightsPanel';

const ModernFocusTimer = () => {
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(0);
  const [currentSession, setCurrentSession] = useState(null);
  const [category, setCategory] = useState('work');
  const [intendedDuration, setIntendedDuration] = useState(25);
  const [showDistractionLog, setShowDistractionLog] = useState(false);
  
  // Alert system refs
  const alertSystemRef = useRef(null);
  const biometricCollectorRef = useRef(null);
  const voiceControllerRef = useRef(null);
  const focusAIRef = useRef(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);
  
  // Initialize alert systems
  useEffect(() => {
    alertSystemRef.current = new DistractionAlertSystem();
    biometricCollectorRef.current = new BiometricCollector();
    voiceControllerRef.current = new VoiceController();
    focusAIRef.current = new FocusAI();
    
    // Initialize notifications on component mount
    alertSystemRef.current.initializeNotifications();
    
    // Setup voice command handlers
    const handleVoiceCommand = (event) => {
      const { action, data } = event.detail;
      
      switch (action) {
        case 'startSession':
          if (!isActive) {
            setCategory(data || 'work');
            startSession();
          }
          break;
        case 'endSession':
          if (isActive) {
            endSession();
          }
          break;
        case 'logDistraction':
          if (isActive) {
            logDistraction(data, 'voice');
          }
          break;
        case 'getStatus':
          if (isActive) {
            const minutes = Math.floor(time / 60);
            voiceControllerRef.current.speak(`You've been focused for ${minutes} minutes`);
          } else {
            voiceControllerRef.current.speak('No active session');
          }
          break;
        case 'enableStudyMode':
          if (alertSystemRef.current) {
            alertSystemRef.current.enableStudyMode();
          }
          break;
        case 'markEducational':
          if (alertSystemRef.current) {
            alertSystemRef.current.markAsEducational();
          }
          break;
        case 'markEntertainment':
          if (alertSystemRef.current) {
            alertSystemRef.current.markAsEntertainment();
          }
          break;
        case 'showAIInsights':
          setShowAIInsights(true);
          voiceControllerRef.current.speak('Showing AI insights');
          break;
      }
    };
    
    window.addEventListener('voiceCommand', handleVoiceCommand);
    
    return () => {
      if (alertSystemRef.current) {
        alertSystemRef.current.stopMonitoring();
      }
      if (biometricCollectorRef.current) {
        biometricCollectorRef.current.stopMonitoring();
      }
      if (voiceControllerRef.current) {
        voiceControllerRef.current.stopListening();
      }
      window.removeEventListener('voiceCommand', handleVoiceCommand);
    };
  }, []);

  // Toggle voice commands
  const toggleVoiceCommands = () => {
    if (!voiceControllerRef.current?.isVoiceSupported()) {
      alert('Voice commands not supported in this browser');
      return;
    }
    
    if (voiceEnabled) {
      voiceControllerRef.current.stopListening();
      setVoiceEnabled(false);
    } else {
      const started = voiceControllerRef.current.startListening();
      if (started) {
        setVoiceEnabled(true);
      }
    }
  };

  const startSession = async () => {
    try {
      const response = await sessionAPI.startSession({
        intendedDuration,
        category,
      });
      
      setCurrentSession(response.data);
      setIsActive(true);
      setTime(0);
      setShowDistractionLog(true);
      
      // Start monitoring systems
      if (alertSystemRef.current) {
        await alertSystemRef.current.startMonitoring();
        console.log('🔔 Alert system started');
      }
      
      if (biometricCollectorRef.current) {
        biometricCollectorRef.current.setSessionId(response.data._id);
        await biometricCollectorRef.current.startMonitoring();
        console.log('📊 Biometric monitoring started');
      }
      
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  // Calculate focus score for AI learning
  const calculateFocusScore = () => {
    const biometrics = biometricCollectorRef.current?.getCurrentReadings();
    return biometrics?.focusScore || 75;
  };
  
  // Get session distractions for AI learning
  const getSessionDistractions = () => {
    return [];
  };

  const endSession = async () => {
    if (!currentSession) return;
    
    try {
      await sessionAPI.endSession(currentSession._id);
      
      // Save to localStorage for achievements
      const sessions = JSON.parse(localStorage.getItem('focusSessions') || '[]');
      sessions.push({
        _id: currentSession._id,
        startTime: currentSession.startTime,
        duration: Math.floor(time / 60),
        category,
        completed: true,
        focusScore: calculateFocusScore(),
        distractions: getSessionDistractions()
      });
      localStorage.setItem('focusSessions', JSON.stringify(sessions));
      
      // Collect session data for AI learning
      const sessionData = {
        duration: time,
        focusScore: calculateFocusScore(),
        distractions: getSessionDistractions(),
        biometrics: biometricCollectorRef.current?.getCurrentReadings() || {},
        timeOfDay: new Date().getHours(),
        dayOfWeek: new Date().getDay(),
        environment: { category, intendedDuration }
      };
      
      // Let AI learn from this session
      if (focusAIRef.current) {
        focusAIRef.current.learnFromSession(sessionData);
        console.log('🤖 AI learned from session data');
      }
      
      setIsActive(false);
      setCurrentSession(null);
      setShowDistractionLog(false);
      
      // Stop monitoring systems
      if (alertSystemRef.current) {
        alertSystemRef.current.stopMonitoring();
        console.log('🔕 Alert system stopped');
      }
      
      if (biometricCollectorRef.current) {
        biometricCollectorRef.current.stopMonitoring();
        console.log('📊 Biometric monitoring stopped');
      }
      
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  const logDistraction = async (source, category = 'other') => {
    if (!currentSession) return;
    
    try {
      await sessionAPI.logDistraction(currentSession._id, {
        source,
        category,
      });
      
      // Show subtle feedback
      const button = document.querySelector(`[data-distraction="${source}"]`);
      if (button) {
        button.classList.add('animate-pulse-soft');
        setTimeout(() => button.classList.remove('animate-pulse-soft'), 1000);
      }
    } catch (error) {
      console.error('Failed to log distraction:', error);
    }
  };

  useEffect(() => {
    let interval = null;
    
    if (isActive) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else if (!isActive && time !== 0) {
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [isActive, time]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressValue = () => {
    const targetSeconds = intendedDuration * 60;
    return Math.min((time / targetSeconds) * 100, 100);
  };

  const distractionButtons = [
    { icon: '📱', label: 'Phone', source: 'Phone', category: 'notification', color: 'bg-red-100 hover:bg-red-200 text-red-700' },
    { icon: '📧', label: 'Email', source: 'Email', category: 'notification', color: 'bg-blue-100 hover:bg-blue-200 text-blue-700' },
    { icon: '🌐', label: 'Social Media', source: 'Social Media', category: 'social', color: 'bg-purple-100 hover:bg-purple-200 text-purple-700' },
    { icon: '💭', label: 'Mind Wandering', source: 'Mind Wandering', category: 'internal', color: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700' },
    { icon: '🔊', label: 'Noise', source: 'Noise', category: 'environment', color: 'bg-orange-100 hover:bg-orange-200 text-orange-700' },
    { icon: '🍽️', label: 'Hunger', source: 'Hunger/Thirst', category: 'internal', color: 'bg-green-100 hover:bg-green-200 text-green-700' },
  ];

  return (
    <div className="space-y-6">
      {/* Main Timer Card */}
      <Card className="text-center relative overflow-hidden">
        {isActive && (
          <div className="absolute inset-0 bg-gradient-to-br from-focus-500/5 to-focus-600/10 animate-pulse-soft"></div>
        )}
        <CardContent className="p-8 relative z-10">
          
          {/* Timer Display */}
          <div className="mb-8">
            <CircularProgress 
              value={getProgressValue()} 
              size={200}
              strokeWidth={12}
              className="mx-auto mb-6"
            >
              <div className="text-center">
                <div className="text-3xl font-bold font-display text-calm-900 dark:text-calm-100">
                  {formatTime(time)}
                </div>
                <div className="text-sm text-calm-500 mt-1">
                  {isActive ? 'In Focus' : 'Ready to Focus'}
                </div>
              </div>
            </CircularProgress>
            
            {isActive && (
              <div className="flex items-center justify-center gap-2 text-sm text-focus-600">
                <div className="w-2 h-2 bg-focus-500 rounded-full animate-pulse"></div>
                <span>Session in progress</span>
              </div>
            )}
          </div>

              {/* Voice Commands Toggle */}
              {!isActive && (
                <div className="mb-6 p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-purple-900 dark:text-purple-100">🎤 Voice Commands</h4>
                      <p className="text-xs text-purple-600 dark:text-purple-400">"Hey FOCUSLOOM, start deep work session"</p>
                    </div>
                    <button
                      onClick={toggleVoiceCommands}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        voiceEnabled 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {voiceEnabled ? '🎤 Listening' : '🎤 Enable'}
                    </button>
                  </div>
                  {voiceEnabled && (
                    <div className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                      • "Hey FOCUSLOOM, start [work/study/creative] session"<br/>
                      • "Log [phone/email/noise] distraction"<br/>
                      • "Hey FOCUSLOOM, how am I doing?"<br/>
                      • "Hey FOCUSLOOM, end session"
                    </div>
                  )}
                </div>
              )}

            {!isActive && (
              <div className="space-y-6 mb-8">
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  <div>
                    <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                      Session Type
                    </label>
                    <select 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-calm-200 dark:border-calm-700 bg-white dark:bg-calm-800 focus:ring-2 focus:ring-focus-500 focus:border-transparent transition-all"
                    >
                      <option value="work">🔬 Deep Work</option>
                      <option value="study">📚 Study</option>
                      <option value="creative">🎨 Creative</option>
                      <option value="coding">💻 Coding</option>
                      <option value="reading">📖 Reading</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                      Duration
                    </label>
                    <select
                      value={intendedDuration}
                      onChange={(e) => setIntendedDuration(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-calm-200 dark:border-calm-700 bg-white dark:bg-calm-800 focus:ring-2 focus:ring-focus-500 focus:border-transparent transition-all"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={25}>25 minutes (Pomodoro)</option>
                      <option value={45}>45 minutes</option>
                      <option value={60}>60 minutes</option>
                      <option value={90}>90 minutes</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

              {/* Educational Content Tagging */}
              {isActive && (
                <>
                  <div className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-green-900 dark:text-green-100">📚 Content Type</h4>
                        <p className="text-xs text-green-600 dark:text-green-400">Tag your current activity to control alerts</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (alertSystemRef.current) {
                            alertSystemRef.current.markAsEducational();
                          }
                        }}
                        className="flex-1 px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        📚 Educational
                        <span className="text-xs opacity-75">(No alerts)</span>
                      </button>
                      <button
                        onClick={() => {
                          if (alertSystemRef.current) {
                            alertSystemRef.current.markAsEntertainment();
                          }
                        }}
                        className="flex-1 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        🎬 Entertainment
                        <span className="text-xs opacity-75">(Alerts on)</span>
                      </button>
                    </div>
                    <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                      • Click "Educational" before watching learning videos<br/>
                      • Click "Entertainment" for non-educational content<br/>
                      • Educational mode auto-disables after 30 minutes
                    </div>
                  </div>

                  <div className="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-blue-900 dark:text-blue-100">📚 Study Mode</h4>
                        <p className="text-xs text-blue-600 dark:text-blue-400">Allows educational YouTube & learning sites</p>
                      </div>
                      <button
                        onClick={() => {
                          if (alertSystemRef.current) {
                            if (alertSystemRef.current.studyMode) {
                              alertSystemRef.current.disableStudyMode();
                            } else {
                              alertSystemRef.current.enableStudyMode();
                            }
                          }
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          alertSystemRef.current?.studyMode 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {alertSystemRef.current?.studyMode ? '✅ Enabled' : '❌ Disabled'}
                      </button>
                    </div>
                  </div>
                </>
              )}
          <div className="flex justify-center gap-4">
            {!isActive ? (
              <Button 
                onClick={startSession} 
                size="lg" 
                className="px-8"
              >
                <span className="mr-2">🚀</span>
                Start Focus Session
              </Button>
            ) : (
              <Button onClick={endSession} variant="destructive" size="lg" className="px-8">
                <span className="mr-2">⏹️</span>
                End Session
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Distraction Logger */}
      {showDistractionLog && isActive && (
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              <span className="mr-2">⚠️</span>
              Quick Distraction Log
            </CardTitle>
            <p className="text-center text-sm text-calm-600 dark:text-calm-400">
              Tap when something breaks your focus (it's okay, we're learning!)
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {distractionButtons.map((distraction) => (
                <button
                  key={distraction.source}
                  data-distraction={distraction.source}
                  onClick={() => logDistraction(distraction.source, distraction.category)}
                  className={`p-4 rounded-xl border-2 border-transparent transition-all duration-200 hover:scale-105 active:scale-95 ${distraction.color}`}
                >
                  <div className="text-2xl mb-1">{distraction.icon}</div>
                  <div className="text-sm font-medium">{distraction.label}</div>
                </button>
              ))}
            </div>
            <div className="mt-4 p-4 rounded-xl bg-calm-50 dark:bg-calm-800 border border-calm-200 dark:border-calm-700">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-calm-600 dark:text-calm-400">
                  💡 <strong>Pro tip:</strong> The goal isn't perfection—it's awareness. Each logged distraction helps you understand your patterns better.
                </p>
                <button
                  onClick={() => {
                    if (alertSystemRef.current) {
                      alertSystemRef.current.playAlarmSound('warning');
                    }
                  }}
                  className="ml-4 px-3 py-1 text-xs bg-focus-100 hover:bg-focus-200 text-focus-700 rounded-lg transition-colors"
                  title="Test notification sound"
                >
                  🔊 Test Sound
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Insights Panel */}
      {showAIInsights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              🤖 AI Insights & Predictions
              <button
                onClick={() => setShowAIInsights(false)}
                className="text-calm-500 hover:text-calm-700 text-xl"
              >
                ×
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AIInsightsPanel focusAI={focusAIRef.current} isActive={isActive} />
          </CardContent>
        </Card>
      )}

      {/* AI Insights Toggle */}
      {!showAIInsights && (
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6 text-center">
            <div className="text-3xl mb-3">🤖</div>
            <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
              AI-Powered Focus Insights
            </h3>
            <p className="text-sm text-purple-700 dark:text-purple-300 mb-4">
              Get personalized predictions and recommendations based on your focus patterns
            </p>
            <Button 
              onClick={() => setShowAIInsights(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              View AI Insights
            </Button>
          </CardContent>
        </Card>
      )}
        <Card className="bg-gradient-to-br from-focus-50 to-focus-100 dark:from-focus-900/20 dark:to-focus-800/20 border-focus-200 dark:border-focus-800">
          <CardContent className="p-6 text-center">
            <div className="text-3xl mb-3">🧠</div>
            <h3 className="font-semibold text-focus-900 dark:text-focus-100 mb-2">
              Ready to build your focus muscle?
            </h3>
            <p className="text-sm text-focus-700 dark:text-focus-300">
              Every session is a step toward better attention. Your future self will thank you.
            </p>
          </CardContent>
        </Card>
    </div>
  );
};

export default ModernFocusTimer;