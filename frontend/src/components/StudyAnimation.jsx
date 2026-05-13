import React from 'react';
import './StudyAnimation.css';

const StudyAnimation = () => {
  return (
    <div className="study-animation-container">
      <svg viewBox="0 0 600 800" className="study-svg" preserveAspectRatio="xMidYMid slice">
        {/* Powder Blue Wall Background */}
        <rect x="0" y="0" width="600" height="800" fill="#b0d4e3"/>
        
        {/* Window with trees outside */}
        <rect x="50" y="80" width="250" height="300" fill="#87ceeb" rx="10"/>
        <rect x="50" y="80" width="250" height="300" fill="none" stroke="#fff" strokeWidth="8" rx="10"/>
        <line x1="175" y1="80" x2="175" y2="380" stroke="#fff" strokeWidth="8"/>
        <line x1="50" y1="230" x2="300" y2="230" stroke="#fff" strokeWidth="8"/>
        
        {/* Trees outside window */}
        <ellipse cx="120" cy="300" rx="40" ry="60" fill="#2d5016" className="tree-crown"/>
        <rect x="115" y="320" width="10" height="50" fill="#5d4037"/>
        <ellipse cx="200" cy="280" rx="35" ry="50" fill="#3d6b1f" className="tree-crown"/>
        <rect x="196" y="300" width="8" height="40" fill="#5d4037"/>
        <ellipse cx="260" cy="310" rx="30" ry="45" fill="#2d5016" className="tree-crown"/>
        <rect x="256" y="325" width="8" height="40" fill="#5d4037"/>
        
        {/* Sky and clouds in window */}
        <ellipse cx="100" cy="150" rx="35" ry="25" fill="#fff" opacity="0.8" className="cloud cloud-1"/>
        <ellipse cx="240" cy="170" rx="30" ry="20" fill="#fff" opacity="0.8" className="cloud cloud-2"/>
        
        {/* Sun in window */}
        <circle cx="270" cy="120" r="25" fill="#ffd700" opacity="0.7" className="sun"/>
        
        {/* Decorative wall elements */}
        <circle cx="450" cy="150" r="60" fill="#9bc4d4" opacity="0.3"/>
        <circle cx="500" cy="650" r="70" fill="#9bc4d4" opacity="0.3"/>
        
        {/* Desk - larger and more detailed */}
        <rect x="50" y="550" width="500" height="25" fill="#8b7355" rx="8"/>
        <rect x="50" y="575" width="500" height="15" fill="#6d5a45" rx="5"/>
        <rect x="60" y="590" width="20" height="200" fill="#6d5a45" rx="5"/>
        <rect x="520" y="590" width="20" height="200" fill="#6d5a45" rx="5"/>
        
        {/* Chair */}
        <ellipse cx="200" cy="650" rx="50" ry="15" fill="#4a4a4a" opacity="0.3"/>
        <rect x="170" y="580" width="60" height="80" fill="#5a5a5a" rx="8"/>
        <rect x="165" y="500" width="70" height="90" fill="#6a6a6a" rx="10"/>
        <rect x="160" y="660" width="15" height="80" fill="#4a4a4a" rx="5"/>
        <rect x="225" y="660" width="15" height="80" fill="#4a4a4a" rx="5"/>
        
        {/* Girl - Body */}
        <ellipse cx="250" cy="520" rx="60" ry="80" fill="#e8b4a8" className="body"/>
        
        {/* Neck */}
        <rect x="235" y="380" width="30" height="40" fill="#f5d5c8" rx="5"/>
        
        {/* Head - pale skin */}
        <ellipse cx="250" cy="350" rx="55" ry="65" fill="#f5d5c8" className="head"/>
        
        {/* Hair - detailed */}
        <ellipse cx="250" cy="320" rx="60" ry="70" fill="#3d2817"/>
        <path d="M 190 340 Q 180 380 195 420" fill="#3d2817" className="hair-strand"/>
        <path d="M 310 340 Q 320 380 305 420" fill="#3d2817" className="hair-strand"/>
        <ellipse cx="220" cy="330" rx="25" ry="35" fill="#2d1807"/>
        <ellipse cx="280" cy="330" rx="25" ry="35" fill="#2d1807"/>
        
        {/* Headphones - detailed */}
        <rect x="180" y="340" width="30" height="40" fill="#ff6b9d" rx="15" className="headphone-left"/>
        <rect x="290" y="340" width="30" height="40" fill="#ff6b9d" rx="15" className="headphone-right"/>
        <path d="M 210 335 Q 250 310 290 335" stroke="#ff6b9d" strokeWidth="8" fill="none" strokeLinecap="round"/>
        <circle cx="195" cy="360" r="18" fill="#ff4d7d"/>
        <circle cx="305" cy="360" r="18" fill="#ff4d7d"/>
        <circle cx="195" cy="360" r="12" fill="#2d2d2d"/>
        <circle cx="305" cy="360" r="12" fill="#2d2d2d"/>
        <circle cx="195" cy="360" r="6" fill="#4d4d4d" className="speaker-detail"/>
        <circle cx="305" cy="360" r="6" fill="#4d4d4d" className="speaker-detail"/>
        
        {/* Face details */}
        <ellipse cx="230" cy="355" rx="4" ry="6" fill="#3d2817" className="eye blink"/>
        <ellipse cx="270" cy="355" rx="4" ry="6" fill="#3d2817" className="eye blink"/>
        <path d="M 225 350 Q 220 345 215 350" stroke="#3d2817" strokeWidth="2" fill="none" className="eyebrow"/>
        <path d="M 275 350 Q 280 345 285 350" stroke="#3d2817" strokeWidth="2" fill="none" className="eyebrow"/>
        <ellipse cx="220" cy="370" rx="8" ry="6" fill="#ffb3ba" opacity="0.6"/>
        <ellipse cx="280" cy="370" rx="8" ry="6" fill="#ffb3ba" opacity="0.6"/>
        <path d="M 240 385 Q 250 390 260 385" stroke="#d4a5a5" strokeWidth="2" fill="none" className="smile"/>
        <ellipse cx="250" cy="375" rx="3" ry="4" fill="#e8b4a8"/>
        
        {/* Shirt - detailed */}
        <path d="M 190 420 L 190 520 Q 190 540 210 540 L 290 540 Q 310 540 310 520 L 310 420 Z" fill="#6c5ce7"/>
        <circle cx="250" cy="430" r="3" fill="#fff"/>
        <circle cx="250" cy="445" r="3" fill="#fff"/>
        <circle cx="250" cy="460" r="3" fill="#fff"/>
        
        {/* Arms - more defined */}
        <ellipse cx="170" cy="480" rx="20" ry="60" fill="#f5d5c8" className="arm-left" transform="rotate(-20 170 480)"/>
        <ellipse cx="330" cy="480" rx="20" ry="60" fill="#f5d5c8" className="arm-right" transform="rotate(20 330 480)"/>
        <circle cx="160" cy="520" r="18" fill="#f5d5c8"/>
        <circle cx="340" cy="520" r="18" fill="#f5d5c8"/>
        
        {/* Laptop - more detailed */}
        <rect x="200" y="520" width="200" height="15" fill="#2c3e50" rx="5"/>
        <rect x="205" y="535" width="190" height="100" fill="#34495e" rx="8" className="laptop-base"/>
        <rect x="215" y="420" width="170" height="120" fill="#2c3e50" rx="8" className="laptop-screen"/>
        <rect x="220" y="425" width="160" height="110" fill="#1a1a2e" className="laptop-display"/>
        
        {/* Screen content - code editor */}
        <rect x="225" y="430" width="150" height="20" fill="#16213e" rx="3"/>
        <circle cx="232" cy="440" r="3" fill="#ff6b6b"/>
        <circle cx="242" cy="440" r="3" fill="#ffd93d"/>
        <circle cx="252" cy="440" r="3" fill="#6bcf7f"/>
        
        {/* Code lines */}
        <line x1="230" y1="460" x2="320" y2="460" stroke="#4ecdc4" strokeWidth="2" className="code-line code-1"/>
        <line x1="230" y1="470" x2="290" y2="470" stroke="#ff6b6b" strokeWidth="2" className="code-line code-2"/>
        <line x1="240" y1="480" x2="310" y2="480" stroke="#95e1d3" strokeWidth="2" className="code-line code-3"/>
        <line x1="230" y1="490" x2="280" y2="490" stroke="#f38181" strokeWidth="2" className="code-line code-4"/>
        <line x1="240" y1="500" x2="330" y2="500" stroke="#aa96da" strokeWidth="2" className="code-line code-5"/>
        <line x1="230" y1="510" x2="300" y2="510" stroke="#fcbad3" strokeWidth="2" className="code-line code-6"/>
        <line x1="240" y1="520" x2="320" y2="520" stroke="#ffffd2" strokeWidth="2" className="code-line code-7"/>
        
        {/* Keyboard */}
        <rect x="210" y="540" width="180" height="90" fill="#34495e" rx="5"/>
        {[...Array(12)].map((_, i) => (
          <rect key={`key-${i}`} x={215 + (i % 6) * 28} y={545 + Math.floor(i / 6) * 20} width="24" height="15" fill="#2c3e50" rx="2" className="key"/>
        ))}
        
        {/* Coffee mug */}
        <ellipse cx="480" cy="560" rx="25" ry="8" fill="#d4a574"/>
        <rect x="455" y="560" width="50" height="60" fill="#fff" stroke="#d4a574" strokeWidth="3" rx="5"/>
        <path d="M 505 575 Q 525 575 525 590 Q 525 605 505 605" stroke="#d4a574" strokeWidth="3" fill="none"/>
        <ellipse cx="480" cy="565" rx="20" ry="6" fill="#8b6f47"/>
        
        {/* Steam */}
        <path d="M 470 550 Q 465 530 470 510" stroke="#d4d4d4" strokeWidth="2" fill="none" opacity="0.7" className="steam steam-1"/>
        <path d="M 480 550 Q 475 530 480 510" stroke="#d4d4d4" strokeWidth="2" fill="none" opacity="0.7" className="steam steam-2"/>
        <path d="M 490 550 Q 485 530 490 510" stroke="#d4d4d4" strokeWidth="2" fill="none" opacity="0.7" className="steam steam-3"/>
        
        {/* Books stack */}
        <rect x="80" y="520" width="60" height="35" fill="#e74c3c" rx="3" transform="rotate(-5 110 537)"/>
        <rect x="85" y="490" width="60" height="35" fill="#3498db" rx="3" transform="rotate(-3 115 507)"/>
        <rect x="90" y="460" width="60" height="35" fill="#2ecc71" rx="3" transform="rotate(-1 120 477)"/>
        <line x1="85" y1="537" x2="135" y2="532" stroke="#c0392b" strokeWidth="2"/>
        <line x1="90" y1="507" x2="140" y2="504" stroke="#2980b9" strokeWidth="2"/>
        <line x1="95" y1="477" x2="145" y2="476" stroke="#27ae60" strokeWidth="2"/>
        
        {/* Plant */}
        <ellipse cx="520" cy="540" rx="30" ry="15" fill="#8b6f47"/>
        <path d="M 520 540 Q 505 510 500 480" stroke="#27ae60" strokeWidth="4" fill="none"/>
        <path d="M 520 540 Q 520 505 520 470" stroke="#27ae60" strokeWidth="4" fill="none"/>
        <path d="M 520 540 Q 535 510 540 480" stroke="#27ae60" strokeWidth="4" fill="none"/>
        <ellipse cx="500" cy="480" rx="12" ry="18" fill="#2ecc71" className="leaf leaf-1"/>
        <ellipse cx="520" cy="470" rx="12" ry="18" fill="#2ecc71" className="leaf leaf-2"/>
        <ellipse cx="540" cy="480" rx="12" ry="18" fill="#2ecc71" className="leaf leaf-3"/>
        
        {/* Floating elements */}
        <circle cx="100" cy="300" r="4" fill="#ffd93d" className="particle particle-1"/>
        <circle cx="500" cy="250" r="3" fill="#ff6b9d" className="particle particle-2"/>
        <circle cx="150" cy="200" r="3.5" fill="#6c5ce7" className="particle particle-3"/>
        <circle cx="450" cy="350" r="3" fill="#4ecdc4" className="particle particle-4"/>
        <path d="M 550 200 L 555 210 L 545 210 Z" fill="#ffd93d" className="particle particle-5"/>
        <path d="M 80 400 L 85 410 L 75 410 Z" fill="#ff6b9d" className="particle particle-6"/>
      </svg>
    </div>
  );
};

export default StudyAnimation;

