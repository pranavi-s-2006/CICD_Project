import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from './ui/Button';
import { useAuth } from '../services/context/AuthContext';

const ModernNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/real-time-session', label: 'Live Session', icon: '⚡' },
    { path: '/secure-test', label: 'Secure Test', icon: '🔒' },
    { path: '/ai-insights', label: 'AI Insights', icon: '🤖' },
    { path: '/analytics', label: 'Analytics', icon: '📊' },
    { path: '/achievements', label: 'Achievements', icon: '🏆' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  const isActive = (path) => location.pathname === path;

  // Don't show navbar on auth pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/20 dark:border-gray-700/30">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-focus-500 to-focus-600 flex items-center justify-center text-white font-bold shadow-lg shadow-focus-500/30 group-hover:shadow-focus-500/50 transition-all">
              🎯
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl font-bold font-display text-gradient">
                FOCUSLOOM
              </h1>
              <p className="text-xs text-calm-500 -mt-1">
                Attention Mapping
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive(item.path)
                    ? 'bg-focus-100 dark:bg-focus-900 text-focus-700 dark:text-focus-300'
                    : 'text-calm-600 dark:text-calm-400 hover:text-calm-900 dark:hover:text-calm-200 hover:bg-calm-100 dark:hover:bg-calm-800'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-calm-600 dark:text-calm-400 hover:bg-calm-100 dark:hover:bg-calm-800 transition-all"
              title="Toggle dark mode"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>

            {/* User Menu */}
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-calm-900 dark:text-calm-100">
                    {user.name || user.email}
                  </p>
                  <p className="text-xs text-calm-500">
                    Focus Champion
                  </p>
                </div>
                
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-lg">
                  {(user.name || user.email).charAt(0).toUpperCase()}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="hidden md:flex"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  Sign In
                </Button>
                <Button size="sm" onClick={() => navigate('/register')}>
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-xl text-calm-600 dark:text-calm-400 hover:bg-calm-100 dark:hover:bg-calm-800 transition-all"
            >
              {isMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20 dark:border-gray-700/30">
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive(item.path)
                      ? 'bg-focus-100 dark:bg-focus-900 text-focus-700 dark:text-focus-300'
                      : 'text-calm-600 dark:text-calm-400 hover:text-calm-900 dark:hover:text-calm-200 hover:bg-calm-100 dark:hover:bg-calm-800'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
              
              {user && (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all w-full text-left"
                >
                  <span className="text-lg">🚪</span>
                  Sign Out
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default ModernNavbar;