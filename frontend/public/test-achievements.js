// Test data generator for achievements
// Run this in browser console: generateTestSessions()

window.generateTestSessions = () => {
  const sessions = [];
  const today = new Date();
  
  // Generate 15 sessions over the past 10 days
  for (let i = 0; i < 15; i++) {
    const daysAgo = Math.floor(i / 2);
    const sessionDate = new Date(today);
    sessionDate.setDate(today.getDate() - daysAgo);
    
    sessions.push({
      _id: `test-${i}`,
      startTime: sessionDate.toISOString(),
      duration: [25, 45, 60, 90][Math.floor(Math.random() * 4)],
      category: ['work', 'study', 'coding'][Math.floor(Math.random() * 3)],
      completed: true,
      focusScore: 70 + Math.floor(Math.random() * 30),
      distractions: Math.random() > 0.7 ? [] : [{ source: 'Phone', category: 'notification' }]
    });
  }
  
  localStorage.setItem('focusSessions', JSON.stringify(sessions));
  console.log('✅ Generated 15 test sessions!');
  console.log('🔄 Refresh the page to see achievements update');
  return sessions;
};

window.clearTestSessions = () => {
  localStorage.removeItem('focusSessions');
  console.log('🗑️ Cleared all test sessions');
  console.log('🔄 Refresh the page');
};

console.log('📊 Test data generator loaded!');
console.log('Run: generateTestSessions() to create sample data');
console.log('Run: clearTestSessions() to remove all data');
