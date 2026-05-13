// Real-time distraction alert system with notifications
class DistractionAlertSystem {
  constructor() {
    this.isMonitoring = false;
    this.distractionStartTime = null;
    this.currentDistraction = null;
    this.alertThresholds = {
      warning: 30, // 30 seconds - user customizable
      danger: 120, // 2 minutes - user customizable
      critical: 300 // 5 minutes - user customizable
    };
    this.notificationPermission = false;
    this.alertInterval = null;
    this.totalDistractionTime = 0;
    this.distractionSessions = [];
    this.audioContext = null;
    this.alarmEnabled = true;
    this.studyMode = false; // Smart study mode
    this.educationalMode = false; // Manual educational content tagging
    this.educationalStartTime = null;
    this.allowedStudySites = [
      'youtube.com/watch', 'coursera.org', 'edx.org', 'khanacademy.org',
      'stackoverflow.com', 'github.com', 'wikipedia.org', 'scholar.google.com'
    ];
  }

  // Manual educational content tagging
  markAsEducational() {
    this.educationalMode = true;
    this.educationalStartTime = Date.now();
    
    // Stop any current alerts
    if (this.alertInterval) {
      clearInterval(this.alertInterval);
      this.alertInterval = null;
    }
    
    // Show educational mode indicator
    this.showEducationalIndicator();
    
    console.log('📚 Educational content marked - Alerts disabled');
    
    // Auto-disable after 30 minutes to prevent abuse
    setTimeout(() => {
      if (this.educationalMode) {
        this.markAsEntertainment();
        console.log('📚 Educational mode auto-disabled after 30 minutes');
      }
    }, 30 * 60 * 1000);
  }
  
  markAsEntertainment() {
    this.educationalMode = false;
    this.educationalStartTime = null;
    
    // Remove educational indicator
    this.hideEducationalIndicator();
    
    // Resume normal distraction detection if currently away
    if (this.distractionStartTime && this.isMonitoring) {
      this.detectPotentialDistraction();
    }
    
    console.log('🎬 Entertainment mode - Alerts enabled');
  }

  // Enhanced educational content detection
  isEducationalContent() {
    // Get current page title and URL if available
    const currentTitle = document.title.toLowerCase();
    const currentUrl = window.location.href.toLowerCase();
    
    // Educational keywords in titles/URLs
    const educationalKeywords = [
      'tutorial', 'learn', 'education', 'course', 'lesson', 'lecture',
      'study', 'research', 'academic', 'university', 'college', 'school',
      'training', 'guide', 'how to', 'documentation', 'manual', 'reference',
      'wiki', 'knowledge', 'science', 'math', 'programming', 'coding',
      'development', 'engineering', 'physics', 'chemistry', 'biology',
      'history', 'literature', 'language', 'grammar', 'vocabulary'
    ];
    
    // Check if current page contains educational keywords
    const hasEducationalKeywords = educationalKeywords.some(keyword => 
      currentTitle.includes(keyword) || currentUrl.includes(keyword)
    );
    
    // Educational file extensions
    const educationalExtensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt', '.md'];
    const hasEducationalExtension = educationalExtensions.some(ext => 
      currentUrl.includes(ext)
    );
    
    // Educational domains
    const educationalDomains = [
      'wikipedia.org', 'scholar.google.com', 'coursera.org', 'edx.org',
      'khanacademy.org', 'stackoverflow.com', 'github.com', 'docs.google.com',
      'drive.google.com', 'dropbox.com', 'onedrive.com', 'notion.so',
      'evernote.com', 'onenote.com', 'medium.com', 'dev.to', 'freecodecamp.org',
      'w3schools.com', 'mdn.mozilla.org'
    ];
    
    const hasEducationalDomain = educationalDomains.some(domain => 
      currentUrl.includes(domain)
    );
    
    return hasEducationalKeywords || hasEducationalExtension || hasEducationalDomain;
  }
  
