import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './Card';
import Button from './Button';

const PrivacyControls = ({ onSettingsChange }) => {
  const [settings, setSettings] = useState({
    cameraEnabled: true,
    microphoneEnabled: true,
    localOnlyMode: false,
    dataRetention: 30 // days
  });

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">🔒 Privacy Controls</CardTitle>
        <CardDescription>You control your data collection and privacy</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-calm-50 dark:bg-calm-800">
            <div>
              <div className="font-semibold text-calm-900 dark:text-calm-100">Camera Access</div>
              <div className="text-sm text-calm-600 dark:text-calm-400">
                For heart rate monitoring via photoplethysmography
              </div>
            </div>
            <button
              onClick={() => updateSetting('cameraEnabled', !settings.cameraEnabled)}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.cameraEnabled ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                settings.cameraEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-calm-50 dark:bg-calm-800">
            <div>
              <div className="font-semibold text-calm-900 dark:text-calm-100">Microphone Access</div>
              <div className="text-sm text-calm-600 dark:text-calm-400">
                For ambient noise level detection
              </div>
            </div>
            <button
              onClick={() => updateSetting('microphoneEnabled', !settings.microphoneEnabled)}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.microphoneEnabled ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                settings.microphoneEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-calm-50 dark:bg-calm-800">
            <div>
              <div className="font-semibold text-calm-900 dark:text-calm-100">Local-Only Mode</div>
              <div className="text-sm text-calm-600 dark:text-calm-400">
                All data stays on your device, no cloud sync
              </div>
            </div>
            <button
              onClick={() => updateSetting('localOnlyMode', !settings.localOnlyMode)}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.localOnlyMode ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                settings.localOnlyMode ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Data Retention</div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="7"
              max="365"
              value={settings.dataRetention}
              onChange={(e) => updateSetting('dataRetention', parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {settings.dataRetention} days
            </span>
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Automatically delete focus data after this period
          </div>
        </div>

        <div className="text-xs text-calm-500 dark:text-calm-400 space-y-1">
          <p>• All biometric processing happens locally in your browser</p>
          <p>• No sensitive data is transmitted without your consent</p>
          <p>• You can export or delete your data anytime</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrivacyControls;