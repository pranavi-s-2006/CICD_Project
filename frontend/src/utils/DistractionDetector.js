// Real phone and email distraction detection
class DistractionDetector {
  constructor() {
    this.phoneDistractions = 0;
    this.emailDistractions = 0;
    this.isMonitoring = false;
    this.lastActivity = Date.now();
    this.tabSwitches = [];
    this.urlChanges = [];
  }

  // 1. PHONE DETECTION - Multiple signals
  startPhoneDetection() {
    // A) Tab visibility changes (phone checking pattern)
    document.addEventListener('visibilitychange', () => {
      if (!this.isMonitoring) return;
      
      const now = Date.now();
      
      if (document.hidden) {
        this.tabLeaveTime = now;
      } else {
        // User returned to tab
        if (this.tabLeaveTime) {
          const awayTime = now - this.tabLeaveTime;
          
          // Short absence (5-30 seconds) = likely phone check
          if (awayTime > 5000 && awayTime < 30000) {
            this.phoneDistractions++;
            this.triggerPhoneDistraction('Quick tab switch - likely phone check');
          }
          
          // Very short absence (1-5 seconds) = notification glance
          if (awayTime > 1000 && awayTime < 5000) {
            this.phoneDistractions += 0.5; // Half point for quick glance
            this.triggerPhoneDistraction('Quick glance - notification check');
          }
        }
      }
    });

    // B) Window focus/blur events
    let focusLossCount = 0;
    
    window.addEventListener('blur', () => {
      if (!this.isMonitoring) return;
      
      focusLossCount++;
      this.lastActivity = Date.now();
      
      // Multiple focus losses in short time = phone distraction pattern
      setTimeout(() => {
        if (focusLossCount > 2) {
          this.phoneDistractions++;
          this.triggerPhoneDistraction('Multiple focus losses - phone usage detected');
        }
        focusLossCount = 0;
      }, 10000); // Reset after 10 seconds
    });

    // C) Mouse/keyboard inactivity detection
    let inactivityTimer;
    
    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      this.lastActivity = Date.now();
      
      inactivityTimer = setTimeout(() => {
        if (this.isMonitoring) {
          // Long inactivity during session = likely phone use
          this.phoneDistractions++;
          this.triggerPhoneDistraction('Extended inactivity - possible phone use');
        }
      }, 120000); // 2 minutes of inactivity
    };

    document.addEventListener('mousemove', resetInactivityTimer);
    document.addEventListener('keypress', resetInactivityTimer);
    document.addEventListener('click', resetInactivityTimer);

