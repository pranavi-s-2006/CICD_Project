import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './services/context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LiveSession from './pages/LiveSession';
import SecureTest from './pages/SecureTest';
import AIInsights from './pages/AIInsights';
import Achievements from './pages/Achievements';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  // Load theme on app start
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <main className="main-content">
                      <Dashboard />
                    </main>
                  </>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/live-session" 
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <main className="main-content">
                      <LiveSession />
                    </main>
                  </>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/secure-test" 
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <main className="main-content">
                      <SecureTest />
                    </main>
                  </>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/ai-insights" 
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <main className="main-content">
                      <AIInsights />
                    </main>
                  </>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/achievements" 
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <main className="main-content">
                      <Achievements />
                    </main>
                  </>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <main className="main-content">
                      <Analytics />
                    </main>
                  </>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <main className="main-content">
                      <Settings />
                    </main>
                  </>
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;