// Voice command system for FOCUSLOOM
class VoiceController {
  constructor() {
    this.isListening = false;
    this.recognition = null;
    this.isSupported = false;
    this.commands = new Map();
    this.lastCommand = null;
    this.voiceEnabled = false;
    
    this.initializeVoiceRecognition();
    this.setupCommands();
  }

  // Initialize Web Speech API
  initializeVoiceRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      this.recognition.continuous = true;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
      this.recognition.maxAlternatives = 1;
      
      this.setupRecognitionEvents();
      this.isSupported = true;
      console.log('🎤 Voice recognition initialized');
    } else {
      console.log('🎤 Voice recognition not supported');
    }
  }

  // Setup recognition event handlers
  setupRecognitionEvents() {
    this.recognition.onstart = () => {
      console.log('🎤 Voice recognition started');
      this.showVoiceIndicator(true);
    };

    this.recognition.onend = () => {
      console.log('🎤 Voice recognition ended');
      this.showVoiceIndicator(false);
      
      // Restart if still enabled
      if (this.voiceEnabled && this.isSupported) {
        setTimeout(() => this.startListening(), 1000);
      }
    };

    this.recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
      console.log('🎤 Voice command:', transcript);
      this.processCommand(transcript);
    };

    this.recognition.onerror = (event) => {
      console.log('🎤 Voice recognition error:', event.error);
      if (event.error === 'not-allowed') {
        this.showPermissionError();
      }
    };
  }

  // Setup voice commands
  setupCommands() {
    // Session control commands
    this.commands.set('hey focusloom start deep work session', () => {
      this.executeCommand('startSession', 'work');
      this.speak('Starting deep work session');
    });

    this.commands.set('hey focusloom start study session', () => {
      this.executeCommand('startSession', 'study');
      this.speak('Starting study session');
    });

    this.commands.set('hey focusloom start creative session', () => {
      this.executeCommand('startSession', 'creative');
      this.speak('Starting creative session');
    });

    this.commands.set('hey focusloom end session', () => {
      this.executeCommand('endSession');
      this.speak('Ending focus session');
    });

    // Distraction logging commands
    this.commands.set('log phone distraction', () => {
      this.executeCommand('logDistraction', 'Phone');
      this.speak('Phone distraction logged');
    });

    this.commands.set('log email distraction', () => {
      this.executeCommand('logDistraction', 'Email');
      this.speak('Email distraction logged');
    });

    this.commands.set('log social media distraction', () => {
      this.executeCommand('logDistraction', 'Social Media');
      this.speak('Social media distraction logged');
    });

    this.commands.set('log noise distraction', () => {
      this.executeCommand('logDistraction', 'Noise');
      this.speak('Noise distraction logged');
    });

    // Status commands
    this.commands.set('hey focusloom how am i doing', () => {
      this.executeCommand('getStatus');
    });

    this.commands.set('hey focusloom show progress', () => {
      this.executeCommand('showProgress');
    });

    // Educational content tagging commands
    this.commands.set('this is educational content', () => {
      this.executeCommand('markEducational');
      this.speak('Educational mode activated - No alerts');
    });

    this.commands.set('this is entertainment', () => {
      this.executeCommand('markEntertainment');
      this.speak('Entertainment mode - Alerts enabled');
    });

    this.commands.set('mark as educational', () => {
      this.executeCommand('markEducational');
      this.speak('Marked as educational content');
    });

    this.commands.set('mark as entertainment', () => {
      this.executeCommand('markEntertainment');
      this.speak('Marked as entertainment content');
    });
  }

  // Process voice command
  processCommand(transcript) {
    // Find matching command
    let matchedCommand = null;
    let bestMatch = 0;

    for (let [command, action] of this.commands) {
      const similarity = this.calculateSimilarity(transcript, command);
      if (similarity > bestMatch && similarity > 0.7) {
        bestMatch = similarity;
        matchedCommand = action;
      }
    }

    if (matchedCommand) {
      this.lastCommand = transcript;
      matchedCommand();
      this.showCommandFeedback(transcript);
    } else {
      console.log('🎤 Command not recognized:', transcript);
      this.speak('Command not recognized');
    }
  }

  // Calculate string similarity
  calculateSimilarity(str1, str2) {
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');
    let matches = 0;

    words1.forEach(word => {
      if (words2.includes(word)) matches++;
    });

    return matches / Math.max(words1.length, words2.length);
  }

  // Execute command by dispatching events
  executeCommand(action, data = null) {
    window.dispatchEvent(new CustomEvent('voiceCommand', {
      detail: { action, data }
    }));
  }

  // Text-to-speech feedback
  speak(text) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.7;
      speechSynthesis.speak(utterance);
    }
  }

  // Start voice recognition
  startListening() {
    if (!this.isSupported) {
      console.log('🎤 Voice recognition not supported');
      return false;
    }

    try {
      this.voiceEnabled = true;
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (error) {
      console.log('🎤 Failed to start voice recognition:', error);
      return false;
    }
  }

  // Stop voice recognition
  stopListening() {
    if (this.recognition && this.isListening) {
      this.voiceEnabled = false;
      this.recognition.stop();
      this.isListening = false;
      this.showVoiceIndicator(false);
    }
  }

  // Show voice indicator
  showVoiceIndicator(active) {
    // Remove existing indicator
    const existing = document.querySelector('.voice-indicator');
    if (existing) existing.remove();

    if (active) {
      const indicator = document.createElement('div');
      indicator.className = 'voice-indicator';
      indicator.innerHTML = `
        <div style="
          position: fixed; top: 20px; left: 20px; z-index: 9999;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white; padding: 12px 16px; border-radius: 12px;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
          font-family: system-ui; font-size: 14px; font-weight: 500;
          display: flex; align-items: center; gap: 8px;
          animation: pulse 2s infinite;
        ">
          <div style="
            width: 8px; height: 8px; background: #fff;
            border-radius: 50%; animation: blink 1s infinite;
          "></div>
          🎤 Listening for commands...
        </div>
        <style>
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
        </style>
      `;
      document.body.appendChild(indicator);
    }
  }

  // Show command feedback
  showCommandFeedback(command) {
    const feedback = document.createElement('div');
    feedback.innerHTML = `
      <div style="
        position: fixed; top: 20px; right: 20px; z-index: 9999;
        background: #3b82f6; color: white; padding: 12px 16px;
        border-radius: 12px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        font-family: system-ui; font-size: 14px; max-width: 300px;
        animation: slideIn 0.3s ease-out;
      ">
        <div style="font-weight: 600; margin-bottom: 4px;">✅ Command Executed</div>
        <div style="opacity: 0.9;">"${command}"</div>
      </div>
      <style>
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      </style>
    `;
    
    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 3000);
  }

  // Show permission error
  showPermissionError() {
    const error = document.createElement('div');
    error.innerHTML = `
      <div style="
        position: fixed; top: 20px; right: 20px; z-index: 9999;
        background: #ef4444; color: white; padding: 16px 20px;
        border-radius: 12px; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        font-family: system-ui; font-size: 14px; max-width: 320px;
      ">
        <div style="font-weight: 600; margin-bottom: 8px;">🎤 Microphone Permission Required</div>
        <div style="opacity: 0.9; margin-bottom: 8px;">Please allow microphone access for voice commands</div>
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: rgba(255,255,255,0.2); border: none; color: white;
          padding: 4px 8px; border-radius: 6px; font-size: 12px; cursor: pointer;
        ">Dismiss</button>
      </div>
    `;
    
    document.body.appendChild(error);
    setTimeout(() => error.remove(), 8000);
  }

  // Get available commands
  getAvailableCommands() {
    return Array.from(this.commands.keys());
  }

  // Check if voice is supported
  isVoiceSupported() {
    return this.isSupported;
  }

  // Get voice status
  getStatus() {
    return {
      supported: this.isSupported,
      listening: this.isListening,
      enabled: this.voiceEnabled,
      lastCommand: this.lastCommand
    };
  }
}

export default VoiceController;