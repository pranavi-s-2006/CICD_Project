import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import Button from './Button';

const ReflectionModal = ({ isOpen, onClose, onSubmit, sessionData }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [focusQuality, setFocusQuality] = useState(3);
  const [recoveryTime, setRecoveryTime] = useState('');

  const commonReasons = [
    { id: 'phone', label: 'Phone notifications', icon: '📱' },
    { id: 'social', label: 'Social media urge', icon: '📱' },
    { id: 'email', label: 'Email checking', icon: '📧' },
    { id: 'noise', label: 'Environmental noise', icon: '🔊' },
    { id: 'thoughts', label: 'Mind wandering', icon: '💭' },
    { id: 'fatigue', label: 'Mental fatigue', icon: '😴' },
    { id: 'hunger', label: 'Hunger/thirst', icon: '🍽️' },
    { id: 'stress', label: 'Stress/anxiety', icon: '😰' },
    { id: 'boredom', label: 'Task was boring', icon: '😑' },
    { id: 'other', label: 'Something else', icon: '🤔' }
  ];

  const handleSubmit = () => {
    const reflection = {
      reason: selectedReason === 'other' ? customReason : commonReasons.find(r => r.id === selectedReason)?.label,
      reasonId: selectedReason,
      focusQuality,
      recoveryTime: recoveryTime ? parseInt(recoveryTime) : null,
      timestamp: Date.now(),
      sessionId: sessionData?.id
    };
    
    onSubmit(reflection);
    onClose();
    
    // Reset form
    setSelectedReason('');
    setCustomReason('');
    setFocusQuality(3);
    setRecoveryTime('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🤔</span>
            Session Reflection
          </CardTitle>
          <p className="text-calm-600 dark:text-calm-400">
            Help us understand your focus patterns better. This takes just 30 seconds.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          
          {/* Session Summary */}
          <div className="p-4 rounded-xl bg-calm-50 dark:bg-calm-800 border border-calm-200 dark:border-calm-700">
            <h4 className="font-semibold text-calm-900 dark:text-calm-100 mb-2">Your Session</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-calm-600 dark:text-calm-400">Duration:</span>
                <div className="font-semibold">{sessionData?.duration || '25 min'}</div>
              </div>
              <div>
                <span className="text-calm-600 dark:text-calm-400">Distractions:</span>
                <div className="font-semibold">{sessionData?.distractions || 3}</div>
              </div>
              <div>
                <span className="text-calm-600 dark:text-calm-400">Focus Score:</span>
                <div className="font-semibold">{sessionData?.focusScore || 78}%</div>
              </div>
            </div>
          </div>

          {/* Main Question */}
          <div>
            <h3 className="text-lg font-semibold text-calm-900 dark:text-calm-100 mb-4">
              What do you think caused the most distraction today?
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {commonReasons.map(reason => (
                <button
                  key={reason.id}
                  onClick={() => setSelectedReason(reason.id)}
                  className={`p-3 rounded-xl border-2 transition-all text-left ${
                    selectedReason === reason.id
                      ? 'border-focus-500 bg-focus-50 dark:bg-focus-900/20'
                      : 'border-calm-200 dark:border-calm-700 hover:border-focus-300 dark:hover:border-focus-600'
                  }`}
                >
                  <div className="text-2xl mb-1">{reason.icon}</div>
                  <div className="text-sm font-medium text-calm-900 dark:text-calm-100">
                    {reason.label}
                  </div>
                </button>
              ))}
            </div>

            {selectedReason === 'other' && (
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Tell us what distracted you..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-calm-200 dark:border-calm-700 bg-white dark:bg-calm-800 focus:ring-2 focus:ring-focus-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          {/* Focus Quality Rating */}
          <div>
            <h4 className="font-semibold text-calm-900 dark:text-calm-100 mb-3">
              How would you rate your overall focus quality?
            </h4>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map(rating => (
                <button
                  key={rating}
                  onClick={() => setFocusQuality(rating)}
                  className={`w-12 h-12 rounded-full border-2 transition-all ${
                    focusQuality >= rating
                      ? 'border-yellow-400 bg-yellow-100 dark:bg-yellow-900/30'
                      : 'border-calm-300 dark:border-calm-600'
                  }`}
                >
                  <span className="text-xl">
                    {focusQuality >= rating ? '⭐' : '☆'}
                  </span>
                </button>
              ))}
              <span className="ml-3 text-sm text-calm-600 dark:text-calm-400">
                {focusQuality === 1 ? 'Very Poor' : 
                 focusQuality === 2 ? 'Poor' :
                 focusQuality === 3 ? 'Average' :
                 focusQuality === 4 ? 'Good' : 'Excellent'}
              </span>
            </div>
          </div>

          {/* Recovery Time (if distractions occurred) */}
          {sessionData?.distractions > 0 && (
            <div>
              <h4 className="font-semibold text-calm-900 dark:text-calm-100 mb-3">
                How long did it typically take you to refocus after a distraction?
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {['1', '2-3', '4-5', '5+'].map(time => (
                  <button
                    key={time}
                    onClick={() => setRecoveryTime(time)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      recoveryTime === time
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-calm-200 dark:border-calm-700 hover:border-purple-300'
                    }`}
                  >
                    <div className="text-sm font-medium text-calm-900 dark:text-calm-100">
                      {time} min
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Skip for now
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!selectedReason || (selectedReason === 'other' && !customReason.trim())}
              className="flex-1"
            >
              <span className="mr-2">💡</span>
              Save Insights
            </Button>
          </div>

          {/* Motivation */}
          <div className="text-center p-3 rounded-xl bg-gradient-to-r from-focus-50 to-purple-50 dark:from-focus-900/20 dark:to-purple-900/20">
            <p className="text-sm text-focus-700 dark:text-focus-300">
              <strong>💡 Why this matters:</strong> Your reflections help build your unique Attention Fingerprint and improve future focus sessions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReflectionModal;