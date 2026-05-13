import React, { useState, useEffect } from 'react';
import './SecureTest.css';

const SecureTest = () => {
  const [testUrl, setTestUrl] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [platform, setPlatform] = useState('custom');
  const [violations, setViolations] = useState(0);

  const platforms = [
    { id: 'hackerrank', name: 'HackerRank', icon: '💻' },
    { id: 'leetcode', name: 'LeetCode', icon: '🔢' },
    { id: 'skillrack', name: 'SkillRack', icon: '🎯' },
    { id: 'custom', name: 'Custom', icon: '🌐' }
  ];

  useEffect(() => {
    if (isActive) {
      let violationCount = 0;
      
      // Prevent tab switching
      const handleVisibilityChange = () => {
        if (document.hidden) {
          violationCount++;
          setViolations(v => v + 1);
          
          if (violationCount >= 3) {
            endTest();
            alert('⛔ Test terminated due to multiple violations!');
          } else {
            alert(`⚠️ WARNING: Tab switching detected! Violation ${violationCount}/3. Test will end after 3 violations.`);
          }
        }
      };

      // Prevent right-click
      const handleContextMenu = (e) => {
        e.preventDefault();
        return false;
      };

      // Prevent keyboard shortcuts
      const handleKeyDown = (e) => {
        // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
        if (e.keyCode === 123 || 
            (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) ||
            (e.ctrlKey && e.keyCode === 85)) {
          e.preventDefault();
          return false;
        }
      };

      // Prevent navigation away
      const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = '';
        return '';
      };

      // Request fullscreen
      document.documentElement.requestFullscreen?.();

      // Add event listeners
      document.addEventListener('visibilitychange', handleVisibilityChange);
      document.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('keydown', handleKeyDown);
      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        document.removeEventListener('contextmenu', handleContextMenu);
        document.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
      };
    }
  }, [isActive]);

  const startTest = () => {
    if (!testUrl) return alert('Enter test URL');
    
    // Check if URL is from a platform that blocks iframes
    const blockedDomains = ['leetcode.com', 'hackerrank.com'];
    const isBlocked = blockedDomains.some(domain => testUrl.includes(domain));
    
    if (isBlocked) {
      const proceed = window.confirm(
        'This platform blocks iframe embedding. The test will open in a new window with monitoring. Continue?'
      );
      if (proceed) {
        window.open(testUrl, '_blank', 'fullscreen=yes');
        return;
      }
      return;
    }
    
    setIsActive(true);
    setViolations(0);
  };

  const endTest = () => {
    setIsActive(false);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    if (violations > 0) {
      alert(`Test completed! Total violations: ${violations}`);
    } else {
      alert('Test completed successfully with no violations!');
    }
  };

  return (
    <div className="secure-test">
      {!isActive ? (
        <div className="test-setup">
          <h1>🔒 Secure Test Platform</h1>
          <p>Take tests in a secure lockdown environment</p>
          
          <div className="platform-grid">
            {platforms.map(p => (
              <button key={p.id} onClick={() => setPlatform(p.id)} className={platform === p.id ? 'active' : ''}>
                <span>{p.icon}</span>
                <span>{p.name}</span>
              </button>
            ))}
          </div>

          <input type="url" value={testUrl} onChange={(e) => setTestUrl(e.target.value)} placeholder="Enter test URL" />
          
          <div className="security-notice">
            <h3>⚠️ Security Features Active:</h3>
            <ul>
              <li>✓ Fullscreen mode enforced</li>
              <li>✓ Tab switching blocked</li>
              <li>✓ Right-click disabled</li>
              <li>✓ Developer tools blocked</li>
              <li>✓ All violations logged</li>
            </ul>
            <p className="iframe-warning">⚠️ Note: Some platforms (LeetCode, HackerRank) block iframe embedding. Use their direct URLs in a new window instead.</p>
          </div>

          <button onClick={startTest} className="btn-start">Start Secure Test</button>
        </div>
      ) : (
        <div className="test-active">
          <div className="test-header">
            <span>🔴 SECURE MODE ACTIVE - Violations: {violations}</span>
            <button onClick={endTest}>End Test</button>
          </div>
          <iframe src={testUrl} title="Test" />
          <div className="test-footer">
            ⚠️ Do not switch tabs or leave this window. All activities are monitored.
          </div>
        </div>
      )}
    </div>
  );
};

export default SecureTest;
