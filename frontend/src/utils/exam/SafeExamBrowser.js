// Safe Exam Browser - Lockdown Mode
class SafeExamBrowser {
  constructor() {
    this.isLocked = false;
    this.violations = [];
    this.originalTitle = document.title;
    this.blockedKeys = [];
    this.monitoringInterval = null;
  }

  // Start exam lockdown mode
  async startExamMode(config = {}) {
    const {
      allowChatbot = true,
      allowCalculator = true,
      blockScreenshots = true,
      blockTabSwitch = true,
      blockDevTools = true,
      blockCopyPaste = true,
      fullscreen = true,
      duration = 60 // minutes
    } = config;

    this.isLocked = true;
    this.violations = [];

    console.log('🔒 Safe Exam Mode Activated');

    try {
      // 1. Enter fullscreen
      if (fullscreen) {
        await this.enterFullscreen();
      }

      // 2. Block keyboard shortcuts
      if (blockScreenshots || blockDevTools || blockCopyPaste) {
        this.blockKeyboardShortcuts(blockScreenshots, blockDevTools, blockCopyPaste);
      }

      // 3. Detect tab switching
      if (blockTabSwitch) {
        this.detectTabSwitch();
      }

      // 4. Block right-click
      this.blockRightClick();

      // 5. Disable text selection
      this.disableTextSelection();

      // 6. Monitor for violations
      this.startViolationMonitoring();

      // 7. Prevent page navigation
      this.preventNavigation();

      // 8. Block browser back/forward
      this.blockBrowserNavigation();

      // Store exam start time
      localStorage.setItem('examStartTime', Date.now());
      localStorage.setItem('examDuration', duration);
      localStorage.setItem('examMode', 'active');

      return {
        success: true,
        message: 'Exam mode activated. Browser is now locked.',
        config: config
      };
    } catch (error) {
      console.error('Error starting exam mode:', error);
      return {
        success: false,
        message: 'Failed to start exam mode: ' + error.message
      };
    }
  }

  // Exit exam mode
  exitExamMode() {
    this.isLocked = false;

    // Remove all event listeners
    document.removeEventListener('keydown', this.keydownHandler);
    document.removeEventListener('contextmenu', this.contextmenuHandler);
    document.removeEventListener('visibilitychange', this.visibilityHandler);
    document.removeEventListener('copy', this.copyHandler);
    document.removeEventListener('paste', this.pasteHandler);
    window.removeEventListener('beforeunload', this.beforeunloadHandler);

    // Exit fullscreen
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }

    // Re-enable text selection
    document.body.style.userSelect = 'auto';
    document.body.style.webkitUserSelect = 'auto';

    // Clear monitoring
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    localStorage.removeItem('examMode');

    console.log('🔓 Safe Exam Mode Deactivated');
    console.log('Violations detected:', this.violations.length);

