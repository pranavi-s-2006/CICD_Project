import React, { useState, useEffect } from 'react';
import { useAuth } from '../services/context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [notifications, setNotifications] = useState(JSON.parse(localStorage.getItem('notifications') || 'true'));
  const [soundEnabled, setSoundEnabled] = useState(JSON.parse(localStorage.getItem('soundEnabled') || 'true'));
  const [autoSave, setAutoSave] = useState(JSON.parse(localStorage.getItem('autoSave') || 'true'));
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState(user?.bio || '');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters!');
      return;
    }
    alert('Password changed successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleProfileUpdate = () => {
    alert('Profile updated successfully!');
  };

  const handleNotificationToggle = () => {
    const newValue = !notifications;
    setNotifications(newValue);
    localStorage.setItem('notifications', JSON.stringify(newValue));
  };

  const handleSoundToggle = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem('soundEnabled', JSON.stringify(newValue));
  };

  const handleAutoSaveToggle = () => {
    const newValue = !autoSave;
    setAutoSave(newValue);
    localStorage.setItem('autoSave', JSON.stringify(newValue));
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure? This will delete all your session data!')) {
      localStorage.removeItem('focusSessions');
      localStorage.removeItem('sessionLogs');
      alert('All data cleared!');
    }
  };

  const exportData = () => {
    const data = {
      sessions: JSON.parse(localStorage.getItem('focusSessions') || '[]'),
      logs: JSON.parse(localStorage.getItem('sessionLogs') || '[]')
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focusloom-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-calm-50 via-white to-focus-50 dark:from-calm-900 dark:via-calm-800 dark:to-focus-900 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-calm-900 dark:text-calm-100 mb-6">⚙️ Settings</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'profile', icon: '👤', label: 'Profile' },
            { id: 'security', icon: '🔒', label: 'Security' },
            { id: 'appearance', icon: '🎨', label: 'Appearance' },
            { id: 'preferences', icon: '⚡', label: 'Preferences' },
            { id: 'data', icon: '💾', label: 'Data' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap shadow-sm ${
                activeTab === tab.id
                  ? 'bg-focus-600 text-white shadow-lg scale-105'
                  : 'bg-white dark:bg-calm-800 text-calm-700 dark:text-calm-300 hover:bg-calm-50 dark:hover:bg-calm-700 border border-calm-200 dark:border-calm-700'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <Card className="border-2 border-calm-200 dark:border-calm-700">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-6 p-4 bg-gradient-to-r from-focus-50 to-purple-50 dark:from-focus-900/20 dark:to-purple-900/20 rounded-xl border border-focus-200 dark:border-focus-800">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-focus-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-calm-900 dark:text-calm-100">{name}</h3>
                      <p className="text-calm-600 dark:text-calm-400">{email}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-calm-900 dark:text-calm-100">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-calm-300 dark:border-calm-700 bg-white dark:bg-calm-800 text-calm-900 dark:text-calm-100 focus:ring-2 focus:ring-focus-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-calm-900 dark:text-calm-100">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-calm-300 dark:border-calm-700 bg-white dark:bg-calm-800 text-calm-900 dark:text-calm-100 focus:ring-2 focus:ring-focus-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-calm-900 dark:text-calm-100">Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      placeholder="Tell us about yourself..."
                      className="w-full px-4 py-2 rounded-lg border border-calm-300 dark:border-calm-700 bg-white dark:bg-calm-800 text-calm-900 dark:text-calm-100 placeholder:text-calm-500 dark:placeholder:text-calm-500 focus:ring-2 focus:ring-focus-500 focus:border-transparent"
                    />
                  </div>

                  <Button onClick={handleProfileUpdate}>Update Profile</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <Card className="border-2 border-calm-200 dark:border-calm-700">
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-calm-900 dark:text-calm-100">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-calm-300 dark:border-calm-700 bg-white dark:bg-calm-800 text-calm-900 dark:text-calm-100 focus:ring-2 focus:ring-focus-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-calm-900 dark:text-calm-100">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-calm-300 dark:border-calm-700 bg-white dark:bg-calm-800 text-calm-900 dark:text-calm-100 focus:ring-2 focus:ring-focus-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-calm-900 dark:text-calm-100">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-calm-300 dark:border-calm-700 bg-white dark:bg-calm-800 text-calm-900 dark:text-calm-100 focus:ring-2 focus:ring-focus-500 focus:border-transparent"
                    />
                  </div>

                  <Button onClick={handlePasswordChange}>Change Password</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-calm-200 dark:border-calm-700">
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-calm-600 dark:text-calm-400 mb-4">
                  Add an extra layer of security to your account
                </p>
                <Button variant="secondary">Enable 2FA</Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Appearance Tab */}
        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <Card className="border-2 border-calm-200 dark:border-calm-700">
              <CardHeader>
                <CardTitle>Theme</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <button
                    onClick={() => handleThemeChange('light')}
                    className={`p-8 rounded-2xl border-3 transition-all shadow-md hover:shadow-xl ${
                      theme === 'light'
                        ? 'border-focus-600 bg-focus-50 dark:bg-focus-900/20 ring-4 ring-focus-200 dark:ring-focus-800 scale-105'
                        : 'border-calm-300 dark:border-calm-700 bg-white dark:bg-calm-800 hover:border-focus-400 dark:hover:border-focus-600'
                    }`}
                  >
                    <div className="text-5xl mb-3">☀️</div>
                    <div className="font-bold text-lg text-calm-900 dark:text-calm-100 mb-1">Light Mode</div>
                    <div className="text-sm text-calm-600 dark:text-calm-400">Bright and clear</div>
                  </button>

                  <button
                    onClick={() => handleThemeChange('dark')}
                    className={`p-8 rounded-2xl border-3 transition-all shadow-md hover:shadow-xl ${
                      theme === 'dark'
                        ? 'border-focus-600 bg-focus-50 dark:bg-focus-900/20 ring-4 ring-focus-200 dark:ring-focus-800 scale-105'
                        : 'border-calm-300 dark:border-calm-700 bg-white dark:bg-calm-800 hover:border-focus-400 dark:hover:border-focus-600'
                    }`}
                  >
                    <div className="text-5xl mb-3">🌙</div>
                    <div className="font-bold text-lg text-calm-900 dark:text-calm-100 mb-1">Dark Mode</div>
                    <div className="text-sm text-calm-600 dark:text-calm-400">Easy on the eyes</div>
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-calm-200 dark:border-calm-700">
              <CardHeader>
                <CardTitle>Language</CardTitle>
              </CardHeader>
              <CardContent>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-calm-300 dark:border-calm-700 bg-white dark:bg-calm-800 text-calm-900 dark:text-calm-100 focus:ring-2 focus:ring-focus-500 focus:border-transparent"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="hi">Hindi</option>
                </select>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <Card className="border-2 border-calm-200 dark:border-calm-700">
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-white dark:bg-calm-800 border border-calm-200 dark:border-calm-700">
                    <div>
                      <div className="font-medium text-calm-900 dark:text-calm-100">Enable Notifications</div>
                      <div className="text-sm text-calm-600 dark:text-calm-400">
                        Receive alerts during focus sessions
                      </div>
                    </div>
                    <button
                      onClick={handleNotificationToggle}
                      className={`w-14 h-8 rounded-full transition ${
                        notifications ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 bg-white rounded-full transition transform ${
                          notifications ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-white dark:bg-calm-800 border border-calm-200 dark:border-calm-700">
                    <div>
                      <div className="font-medium text-calm-900 dark:text-calm-100">Sound Effects</div>
                      <div className="text-sm text-calm-600 dark:text-calm-400">
                        Play sounds for alerts and notifications
                      </div>
                    </div>
                    <button
                      onClick={handleSoundToggle}
                      className={`w-14 h-8 rounded-full transition ${
                        soundEnabled ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 bg-white rounded-full transition transform ${
                          soundEnabled ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-white dark:bg-calm-800 border border-calm-200 dark:border-calm-700">
                    <div>
                      <div className="font-medium text-calm-900 dark:text-calm-100">Auto-Save Notes</div>
                      <div className="text-sm text-calm-600 dark:text-calm-400">
                        Automatically save session notes
                      </div>
                    </div>
                    <button
                      onClick={handleAutoSaveToggle}
                      className={`w-14 h-8 rounded-full transition ${
                        autoSave ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 bg-white rounded-full transition transform ${
                          autoSave ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-calm-200 dark:border-calm-700">
              <CardHeader>
                <CardTitle>Focus Session Defaults</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-calm-900 dark:text-calm-100">Default Duration (minutes)</label>
                    <input
                      type="number"
                      defaultValue={25}
                      className="w-full px-4 py-2 rounded-lg border border-calm-300 dark:border-calm-700 bg-white dark:bg-calm-800 text-calm-900 dark:text-calm-100 focus:ring-2 focus:ring-focus-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-calm-900 dark:text-calm-100">Default Category</label>
                    <select className="w-full px-4 py-2 rounded-lg border border-calm-300 dark:border-calm-700 bg-white dark:bg-calm-800 text-calm-900 dark:text-calm-100 focus:ring-2 focus:ring-focus-500 focus:border-transparent">
                      <option>Work</option>
                      <option>Study</option>
                      <option>Coding</option>
                      <option>Reading</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Data Tab */}
        {activeTab === 'data' && (
          <div className="space-y-6">
            <Card className="border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-white to-green-50 dark:from-calm-800 dark:to-green-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>📥</span>
                  Export Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-calm-600 dark:text-calm-400 mb-4">
                  Download all your focus sessions and notes as JSON
                </p>
                <Button onClick={exportData}>📥 Export Data</Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-red-200 dark:border-red-800 bg-gradient-to-br from-white to-red-50 dark:from-calm-800 dark:to-red-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>🗑️</span>
                  Clear All Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-600 dark:text-red-400 mb-4">
                  ⚠️ Warning: This will permanently delete all your session data!
                </p>
                <Button variant="destructive" onClick={clearAllData}>
                  🗑️ Clear All Data
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-red-300 dark:border-red-700 bg-gradient-to-br from-white to-red-50 dark:from-calm-800 dark:to-red-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>⚠️</span>
                  Account
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-calm-600 dark:text-calm-400 mb-4">
                  Permanently delete your account and all associated data
                </p>
                <Button variant="destructive">Delete Account</Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
