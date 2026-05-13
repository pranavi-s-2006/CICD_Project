import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/context/AuthContext';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    { icon: '🎓', title: 'Live Session', desc: 'Real-time focus tracking with instant feedback', color: '#4299e1' },
    { icon: '🔒', title: 'Secure Test', desc: 'Proctored exam mode with integrity monitoring', color: '#48bb78' },
    { icon: '🤖', title: 'AI Insights', desc: 'Smart recommendations powered by machine learning', color: '#9f7aea' },
    { icon: '📊', title: 'Analytics', desc: 'Deep dive into your focus patterns and trends', color: '#ed8936' },
    { icon: '🏆', title: 'Achievements', desc: 'Gamified progress tracking with rewards', color: '#f56565' }
  ];

  // useEffect(() => {
  //   if (user) navigate('/dashboard');
  // }, [user, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="landing-page">
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <nav className="landing-nav">
        <div className="logo">
          <span className="logo-icon">🎯</span>
          <span className="logo-text">FOCUSLOOM</span>
        </div>
        <div className="nav-actions">
          <button onClick={() => navigate('/login')} className="btn-ghost">Login</button>
          <button onClick={() => navigate('/register')} className="btn-primary">Get Started</button>
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Master Your Focus,<br />
            <span className="gradient-text">Transform Your Learning</span>
          </h1>
          <p className="hero-subtitle">
            AI-powered attention mapping that helps students and professionals<br />
            understand their focus patterns and achieve peak productivity
          </p>
          <div className="hero-cta">
            <button onClick={() => navigate('/register')} className="btn-hero">
              Start Free Trial
              <span className="arrow">→</span>
            </button>
          </div>
        </div>

        <div className="hero-visual">
          <img src="/image0.jpg" alt="Focus" className="floating-card card-1" />
          <img src="/image1.jpg" alt="Learning" className="floating-card card-2" />
          <img src="/image2.jpg" alt="Achievement" className="floating-card card-3" />
        </div>
      </section>

      <section className="features-carousel">
        <h2 className="section-title">Powerful Features for Modern Learners</h2>
        <div className="carousel-container">
          <div className="carousel-track" style={{ transform: `translateX(-${currentFeature * 20}%)` }}>
            {features.map((feature, idx) => (
              <div key={idx} className={`feature-card ${idx === currentFeature ? 'active' : ''}`}>
                <div className="feature-icon" style={{ background: feature.color }}>{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="carousel-dots">
          {features.map((_, idx) => (
            <span key={idx} className={`dot ${idx === currentFeature ? 'active' : ''}`} onClick={() => setCurrentFeature(idx)}></span>
          ))}
        </div>
      </section>

      <section className="features-grid">
        {features.map((feature, idx) => (
          <div key={idx} className="grid-feature" style={{ animationDelay: `${idx * 0.1}s` }}>
            <div className="grid-icon" style={{ background: feature.color }}>{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.desc}</p>
          </div>
        ))}
      </section>

      <section className="stats-section">
        <div className="stat-item">
          <div className="stat-number">10K+</div>
          <div className="stat-label">Active Users</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">500K+</div>
          <div className="stat-label">Focus Sessions</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">95%</div>
          <div className="stat-label">Satisfaction Rate</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">40%</div>
          <div className="stat-label">Productivity Boost</div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to Transform Your Focus?</h2>
        <p>Join thousands of students and professionals achieving their goals</p>
        <button onClick={() => navigate('/register')} className="btn-cta">
          Get Started Free
        </button>
      </section>

      <footer className="landing-footer">
        <p>© 2024 FOCUSLOOM. Built with ❤️ for better focus.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
