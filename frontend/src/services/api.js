import axios from 'axios';
import AnalyticsCalculator from '../utils/AnalyticsCalculator';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => 
    api.post('/api/auth/login', { email, password }),
  
  register: (name, email, password) => 
    api.post('/api/auth/register', { name, email, password }),
};

export const sessionAPI = {
  startSession: (data) => 
    api.post('/api/sessions/start', data),
  
  endSession: (sessionId) => 
    api.post(`/api/sessions/${sessionId}/end`),
  
  logDistraction: (sessionId, data) => 
    api.post(`/api/sessions/${sessionId}/distractions`, data),
  
  resolveDistraction: (distractionId) => 
    api.patch(`/api/sessions/distractions/${distractionId}/resolve`),
  
  getSessions: (params) => 
    api.get('/api/sessions', { params }),
};

export const analyticsAPI = {
  getDailySummary: (date) => 
    api.get('/api/analytics/daily-summary', { params: { date } }),
  
  getWeeklyTrends: () => 
    api.get('/api/analytics/weekly-trends'),
  
  getDistractionPatterns: (days) => 
    api.get('/api/analytics/distraction-patterns', { params: { days } }),
  
  // Get real-time calculated insights from backend
  getInsights: (days = 30) => 
    api.get('/api/analytics/insights', { params: { days } }),
};

export const streakAPI = {
  recordLogin: () => 
    api.post('/api/streak/login'),
  
  getStreak: () => 
    api.get('/api/streak/streak'),
  
  getActivityHistory: (days = 30) => 
    api.get('/api/streak/history', { params: { days } }),
};

export default api;