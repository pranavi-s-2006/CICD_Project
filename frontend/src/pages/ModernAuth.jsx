import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../services/context/AuthContext';

const ModernAuth = ({ mode = 'login' }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const isLogin = mode === 'login';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const result = isLogin
        ? await login(formData.email, formData.password)
        : await register(formData.name, formData.email, formData.password);

      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Authentication failed');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900 dark:via-orange-900 dark:to-yellow-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        
        {/* Logo & Brand */}
        <div className="text-center space-y-4">
          <Link to="/" className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-focus-500 to-focus-600 text-white text-2xl font-bold shadow-lg shadow-focus-500/30 hover:scale-110 transition-transform">
            🎯
          </Link>
          <div>
            <Link to="/" className="inline-block">
              <h1 className="text-3xl font-bold font-display text-gradient hover:scale-105 transition-transform">
                FOCUSLOOM
              </h1>
            </Link>
            <p className="text-calm-600 dark:text-calm-400 mt-2">
              {isLogin ? 'Welcome back! Ready to focus?' : 'Start your focus journey today'}
            </p>
          </div>
        </div>

        {/* Auth Card */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {isLogin ? 'Sign In' : 'Create Account'}
            </CardTitle>
            <CardDescription>
              {isLogin 
                ? 'Enter your credentials to access your focus dashboard'
                : 'Join thousands improving their focus and productivity'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Name Field (Register only) */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required={!isLogin}
                    className="w-full px-4 py-3 rounded-xl border border-calm-200 dark:border-calm-700 bg-white dark:bg-calm-800 focus:ring-2 focus:ring-focus-500 focus:border-transparent transition-all placeholder-calm-400"
                    placeholder="Enter your full name"
                  />
                </div>
              )}

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-calm-200 dark:border-calm-700 bg-white dark:bg-calm-800 focus:ring-2 focus:ring-focus-500 focus:border-transparent transition-all placeholder-calm-400"
                  placeholder="Enter your email"
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-calm-200 dark:border-calm-700 bg-white dark:bg-calm-800 focus:ring-2 focus:ring-focus-500 focus:border-transparent transition-all placeholder-calm-400"
                  placeholder="Enter your password"
                />
              </div>

              {/* Confirm Password (Register only) */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required={!isLogin}
                    className="w-full px-4 py-3 rounded-xl border border-calm-200 dark:border-calm-700 bg-white dark:bg-calm-800 focus:ring-2 focus:ring-focus-500 focus:border-transparent transition-all placeholder-calm-400"
                    placeholder="Confirm your password"
                  />
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-700 dark:text-red-300 text-center">
                    {error}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                size="lg" 
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {isLogin ? 'Signing In...' : 'Creating Account...'}
                  </div>
                ) : (
                  <>
                    <span className="mr-2">{isLogin ? '🚀' : '✨'}</span>
                    {isLogin ? 'Sign In' : 'Create Account'}
                  </>
                )}
              </Button>

              {/* Forgot Password (Login only) */}
              {isLogin && (
                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm text-focus-600 hover:text-focus-700 transition-colors"
                  >
                    Forgot your password?
                  </button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Switch Mode */}
        <div className="text-center">
          <p className="text-calm-600 dark:text-calm-400">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            {' '}
            <Link 
              to={isLogin ? '/register' : '/login'}
              className="text-focus-600 hover:text-focus-700 font-medium transition-colors"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </Link>
          </p>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-3 gap-4 pt-8">
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-focus-100 dark:bg-focus-900 flex items-center justify-center mx-auto mb-2">
              <span className="text-xl">📊</span>
            </div>
            <p className="text-xs text-calm-600 dark:text-calm-400">
              Focus Analytics
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900 flex items-center justify-center mx-auto mb-2">
              <span className="text-xl">⚠️</span>
            </div>
            <p className="text-xs text-calm-600 dark:text-calm-400">
              Distraction Tracking
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-2">
              <span className="text-xl">🎯</span>
            </div>
            <p className="text-xs text-calm-600 dark:text-calm-400">
              Focus Improvement
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernAuth;