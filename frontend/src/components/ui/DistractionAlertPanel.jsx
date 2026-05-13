import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './Card';
import Button from './Button';
import Badge from './Badge';

const DistractionAlertPanel = ({ alertSystem }) => {
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [currentDistraction, setCurrentDistraction] = useState(null);
  const [stats, setStats] = useState({ totalSessions: 0, totalTime: '0s' });
  const [customTimings, setCustomTimingsState] = useState({ warning: 30, danger: 120, critical: 300 });

  const setCustomTimings = (type, value) => {
    const newTimings = { ...customTimings, [type]: value };
    setCustomTimingsState(newTimings);
    
    if (alertSystem) {
      alertSystem.setAlertTimings(newTimings.warning, newTimings.danger, newTimings.critical);
    }
  };

  useEffect(() => {
    // Check browser notification permission
    const checkPermission = () => {
      if ('Notification' in window) {
        setNotificationEnabled(Notification.permission === 'granted');
      }
    };
    
    checkPermission();
    const interval = setInterval(checkPermission, 1000);

    // Listen for distraction events
    const handleDistractionStart = (e) => {
      setCurrentDistraction({ startTime: e.detail.startTime, duration: 0 });
    };

    const handleDistractionUpdate = (e) => {
      setCurrentDistraction(prev => prev ? { ...prev, duration: e.detail.duration, level: e.detail.level } : null);
    };

    const handleDistractionEnd = (e) => {
      setCurrentDistraction(null);
      if (alertSystem) {
        setStats(alertSystem.getDistractionStats());
      }
    };

    window.addEventListener('distractionStarted', handleDistractionStart);
    window.addEventListener('distractionUpdate', handleDistractionUpdate);
    window.addEventListener('distractionEnded', handleDistractionEnd);

    return () => {
      clearInterval(interval);
      window.removeEventListener('distractionStarted', handleDistractionStart);
      window.removeEventListener('distractionUpdate', handleDistractionUpdate);
      window.removeEventListener('distractionEnded', handleDistractionEnd);
    };
  }, [alertSystem]);

  const handleEnableNotifications = async () => {
    if (!alertSystem) return;
    const enabled = await alertSystem.initializeNotifications();
    setNotificationEnabled(enabled);
  };

  const handleTestNotification = () => {
    // Test alarm sound first
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
      
      console.log('🔊 Test alarm played');
    } catch (error) {
      console.log('Audio test failed:', error);
    }
    
    // Show in-page notification
    const testDiv = document.createElement('div');
    testDiv.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 9999;
      background: #10b981; color: white; padding: 16px 20px;
      border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      font-family: system-ui; font-size: 14px; max-width: 300px;
      animation: slideIn 0.3s ease-out;
    `;
    
    testDiv.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 4px;">🎯 FOCUSLOOM Alert Test</div>
      <div>🔊 Alarm sound + notification working! You'll get alerts when distracted.</div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(testDiv);
    
    setTimeout(() => {
      testDiv.style.animation = 'slideIn 0.3s ease-out reverse';
      setTimeout(() => {
        testDiv.remove();
        style.remove();
      }, 300);
    }, 4000);
    
    console.log('Test notification and sound completed');
  };

  const getLevelColor = (level) => {
    if (level === 'critical') return 'bg-red-500';
    if (level === 'danger') return 'bg-yellow-500';
    if (level === 'warning') return 'bg-orange-500';
    return 'bg-blue-500';
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🚨 Distraction Alerts</CardTitle>
          <CardDescription>Real-time notifications when you get distracted</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {!notificationEnabled ? (
            <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔔</span>
                <div className="flex-1">
                  <div className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                    Enable Notifications
                  </div>
                  <div className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                    Get alerted when you visit distracting sites during focus sessions
                  </div>
                  <Button onClick={handleEnableNotifications} size="sm" variant="warning">
                    Enable Alerts
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">✅</span>
                    <span className="font-semibold text-green-800 dark:text-green-200">
                      Notifications Enabled
                    </span>
                  </div>
                  <Button onClick={handleTestNotification} size="sm" variant="outline">
                    Test
                  </Button>
                </div>
              </div>

              {/* Custom Timing Settings */}
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="font-semibold text-blue-800 dark:text-blue-200 mb-3">
                  ⏰ Custom Alert Timings
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div>
                    <label className="text-xs text-blue-700 dark:text-blue-300">Warning (sec)</label>
                    <input 
                      type="number" 
                      defaultValue="30" 
                      min="10" 
                      max="300"
                      className="w-full px-2 py-1 text-sm rounded border border-blue-300 dark:border-blue-600 bg-white dark:bg-blue-900"
                      onChange={(e) => setCustomTimings('warning', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-blue-700 dark:text-blue-300">Danger (sec)</label>
                    <input 
                      type="number" 
                      defaultValue="120" 
                      min="30" 
                      max="600"
                      className="w-full px-2 py-1 text-sm rounded border border-blue-300 dark:border-blue-600 bg-white dark:bg-blue-900"
                      onChange={(e) => setCustomTimings('danger', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-blue-700 dark:text-blue-300">Critical (sec)</label>
                    <input 
                      type="number" 
                      defaultValue="300" 
                      min="60" 
                      max="900"
                      className="w-full px-2 py-1 text-sm rounded border border-blue-300 dark:border-blue-600 bg-white dark:bg-blue-900"
                      onChange={(e) => setCustomTimings('critical', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  Customize when you want to be alerted during distractions
                </div>
              </div>

              {currentDistraction && (
                <div className={`p-4 rounded-lg border-2 ${
                  currentDistraction.level === 'critical' ? 'bg-red-50 dark:bg-red-900/20 border-red-500 animate-pulse' :
                  currentDistraction.level === 'danger' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500' :
                  'bg-orange-50 dark:bg-orange-900/20 border-orange-500'
                }`}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div className="flex-1">
                      <div className="font-semibold text-red-800 dark:text-red-200 mb-1">
                        Distraction Detected
                      </div>
                      <div className="text-sm text-red-700 dark:text-red-300 mb-2">
                        You've been away for {formatDuration(currentDistraction.duration)}
                      </div>
                      <div className="w-full bg-red-200 dark:bg-red-800 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${getLevelColor(currentDistraction.level)}`}
                          style={{ width: `${Math.min((currentDistraction.duration / 300) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {stats.totalSessions > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-calm-50 dark:bg-calm-800">
                    <div className="text-xs text-calm-600 dark:text-calm-400 mb-1">Total Distractions</div>
                    <div className="text-xl font-bold text-calm-900 dark:text-calm-100">{stats.totalSessions}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-calm-50 dark:bg-calm-800">
                    <div className="text-xs text-calm-600 dark:text-calm-400 mb-1">Time Lost</div>
                    <div className="text-xl font-bold text-red-600">{stats.totalTimeFormatted}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="text-xs text-calm-500 dark:text-calm-400 space-y-1">
            <p>• 30s away = Warning notification</p>
            <p>• 2min away = Danger notification</p>
            <p>• 5min away = Critical notification</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DistractionAlertPanel;