    return {
      success: true,
      violations: this.violations,
      violationCount: this.violations.length
    };
  }

  // Enter fullscreen mode
  async enterFullscreen() {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        console.log('✅ Fullscreen activated');
      } else {
        console.warn('Fullscreen API not supported');
      }
    } catch (error) {
      console.warn('Fullscreen failed:', error.message);
      // Don't log as violation if user denied permission
    }

    // Monitor fullscreen exit
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement && this.isLocked) {
        this.logViolation('fullscreen_exit', 'User exited fullscreen during exam');
        // Try to re-enter fullscreen
        setTimeout(() => {
          if (this.isLocked && document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {
              console.warn('Could not re-enter fullscreen');
            });
          }
        }, 100);
      }
    });
  }

  // Block keyboard shortcuts
  blockKeyboardShortcuts(blockScreenshots, blockDevTools, blockCopyPaste) {
    this.keydownHandler = (e) => {
      if (!this.isLocked) return;

      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const alt = e.altKey;

      // Block screenshot shortcuts
      if (blockScreenshots) {
        if (key === 'printscreen' || (ctrl && shift && key === 's')) {
          e.preventDefault();
          this.logViolation('screenshot_attempt', 'Screenshot attempt blocked');
          this.showWarning('Screenshots are disabled during exam mode');
          return false;
        }
      }

      // Block developer tools
      if (blockDevTools) {
        if ((ctrl && shift && key === 'i') || // DevTools
            (ctrl && shift && key === 'j') || // Console
            (ctrl && shift && key === 'c') || // Inspect
            (ctrl && key === 'u') ||           // View Source
            key === 'f12') {                   // DevTools
          e.preventDefault();
          this.logViolation('devtools_attempt', 'Developer tools access blocked');
          this.showWarning('Developer tools are disabled');
          return false;
        }
      }

      // Block copy/paste
      if (blockCopyPaste) {
        if ((ctrl && key === 'c') || (ctrl && key === 'v') || (ctrl && key === 'x')) {
          e.preventDefault();
          this.logViolation('copy_paste_attempt', 'Copy/paste blocked');
          this.showWarning('Copy/paste is disabled during exam');
          return false;
        }
      }

      // Block refresh
      if ((ctrl && key === 'r') || key === 'f5') {
        e.preventDefault();
        this.logViolation('refresh_attempt', 'Page refresh blocked');
        this.showWarning('Page refresh is disabled');
        return false;
      }

      // Block new tab/window
      if ((ctrl && key === 't') || (ctrl && key === 'n') || (ctrl && shift && key === 'n')) {
        e.preventDefault();
        this.logViolation('new_tab_attempt', 'New tab/window blocked');
        this.showWarning('Opening new tabs is disabled');
        return false;
      }

      // Block Alt+Tab (Windows)
      if (alt && key === 'tab') {
        e.preventDefault();
        this.logViolation('alt_tab_attempt', 'Alt+Tab blocked');
        return false;
      }
    };

    document.addEventListener('keydown', this.keydownHandler);
  }

  // Detect tab switching
  detectTabSwitch() {
    this.visibilityHandler = () => {
      if (document.hidden && this.isLocked) {
        this.logViolation('tab_switch', 'User switched to another tab/window');
        this.showWarning('⚠️ Tab switching detected! This has been logged.');
      }
    };

    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  // Block right-click
  blockRightClick() {
    this.contextmenuHandler = (e) => {
      if (this.isLocked) {
        e.preventDefault();
        this.logViolation('right_click', 'Right-click blocked');
        this.showWarning('Right-click is disabled during exam');
        return false;
      }
    };

    document.addEventListener('contextmenu', this.contextmenuHandler);
  }

  // Disable text selection
  disableTextSelection() {
    if (this.isLocked) {
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
    }
  }

  // Block copy/paste events
  blockCopyPaste() {
    this.copyHandler = (e) => {
      if (this.isLocked) {
        e.preventDefault();
        this.logViolation('copy_attempt', 'Copy blocked');
      }
    };

    this.pasteHandler = (e) => {
      if (this.isLocked) {
        e.preventDefault();
        this.logViolation('paste_attempt', 'Paste blocked');
      }
    };

    document.addEventListener('copy', this.copyHandler);
    document.addEventListener('paste', this.pasteHandler);
  }

  // Prevent page navigation
  preventNavigation() {
    this.beforeunloadHandler = (e) => {
      if (this.isLocked) {
        e.preventDefault();
        e.returnValue = 'Exam is in progress. Are you sure you want to leave?';
        this.logViolation('navigation_attempt', 'User tried to leave page');
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', this.beforeunloadHandler);
  }

  // Block browser back/forward
  blockBrowserNavigation() {
    // Push a dummy state to prevent back button
    history.pushState(null, null, location.href);
    
    window.addEventListener('popstate', () => {
      if (this.isLocked) {
        history.pushState(null, null, location.href);
        this.logViolation('back_button', 'Back button pressed');
        this.showWarning('Navigation is disabled during exam');
      }
    });
  }

  // Start violation monitoring
  startViolationMonitoring() {
    this.monitoringInterval = setInterval(() => {
      if (!this.isLocked) return;

      // Check if still in fullscreen
      if (!document.fullscreenElement) {
        this.logViolation('fullscreen_violation', 'Not in fullscreen mode');
      }

      // Check exam time remaining
      const startTime = parseInt(localStorage.getItem('examStartTime'));
      const duration = parseInt(localStorage.getItem('examDuration'));
      const elapsed = (Date.now() - startTime) / 1000 / 60; // minutes

      if (elapsed >= duration) {
        this.showWarning('⏰ Exam time is up!');
        this.exitExamMode();
      }
    }, 5000); // Check every 5 seconds
  }

  // Log violation
  logViolation(type, description) {
    const violation = {
      type,
      description,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };

    this.violations.push(violation);

    // Store in localStorage for reporting
    const storedViolations = JSON.parse(localStorage.getItem('examViolations') || '[]');
    storedViolations.push(violation);
    localStorage.setItem('examViolations', JSON.stringify(storedViolations));

    console.warn('🚨 Violation:', violation);
  }

  // Show warning message
  showWarning(message) {
    // Create warning overlay
    const warning = document.createElement('div');
    warning.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #ef4444;
      color: white;
      padding: 15px 30px;
      border-radius: 10px;
      font-weight: bold;
      z-index: 999999;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      animation: slideDown 0.3s ease-out;
    `;
    warning.textContent = message;

    document.body.appendChild(warning);

    setTimeout(() => {
      warning.remove();
    }, 3000);
  }

  // Get exam status
  getStatus() {
    const startTime = parseInt(localStorage.getItem('examStartTime'));
    const duration = parseInt(localStorage.getItem('examDuration'));
    const elapsed = startTime ? (Date.now() - startTime) / 1000 / 60 : 0;
    const remaining = duration - elapsed;

    return {
      isActive: this.isLocked,
      violations: this.violations.length,
      timeElapsed: Math.floor(elapsed),
      timeRemaining: Math.floor(Math.max(0, remaining)),
      fullscreen: !!document.fullscreenElement
    };
  }

  // Generate exam report
  generateReport() {
    const violations = JSON.parse(localStorage.getItem('examViolations') || '[]');
    const startTime = parseInt(localStorage.getItem('examStartTime'));
    const duration = parseInt(localStorage.getItem('examDuration'));

    return {
      examStartTime: new Date(startTime).toISOString(),
      examDuration: duration,
      totalViolations: violations.length,
      violations: violations,
      violationsByType: this.groupViolationsByType(violations),
      examCompleted: !this.isLocked,
      timestamp: new Date().toISOString()
    };
  }

  groupViolationsByType(violations) {
    return violations.reduce((acc, v) => {
      acc[v.type] = (acc[v.type] || 0) + 1;
      return acc;
    }, {});
  }
}

export default SafeExamBrowser;