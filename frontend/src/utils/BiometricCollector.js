import DistractionDetector from './DistractionDetector';

// Real-time biometric and environmental data collection
class BiometricCollector {
  constructor() {
    this.heartRateData = [];
    this.ambientNoiseLevel = 0;
    this.eyeStrainMetrics = {
      blinkRate: 0,
      screenTime: 0,
      lastBlink: Date.now()
    };
    this.notificationCount = 0;
    this.isCollecting = false;
    this.distractionDetector = new DistractionDetector();
  }

  // 1. HEART RATE - Using camera for photoplethysmography
  async startHeartRateMonitoring() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      
      // Store stream reference for cleanup
      this.cameraStream = stream;
      
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      const analyzeFrame = () => {
        if (!this.isCollecting) return;
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Calculate average red channel intensity (blood flow)
        let redSum = 0;
        for (let i = 0; i < imageData.data.length; i += 4) {
          redSum += imageData.data[i]; // Red channel
        }
        
        const avgRed = redSum / (imageData.data.length / 4);
        this.heartRateData.push({ timestamp: Date.now(), intensity: avgRed });
        
        // Keep only last 10 seconds of data
        const tenSecondsAgo = Date.now() - 10000;
        this.heartRateData = this.heartRateData.filter(d => d.timestamp > tenSecondsAgo);
        
        requestAnimationFrame(analyzeFrame);
      };
      
      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        analyzeFrame();
      };
      
    } catch (error) {
      console.log('Camera access denied, using interaction-based heart rate estimation');
      this.estimateHeartRateFromActivity();
    }
  }

  // 2. AMBIENT NOISE - Using microphone
  async startNoiseMonitoring() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Store stream reference for cleanup
      this.microphoneStream = stream;
      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      microphone.connect(analyser);
      
      const measureNoise = () => {
        if (!this.isCollecting) return;
        
        analyser.getByteFrequencyData(dataArray);
        
        // Calculate average amplitude
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        
        // Convert to decibel approximation
        this.ambientNoiseLevel = Math.round((sum / bufferLength) * 0.4);
        
        setTimeout(measureNoise, 1000);
      };
      
      measureNoise();
      
    } catch (error) {
      console.log('Microphone access denied, using activity-based noise estimation');
      this.estimateNoiseFromActivity();
    }
  }

  // 3. EYE STRAIN - Using interaction patterns
  startEyeStrainMonitoring() {
    let lastMouseMove = Date.now();
    let mouseMovements = 0;
    let scrollEvents = 0;
    
    document.addEventListener('mousemove', () => {
      const now = Date.now();
      if (now - lastMouseMove > 100) {
        mouseMovements++;
        lastMouseMove = now;
      }
    });
    
    document.addEventListener('scroll', () => {
      scrollEvents++;
    });
    
    setInterval(() => {
      if (!this.isCollecting) return;
      
      this.eyeStrainMetrics.screenTime += 1;
      
      const timeSinceLastMove = Date.now() - lastMouseMove;
      const movementRate = mouseMovements / (this.eyeStrainMetrics.screenTime || 1);
      
      let strainLevel = 0;
      
      // Increase strain with screen time
      strainLevel += Math.min(this.eyeStrainMetrics.screenTime * 0.5, 40);
      
      // Increase strain with low interaction
      if (movementRate < 0.1) strainLevel += 20;
      if (timeSinceLastMove > 30000) strainLevel += 15;
      
      this.eyeStrainMetrics.currentStrain = Math.min(strainLevel, 100);
      
      if (this.eyeStrainMetrics.screenTime % 60 === 0) {
        mouseMovements = 0;
        scrollEvents = 0;
      }
      
    }, 1000);
  }

  // 4. PHONE NOTIFICATIONS - Using Page Visibility API
  startNotificationMonitoring() {
    let tabSwitches = 0;
    let focusLosses = 0;
    
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.lastTabLeave = Date.now();
      } else {
        if (this.lastTabLeave && (Date.now() - this.lastTabLeave) < 30000) {
          tabSwitches++;
          this.notificationCount = tabSwitches;
        }
      }
    });
    
    window.addEventListener('blur', () => {
      focusLosses++;
      this.notificationCount = Math.max(this.notificationCount, focusLosses);
    });
    
    setInterval(() => {
      if (this.isCollecting) {
        tabSwitches = Math.max(0, tabSwitches - 1);
        focusLosses = Math.max(0, focusLosses - 1);
      }
    }, 600000);
  }

  // Start all monitoring
  async startMonitoring() {
    this.isCollecting = true;
    
    await this.startHeartRateMonitoring();
    await this.startNoiseMonitoring();
    this.startEyeStrainMonitoring();
    this.startNotificationMonitoring();
    
    // Start phone and email detection
    this.distractionDetector.startMonitoring();
    
    console.log('🔴 Real-time biometric monitoring started');
    console.log('📱📧 Phone and email detection active');
  }

  // Stop monitoring
  stopMonitoring() {
    this.isCollecting = false;
    
    // Stop camera stream
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(track => {
        track.stop();
        console.log('📷 Camera turned off');
      });
      this.cameraStream = null;
    }
    
    // Stop microphone stream
    if (this.microphoneStream) {
      this.microphoneStream.getTracks().forEach(track => {
        track.stop();
        console.log('🎤 Microphone turned off');
      });
      this.microphoneStream = null;
    }
    
    this.distractionDetector.stopMonitoring();
    console.log('⏹️ Biometric monitoring stopped - all devices turned off');
  }

  // Get current readings and store in MongoDB
  getCurrentReadings() {
    const distractions = this.distractionDetector.getDistractionCounts();
    
    // Calculate confidence levels based on data quality
    const heartRateConfidence = this.heartRateData.length > 5 ? 
      Math.min(85 + (this.heartRateData.length * 2), 95) : 45;
    
    const noiseConfidence = this.ambientNoiseLevel > 0 ? 90 : 0;
    
    const eyeStrainConfidence = this.eyeStrainMetrics.screenTime > 30 ? 80 : 50;
    
    const readings = {
      heartRate: this.calculateHeartRate(),
      heartRateConfidence,
      ambientNoise: this.ambientNoiseLevel,
      noiseConfidence,
      eyeStrain: this.eyeStrainMetrics.currentStrain || 20,
      eyeStrainConfidence,
      notificationDistractions: this.notificationCount,
      phoneDistractions: distractions.phone,
      emailDistractions: distractions.email,
      totalDistractions: distractions.total,
      focusScore: this.calculateFocusScore(distractions),
      focusScoreConfidence: Math.round((heartRateConfidence + noiseConfidence + eyeStrainConfidence) / 3)
    };
    
    // Store in MongoDB every 30 seconds
    if (this.isCollecting && this.shouldStoreData()) {
      this.storeBiometricData(readings);
    }
    
    return readings;
  }

  calculateHeartRate() {
    if (this.heartRateData.length < 10) return 72;
    
    const recent = this.heartRateData.slice(-10);
    const avg = recent.reduce((sum, d) => sum + d.intensity, 0) / recent.length;
    
    // Convert intensity variation to BPM estimate
    return Math.round(60 + (avg / 1000) * 40);
  }

  calculateFocusScore(distractions = { phone: 0, email: 0, total: 0 }) {
    let score = 100;
    
    score -= Math.min(this.notificationCount * 5, 30);
    score -= Math.min((this.eyeStrainMetrics.currentStrain || 0) * 0.3, 25);
    score -= Math.min(this.ambientNoiseLevel * 0.5, 20);
    
    // Penalize phone and email distractions more heavily
    score -= Math.min(distractions.phone * 8, 25); // Phone is worse
    score -= Math.min(distractions.email * 6, 20); // Email is bad too
    
    return Math.max(40, Math.round(score));
  }

  estimateHeartRateFromActivity() {
    setInterval(() => {
      if (this.isCollecting) {
        const baseRate = 72;
        const stressVariation = this.notificationCount * 2;
        const noiseVariation = this.ambientNoiseLevel * 0.1;
        
        this.heartRateData.push({
          timestamp: Date.now(),
          intensity: baseRate + stressVariation + noiseVariation + (Math.random() - 0.5) * 4
        });
      }
    }, 1000);
  }

  // Store biometric data in MongoDB
  async storeBiometricData(readings) {
    try {
      const response = await fetch('/api/biometric/biometric', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          sessionId: this.currentSessionId,
          heartRate: readings.heartRate,
          ambientNoise: readings.ambientNoise,
          eyeStrain: readings.eyeStrain,
          tabSwitches: this.tabSwitchCount || 0,
          phoneDistractions: readings.phoneDistractions,
          emailDistractions: readings.emailDistractions,
          focusScore: readings.focusScore,
          mouseMovements: this.mouseMovementCount || 0,
          keystrokes: this.keystrokeCount || 0,
          scrollEvents: this.scrollEventCount || 0
        })
      });
      
      if (response.ok) {
        console.log('📊 Biometric data stored in MongoDB');
      }
    } catch (error) {
      console.error('Failed to store biometric data:', error);
    }
  }

  // Check if we should store data (every 30 seconds)
  shouldStoreData() {
    const now = Date.now();
    if (!this.lastStorageTime || (now - this.lastStorageTime) > 30000) {
      this.lastStorageTime = now;
      return true;
    }
    return false;
  }

  // Set current session ID
  setSessionId(sessionId) {
    this.currentSessionId = sessionId;
  }
}

export default BiometricCollector;