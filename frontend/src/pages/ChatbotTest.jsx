import React from 'react';
import EducationalChatbot from '../components/chat/EducationalChatbot';

const ChatbotTest = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Chatbot Test Page</h1>
        <p className="text-gray-600 mb-8">
          Look for the 💬 button in the bottom-right corner of the screen.
        </p>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Instructions:</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Look at the bottom-right corner of your screen</li>
            <li>You should see a blue/purple 💬 button</li>
            <li>Click it to open the chatbot</li>
            <li>Try asking: "How to solve calculus?"</li>
          </ol>
        </div>
      </div>
      
      {/* Chatbot Component */}
      <EducationalChatbot isSessionActive={true} />
    </div>
  );
};

export default ChatbotTest;