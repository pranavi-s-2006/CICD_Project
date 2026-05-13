import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-brand">
          <Link to="/dashboard" className="navbar-logo">
            <span className="logo-text">FOCUSLOOM</span>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className="hamburger"></span>
        </button>

        {/* Navigation Links */}
        <div className={`navbar-links ${isMobileMenuOpen ? 'open' : ''}`}>
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">
                <span className="nav-icon">📊</span>
                Dashboard
              </Link>
              <Link to="/live-session" className="nav-link">
                <span className="nav-icon">🎓</span>
                Live Session
              </Link>
              <Link to="/secure-test" className="nav-link">
                <span className="nav-icon">🔒</span>
                Secure Test
              </Link>
              <Link to="/ai-insights" className="nav-link">
                <span className="nav-icon">🤖</span>
                AI Insights
              </Link>
              <Link to="/achievements" className="nav-link">
                <span className="nav-icon">🏆</span>
                Achievements
              </Link>
              <Link to="/analytics" className="nav-link">
                <span className="nav-icon">📈</span>
                Analytics
              </Link>
              <Link to="/settings" className="nav-link">
                <span className="nav-icon">⚙️</span>
                Settings
              </Link>
              
              {/* User Profile */}
              <div className="user-profile">
                <div className="user-avatar">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <span className="user-name">{user.name}</span>
                  <span className="user-email">{user.email}</span>
                </div>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="nav-link register">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;