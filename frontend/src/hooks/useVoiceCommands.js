import { useState, useRef } from 'react';

export const useVoiceCommands = (onCommand) => {
  const [isListening, setIsListening] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const recognitionRef = useRef(null);
  const isDictatingRef = useRef(false);
  const isListeningRef = useRef(false);

  const initRecognition = () => {
    if (recognitionRef.current) return recognitionRef.current;

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported. Use Chrome.');
      return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      const lower = transcript.toLowerCase();
      
      console.log('🎤 Heard:', transcript);

      if (lower.includes('start notes') || lower.includes('add notes')) {
        console.log('✅ START NOTES');
        isDictatingRef.current = true;
        setIsDictating(true);
        onCommand('START_NOTES');
      } else if (lower.includes('stop notes')) {
        console.log('✅ STOP NOTES');
        isDictatingRef.current = false;
        setIsDictating(false);
        onCommand('STOP_NOTES');
      } else if (lower.includes('end session') || lower.includes('stop session')) {
        console.log('✅ END SESSION');
        isDictatingRef.current = false;
        setIsDictating(false);
        onCommand('END_SESSION');
      } else if (isDictatingRef.current) {
        console.log('✅ DICTATE:', transcript);
        onCommand('DICTATE', transcript);
      } else {
        console.log('❌ Not in dictation mode');
      }
    };

    recognition.onerror = (event) => {
      console.error('❌ Error:', event.error);
    };

    recognition.onend = () => {
      console.log('🔄 Recognition ended');
      if (isListeningRef.current) {
        console.log('🔄 Restarting...');
        setTimeout(() => {
          try {
            recognition.start();
          } catch (e) {
            console.log('Restart failed:', e);
          }
        }, 100);
      }
    };

    recognitionRef.current = recognition;
    return recognition;
  };

  const startListening = () => {
    const recognition = initRecognition();
    if (!recognition) return;

    try {
      recognition.start();
      isListeningRef.current = true;
      setIsListening(true);
      console.log('✅ VOICE STARTED - Say "start notes" to begin');
    } catch (e) {
      console.error('Failed to start:', e);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      isListeningRef.current = false;
      recognitionRef.current.stop();
      setIsListening(false);
      setIsDictating(false);
      isDictatingRef.current = false;
      console.log('❌ VOICE STOPPED');
    }
  };

  return { isListening, isDictating, startListening, stopListening };
};