  // Smart educational detection for external tabs
  detectEducationalActivity() {
    const now = Date.now();
    const timeAway = now - this.distractionStartTime;
    
    // Quick reference checks (< 2 minutes) - likely educational
    if (timeAway < 120000) {
      console.log('✅ Quick reference detected - likely educational');
      return true;
    }
    
    // During study hours with medium duration - possibly educational
    const currentHour = new Date().getHours();
    if (currentHour >= 8 && currentHour <= 23 && timeAway >= 120000 && timeAway <= 600000) {
      console.log('✅ Study hours + medium duration - possibly educational');
      return true;
    }
    
    // Document reading duration - likely educational
    if (timeAway >= 300000 && timeAway <= 1800000) {
      console.log('✅ Document reading duration - likely educational');
      return true;
    }
    
    return false;
  }
  
  // Show educational mode indicator
  showEducationalIndicator() {
    // Remove existing indicator
    const existing = document.querySelector('.educational-indicator');
    if (existing) existing.remove();
    
    const indicator = document.createElement('div');
    indicator.className = 'educational-indicator';
    indicator.innerHTML = `
      <div style="
        position: fixed; bottom: 20px; right: 20px; z-index: 9999;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white; padding: 12px 16px; border-radius: 12px;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        font-family: system-ui; font-size: 14px; font-weight: 500;
        display: flex; align-items: center; gap: 8px;
        cursor: pointer;
      " onclick="window.dispatchEvent(new CustomEvent('toggleEducationalMode'))">
        <div style="
          width: 8px; height: 8px; background: #fff;
          border-radius: 50%; animation: pulse 2s infinite;
        "></div>
        📚 Educational Mode Active - No Alerts
      </div>
      <style>
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      </style>
    `;
    
    document.body.appendChild(indicator);
  }
  
  // Hide educational indicator
  hideEducationalIndicator() {
    const indicator = document.querySelector('.educational-indicator');
    if (indicator) indicator.remove();
  }

  // Enable study mode
  enableStudyMode() {
    this.studyMode = true;
    console.log('📚 Study mode enabled - Educational content allowed');
  }

  // Disable study mode
  disableStudyMode() {
    this.studyMode = false;
    console.log('📚 Study mode disabled - All content monitored');
  }

