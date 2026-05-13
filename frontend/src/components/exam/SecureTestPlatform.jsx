import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import SafeExamBrowser from '../../utils/exam/SafeExamBrowser';

const SecureTestPlatform = () => {
  const [examBrowser] = useState(() => new SafeExamBrowser());
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState(null);
  const [testUrl, setTestUrl] = useState('');
  const [testPlatform, setTestPlatform] = useState('custom');
  const [config, setConfig] = useState({
    duration: 60,
    fullscreen: true,
    blockScreenshots: true,
    blockTabSwitch: true,
    blockDevTools: true,
    allowChatbot: false
  });

  const platforms = [
    {
      id: 'hackerrank',
      name: 'HackerRank',
      icon: '💻',
      placeholder: 'https://www.hackerrank.com/test/...',
      description: 'Paste your HackerRank test link'
    },
    {
      id: 'leetcode',
      name: 'LeetCode',
      icon: '🔢',
      placeholder: 'https://leetcode.com/problems/...',
      description: 'Paste LeetCode problem link'
    },
    {
      id: 'skillrack',
      name: 'SkillRack',
      icon: '🎯',
      placeholder: 'https://www.skillrack.com/...',
      description: 'Paste SkillRack test link'
    },
    {
      id: 'codechef',
      name: 'CodeChef',
      icon: '👨‍🍳',
      placeholder: 'https://www.codechef.com/...',
      description: 'Paste CodeChef contest link'
    },
    {
      id: 'codeforces',
      name: 'Codeforces',
      icon: '🏆',
      placeholder: 'https://codeforces.com/...',
      description: 'Paste Codeforces problem link'
    },
    {
      id: 'custom',
      name: 'Custom URL',
      icon: '🌐',
      placeholder: 'https://your-test-platform.com/test',
      description: 'Any test platform URL'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      if (isActive) {
        setStatus(examBrowser.getStatus());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, examBrowser]);

  const startTest = async () => {
    if (!testUrl.trim()) {
      alert('Please enter a test URL');
      return;
    }

    // Validate URL
    try {
      new URL(testUrl);
    } catch {
      alert('Please enter a valid URL');
      return;
    }

    const result = await examBrowser.startExamMode(config);
    if (result.success) {
      setIsActive(true);
      setStatus(examBrowser.getStatus());
    }
  };

  const endTest = () => {
    const result = examBrowser.exitExamMode();
    setIsActive(false);
    setStatus(null);
    
    const report = examBrowser.generateReport();
    downloadReport(report);
  };

  const downloadReport = (report) => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exam-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-calm-50 via-white to-focus-50 dark:from-calm-900 dark:via-calm-800 dark:to-focus-900">
      {!isActive ? (
        <div className="container mx-auto px-6 py-8 space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold font-display text-gradient">
              🔒 Secure Test Platform
            </h1>
            <p className="text-lg text-calm-600 dark:text-calm-400 max-w-2xl mx-auto">
              Take tests from HackerRank, LeetCode, SkillRack, and more in a secure lockdown environment
            </p>
          </div>

          {/* Platform Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Test Platform</CardTitle>
              <CardDescription>Choose your coding platform or enter custom URL</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {platforms.map(platform => (
                  <button
                    key={platform.id}
                    onClick={() => {
                      setTestPlatform(platform.id);
                      setTestUrl('');
                    }}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      testPlatform === platform.id
                        ? 'border-focus-500 bg-focus-50 dark:bg-focus-900/20'
                        : 'border-calm-200 dark:border-calm-700 hover:border-focus-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{platform.icon}</div>
                    <div className="font-semibold text-sm">{platform.name}</div>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-calm-900 dark:text-calm-100 mb-2">
                  Test URL
                </label>
                <input
                  type="url"
                  value={testUrl}
                  onChange={(e) => setTestUrl(e.target.value)}
                  placeholder={platforms.find(p => p.id === testPlatform)?.placeholder}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus-500 dark:bg-calm-800 dark:border-calm-700"
                />
                <p className="text-xs text-calm-600 mt-1">
                  {platforms.find(p => p.id === testPlatform)?.description}
                </p>
              </div>

              {/* Quick Links */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">📚 Example Test Links</h4>
                <div className="space-y-2 text-sm">
                  <button 
                    onClick={() => setTestUrl('https://www.hackerrank.com/dashboard')}
                    className="block text-blue-600 hover:underline"
                  >
                    • HackerRank Dashboard
                  </button>
                  <button 
                    onClick={() => setTestUrl('https://leetcode.com/problemset/all/')}
                    className="block text-blue-600 hover:underline"
                  >
                    • LeetCode Problems
                  </button>
                  <button 
                    onClick={() => setTestUrl('https://www.skillrack.com/faces/candidate/codingquestions.xhtml')}
                    className="block text-blue-600 hover:underline"
                  >
                    • SkillRack Coding Questions
                  </button>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Test Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure lockdown features for your test</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div>
                <label className="block text-sm font-medium text-calm-900 dark:text-calm-100 mb-2">
                  Test Duration (minutes)
                </label>
                <input
                  type="number"
                  value={config.duration}
                  onChange={(e) => setConfig({...config, duration: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus-500 dark:bg-calm-800 dark:border-calm-700"
                  min="1"
                  max="300"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-calm-50 dark:hover:bg-calm-800">
                  <input
                    type="checkbox"
                    checked={config.fullscreen}
                    onChange={(e) => setConfig({...config, fullscreen: e.target.checked})}
                    className="w-5 h-5"
                  />
                  <div>
                    <div className="font-medium">Fullscreen Mode</div>
                    <div className="text-sm text-calm-600">Lock browser in fullscreen</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-calm-50 dark:hover:bg-calm-800">
                  <input
                    type="checkbox"
                    checked={config.blockScreenshots}
                    onChange={(e) => setConfig({...config, blockScreenshots: e.target.checked})}
                    className="w-5 h-5"
                  />
                  <div>
                    <div className="font-medium">Block Screenshots</div>
                    <div className="text-sm text-calm-600">Prevent screen capture</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-calm-50 dark:hover:bg-calm-800">
                  <input
                    type="checkbox"
                    checked={config.blockTabSwitch}
                    onChange={(e) => setConfig({...config, blockTabSwitch: e.target.checked})}
                    className="w-5 h-5"
                  />
                  <div>
                    <div className="font-medium">Monitor Tab Switching</div>
                    <div className="text-sm text-calm-600">Log tab changes</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-calm-50 dark:hover:bg-calm-800">
                  <input
                    type="checkbox"
                    checked={config.blockDevTools}
                    onChange={(e) => setConfig({...config, blockDevTools: e.target.checked})}
                    className="w-5 h-5"
                  />
                  <div>
                    <div className="font-medium">Block Developer Tools</div>
                    <div className="text-sm text-calm-600">Disable F12, inspect</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-calm-50 dark:hover:bg-calm-800">
                  <input
                    type="checkbox"
                    checked={config.allowChatbot}
                    onChange={(e) => setConfig({...config, allowChatbot: e.target.checked})}
                    className="w-5 h-5"
                  />
                  <div>
                    <div className="font-medium">Allow Study Assistant</div>
                    <div className="text-sm text-calm-600">Enable educational chatbot</div>
                  </div>
                </label>

              </div>

              <Button onClick={startTest} size="lg" className="w-full">
                🚀 Start Secure Test
              </Button>

            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3">🔒</div>
                <h3 className="font-semibold mb-2">Secure Environment</h3>
                <p className="text-sm text-calm-600">Prevents cheating with browser lockdown</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="font-semibold mb-2">Activity Monitoring</h3>
                <p className="text-sm text-calm-600">Tracks all violations and suspicious behavior</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3">📝</div>
                <h3 className="font-semibold mb-2">Detailed Reports</h3>
                <p className="text-sm text-calm-600">Generates comprehensive exam reports</p>
              </CardContent>
            </Card>
          </div>

        </div>
      ) : (
        // Active Test View
        <div className="h-screen flex flex-col bg-black">
          
          {/* Status Bar */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <span className="font-semibold">SECURE TEST MODE</span>
              </div>
              <Badge variant="danger" className="bg-white text-red-600">
                {testPlatform.toUpperCase()}
              </Badge>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-sm">
                <span className="opacity-75">Time Remaining:</span>
                <span className="font-bold ml-2">{status?.timeRemaining || 0} min</span>
              </div>
              <div className="text-sm">
                <span className="opacity-75">Violations:</span>
                <span className="font-bold ml-2">{status?.violations || 0}</span>
              </div>
              <Button 
                onClick={endTest} 
                variant="destructive" 
                size="sm"
                className="bg-white text-red-600 hover:bg-gray-100"
              >
                End Test
              </Button>
            </div>
          </div>

          {/* Embedded Test Platform */}
          <iframe
            src={testUrl}
            className="flex-1 w-full border-0"
            title="Secure Test Platform"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            allow="clipboard-read; clipboard-write"
          />

          {/* Warning Footer */}
          <div className="bg-yellow-600 text-white px-6 py-2 text-center text-sm">
            ⚠️ This test is being monitored. All activities are logged. Do not attempt to switch tabs or take screenshots.
          </div>

        </div>
      )}
    </div>
  );
};

export default SecureTestPlatform;