import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './Card';
import Button from './Button';
import VoiceCommandSystem from '../../utils/VoiceCommandSystem';

const VoiceControls = ({ onVoiceCommand }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voiceSystem] = useState(new VoiceCommandSystem());

  useEffect(() => {
    const supported = voiceSystem.initialize();
    setIsSupported(supported);
    
    if (supported) {
      voiceSystem.setCommandHandler((action, transcript) => {
        onVoiceCommand?.(action, transcript);
      });
    }
  }, [voiceSystem, onVoiceCommand]);

  const toggleVoiceCommands = () => {
    if (isEnabled) {
      voiceSystem.stopListening();
      setIsEnabled(false);
    } else {
      voiceSystem.startListening();
      setIsEnabled(true);
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🎤 Voice Commands</CardTitle>
          <CardDescription>Voice recognition not supported in this browser</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
            <div className="text-sm text-yellow-700 dark:text-yellow-300">
              Try using Chrome or Edge for voice command support
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">🎤 Voice Commands</CardTitle>
        <CardDescription>Control FOCUSLOOM with your voice</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="flex items-center justify-between p-3 rounded-lg bg-calm-50 dark:bg-calm-800">
          <div>
            <div className="font-semibold text-calm-900 dark:text-calm-100">Voice Control</div>
            <div className="text-sm text-calm-600 dark:text-calm-400">
              {isEnabled ? 'Listening for "Hey FOCUSLOOM"' : 'Voice commands disabled'}
            </div>
          </div>
          <Button 
            onClick={toggleVoiceCommands}
            variant={isEnabled ? 'destructive' : 'default'}
            size="sm"
          >
            {isEnabled ? 'Stop Listening' : 'Start Listening'}
          </Button>
        </div>

        {isEnabled && (
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              🎯 Available Commands
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <p>• "Start session" or "Begin session"</p>
              <p>• "Stop session" or "End session"</p>
              <p>• "Status" or "How am I doing"</p>
              <p>• "Take break" or "Break time"</p>
              <p>• "I got distracted" or "Distraction"</p>
              <p className="text-xs opacity-80 mt-2">
                📝 You don't need to say "Hey FOCUSLOOM" - just the command!
              </p>
            </div>
          </div>
        )}

        <div className="text-xs text-calm-500 dark:text-calm-400">
          Voice commands work best in quiet environments. Microphone permission required.
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceControls;