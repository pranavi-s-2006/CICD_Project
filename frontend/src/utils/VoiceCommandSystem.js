class VoiceCommandSystem {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.commands = {
      'start': ['start session', 'start focus', 'begin session', 'start deep work', 'start work'],
      'stop': ['stop session', 'end session', 'finish session', 'stop work'],
      'status': ['status', 'how am i doing', 'focus score', 'current score'],
      'break': ['take break', 'break time', 'pause session'],
      'distraction': ['i got distracted', 'distraction', 'lost focus']
    };
    this.onCommand = null;
  }

  initialize() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.log('Speech recognition not supported');
      return false;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      console.log('🎤 Voice heard:', transcript);
      this.processCommand(transcript);
    };

    this.recognition.onerror = (event) => {
      console.log('Speech recognition error:', event.error);
    };

    return true;
  }

  processCommand(transcript) {
    console.log('🔍 Processing command:', transcript);
    let commandFound = false;
    
    for (const [action, phrases] of Object.entries(this.commands)) {
      for (const phrase of phrases) {
        if (transcript.includes(phrase)) {
          console.log('✅ Command matched:', action, 'for phrase:', phrase);
          this.executeCommand(action, transcript);
          commandFound = true;
          break;
        }
      }
      if (commandFound) break;
    }

    if (!commandFound) {
      console.log('❌ No command found in:', transcript);
      this.showVoiceResponse(`Heard: "${transcript}" - Try "start session" or "stop session"`);
    }
  }

  executeCommand(action, transcript) {
    this.showVoiceResponse(`Command recognized: ${action}`);
    
    if (this.onCommand) {
      this.onCommand(action, transcript);
    }
  }

  showVoiceResponse(message) {
    const responseDiv = document.createElement('div');
    responseDiv.style.cssText = `
      position: fixed; top: 80px; right: 20px; z-index: 9999;
      background: #3b82f6; color: white; padding: 12px 16px;
      border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      font-family: system-ui; font-size: 13px; max-width: 280px;
      animation: slideIn 0.3s ease-out;
    `;
    
    responseDiv.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 4px;">🎤 Voice Command</div>
      <div>${message}</div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(responseDiv);
    
    setTimeout(() => {
      responseDiv.style.animation = 'slideIn 0.3s ease-out reverse';
      setTimeout(() => {
        responseDiv.remove();
        style.remove();
      }, 300);
    }, 3000);
  }

  startListening() {
    if (this.recognition && !this.isListening) {
      this.recognition.start();
      this.isListening = true;
      console.log('🎤 Voice commands active - say "Hey FOCUSLOOM"');
      this.showVoiceResponse('Voice commands active! Say "Hey FOCUSLOOM, start session"');
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      console.log('🎤 Voice commands stopped');
    }
  }

  setCommandHandler(handler) {
    this.onCommand = handler;
  }
}

export default VoiceCommandSystem;