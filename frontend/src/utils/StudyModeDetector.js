// Smart Study Mode - Distinguishes productive vs distracting tab switches
class StudyModeDetector {
  constructor() {
    this.studyMode = false;
    this.allowedDomains = new Set();
    this.productiveTabs = new Set();
    this.distractingTabs = new Set();
    this.tabSwitchContext = [];
  }

  // Enable study mode with allowed domains
  enableStudyMode(allowedSites = []) {
    this.studyMode = true;
    
    // Default productive domains
    const defaultStudySites = [
      'wikipedia.org', 'scholar.google.com', 'coursera.org', 'edx.org',
      'khanacademy.org', 'stackoverflow.com', 'github.com', 'docs.google.com',
      'notion.so', 'obsidian.md', 'evernote.com', 'onenote.com',
      'youtube.com/watch', 'vimeo.com', 'ted.com', 'udemy.com'
    ];
    
    // Add user-specified sites
    [...defaultStudySites, ...allowedSites].forEach(domain => {
      this.allowedDomains.add(domain.toLowerCase());
    });
    
    console.log('📚 Study Mode enabled - Productive tab switches allowed');
    this.startSmartDetection();
  }

  // Disable study mode
  disableStudyMode() {
    this.studyMode = false;
    this.allowedDomains.clear();
    console.log('📚 Study Mode disabled - All tab switches monitored');
  }

  // Smart detection logic
  startSmartDetection() {
    // Override the distraction detector's tab switch logic
    document.addEventListener('visibilitychange', (e) => {
      if (!this.studyMode) return;
      
      const now = Date.now();
      
      if (document.hidden) {
        // User left FOCUSLOOM tab
        this.tabLeaveTime = now;
        this.lastActiveTab = document.title;
      } else {
        // User returned to FOCUSLOOM tab
        if (this.tabLeaveTime) {
          const awayTime = now - this.tabLeaveTime;
          this.analyzeTabSwitch(awayTime);
        }
      }
    });

    // Monitor URL changes in current tab (for SPAs)
    let lastUrl = window.location.href;
    setInterval(() => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl && this.studyMode) {
        this.checkUrlProductivity(currentUrl);
        lastUrl = currentUrl;
      }
    }, 2000);
  }

  // Analyze if tab switch was productive or distracting
  analyzeTabSwitch(awayTime) {
    const context = {
      duration: awayTime,
      timestamp: Date.now(),
      timeOfDay: new Date().getHours()
    };

    // Very short switches (< 3 seconds) = likely productive reference
    if (awayTime < 3000) {
      this.recordProductiveSwitch('Quick reference', context);
      return;
    }

    // Medium switches (3-30 seconds) = likely reading/note-taking
    if (awayTime >= 3000 && awayTime <= 30000) {
      this.recordProductiveSwitch('Study material review', context);
      return;
    }

    // Longer switches (30 seconds - 5 minutes) = could be productive
    if (awayTime > 30000 && awayTime <= 300000) {
      // Check patterns to determine if productive
      if (this.isLikelyProductivePattern(context)) {
        this.recordProductiveSwitch('Extended study session', context);
      } else {
        this.recordDistraction('Possible distraction - long absence', context);
      }
      return;
    }

    // Very long switches (> 5 minutes) = likely distraction
    if (awayTime > 300000) {
      this.recordDistraction('Extended absence - likely distraction', context);
    }
  }

  // Check if URL is productive
  checkUrlProductivity(url) {
    const isProductive = Array.from(this.allowedDomains).some(domain => 
      url.toLowerCase().includes(domain)
    );

    if (isProductive) {
      this.productiveTabs.add(url);
      console.log('✅ Productive site detected:', url);
    } else {
      // Check for common distraction patterns
      const distractingSites = [
        'facebook.com', 'instagram.com', 'twitter.com', 'tiktok.com',
        'reddit.com', 'netflix.com', 'youtube.com/shorts', 'twitch.tv'
      ];
      
      const isDistracting = distractingSites.some(site => 
        url.toLowerCase().includes(site)
      );
      
      if (isDistracting) {
        this.distractingTabs.add(url);
        this.recordDistraction('Distracting website detected', { url });
      }
    }
  }

  // Determine if pattern suggests productive work
  isLikelyProductivePattern(context) {
    // During typical study hours (9 AM - 11 PM)
    if (context.timeOfDay >= 9 && context.timeOfDay <= 23) {
      return true;
    }

    // If recent switches were productive
    const recentSwitches = this.tabSwitchContext.slice(-5);
    const productiveCount = recentSwitches.filter(s => s.productive).length;
    
    return productiveCount >= 3; // Majority were productive
  }

  // Record productive tab switch
  recordProductiveSwitch(reason, context) {
    this.tabSwitchContext.push({
      ...context,
      productive: true,
      reason
    });

    // Keep only recent history
    if (this.tabSwitchContext.length > 20) {
      this.tabSwitchContext = this.tabSwitchContext.slice(-20);
    }

    // Dispatch event for UI
    window.dispatchEvent(new CustomEvent('productiveSwitch', {
      detail: { reason, context }
    }));

    console.log('✅ Productive switch:', reason);
  }

  // Record actual distraction
  recordDistraction(reason, context) {
    this.tabSwitchContext.push({
      ...context,
      productive: false,
      reason
    });

    // Dispatch event for distraction tracking
    window.dispatchEvent(new CustomEvent('actualDistraction', {
      detail: { reason, context }
    }));

    console.log('❌ Distraction detected:', reason);
  }

  // Get study session stats
  getStudyStats() {
    const recent = this.tabSwitchContext.slice(-10);
    const productive = recent.filter(s => s.productive).length;
    const distracting = recent.filter(s => !s.productive).length;

    return {
      studyMode: this.studyMode,
      productiveSwitches: productive,
      distractingSwitches: distracting,
      focusEfficiency: productive / (productive + distracting) * 100 || 100,
      allowedSites: Array.from(this.allowedDomains),
      productiveTabs: Array.from(this.productiveTabs),
      distractingTabs: Array.from(this.distractingTabs)
    };
  }

  // Smart recommendations based on usage
  getSmartRecommendations() {
    const stats = this.getStudyStats();
    const recommendations = [];

    if (stats.focusEfficiency > 80) {
      recommendations.push({
        type: 'success',
        message: '🎯 Excellent focus! Your tab switches are mostly productive.',
        action: 'Keep up the great study habits!'
      });
    }

    if (stats.distractingSwitches > 3) {
      recommendations.push({
        type: 'warning',
        message: '⚠️ Several distracting sites detected.',
        action: 'Consider using website blockers during study time.'
      });
    }

    if (stats.productiveSwitches > 5) {
      recommendations.push({
        type: 'info',
        message: '📚 Active learning detected! You\'re referencing multiple sources.',
        action: 'This is great for deep understanding.'
      });
    }

    return recommendations;
  }
}

export default StudyModeDetector;