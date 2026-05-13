import React, { useState, useEffect, useRef } from 'react';
import { sessionAPI } from '../services/api';
import { useAuth } from '../services/context/AuthContext';
import { useVoiceCommands } from '../hooks/useVoiceCommands';
import './LiveSession.css';

const LiveSession = () => {
  const { user } = useAuth();
  const [step, setStep] = useState('setup'); // setup, category, active
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [category, setCategory] = useState('work');
  const [duration, setDuration] = useState(25);
  const [sessionType, setSessionType] = useState(''); // education or non-education
  const [notes, setNotes] = useState([]);
  const [distractionDetected, setDistractionDetected] = useState(false);
  const [heartRate, setHeartRate] = useState(0);
  const [awayTime, setAwayTime] = useState(0);
  const [showAwayPrompt, setShowAwayPrompt] = useState(false);
  const [allowedAwayMinutes, setAllowedAwayMinutes] = useState(0);
  const [awayTimer, setAwayTimer] = useState(0);
  const [faceDetected, setFaceDetected] = useState(true);
  const [manualNote, setManualNote] = useState('');
  const [sessionTopic, setSessionTopic] = useState('');
  const [sessionLogs, setSessionLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [lastBeepTime, setLastBeepTime] = useState(0);
  const [isSmiling, setIsSmiling] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [lookingAwayStart, setLookingAwayStart] = useState(null);
  const [dictationMode, setDictationMode] = useState(false);
  const [aiDictationMode, setAiDictationMode] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [visitedLink, setVisitedLink] = useState('');
  const [linkClassification, setLinkClassification] = useState(null);
  const [allowedLinkTime, setAllowedLinkTime] = useState(0);
  const [linkTimer, setLinkTimer] = useState(0);
  const [showLinkPrompt, setShowLinkPrompt] = useState(false);
  const [showTimePrompt, setShowTimePrompt] = useState(false);
  
  const videoRef = useRef(null);
  const beepRef = useRef(null);
  const awayIntervalRef = useRef(null);
  const faceDetectionRef = useRef(null);
  const linkTimerRef = useRef(null);

  const handleVoiceCommand = (command, data) => {
    console.log('Voice command received:', command, data);
    
    switch(command) {
      case 'START_NOTES':
      case 'ADD_NOTES':
        speak('Notes mode activated');
        break;
      case 'DICTATE':
        addNote(data);
        break;
      case 'STOP_NOTES':
        speak('Notes stopped');
        break;
      case 'END_SESSION':
        endSession();
        break;
      default:
        break;
    }
  };

  const { isListening, isDictating, startListening, stopListening } = useVoiceCommands(handleVoiceCommand);

  useEffect(() => {
    if (user) {
      const allLogs = JSON.parse(localStorage.getItem('sessionLogs') || '[]');
      const userLogs = allLogs.filter(log => log.userId === user._id || log.userId === user.id);
      setSessionLogs(userLogs);
    }
  }, [user]);

  useEffect(() => {
    let interval;
    if (isActive && !isPaused) {
      interval = setInterval(() => setTime(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, isPaused]);

  // Webcam & Distraction Detection
  useEffect(() => {
    if (isActive) {
      startWebcam();
      detectDistraction();
    }
    return () => stopWebcam();
  }, [isActive]);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          startFaceDetection();
        };
      }
      // Simulate heart rate monitoring
      setInterval(() => {
        setHeartRate(Math.floor(Math.random() * (85 - 65) + 65));
      }, 2000);
    } catch (err) {
      console.error('Webcam access denied');
    }
  };

  const startFaceDetection = () => {
    faceDetectionRef.current = setInterval(() => {
      const facePresent = Math.random() > 0.02; // 98% chance face is present
      const lookingAway = Math.random() > 0.95; // 5% chance looking away
      
      setFaceDetected(facePresent);
      
      const now = Date.now();
      
      // Face not detected - beep immediately
      if (!facePresent) {
        if (now - lastBeepTime > 1000) {
          playBeep();
          setLastBeepTime(now);
          setDistractionDetected(true);
          setTimeout(() => setDistractionDetected(false), 2000);
        }
      }
      // Looking away - track time and beep after 2 seconds
      else if (lookingAway) {
        if (!lookingAwayStart) {
          setLookingAwayStart(now);
        } else if (now - lookingAwayStart >= 2000 && now - lastBeepTime > 2000) {
          playBeep();
          setLastBeepTime(now);
          setDistractionDetected(true);
          setTimeout(() => setDistractionDetected(false), 2000);
        }
      }
      // Normal - reset looking away timer
      else {
        setLookingAwayStart(null);
      }
    }, 500);
  };

  const stopWebcam = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    if (faceDetectionRef.current) {
      clearInterval(faceDetectionRef.current);
    }
    if (awayIntervalRef.current) {
      clearInterval(awayIntervalRef.current);
    }
  };

  const detectDistraction = () => {
    // Tab visibility detection - pause session and ask for link
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPaused(true);
        setShowLinkPrompt(true);
      } else {
        // User came back - check if timer is running
        if (linkTimerRef.current) {
          // Timer still running, allow navigation
        } else {
          // No timer, resume session
          if (!showTimePrompt && !showLinkPrompt) {
            setIsPaused(false);
          }
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  };

  const classifyLink = (url) => {
    const educationalKeywords = ['edu', 'learn', 'course', 'tutorial', 'study', 'academic', 'university', 'college', 'wikipedia', 'stackoverflow', 'github', 'documentation', 'docs', 'lecture', 'research', 'scholar', 'book', 'library', 'khan', 'coursera', 'udemy', 'edx', 'mit', 'stanford', 'arxiv', 'medium', 'dev.to', 'freecodecamp'];
    const lowerUrl = url.toLowerCase();
    return educationalKeywords.some(keyword => lowerUrl.includes(keyword));
  };

  const handleLinkSubmit = () => {
    if (!visitedLink.trim()) {
      alert('Please enter the link you visited');
      return;
    }
    const isEducational = classifyLink(visitedLink);
    setLinkClassification(isEducational ? 'educational' : 'non-educational');
    setShowLinkPrompt(false);
    setShowTimePrompt(true);
  };

  const handleTimeSubmit = () => {
    if (allowedLinkTime <= 0) {
      alert('Please enter valid minutes');
      return;
    }
    setShowTimePrompt(false);
    setLinkTimer(0);
    
    // Start link timer
    linkTimerRef.current = setInterval(() => {
      setLinkTimer(prev => {
        const newTime = prev + 1;
        if (newTime >= allowedLinkTime * 60) {
          playBeep();
          alert(`⏰ Your ${allowedLinkTime} minutes are up! Please return to the live session.`);
          clearInterval(linkTimerRef.current);
          linkTimerRef.current = null;
          setIsPaused(false);
          setLinkTimer(0);
          setVisitedLink('');
          setLinkClassification(null);
          setAllowedLinkTime(0);
          return 0;
        }
        return newTime;
      });
    }, 1000);
  };

  const handleAwayConfirm = () => {
    if (allowedAwayMinutes <= 0) {
      alert('Please enter valid minutes');
      return;
    }
    
    setShowAwayPrompt(false);
    setAwayTimer(0);
    
    // Start away timer
    awayIntervalRef.current = setInterval(() => {
      setAwayTimer(prev => {
        const newTime = prev + 1;
        if (newTime >= allowedAwayMinutes * 60) {
          playBeep();
          alert(`⏰ Your ${allowedAwayMinutes} minutes are up! Return to focus.`);
          clearInterval(awayIntervalRef.current);
          return 0;
        }
        return newTime;
      });
    }, 1000);
  };

  const playBeep = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const addNote = (text) => {
    const newNote = { text, time: new Date().toLocaleTimeString() };
    console.log('Adding note:', newNote);
    setNotes(prev => {
      const updated = [...prev, newNote];
      console.log('Updated notes:', updated);
      return updated;
    });
  };

  const handleManualNote = () => {
    if (manualNote.trim()) {
      addNote(manualNote);
      setManualNote('');
    }
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    
    const userMsg = { role: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    
    // Simulate AI response
    setTimeout(() => {
      const botResponse = generateBotResponse(chatInput);
      setChatMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
    }, 500);
    
    setChatInput('');
  };

  const generateBotResponse = (question) => {
    const q = question.toLowerCase();
    
    // Math questions
    if (q.includes('quadratic')) {
      return 'Quadratic Equation: ax² + bx + c = 0. Solution: x = [-b ± √(b²-4ac)] / 2a. Steps: 1) Identify a, b, c. 2) Calculate discriminant (b²-4ac). 3) If positive: 2 real roots, zero: 1 root, negative: complex roots. Example: x² - 5x + 6 = 0 → a=1, b=-5, c=6 → x = [5 ± √(25-24)]/2 → x = 3 or x = 2';
    } 
    if (q.includes('derivative') || q.includes('differentiat')) {
      return 'Derivatives: d/dx of common functions: 1) xⁿ → nxⁿ⁻¹, 2) sin(x) → cos(x), 3) cos(x) → -sin(x), 4) eˣ → eˣ, 5) ln(x) → 1/x. Rules: Product rule: (uv)\' = u\'v + uv\', Quotient rule: (u/v)\' = (u\'v - uv\')/v², Chain rule: f(g(x))\' = f\'(g(x))·g\'(x). Example: d/dx(x³) = 3x²';
    } 
    if (q.includes('integral') || q.includes('integrat')) {
      return 'Integration: ∫xⁿ dx = xⁿ⁺¹/(n+1) + C. Common integrals: 1) ∫sin(x)dx = -cos(x) + C, 2) ∫cos(x)dx = sin(x) + C, 3) ∫eˣdx = eˣ + C, 4) ∫1/x dx = ln|x| + C. Techniques: Substitution, Integration by parts (∫udv = uv - ∫vdu), Partial fractions. Example: ∫x²dx = x³/3 + C';
    } 
    if (q.includes('matrix') || q.includes('matrices')) {
      return 'Matrices: Addition: Add corresponding elements. Multiplication: (AB)ᵢⱼ = Σ AᵢₖBₖⱼ. Determinant (2×2): |A| = ad-bc for [[a,b],[c,d]]. Inverse: A⁻¹ = (1/|A|)·adj(A). Properties: (AB)⁻¹ = B⁻¹A⁻¹, (Aᵀ)ᵀ = A. Applications: Solving systems of equations, transformations, eigenvalues.';
    } 
    if (q.includes('probability') || q.includes('statistic')) {
      return 'Probability: P(A) = favorable outcomes / total outcomes. Rules: P(A∪B) = P(A) + P(B) - P(A∩B), P(A|B) = P(A∩B)/P(B). Distributions: Normal (bell curve), Binomial (n trials), Poisson (rare events). Statistics: Mean = Σx/n, Variance = Σ(x-μ)²/n, Standard deviation = √variance. Example: Coin flip P(heads) = 1/2';
    }
    
    // Physics questions
    if (q.includes('newton') || q.includes('force') || (q.includes('motion') && !q.includes('emotion'))) {
      return 'Newton\'s Laws: 1) Object at rest stays at rest (inertia). 2) F = ma (Force = mass × acceleration). 3) Action-reaction pairs. Kinematics: v = u + at, s = ut + ½at², v² = u² + 2as. Force types: Gravity (F=mg), Friction (f=μN), Tension, Normal. Example: 10kg object, a=2m/s² → F = 10×2 = 20N';
    } 
    if (q.includes('energy') || q.includes('work') || q.includes('power')) {
      return 'Energy: KE = ½mv², PE = mgh, Total E = KE + PE (conserved). Work: W = F·d·cos(θ), measured in Joules. Power: P = W/t = F·v, measured in Watts. Conservation: Energy cannot be created/destroyed, only transformed. Example: 2kg ball at 5m height → PE = 2×10×5 = 100J';
    } 
    if (q.includes('electric') || q.includes('circuit') || q.includes('current') || q.includes('voltage') || q.includes('ohm')) {
      return 'Electricity: Ohm\'s Law: V = IR (Voltage = Current × Resistance). Power: P = VI = I²R = V²/R. Series: Rₜₒₜₐₗ = R₁+R₂+..., same current. Parallel: 1/Rₜₒₜₐₗ = 1/R₁+1/R₂+..., same voltage. Kirchhoff: ΣI(in) = ΣI(out), ΣV(loop) = 0. Example: 12V, 4Ω → I = 12/4 = 3A';
    } 
    if (q.includes('wave') || q.includes('frequency') || q.includes('wavelength')) {
      return 'Waves: v = fλ (velocity = frequency × wavelength). Types: Transverse (light, EM), Longitudinal (sound). Properties: Amplitude, frequency (Hz), period (T=1/f), wavelength. Sound: v ≈ 343 m/s in air. Light: c = 3×10⁸ m/s. Doppler effect: frequency changes with motion. Example: f=100Hz, λ=2m → v=200m/s';
    } 
    if (q.includes('thermo') || q.includes('heat') || q.includes('temperature')) {
      return 'Thermodynamics: Q = mcΔT (Heat = mass × specific heat × temp change). Laws: 0) Thermal equilibrium, 1) Energy conserved, 2) Entropy increases, 3) Absolute zero unreachable. Processes: Isothermal (constant T), Adiabatic (no heat), Isobaric (constant P), Isochoric (constant V). Example: 1kg water, c=4200J/kg·K, ΔT=10K → Q=42000J';
    }
    
    // Chemistry questions
    if (q.includes('periodic') || q.includes('element')) {
      return 'Periodic Table: Groups (vertical) share properties. Periods (horizontal) show electron shells. Trends: Atomic radius decreases left→right, increases top→bottom. Electronegativity increases left→right. Metals (left), Nonmetals (right), Metalloids (middle). Groups: 1-Alkali, 2-Alkaline earth, 17-Halogens, 18-Noble gases. Example: Na (Sodium) - Group 1, Period 3, Atomic# 11';
    } 
    if (q.includes('chemical') || q.includes('equation') || q.includes('balance')) {
      return 'Balancing Equations: 1) Count atoms of each element. 2) Add coefficients to balance. 3) Check all elements balanced. Example: H₂ + O₂ → H₂O becomes 2H₂ + O₂ → 2H₂O. Types: Synthesis (A+B→AB), Decomposition (AB→A+B), Single replacement (A+BC→AC+B), Double replacement (AB+CD→AD+CB), Combustion (fuel+O₂→CO₂+H₂O)';
    } 
    if (q.includes('mole') || q.includes('avogadro')) {
      return 'Mole Concept: 1 mole = 6.022×10²³ particles (Avogadro\'s number). Molar mass = mass of 1 mole (g/mol). n = m/M (moles = mass/molar mass). n = V/22.4 (at STP). Molarity: M = n/V (mol/L). Example: 18g H₂O, M=18g/mol → n = 18/18 = 1 mole = 6.022×10²³ molecules';
    }
    
    // DSA questions
    if (q.includes('array')) {
      return 'Arrays: Contiguous memory, O(1) access by index. Operations: Access O(1), Search O(n), Insert/Delete O(n). Dynamic arrays (ArrayList): Auto-resize, amortized O(1) append. Common problems: Two pointers, sliding window, prefix sum. Example: Find max subarray sum (Kadane\'s algorithm), Rotate array, Remove duplicates. Space: O(n), Best for: Random access, fixed size.';
    } 
    if (q.includes('linked list')) {
      return 'Linked List: Nodes with data + pointer. Types: Singly (→), Doubly (↔), Circular. Operations: Insert O(1) at head, Delete O(1) with pointer, Search O(n). Advantages: Dynamic size, efficient insertion/deletion. Disadvantages: No random access, extra memory for pointers. Problems: Reverse list, detect cycle (Floyd\'s), merge sorted lists, find middle (slow-fast pointers).';
    } 
    if (q.includes('stack') || q.includes('queue')) {
      return 'Stack: LIFO (Last In First Out). Operations: push(), pop(), peek() - all O(1). Uses: Function calls, undo/redo, expression evaluation, DFS. Queue: FIFO (First In First Out). Operations: enqueue(), dequeue() - O(1). Types: Simple, Circular, Priority, Deque. Uses: BFS, scheduling, buffering. Implement: Array or LinkedList.';
    } 
    if (q.includes('tree') || q.includes('binary')) {
      return 'Binary Tree: Each node has ≤2 children. Types: Full (0 or 2 children), Complete (filled left→right), Perfect (all levels full), BST (left<root<right). Traversals: Inorder (L-Root-R), Preorder (Root-L-R), Postorder (L-R-Root), Level-order (BFS). Height: O(log n) balanced, O(n) skewed. Operations: Search/Insert/Delete O(log n) in BST. Problems: Validate BST, LCA, diameter, serialize.';
    } 
    if (q.includes('graph') || q.includes('bfs') || q.includes('dfs')) {
      return 'Graphs: Vertices + Edges. Types: Directed/Undirected, Weighted/Unweighted, Cyclic/Acyclic. Representation: Adjacency Matrix O(V²), Adjacency List O(V+E). DFS: Stack/Recursion, explores deep, O(V+E). BFS: Queue, level-by-level, shortest path in unweighted. Algorithms: Dijkstra (shortest path), Kruskal/Prim (MST), Topological sort (DAG), Detect cycle, Connected components.';
    } 
    if (q.includes('sort') || q.includes('quick') || q.includes('merge')) {
      return 'Sorting: Bubble O(n²), Selection O(n²), Insertion O(n²). Efficient: Merge Sort O(n log n) stable, divide-conquer. Quick Sort O(n log n) avg, O(n²) worst, in-place. Heap Sort O(n log n), in-place. Counting/Radix O(n+k) for integers. When to use: Quick (general), Merge (stable needed), Heap (space constrained), Insertion (small/nearly sorted).';
    } 
    if (q.includes('dynamic programming') || q.includes('dp')) {
      return 'Dynamic Programming: Solve by breaking into subproblems, store results (memoization/tabulation). Steps: 1) Define state, 2) Recurrence relation, 3) Base cases, 4) Order of computation. Classic: Fibonacci, Knapsack (0/1, unbounded), LCS, LIS, Edit distance, Coin change, Matrix chain. Approach: Top-down (recursion+memo) or Bottom-up (tabulation). Optimization: Space reduction, state compression.';
    } 
    if (q.includes('time complexity') || q.includes('big o') || q.includes('complexity')) {
      return 'Time Complexity: O(1) constant, O(log n) logarithmic, O(n) linear, O(n log n) linearithmic, O(n²) quadratic, O(2ⁿ) exponential, O(n!) factorial. Rules: Drop constants, keep dominant term, worst case. Space: Auxiliary space used. Examples: Binary search O(log n), Linear search O(n), Merge sort O(n log n), Nested loops O(n²), Recursion tree depth = space.';
    }
    
    // Study & Focus
    if (q.includes('focus') || q.includes('concentrate')) {
      return 'To improve focus: 1) Eliminate distractions by putting your phone away. 2) Use the Pomodoro technique (25 min work, 5 min break). 3) Create a dedicated workspace. 4) Stay hydrated and take regular breaks. 5) Practice mindfulness meditation to train your attention span.';
    } 
    if (q.includes('study') || q.includes('learn')) {
      return 'Effective study techniques: 1) Active recall - test yourself instead of re-reading. 2) Spaced repetition - review material at increasing intervals. 3) Feynman technique - explain concepts in simple terms. 4) Mind mapping for visual learners. 5) Study in 25-50 minute blocks with breaks.';
    }
    
    // Default - only if no match found
    return `I can help with: Math (calculus, algebra, probability), Physics (mechanics, electricity, thermodynamics), Chemistry (periodic table, equations, moles), DSA (arrays, trees, graphs, sorting, DP), and Study techniques. What would you like to know?`;
  };

  const toggleVoiceRecognition = () => {
    if (isListening) {
      stopListening();
      speak('Voice control disabled');
    } else {
      startListening();
      speak('Voice control enabled');
    }
  };

  const startSession = async () => {
    try {
      const response = await sessionAPI.startSession({ intendedDuration: duration, category });
      setSessionId(response.data._id);
      setIsActive(true);
      setTime(0);
    } catch (error) {
      alert('Failed to start session');
    }
  };

  const endSession = async () => {
    try {
      stopListening();
      
      if (sessionId) {
        await sessionAPI.endSession(sessionId);
      }
      
      if (sessionTopic.trim()) {
        const log = {
          id: Date.now(),
          userId: user?._id || user?.id || 'guest',
          topic: sessionTopic,
          duration: time,
          notes: notes,
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString(),
          category,
          type: sessionType
        };
        const allLogs = JSON.parse(localStorage.getItem('sessionLogs') || '[]');
        const updatedLogs = [log, ...allLogs];
        localStorage.setItem('sessionLogs', JSON.stringify(updatedLogs));
        
        const userLogs = updatedLogs.filter(l => l.userId === (user?._id || user?.id || 'guest'));
        setSessionLogs(userLogs);
      }
      
      setIsActive(false);
      setSessionId(null);
      setDictationMode(false);
      setAiDictationMode(false);
      stopWebcam();
      downloadNotes();
      alert('Session Ended Successfully');
      setStep('setup');
      setSessionTopic('');
      setNotes([]);
    } catch (error) {
      console.error('Failed to end session:', error);
      alert('Session Ended Successfully');
      setStep('setup');
    }
  };

  const logDistraction = async (source) => {
    try {
      await sessionAPI.logDistraction(sessionId, { category: 'notification', source, severity: 2 });
    } catch (error) {
      console.error('Failed to log distraction');
    }
  };

  const downloadNotes = () => {
    if (notes.length === 0) return;
    const content = notes.map(n => `[${n.time}] ${n.text}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-notes-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (step === 'setup') {
    return (
      <div className="live-session">
        <button onClick={() => setShowLogs(!showLogs)} className="logs-toggle">
          📋 Session Logs ({sessionLogs.length})
        </button>

        {showLogs && (
          <div className="logs-sidebar">
            <div className="logs-header">
              <h3>📚 Session History</h3>
              <button onClick={() => setShowLogs(false)} className="close-logs">✕</button>
            </div>
            <div className="logs-list">
              {sessionLogs.map(log => (
                <div key={log.id} className="log-item" onClick={() => setSelectedLog(log)}>
                  <h4>{log.topic}</h4>
                  <p>{log.date} • {formatTime(log.duration)}</p>
                  <span className="log-notes-count">{(log.notes || []).length} notes</span>
                </div>
              ))}
              {sessionLogs.length === 0 && <p className="no-logs">No sessions yet</p>}
            </div>
          </div>
        )}

        {selectedLog && (
          <div className="log-detail-overlay" onClick={() => setSelectedLog(null)}>
            <div className="log-detail" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setSelectedLog(null)} className="close-detail">✕</button>
              <h2>{selectedLog.topic}</h2>
              <div className="log-meta">
                <span>📅 {selectedLog.date}</span>
                <span>⏱️ {formatTime(selectedLog.duration)}</span>
                <span>📂 {selectedLog.category}</span>
              </div>
              <h3>Notes:</h3>
              <div className="log-notes">
                {(selectedLog.notes || []).map((note, i) => (
                  <div key={i} className="log-note">
                    <span>{note.time}</span>
                    <p>{note.text}</p>
                  </div>
                ))}
                {(!selectedLog.notes || selectedLog.notes.length === 0) && <p>No notes taken</p>}
              </div>
            </div>
          </div>
        )}

        <h1>🎓 Live Focus Session</h1>
        <div className="session-setup">
          <div className="setup-card">
            <h2>Start New Session</h2>
            <div className="form-group">
              <label>Session Topic</label>
              <input 
                type="text" 
                value={sessionTopic} 
                onChange={(e) => setSessionTopic(e.target.value)} 
                placeholder="What will you study/work on?"
              />
            </div>
            <div className="form-group">
              <label>Duration (minutes)</label>
              <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="work">Work</option>
                <option value="study">Study</option>
                <option value="coding">Coding</option>
                <option value="reading">Reading</option>
                <option value="creative">Creative</option>
              </select>
            </div>
            <button onClick={() => setStep('category')} className="btn-start">Start Session</button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'category') {
    // Auto-start with education mode
    setSessionType('education');
    startSession();
    setStep('active');
    return null;
  }

  return (
    <div className="live-session">
      <h1>🎓 Live Focus Session - Education Mode</h1>
      
      <button onClick={() => setShowChatbot(!showChatbot)} className="chatbot-toggle">
        {showChatbot ? '✕ Close' : '💬 AI Assistant'}
      </button>

      {showChatbot && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <h3>🤖 Study Assistant</h3>
          </div>
          <div className="chatbot-messages">
            {chatMessages.length === 0 && (
              <div className="chat-welcome">
                <p>👋 Hi! I'm your AI study assistant. Ask me anything about:</p>
                <ul>
                  <li>📐 Math: Calculus, Algebra, Probability, Matrices</li>
                  <li>⚛️ Physics: Mechanics, Electricity, Thermodynamics, Waves</li>
                  <li>🧪 Chemistry: Periodic Table, Equations, Moles</li>
                  <li>💻 DSA: Arrays, Trees, Graphs, Sorting, DP, Complexity</li>
                  <li>📚 Study: Focus, Learning techniques, Time management</li>
                </ul>
              </div>
            )}
            {chatMessages.map((msg, i) => (
              <div key={i} className={`chat-message ${msg.role}`}>
                <div className="message-content">{msg.text}</div>
              </div>
            ))}
          </div>
          <div className="chatbot-input">
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
              placeholder="Ask me anything..."
            />
            <button onClick={handleChatSend}>Send</button>
          </div>
        </div>
      )}
      
      {showLinkPrompt && (
        <div className="away-prompt-overlay">
          <div className="away-prompt">
            <h2>🔗 Tab Navigation Detected</h2>
            <p>Session paused. Please enter the link you visited:</p>
            <input 
              type="text" 
              value={visitedLink} 
              onChange={(e) => setVisitedLink(e.target.value)}
              placeholder="https://example.com"
              className="away-input"
            />
            <div className="away-buttons">
              <button onClick={handleLinkSubmit} className="btn-confirm">Submit</button>
            </div>
          </div>
        </div>
      )}

      {showTimePrompt && (
        <div className="away-prompt-overlay">
          <div className="away-prompt">
            <h2>{linkClassification === 'educational' ? '🎓 Educational Link' : '⚠️ Non-Educational Link'}</h2>
            <p>Link classified as: <strong>{linkClassification}</strong></p>
            <p>How much time do you need on this link?</p>
            <input 
              type="number" 
              value={allowedLinkTime} 
              onChange={(e) => setAllowedLinkTime(e.target.value)}
              placeholder="Minutes"
              className="away-input"
            />
            <div className="away-buttons">
              <button onClick={handleTimeSubmit} className="btn-confirm">Start Timer</button>
            </div>
          </div>
        </div>
      )}
      
      {showAwayPrompt && (
        <div className="away-prompt-overlay">
          <div className="away-prompt">
            <h2>📚 Switching Tabs?</h2>
            <p>How long will you be away from this tab?</p>
            <input 
              type="number" 
              value={allowedAwayMinutes} 
              onChange={(e) => setAllowedAwayMinutes(e.target.value)}
              placeholder="Minutes"
              className="away-input"
            />
            <div className="away-buttons">
              <button onClick={handleAwayConfirm} className="btn-confirm">Start Timer</button>
              <button onClick={() => setShowAwayPrompt(false)} className="btn-cancel">Cancel</button>
            </div>
          </div>
        </div>
      )}
      
      <div className="session-active">
        {distractionDetected && (
          <div className="distraction-alert">
            ⚠️ {!faceDetected ? 'FACE NOT DETECTED!' : 'Stay focused!'}
          </div>
        )}

        {awayTimer > 0 && (
          <div className="away-timer">
            ⏱️ Away Time: {Math.floor(awayTimer / 60)}:{(awayTimer % 60).toString().padStart(2, '0')} / {allowedAwayMinutes}:00
          </div>
        )}

        {linkTimer > 0 && (
          <div className="away-timer" style={{background: linkClassification === 'educational' ? '#48bb78' : '#f56565'}}>
            {linkClassification === 'educational' ? '🎓' : '⚠️'} Link Time: {Math.floor(linkTimer / 60)}:{(linkTimer % 60).toString().padStart(2, '0')} / {allowedLinkTime}:00
          </div>
        )}

        {isPaused && !showLinkPrompt && !showTimePrompt && (
          <div className="pause-indicator">
            ⏸️ Session Paused
          </div>
        )}

        <div className="session-grid">
          <div className="timer-section">
            <div className="timer-circle">
              <h2>{formatTime(time)}</h2>
              <p>Focus Time</p>
            </div>
            
            <div className="voice-controls">
              <button onClick={toggleVoiceRecognition} className={`voice-btn ${isListening ? 'active' : ''}`}>
                {isListening ? '🎤 Listening...' : '🎤 Enable Voice'}
              </button>
              {isDictating && (
                <div className="dictation-indicator">
                  <span className="pulse-dot"></span>
                  📝 DICTATING - Say "stop notes" to exit
                </div>
              )}
              {aiDictationMode && (
                <div className="dictation-indicator" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                  <span className="pulse-dot"></span>
                  🤖 AI MODE - Say "close AI assistant" to exit
                </div>
              )}
              <p className="voice-hint">
                {isDictating 
                  ? 'Dictating notes. Say "stop notes" or "end session".' 
                  : isListening ? 'Say "start notes" or "add notes" to begin' : 'Click to enable voice control'
                }
              </p>
              <div className="voice-commands-help">
                <small><strong>Voice Commands:</strong></small>
                <small>• "Start notes" or "Add notes" - Begin dictation</small>
                <small>• Say anything - It will be added as a note</small>
                <small>• "Stop notes" - Stop dictation</small>
                <small>• "End session" or "Stop session" - End session</small>
              </div>
            </div>
          </div>

          {isActive && (
            <div className="monitoring-section">
              <h3>📹 Live Monitoring</h3>
              <video ref={videoRef} autoPlay muted className="webcam-feed" />
              <div className="biometric-data">
                <div className="metric">
                  <span>❤️</span>
                  <div>
                    <p>Heart Rate</p>
                    <h4>{heartRate} BPM</h4>
                  </div>
                </div>
                <div className="metric">
                  <span>{faceDetected ? '👤' : '❌'}</span>
                  <div>
                    <p>Face Status</p>
                    <h4>{faceDetected ? 'Focused' : 'Not Found'}</h4>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="notes-section">
            <h3>📝 Session Notes ({notes.length})</h3>
            <div className="manual-note-input">
              <input 
                type="text" 
                value={manualNote} 
                onChange={(e) => setManualNote(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleManualNote()}
                placeholder="Type a note and press Enter..."
                className="note-input"
              />
              <button onClick={handleManualNote} className="btn-add-note">Add Note</button>
            </div>
            <div className="notes-list">
              {notes.length > 0 ? (
                notes.map((note, i) => (
                  <div key={i} className="note-item">
                    <span className="note-time">{note.time}</span>
                    <p>{note.text}</p>
                    <button onClick={() => setNotes(notes.filter((_, index) => index !== i))} className="btn-delete-note">✕</button>
                  </div>
                ))
              ) : (
                <p className="no-notes">Type or say "Hey Focus, [your note]" to add notes</p>
              )}
            </div>
          </div>
        </div>

        <div className="distraction-buttons">
          <h3>Quick Log Distraction</h3>
          <div className="distraction-grid">
            <button onClick={() => logDistraction('Phone')}>📱 Phone</button>
            <button onClick={() => logDistraction('Social Media')}>💬 Social</button>
            <button onClick={() => logDistraction('Email')}>📧 Email</button>
            <button onClick={() => logDistraction('Noise')}>🔊 Noise</button>
          </div>
        </div>
        
        <button onClick={endSession} className="btn-end">End Session</button>
      </div>
    </div>
  );
};

export default LiveSession;
