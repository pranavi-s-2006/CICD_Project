import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import SafeExamBrowser from '../../utils/exam/SafeExamBrowser';

const ExamMode = () => {
  const [examBrowser] = useState(() => new SafeExamBrowser());
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState(null);
  const [config, setConfig] = useState({
    allowChatbot: true,
    allowCalculator: true,
    blockScreenshots: true,
    blockTabSwitch: true,
    blockDevTools: true,
    blockCopyPaste: false,
    fullscreen: true,
    duration: 60
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (isActive) {
        setStatus(examBrowser.getStatus());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, examBrowser]);

  const startExam = async () => {
    try {
      const result = await examBrowser.startExamMode(config);
      if (result.success) {
        setIsActive(true);
        setStatus(examBrowser.getStatus());
      } else {
        alert('Failed to start exam mode: ' + result.message);
      }
    } catch (error) {
      console.error('Error starting exam:', error);
      alert('Error starting exam mode. Please try again.');
    }
  };

  const endExam = () => {
    const result = examBrowser.exitExamMode();
    setIsActive(false);
    setStatus(null);
    
    // Show report
    const report = examBrowser.generateReport();
    console.log('Exam Report:', report);
    alert(`Exam Completed!\n\nViolations: ${result.violationCount}\nCheck console for detailed report.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-calm-50 via-white to-focus-50 dark:from-calm-900 dark:via-calm-800 dark:to-focus-900">
      <div className="container mx-auto px-6 py-8 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold font-display text-gradient">
            🔒 Safe Exam Browser
          </h1>
          <p className="text-lg text-calm-600 dark:text-calm-400 max-w-2xl mx-auto">
            Secure lockdown mode for exams and focused study sessions
          </p>
        </div>

        {!isActive ? (
          <>
            {/* Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Exam Configuration</CardTitle>
                <CardDescription>Configure security settings for your exam session</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-calm-900 dark:text-calm-100 mb-2">
                    Exam Duration (minutes)
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

                {/* Security Options */}
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
                      <div className="text-sm text-calm-600">Force fullscreen during exam</div>
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
                      <div className="text-sm text-calm-600">Prevent screenshot capture</div>
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
                      <div className="font-medium">Detect Tab Switching</div>
                      <div className="text-sm text-calm-600">Log when user switches tabs</div>
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
                      <div className="text-sm text-calm-600">Prevent DevTools access</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-calm-50 dark:hover:bg-calm-800">
                    <input
                      type="checkbox"
                      checked={config.blockCopyPaste}
                      onChange={(e) => setConfig({...config, blockCopyPaste: e.target.checked})}
                      className="w-5 h-5"
                    />
                    <div>
                      <div className="font-medium">Block Copy/Paste</div>
                      <div className="text-sm text-calm-600">Disable clipboard operations</div>
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
                      <div className="font-medium">Allow Educational Chatbot</div>
                      <div className="text-sm text-calm-600">Enable AI study assistant</div>
                    </div>
                  </label>

                </div>

                <Button onClick={startExam} size="lg" className="w-full">
                  🔒 Start Secure Exam Mode
                </Button>

              </CardContent>
            </Card>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3">🔒</div>
                  <h3 className="font-semibold mb-2">Browser Lockdown</h3>
                  <p className="text-sm text-calm-600">Prevents tab switching, screenshots, and unauthorized access</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3">📊</div>
                  <h3 className="font-semibold mb-2">Violation Tracking</h3>
                  <p className="text-sm text-calm-600">Logs all suspicious activities during exam</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3">🎓</div>
                  <h3 className="font-semibold mb-2">Study Tools</h3>
                  <p className="text-sm text-calm-600">Optional chatbot and calculator access</p>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <>
            {/* Active Exam Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                  Exam in Progress
                </CardTitle>
                <CardDescription>Browser is locked in secure mode</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-calm-50 dark:bg-calm-800 rounded-lg">
                    <div className="text-2xl font-bold text-focus-600">{status?.timeRemaining || 0}</div>
                    <div className="text-sm text-calm-600">Minutes Remaining</div>
                  </div>

                  <div className="text-center p-4 bg-calm-50 dark:bg-calm-800 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{status?.timeElapsed || 0}</div>
                    <div className="text-sm text-calm-600">Minutes Elapsed</div>
                  </div>

                  <div className="text-center p-4 bg-calm-50 dark:bg-calm-800 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{status?.violations || 0}</div>
                    <div className="text-sm text-calm-600">Violations</div>
                  </div>

                  <div className="text-center p-4 bg-calm-50 dark:bg-calm-800 rounded-lg">
                    <Badge variant={status?.fullscreen ? 'success' : 'danger'}>
                      {status?.fullscreen ? '✓ Fullscreen' : '✗ Not Fullscreen'}
                    </Badge>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">⚠️ Exam Mode Active</h4>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                    <li>• Screenshots are disabled</li>
                    <li>• Tab switching is being monitored</li>
                    <li>• Browser navigation is blocked</li>
                    <li>• All violations are being logged</li>
                  </ul>
                </div>

                <Button onClick={endExam} variant="destructive" size="lg" className="w-full">
                  ⏹️ End Exam & Generate Report
                </Button>

              </CardContent>
            </Card>
          </>
        )}

      </div>
    </div>
  );
};

export default ExamMode;