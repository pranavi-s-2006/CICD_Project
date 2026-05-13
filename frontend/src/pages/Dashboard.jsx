import React, { useState, useEffect } from 'react';
import FocusTimer from '../components/FocusTimer';
import { analyticsAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const SAMPLE_WEEKLY = [
  { date: new Date(Date.now() - 6 * 86400000).toISOString(), focusTime: 120, distractionCount: 8 },
  { date: new Date(Date.now() - 5 * 86400000).toISOString(), focusTime: 95,  distractionCount: 12 },
  { date: new Date(Date.now() - 4 * 86400000).toISOString(), focusTime: 150, distractionCount: 6 },
  { date: new Date(Date.now() - 3 * 86400000).toISOString(), focusTime: 110, distractionCount: 10 },
  { date: new Date(Date.now() - 2 * 86400000).toISOString(), focusTime: 135, distractionCount: 7 },
  { date: new Date(Date.now() - 1 * 86400000).toISOString(), focusTime: 125, distractionCount: 9 },
  { date: new Date().toISOString(),                           focusTime: 145, distractionCount: 12 }
];

const SAMPLE_SUMMARY = {
  focusScore: 78,
  totalFocusTime: 145,
  totalSessions: 6,
  distractionCount: 12,
  totalDistractionTime: 45,
  avgSessionDuration: 24
};

const Dashboard = () => {
  const [dailySummary, setDailySummary] = useState(SAMPLE_SUMMARY);
  const [weeklyData, setWeeklyData] = useState(SAMPLE_WEEKLY);
  const [timerState, setTimerState] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [summaryResponse, weeklyResponse] = await Promise.all([
        analyticsAPI.getDailySummary(),
        analyticsAPI.getWeeklyTrends()
      ]);
      const summary = summaryResponse.data;
      const daily = weeklyResponse.data.dailyData;
      const hasWeeklyData = daily && Object.values(daily).some(d => d.focusTime > 0 || d.sessionCount > 0);
      if (summary?.totalSessions > 0) setDailySummary(summary);
      if (hasWeeklyData) setWeeklyData(Object.values(daily));
    } catch (error) {
      // sample data already set as default state, nothing to do
    }
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome Back!</h1>
        <p>Track and improve your focus today</p>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <h3>Focus Score</h3>
            <div className="stat-value">{dailySummary?.focusScore || 0}</div>
            <div className="stat-trend">
              <span className="trend-up">↑ 5% from yesterday</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <h3>Focus Time</h3>
            <div className="stat-value">{formatTime(dailySummary?.totalFocusTime || 0)}</div>
            <div className="stat-subtitle">{dailySummary?.totalSessions || 0} sessions</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>Distractions</h3>
            <div className="stat-value">{dailySummary?.distractionCount || 0}</div>
            <div className="stat-subtitle">
              Avg: {Math.round(dailySummary?.totalDistractionTime / (dailySummary?.distractionCount || 1)) || 0}m each
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Avg Session</h3>
            <div className="stat-value">{Math.round(dailySummary?.avgSessionDuration || 0)}m</div>
            <div className="stat-subtitle">Best: 45m</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Left Column */}
        <div className="dashboard-left">
          <div className="focus-section">
            <h2>🍅 Pomodoro</h2>
            <FocusTimer onStateChange={setTimerState} />

            {timerState?.pomodoroMode && timerState?.isActive && (
              <div className="pomodoro-dashboard-tracker">
                <div className="pomodoro-title">🍅 Pomodoro Progress</div>
                <div className="pomodoro-sessions">
                  {[1, 2, 3, 4].map((num) => (
                    <div
                      key={num}
                      className={`pomodoro-dot ${
                        num <= timerState.pomodoroCount ? 'completed' :
                        num === timerState.pomodoroCount + 1 && !timerState.isBreak ? 'active' : ''
                      }`}
                    >
                      <div><span className="dot-number">{num}</span></div>
                      <span className="dot-label">Session {num}</span>
                    </div>
                  ))}
                </div>
                <div className="pomodoro-status">
                  {timerState.isBreak ? (
                    <span className="break-badge">☕ Break Time - Relax & Recharge</span>
                  ) : (
                    <span className="focus-badge">🎯 Focus Time - Stay Concentrated</span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="recent-sessions">
            <h2>Recent Sessions</h2>
            <div className="sessions-list">
              {[1, 2, 3].map((session) => (
                <div key={session} className="session-item">
                  <div className="session-category">Work</div>
                  <div className="session-duration">25 minutes</div>
                  <div className="session-score"><span className="score-badge">85</span></div>
                  <div className="session-time">2 hours ago</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="dashboard-right">
          <div className="chart-section">
            <h2>Weekly Focus Trends</h2>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData.slice(-7)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [`${Math.round(value)}m`, 'Focus Time']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Legend />
                  <Bar dataKey="focusTime" name="Focus Time (minutes)" fill="#4299e1" />
                  <Bar dataKey="distractionCount" name="Distractions" fill="#f56565" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="quick-tips">
            <h2>Focus Tips</h2>
            <div className="tips-grid">
              <div className="tip-card">
                <h3>🍅 Try Pomodoro</h3>
                <p>25 minutes focus, 5 minutes break. Repeat 4 times, then take a longer break.</p>
              </div>
              <div className="tip-card">
                <h3>📵 Phone Away</h3>
                <p>Place your phone in another room during focus sessions to reduce notifications.</p>
              </div>
              <div className="tip-card">
                <h3>🎯 Clear Goals</h3>
                <p>Define exactly what you want to accomplish in each session before starting.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