  // Initialize notification system (browser notifications)
  async initializeNotifications() {
    if (!('Notification' in window)) {
      console.log('Browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.notificationPermission = true;
      this.showWelcomeNotification();
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      this.notificationPermission = permission === 'granted';
      
      if (this.notificationPermission) {
        this.showWelcomeNotification();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Notification permission error:', error);
      return false;
    }
  }

  // Play alarm sound
  async playAlarmSound(level) {
    if (!this.alarmEnabled) return;
    
    try {
      // Use multiple approaches to ensure sound plays across tabs
      
      // Method 1: HTML5 Audio with higher volume
      const audio = new Audio();
      audio.volume = 0.8;
      
      // Create a longer, more noticeable beep sound
      const sampleRate = 44100;
      const duration = level === 'critical' ? 0.8 : 0.4;
      const frequency = level === 'warning' ? 800 : level === 'danger' ? 1000 : 1200;
      
      // Generate WAV file data
      const samples = Math.floor(sampleRate * duration);
      const buffer = new ArrayBuffer(44 + samples * 2);
      const view = new DataView(buffer);
      
      // WAV header
      const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };
      
      writeString(0, 'RIFF');
      view.setUint32(4, 36 + samples * 2, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeString(36, 'data');
      view.setUint32(40, samples * 2, true);
      
      // Generate sine wave
      for (let i = 0; i < samples; i++) {
        const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.8 * 32767;
        view.setInt16(44 + i * 2, sample, true);
      }
      
      // Convert to blob and play
      const blob = new Blob([buffer], { type: 'audio/wav' });
      audio.src = URL.createObjectURL(blob);
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log('Audio play failed:', error);
          this.playSystemBeep(level);
        });
      }
      
      // For danger and critical, play multiple times
      if (level === 'danger') {
        setTimeout(() => {
          const audio2 = audio.cloneNode();
          audio2.play().catch(() => {});
        }, 400);
      } else if (level === 'critical') {
        for (let i = 1; i < 3; i++) {
          setTimeout(() => {
            const audioClone = audio.cloneNode();
            audioClone.play().catch(() => {});
          }, i * 500);
        }
      }
      
      console.log(`🔊 ${level} alarm sound played`);
      
    } catch (error) {
      console.log('Custom audio failed:', error);
      this.playSystemBeep(level);
    }
  }
  
  // System beep fallback
  playSystemBeep(level) {
    try {
      // Try to use system beep sound
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
      audio.volume = 0.9;
      audio.play();
      
      if (level !== 'warning') {
        setTimeout(() => {
          const audio2 = new Audio(audio.src);
          audio2.volume = 0.9;
          audio2.play();
        }, 300);
      }
      
    } catch (error) {
      console.log('System beep failed:', error);
    }
  }

  // Show welcome notification
  showWelcomeNotification() {
    const welcomeDiv = document.createElement('div');
    welcomeDiv.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 9999;
      background: #10b981; color: white; padding: 16px 20px;
      border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      font-family: system-ui; font-size: 14px; max-width: 300px;
      animation: slideIn 0.3s ease-out;
    `;
    
    welcomeDiv.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 4px;">🎯 FOCUSLOOM Alert System Active</div>
      <div>I'll notify you when you visit distracting sites during focus sessions.</div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(welcomeDiv);
    
    setTimeout(() => {
      welcomeDiv.style.animation = 'slideIn 0.3s ease-out reverse';
      setTimeout(() => {
        welcomeDiv.remove();
        style.remove();
      }, 300);
    }, 3000);
    
    console.log('🔔 Welcome notification sent');
  }

  // Start monitoring for distractions
  startMonitoring() {
    this.isMonitoring = true;
    this.totalDistractionTime = 0;
    this.distractionSessions = [];
    
    // Monitor tab visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // User left FOCUSLOOM - start tracking potential distraction
        this.handleTabLeave();
      } else {
        // User returned to FOCUSLOOM - end distraction tracking
        this.handleTabReturn();
      }
    });

    // Monitor URL changes (for single-page apps)
    this.startUrlMonitoring();
    
    console.log('🚨 Distraction alert system started');
  }

  // Handle when user leaves FOCUSLOOM tab
  handleTabLeave() {
    if (!this.isMonitoring) return;
    
    this.distractionStartTime = Date.now();
    console.log('🚪 User left FOCUSLOOM tab - starting distraction tracking');
    
    // Start progressive alerts even in study mode (but with different thresholds)
    this.detectPotentialDistraction();
  }

  // Handle when user returns to FOCUSLOOM tab
  handleTabReturn() {
    if (!this.isMonitoring || !this.distractionStartTime) return;
    
    const distractionDuration = Date.now() - this.distractionStartTime;
    const durationSeconds = Math.floor(distractionDuration / 1000);
    
    // In educational mode, log as productive time
    if (this.educationalMode) {
      console.log(`📚 Educational mode: ${durationSeconds}s learning time - No alerts`);
      // Clear timers without triggering alerts
      if (this.alertInterval) {
        clearInterval(this.alertInterval);
        this.alertInterval = null;
      }
      this.distractionStartTime = null;
      this.currentDistraction = null;
      return;
    }
    
    // In study mode, assume educational content and don't alert
    if (this.studyMode) {
      console.log(`📚 Study mode: ${durationSeconds}s activity assumed educational - No alerts`);
      // Clear timers without triggering alerts
      if (this.alertInterval) {
        clearInterval(this.alertInterval);
        this.alertInterval = null;
      }
      this.distractionStartTime = null;
      this.currentDistraction = null;
      return;
    }
    
    // Normal mode - show alerts for distractions
    if (this.currentDistraction && durationSeconds > 10) {
      this.showReturnNotification(durationSeconds);
      this.endDistractionSession(distractionDuration);
    }
    
    // Clear timers
    if (this.alertInterval) {
      clearInterval(this.alertInterval);
      this.alertInterval = null;
    }
    
    this.distractionStartTime = null;
    this.currentDistraction = null;
  }

  // Check if user is on distracting sites
  checkForDistractingSites() {
    if (!this.isMonitoring || !this.distractionStartTime) return;
    
    // Since we can't directly access other tabs, we'll use behavioral detection
    // and prompt user to self-report or use browser extension approach
    
    // For demo purposes, simulate detection after certain time patterns
    const timeAway = Date.now() - this.distractionStartTime;
    
    // If away for more than 10 seconds, likely on another site
    if (timeAway > 10000 && !this.currentDistraction) {
      this.detectPotentialDistraction();
    }
  }

  // Detect potential distraction and start alerts
  detectPotentialDistraction() {
    console.log('🎯 Potential distraction detected - analyzing...');
    
    this.currentDistraction = {
      type: 'tab-switch',
      startTime: this.distractionStartTime,
      site: 'External tab'
    };
    
    // Check if educational mode is active (manual override)
    if (this.educationalMode) {
      console.log('📚 Educational mode active - No alerts');
      return;
    }
    
    // Auto-detect educational activity (only if not in study mode)
    if (!this.studyMode && this.detectEducationalActivity()) {
      console.log('📚 Auto-detected educational activity - No alerts');
      return;
    }
    
    // Start alerts (study mode uses different thresholds but still alerts)
    this.startProgressiveAlerts();
    
    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('distractionStarted', {
      detail: { 
        startTime: this.distractionStartTime,
        type: 'tab-switch'
      }
    }));
  }

  // Start progressive alert system
  startProgressiveAlerts() {
    let lastWarningTime = 0;
    let lastDangerTime = 0;
    let lastCriticalTime = 0;
    
    this.alertInterval = setInterval(() => {
      if (!this.isMonitoring || !this.distractionStartTime) {
        clearInterval(this.alertInterval);
        return;
      }
      
      const duration = Math.floor((Date.now() - this.distractionStartTime) / 1000);
      
      // In study mode, use longer thresholds but still alert
      const warningThreshold = this.studyMode ? 120 : this.alertThresholds.warning; // 2 min vs 30s
      const dangerThreshold = this.studyMode ? 300 : this.alertThresholds.danger;   // 5 min vs 2min
      const criticalThreshold = this.studyMode ? 600 : this.alertThresholds.critical; // 10 min vs 5min
      
      // Progressive alerts based on duration
      if (duration >= warningThreshold && duration < warningThreshold + 5 && lastWarningTime === 0) {
        const message = this.studyMode ? 'Study break reminder' : 'Focus reminder';
        this.showDistractionAlert('warning', duration, message);
        lastWarningTime = duration;
        console.log(`⚠️ WARNING alert triggered at ${duration}s`);
      } else if (duration >= dangerThreshold && duration < dangerThreshold + 5 && lastDangerTime === 0) {
        const message = this.studyMode ? 'Long study break detected' : 'Extended distraction';
        this.showDistractionAlert('danger', duration, message);
        lastDangerTime = duration;
        console.log(`🚨 DANGER alert triggered at ${duration}s`);
      } else if (duration >= criticalThreshold && lastCriticalTime === 0) {
        const message = this.studyMode ? 'Very long break - return to focus' : 'Critical distraction level';
        this.showDistractionAlert('critical', duration, message);
        lastCriticalTime = duration;
        console.log(`🔴 CRITICAL alert triggered at ${duration}s`);
        // Repeat critical every 30 seconds
        setInterval(() => {
          if (this.isMonitoring && this.distractionStartTime) {
            const currentDuration = Math.floor((Date.now() - this.distractionStartTime) / 1000);
            this.showDistractionAlert('critical', currentDuration, message);
          }
        }, 30000);
      }
      
      // Update UI with current distraction time
      this.updateDistractionUI(duration);
      
    }, 1000); // Check every second
  }

  // Show distraction notification
  showDistractionAlert(level, duration, customMessage = null) {
    const messages = {
      warning: {
        title: this.studyMode ? '📚 Study Break Reminder' : '⚠️ FOCUSLOOM Alert',
        body: customMessage || `You've been away for ${duration}s. Time to refocus?`,
        color: '#f59e0b'
      },
      danger: {
        title: this.studyMode ? '📚 Long Study Break' : '🚨 FOCUSLOOM Alert',
        body: customMessage || `${Math.floor(duration/60)}m ${duration%60}s away! Return to focus session.`,
        color: '#ef4444'
      },
      critical: {
        title: this.studyMode ? '📚 Return to Focus' : '🔴 FOCUSLOOM URGENT',
        body: customMessage || `${Math.floor(duration/60)}m ${duration%60}s distracted! Focus session suffering!`,
        color: '#dc2626'
      }
    };
    
    const message = messages[level];
    
    // ALWAYS play sound first (even if notifications fail)
    this.playAlarmSound(level);
    
    // Show browser notification (visible on all tabs)
    if (this.notificationPermission) {
      try {
        const notification = new Notification(message.title, {
          body: message.body,
          icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🎯</text></svg>',
          tag: 'focusloom-alert',
          requireInteraction: level === 'critical',
          silent: false
        });
        
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
        
        if (level !== 'critical') {
          setTimeout(() => notification.close(), level === 'danger' ? 8000 : 5000);
        }
      } catch (error) {
        console.log('Notification failed:', error);
      }
    }
    
    // Also create in-page notification for when user returns
    const alertDiv = document.createElement('div');
    alertDiv.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 9999;
      background: ${message.color}; color: white; padding: 16px 20px;
      border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      font-family: system-ui; font-size: 14px; max-width: 320px;
      animation: slideIn 0.3s ease-out;
      cursor: pointer;
    `;
    
    alertDiv.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 4px;">${message.title}</div>
      <div>${message.body}</div>
      <div style="font-size: 12px; opacity: 0.9; margin-top: 8px;">🔊 Alarm + Browser notification sent</div>
    `;
    
    alertDiv.onclick = () => alertDiv.remove();
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
      if (alertDiv.parentElement) {
        alertDiv.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => {
          alertDiv.remove();
          style.remove();
        }, 300);
      }
    }, 3000);
    
    console.log(`🚨 ${level.toUpperCase()} alert: ${duration}s distracted`);
  }

  // Show return notification when user comes back
  showReturnNotification(durationSeconds) {
    const color = durationSeconds > 300 ? '#dc2626' : durationSeconds > 120 ? '#ef4444' : '#f59e0b';
    const level = durationSeconds > 300 ? 'CRITICAL' : durationSeconds > 120 ? 'HIGH' : 'MEDIUM';
    
    const returnDiv = document.createElement('div');
    returnDiv.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 9999;
      background: ${color}; color: white; padding: 20px 24px;
      border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.4);
      font-family: system-ui; font-size: 15px; max-width: 350px;
      animation: slideIn 0.4s ease-out;
      cursor: pointer;
      border: 2px solid rgba(255,255,255,0.2);
    `;
    
    returnDiv.innerHTML = `
      <div style="font-weight: bold; font-size: 16px; margin-bottom: 8px;">
        🔴 Welcome Back - Distraction Detected!
      </div>
      <div style="margin-bottom: 8px;">
        You were away for <strong>${this.formatDuration(durationSeconds)}</strong>
      </div>
      <div style="font-size: 13px; opacity: 0.9; margin-bottom: 8px;">
        Impact Level: <strong>${level}</strong>
      </div>
      <div style="font-size: 12px; opacity: 0.8;">
        Click to dismiss • Focus score affected
      </div>
    `;
    
    returnDiv.onclick = () => returnDiv.remove();
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%) scale(0.9); opacity: 0; }
        to { transform: translateX(0) scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(returnDiv);
    
    setTimeout(() => {
      if (returnDiv.parentElement) {
        returnDiv.style.animation = 'slideIn 0.4s ease-out reverse';
        setTimeout(() => {
          returnDiv.remove();
          style.remove();
        }, 400);
      }
    }, 8000);
    
    console.log(`✅ Return notification: ${durationSeconds}s distraction detected`);
  }

  // Update UI with current distraction info
  updateDistractionUI(duration) {
    window.dispatchEvent(new CustomEvent('distractionUpdate', {
      detail: { 
        duration,
        formatted: this.formatDuration(duration),
        level: this.getDistractionLevel(duration)
      }
    }));
  }

  // End distraction session
  endDistractionSession(totalDuration) {
    const session = {
      startTime: this.distractionStartTime,
      endTime: Date.now(),
      duration: totalDuration,
      durationSeconds: Math.floor(totalDuration / 1000),
      type: this.currentDistraction?.type || 'unknown',
      site: this.currentDistraction?.site || 'External site'
    };
    
    this.distractionSessions.push(session);
    this.totalDistractionTime += totalDuration;
    
    // Show return notification
    if (this.notificationPermission && session.durationSeconds > 30) {
      new Notification('✅ Welcome Back!', {
        body: `You were distracted for ${this.formatDuration(session.durationSeconds)}. Let's refocus!`,
        icon: '/favicon.ico',
        tag: 'return-notification'
      });
    }
    
    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('distractionEnded', {
      detail: session
    }));
    
    console.log(`✅ Distraction ended: ${this.formatDuration(session.durationSeconds)}`);
  }

  // Monitor URL changes for browser-based detection
  startUrlMonitoring() {
    // This would work if FOCUSLOOM was a browser extension
    // For web app, we use behavioral patterns and user self-reporting
    
    let lastUrl = window.location.href;
    
    setInterval(() => {
      const currentUrl = window.location.href;
      
      if (currentUrl !== lastUrl && this.isMonitoring) {
        this.checkUrlForDistractions(currentUrl);
        lastUrl = currentUrl;
      }
    }, 2000);
  }

  // Check if URL is distracting
  checkUrlForDistractions(url) {
    const distractingSites = [
      'youtube.com', 'facebook.com', 'instagram.com', 'twitter.com',
      'tiktok.com', 'reddit.com', 'netflix.com', 'twitch.tv',
      'snapchat.com', 'linkedin.com/feed', 'pinterest.com'
    ];
    
    const isDistracting = distractingSites.some(site => 
      url.toLowerCase().includes(site)
    );
    
    if (isDistracting) {
      const siteName = distractingSites.find(site => url.includes(site));
      this.triggerImmediateAlert(siteName, url);
    }
  }

  // Trigger immediate alert for known distracting sites
  triggerImmediateAlert(siteName, url) {
    if (!this.notificationPermission) return;
    
    new Notification('🚨 Distraction Detected!', {
      body: `You're on ${siteName} during your focus session. Time to get back on track!`,
      icon: '/favicon.ico',
      tag: 'immediate-distraction',
      requireInteraction: true,
      actions: [
        { action: 'close-tab', title: 'Close Tab' },
        { action: 'continue', title: 'Just 2 more minutes' }
      ]
    });
    
    // Update current distraction info
    this.currentDistraction = {
      type: 'social-media',
      site: siteName,
      startTime: Date.now()
    };
  }

  // Utility functions
  formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  }

  getDistractionLevel(seconds) {
    if (seconds >= this.alertThresholds.critical) return 'critical';
    if (seconds >= this.alertThresholds.danger) return 'danger';
    if (seconds >= this.alertThresholds.warning) return 'warning';
    return 'normal';
  }

  // Get distraction statistics
  getDistractionStats() {
    const totalSessions = this.distractionSessions.length;
    const totalTime = Math.floor(this.totalDistractionTime / 1000);
    const avgDuration = totalSessions > 0 ? Math.floor(totalTime / totalSessions) : 0;
    const longestDistraction = Math.max(...this.distractionSessions.map(s => s.durationSeconds), 0);
    
    return {
      totalSessions,
      totalTime,
      totalTimeFormatted: this.formatDuration(totalTime),
      avgDuration,
      avgDurationFormatted: this.formatDuration(avgDuration),
      longestDistraction,
      longestDistractionFormatted: this.formatDuration(longestDistraction),
      recentSessions: this.distractionSessions.slice(-5)
    };
  }

  // Stop monitoring
  stopMonitoring() {
    this.isMonitoring = false;
    
    if (this.alertInterval) {
      clearInterval(this.alertInterval);
      this.alertInterval = null;
    }
    
    // Show session summary
    if (this.notificationPermission && this.distractionSessions.length > 0) {
      const stats = this.getDistractionStats();
      new Notification('📊 Focus Session Complete', {
        body: `Total distractions: ${stats.totalSessions} (${stats.totalTimeFormatted})`,
        icon: '/favicon.ico',
        tag: 'session-summary'
      });
    }
    
    console.log('🛑 Distraction alert system stopped');
  }
}

export default DistractionAlertSystem;