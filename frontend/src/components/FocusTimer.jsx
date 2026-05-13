import React, { useState, useEffect } from 'react';
import { sessionAPI } from '../services/api';
import './FocusTimer.css';

const FocusTimer = ({ onStateChange }) => {
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(0);
  const [currentSession, setCurrentSession] = useState(null);
  const [category, setCategory] = useState('work');
  const [intendedDuration, setIntendedDuration] = useState(25);
  const [pomodoroMode, setPomodoroMode] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);

  const startSession = async () => {
    try {
      const response = await sessionAPI.startSession({
        intendedDuration,
        category,
      });
      
      setCurrentSession(response.data);
      setIsActive(true);
      setTime(0);
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  const endSession = async () => {
    if (!currentSession) return;
    
    try {
      await sessionAPI.endSession(currentSession._id);
      
      // Save to localStorage for achievements
      const sessions = JSON.parse(localStorage.getItem('focusSessions') || '[]');
      sessions.push({
        _id: currentSession._id,
        startTime: currentSession.startTime || new Date().toISOString(),
        duration: Math.floor(time / 60),
        category,
        completed: true,
        focusScore: 75,
        distractions: []
      });
      localStorage.setItem('focusSessions', JSON.stringify(sessions));
      
      setIsActive(false);
      setCurrentSession(null);
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  const logDistraction = async (source, category = 'other') => {
    if (!currentSession) return;
    
    try {
      await sessionAPI.logDistraction(currentSession._id, {
        source,
        category,
      });
      alert(`Logged distraction: ${source}`);
    } catch (error) {
      console.error('Failed to log distraction:', error);
    }
  };

  useEffect(() => {
    let interval = null;
    
    if (isActive) {
      interval = setInterval(() => {
        setTime((prevTime) => {
          const newTime = prevTime + 1;
          
          // Pomodoro timer check
          if (pomodoroMode) {
            const targetMinutes = isBreak ? (pomodoroCount % 4 === 0 ? 15 : 5) : 25;
            if (newTime >= targetMinutes * 60) {
              playBeep();
              if (isBreak) {
                alert('Break over! Ready for another focus session?');
                setIsBreak(false);
                return 0;
              } else {
                const newCount = pomodoroCount + 1;
                setPomodoroCount(newCount);
                const breakTime = newCount % 4 === 0 ? 15 : 5;
                alert(`Pomodoro complete! Take a ${breakTime} minute break.`);
                setIsBreak(true);
                return 0;
              }
            }
          }
          return newTime;
        });
      }, 1000);
    } else if (!isActive && time !== 0) {
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [isActive, time, pomodoroMode, isBreak, pomodoroCount]);

  // Pass state to parent
  useEffect(() => {
    if (onStateChange) {
      onStateChange({ isActive, pomodoroMode, isBreak, pomodoroCount });
    }
  }, [isActive, pomodoroMode, isBreak, pomodoroCount, onStateChange]);

  const playBeep = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="focus-timer">
      <div className="timer-header">
        <h2>{pomodoroMode ? (isBreak ? '☕ Break Time' : '🍅 Pomodoro Session') : 'Focus Session'}</h2>
        {!isActive && (
          <div className="session-settings">
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="work">Work</option>
              <option value="study">Study</option>
              <option value="creative">Creative</option>
              <option value="coding">Coding</option>
              <option value="reading">Reading</option>
            </select>
            <input
              type="number"
              value={intendedDuration}
              onChange={(e) => setIntendedDuration(e.target.value)}
              min="1"
              max="120"
            />
            <span>minutes</span>
          </div>
        )}
        {!isActive && (
          <label className="pomodoro-toggle">
            <input 
              type="checkbox" 
              checked={pomodoroMode} 
              onChange={(e) => setPomodoroMode(e.target.checked)}
            />
            <span>🍅 Pomodoro Mode (25min work / 5min break)</span>
          </label>
        )}
      </div>

      <div className="timer-display">
        <div className="time">{formatTime(time)}</div>
        <div className="timer-controls">
          {!isActive ? (
            <button onClick={startSession} className="start-btn">
              {pomodoroMode ? 'Start Pomodoro' : 'Start Focus Session'}
            </button>
          ) : (
            <button onClick={endSession} className="end-btn">
              End Session
            </button>
          )}
        </div>
      </div>

      {isActive && (
        <div className="distraction-logger">
          <h3>Quick Distraction Log</h3>
          <div className="distraction-buttons">
            <button onClick={() => logDistraction('Phone', 'notification')}>
              📱 Phone
            </button>
            <button onClick={() => logDistraction('Email', 'notification')}>
              📧 Email
            </button>
            <button onClick={() => logDistraction('Social Media', 'social')}>
              🌐 Social Media
            </button>
            <button onClick={() => logDistraction('Mind Wandering', 'internal')}>
              💭 Mind Wandering
            </button>
            <button onClick={() => logDistraction('Noise', 'environment')}>
              🔊 Noise
            </button>
            <button onClick={() => logDistraction('Hunger/Thirst', 'internal')}>
              🍽️ Hunger/Thirst
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FocusTimer;