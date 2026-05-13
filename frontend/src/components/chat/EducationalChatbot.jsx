import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '../ui/Card';

const EducationalChatbot = ({ isSessionActive }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Hi! I\'m your study assistant. Ask me any educational questions without leaving your focus session!',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call AI API (OpenAI, Gemini, or local model)
      const response = await fetch('http://localhost:5000/api/chat/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: input,
          context: 'educational',
          sessionActive: isSessionActive
        })
      });

      const data = await response.json();

      const assistantMessage = {
        role: 'assistant',
        content: data.answer,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      // Fallback to simple responses
      const fallbackAnswer = generateFallbackAnswer(input);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: fallbackAnswer,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackAnswer = (question) => {
    const q = question.toLowerCase();
    
    // Math questions
    if (q.includes('calculus') || q.includes('derivative')) {
      return '📐 For calculus help:\n\n1. Derivative basics: d/dx(x^n) = nx^(n-1)\n2. Chain rule: d/dx[f(g(x))] = f\'(g(x)) × g\'(x)\n3. Product rule: d/dx[f(x)g(x)] = f\'(x)g(x) + f(x)g\'(x)\n\nNeed more specific help? Ask me about a particular problem!';
    }
    
    if (q.includes('algebra') || q.includes('equation')) {
      return '🔢 Algebra tips:\n\n1. Isolate the variable on one side\n2. Perform same operation on both sides\n3. Simplify step by step\n4. Check your answer\n\nShare your specific equation and I\'ll guide you!';
    }

    // Programming questions
    if (q.includes('python') || q.includes('code') || q.includes('programming')) {
      return '💻 Python help:\n\n```python\n# Basic syntax\nfor i in range(10):\n    print(i)\n\n# Functions\ndef greet(name):\n    return f"Hello {name}"\n```\n\nWhat specific concept do you need help with?';
    }

    // Science questions
    if (q.includes('physics') || q.includes('force') || q.includes('motion')) {
      return '⚛️ Physics concepts:\n\n• Newton\'s Laws\n• F = ma (Force = mass × acceleration)\n• Energy = Work = Force × Distance\n\nAsk me about a specific topic!';
    }

    if (q.includes('chemistry') || q.includes('element') || q.includes('reaction')) {
      return '🧪 Chemistry help:\n\n• Periodic table elements\n• Chemical reactions\n• Balancing equations\n• Molecular structures\n\nWhat chemistry topic are you studying?';
    }

    // General study help
    if (q.includes('how to study') || q.includes('tips')) {
      return '📚 Study tips:\n\n1. Active recall - test yourself\n2. Spaced repetition - review regularly\n3. Pomodoro technique - 25 min focus\n4. Teach others - best way to learn\n5. Take breaks - rest is important\n\nStay focused! 🎯';
    }

    // Default response
    return '🤔 I\'m here to help with:\n\n• Math (Calculus, Algebra, Geometry)\n• Science (Physics, Chemistry, Biology)\n• Programming (Python, JavaScript, etc.)\n• Study techniques\n• Homework questions\n\nPlease ask your educational question and I\'ll do my best to help!';
  };

  const quickQuestions = [
    'How to solve quadratic equations?',
    'Explain derivatives in calculus',
    'What is Newton\'s first law?',
    'How does photosynthesis work?',
    'Python for loop syntax'
  ];

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl transition-all z-50 ${
          isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
        }`}
        title={isOpen ? 'Close chat' : 'Ask educational questions'}
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] shadow-2xl rounded-2xl overflow-hidden z-50 bg-white dark:bg-gray-800">
          <Card className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
              <h3 className="font-bold text-lg flex items-center gap-2">
                🎓 Study Assistant
                {isSessionActive && (
                  <span className="text-xs bg-green-500 px-2 py-1 rounded-full">
                    Session Active
                  </span>
                )}
              </h3>
              <p className="text-xs opacity-90">Ask educational questions without leaving!</p>
            </div>

            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      msg.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </CardContent>

            {/* Quick Questions */}
            {messages.length === 1 && (
              <div className="px-4 pb-2">
                <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.slice(0, 3).map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(q)}
                      className="text-xs bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask your educational question..."
                  className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !input.trim()}
                  className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? '...' : '📤'}
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default EducationalChatbot;