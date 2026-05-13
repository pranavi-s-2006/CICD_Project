import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './Card';
import Button from './Button';
import Badge from './Badge';

const StudyModePanel = ({ studyModeDetector, onModeChange }) => {
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [customSites, setCustomSites] = useState('');
  const [studyStats, setStudyStats] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    // Listen for study mode events
    const handleProductiveSwitch = (e) => {
      console.log('✅ Productive switch:', e.detail.reason);
      updateStats();
    };

    const handleDistraction = (e) => {
      console.log('❌ Distraction:', e.detail.reason);
      updateStats();
    };

    window.addEventListener('productiveSwitch', handleProductiveSwitch);
    window.addEventListener('actualDistraction', handleDistraction);

    // Update stats every 10 seconds
    const interval = setInterval(updateStats, 10000);

    return () => {
      window.removeEventListener('productiveSwitch', handleProductiveSwitch);
      window.removeEventListener('actualDistraction', handleDistraction);
      clearInterval(interval);
    };
  }, []);

  const updateStats = () => {
    if (studyModeDetector) {
      const stats = studyModeDetector.getStudyStats();
      const recs = studyModeDetector.getSmartRecommendations();
      setStudyStats(stats);
      setRecommendations(recs);
    }
  };

  const toggleStudyMode = () => {
    if (!isStudyMode) {
      // Enable study mode
      const additionalSites = customSites
        .split(',')
        .map(site => site.trim())
        .filter(site => site.length > 0);
      
      studyModeDetector.enableStudyMode(additionalSites);
      setIsStudyMode(true);
      onModeChange?.(true);
    } else {
      // Disable study mode
      studyModeDetector.disableStudyMode();
      setIsStudyMode(false);
      onModeChange?.(false);
    }
    
    updateStats();
  };

  const presetStudyTypes = [
    {
      name: 'Research & Writing',
      sites: ['scholar.google.com', 'jstor.org', 'researchgate.net', 'docs.google.com']
    },
    {
      name: 'Programming',
      sites: ['stackoverflow.com', 'github.com', 'developer.mozilla.org', 'w3schools.com']
    },
    {
      name: 'Online Learning',
      sites: ['coursera.org', 'edx.org', 'udemy.com', 'khanacademy.org']
    },
    {
      name: 'Language Learning',
      sites: ['duolingo.com', 'babbel.com', 'memrise.com', 'lingoda.com']
    }
  ];

  const addPresetSites = (sites) => {
    const current = customSites ? customSites + ', ' : '';
    setCustomSites(current + sites.join(', '));
  };

  return (
    <Card className={`transition-all ${isStudyMode ? 'border-green-300 bg-green-50 dark:bg-green-900/20' : ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>📚</span>
          Smart Study Mode
          {isStudyMode && <Badge variant="success">Active</Badge>}
        </CardTitle>
        <CardDescription>
          Distinguishes between productive study tabs and actual distractions
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        
        {/* Study Mode Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-calm-50 dark:bg-calm-800">
          <div>
            <h4 className="font-semibold text-calm-900 dark:text-calm-100">
              {isStudyMode ? 'Study Mode Active' : 'Enable Study Mode'}
            </h4>
            <p className="text-sm text-calm-600 dark:text-calm-400">
              {isStudyMode 
                ? 'Productive tab switches won\'t count as distractions'
                : 'Allow productive tab switches for research and note-taking'
              }
            </p>
          </div>
          <Button 
            onClick={toggleStudyMode}
            variant={isStudyMode ? 'destructive' : 'default'}
          >
            {isStudyMode ? 'Disable' : 'Enable'}
          </Button>
        </div>

        {/* Custom Sites Input */}
        {!isStudyMode && (
          <div>
            <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
              Additional Study Sites (optional)
            </label>
            <textarea
              value={customSites}
              onChange={(e) => setCustomSites(e.target.value)}
              placeholder="wikipedia.org, docs.google.com, notion.so"
              className="w-full px-4 py-3 rounded-xl border border-calm-200 dark:border-calm-700 bg-white dark:bg-calm-800 focus:ring-2 focus:ring-focus-500 focus:border-transparent resize-none"
              rows={3}
            />
            <p className="text-xs text-calm-500 mt-1">
              Separate multiple sites with commas. Common study sites are already included.
            </p>
          </div>
        )}

        {/* Preset Study Types */}
        {!isStudyMode && (
          <div>
            <h4 className="font-semibold text-calm-900 dark:text-calm-100 mb-3">
              Quick Setup for Common Study Types
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {presetStudyTypes.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => addPresetSites(preset.sites)}
                  className="p-3 text-left rounded-xl border border-calm-200 dark:border-calm-700 hover:border-focus-300 dark:hover:border-focus-600 transition-all"
                >
                  <div className="font-medium text-calm-900 dark:text-calm-100 mb-1">
                    {preset.name}
                  </div>
                  <div className="text-xs text-calm-600 dark:text-calm-400">
                    {preset.sites.length} sites included
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Study Stats */}
        {isStudyMode && studyStats && (
          <div>
            <h4 className="font-semibold text-calm-900 dark:text-calm-100 mb-3">
              Study Session Analytics
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                <div className="text-2xl font-bold text-green-600">
                  {studyStats.productiveSwitches}
                </div>
                <div className="text-xs text-green-700 dark:text-green-300">
                  Productive Switches
                </div>
              </div>
              
              <div className="text-center p-3 rounded-lg bg-red-100 dark:bg-red-900/30">
                <div className="text-2xl font-bold text-red-600">
                  {studyStats.distractingSwitches}
                </div>
                <div className="text-xs text-red-700 dark:text-red-300">
                  Distractions
                </div>
              </div>
              
              <div className="text-center p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(studyStats.focusEfficiency)}%
                </div>
                <div className="text-xs text-blue-700 dark:text-blue-300">
                  Focus Efficiency
                </div>
              </div>
              
              <div className="text-center p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <div className="text-2xl font-bold text-purple-600">
                  {studyStats.allowedSites.length}
                </div>
                <div className="text-xs text-purple-700 dark:text-purple-300">
                  Study Sites
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            {studyStats.productiveTabs.length > 0 && (
              <div className="mb-4">
                <h5 className="text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                  Recent Productive Sites:
                </h5>
                <div className="flex flex-wrap gap-2">
                  {studyStats.productiveTabs.slice(-5).map((site, index) => (
                    <Badge key={index} variant="success" className="text-xs">
                      {new URL(site).hostname}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Smart Recommendations */}
        {recommendations.length > 0 && (
          <div>
            <h4 className="font-semibold text-calm-900 dark:text-calm-100 mb-3">
              Smart Recommendations
            </h4>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border-l-4 ${
                    rec.type === 'success' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
                    rec.type === 'warning' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                    'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  }`}
                >
                  <div className="font-medium text-calm-900 dark:text-calm-100 mb-1">
                    {rec.message}
                  </div>
                  <div className="text-sm text-calm-600 dark:text-calm-400">
                    {rec.action}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* How It Works */}
        <div className="p-4 rounded-xl bg-focus-50 dark:bg-focus-900/20 border border-focus-200 dark:border-focus-800">
          <h4 className="font-semibold text-focus-900 dark:text-focus-100 mb-2">
            🧠 How Smart Study Mode Works
          </h4>
          <ul className="text-sm text-focus-700 dark:text-focus-300 space-y-1">
            <li>• <strong>Quick switches</strong> (&lt;3s) = Reference lookup ✅</li>
            <li>• <strong>Medium switches</strong> (3-30s) = Reading/note-taking ✅</li>
            <li>• <strong>Study sites</strong> = Always productive ✅</li>
            <li>• <strong>Social media</strong> = Always distraction ❌</li>
            <li>• <strong>Long absences</strong> (&gt;5min) = Likely distraction ❌</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudyModePanel;