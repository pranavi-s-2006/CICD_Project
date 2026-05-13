import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './services/context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ModernAuth from './pages/ModernAuth';
import EnhancedDashboard from './pages/EnhancedDashboard';
import ModernAnalytics from './pages/ModernAnalytics';
import AIInsights from './pages/AIInsights';
import Achievements from './pages/Achievements';
import RealTimeSession from './pages/RealTimeSession';
import Settings from './pages/Settings';
import ExamMode from './components/exam/ExamMode';
import SecureTestPlatform from './components/exam/SecureTestPlatform';
import ModernNavbar from './components/ModernNavbar';
import EducationalChatbot from './components/chat/EducationalChatbot';

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-calm-50 via-white to-focus-50 dark:from-calm-900 dark:via-calm-800 dark:to-focus-900">
      <ModernNavbar />
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/login" element={<ModernAuth mode="login" />} />
          <Route path="/register" element={<ModernAuth mode="register" />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <EnhancedDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/real-time-session" 
            element={
              <ProtectedRoute>
                <RealTimeSession />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/ai-insights" 
            element={
              <ProtectedRoute>
                <AIInsights />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute>
                <ModernAnalytics />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/achievements" 
            element={
              <ProtectedRoute>
                <Achievements />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/exam-mode" 
            element={
              <ProtectedRoute>
                <ExamMode />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/secure-test" 
            element={
              <ProtectedRoute>
                <SecureTestPlatform />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
      
      {/* Global Chatbot - Shows on all pages when logged in */}
      {user && <EducationalChatbot isSessionActive={false} />}
    </div>
  );
}

function ModernApp() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default ModernApp;