    // D) Device orientation changes (mobile)
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', () => {
        if (this.isMonitoring) {
          this.phoneDistractions += 0.3;
          this.triggerPhoneDistraction('Device orientation change');
        }
      });
    }
  }

  // 2. EMAIL DETECTION - URL and behavior patterns
  startEmailDetection() {
    // A) URL monitoring for email sites
    const emailDomains = [
      'gmail.com', 'outlook.com', 'yahoo.com', 'mail.google.com',
      'outlook.live.com', 'mail.yahoo.com', 'protonmail.com'
    ];

    // Monitor URL changes (for single-page apps)
    let lastUrl = window.location.href;
    
    const checkUrlChange = () => {
      if (!this.isMonitoring) return;
      
      const currentUrl = window.location.href;
      
      if (currentUrl !== lastUrl) {
        // Check if navigating to email
        const isEmailSite = emailDomains.some(domain => 
          currentUrl.includes(domain)
        );
        
        if (isEmailSite) {
          this.emailDistractions++;
          this.triggerEmailDistraction('Navigated to email site');
        }
        
        lastUrl = currentUrl;
      }
    };

    // Check URL changes every 2 seconds
    setInterval(checkUrlChange, 2000);

    // B) New tab/window detection
    let windowCount = 1;
    
    window.addEventListener('beforeunload', () => {
      // User is leaving - might be going to email
      if (this.isMonitoring) {
        setTimeout(() => {
          // If they come back quickly, might have checked email
          this.emailDistractions += 0.5;
          this.triggerEmailDistraction('Quick navigation - possible email check');
        }, 5000);
      }
    });

    // C) Keyboard shortcuts for email
    document.addEventListener('keydown', (e) => {
      if (!this.isMonitoring) return;
      
      // Common email shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        // New tab - might be for email
        setTimeout(() => {
          this.emailDistractions += 0.3;
          this.triggerEmailDistraction('New tab opened - possible email check');
        }, 1000);
      }
      
      // Alt+Tab (Windows) or Cmd+Tab (Mac)
      if ((e.altKey && e.key === 'Tab') || (e.metaKey && e.key === 'Tab')) {
        this.emailDistractions += 0.2;
        this.triggerEmailDistraction('App switching - possible email check');
      }
    });

    // D) Notification API detection
    if ('Notification' in window) {
      // Request permission to detect notifications
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          // Monitor for notification interactions
          document.addEventListener('click', (e) => {
            // If clicking during focus session, might be notification
            if (this.isMonitoring && Date.now() - this.lastActivity > 30000) {
              this.emailDistractions += 0.4;
              this.triggerEmailDistraction('Click after inactivity - possible notification');
            }
          });
        }
      });
    }
  }

  // 3. ADVANCED BEHAVIORAL DETECTION
  startBehavioralDetection() {
    let typingPattern = [];
    let clickPattern = [];
    
    // Monitor typing patterns
    document.addEventListener('keydown', (e) => {
      if (!this.isMonitoring) return;
      
      typingPattern.push({
        timestamp: Date.now(),
        key: e.key,
        interval: typingPattern.length > 0 ? 
          Date.now() - typingPattern[typingPattern.length - 1].timestamp : 0
      });
      
      // Keep only recent typing
      if (typingPattern.length > 20) {
        typingPattern = typingPattern.slice(-20);
      }
      
      // Detect distracted typing (irregular intervals)
      if (typingPattern.length > 10) {
        const intervals = typingPattern.map(t => t.interval).filter(i => i > 0);
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const variance = intervals.reduce((acc, val) => 
          acc + Math.pow(val - avgInterval, 2), 0) / intervals.length;
        
        // High variance = distracted typing = possible phone/email checking
        if (variance > 15000) {
          this.phoneDistractions += 0.1;
          this.emailDistractions += 0.1;
        }
      }
    });

    // Monitor mouse movement patterns
    let mouseMovements = [];
    
    document.addEventListener('mousemove', (e) => {
      if (!this.isMonitoring) return;
      
      mouseMovements.push({
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now()
      });
      
      if (mouseMovements.length > 50) {
        mouseMovements = mouseMovements.slice(-50);
      }
      
      // Detect erratic mouse movement (multitasking indicator)
      if (mouseMovements.length > 10) {
        const recent = mouseMovements.slice(-10);
        let totalDistance = 0;
        
        for (let i = 1; i < recent.length; i++) {
          const dx = recent[i].x - recent[i-1].x;
          const dy = recent[i].y - recent[i-1].y;
          totalDistance += Math.sqrt(dx*dx + dy*dy);
        }
        
        // Very erratic movement = possible multitasking
        if (totalDistance > 2000) {
          this.phoneDistractions += 0.05;
          this.emailDistractions += 0.05;
        }
      }
    });
  }

  // Trigger phone distraction event
  triggerPhoneDistraction(reason) {
    console.log(`📱 Phone distraction detected: ${reason}`);
    
    // Dispatch custom event for UI updates
    window.dispatchEvent(new CustomEvent('phoneDistraction', {
      detail: { reason, count: this.phoneDistractions }
    }));
  }

  // Trigger email distraction event
  triggerEmailDistraction(reason) {
    console.log(`📧 Email distraction detected: ${reason}`);
    
    // Dispatch custom event for UI updates
    window.dispatchEvent(new CustomEvent('emailDistraction', {
      detail: { reason, count: this.emailDistractions }
    }));
  }

  // Start all detection
  startMonitoring() {
    this.isMonitoring = true;
    this.phoneDistractions = 0;
    this.emailDistractions = 0;
    
    this.startPhoneDetection();
    this.startEmailDetection();
    this.startBehavioralDetection();
    
    console.log('📱📧 Phone and email distraction detection started');
  }

  // Stop monitoring
  stopMonitoring() {
    this.isMonitoring = false;
    console.log('📱📧 Distraction detection stopped');
  }

  // Get current distraction counts
  getDistractionCounts() {
    return {
      phone: Math.round(this.phoneDistractions),
      email: Math.round(this.emailDistractions),
      total: Math.round(this.phoneDistractions + this.emailDistractions)
    };
  }
}

export default DistractionDetector;