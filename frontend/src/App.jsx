

import { useState, useEffect } from 'react';
import Header from './components/Header';
import PlatformContent from './components/PlatformContent';
import ChatbotModal from './components/ChatbotModal';

function App() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  // Load session ID from localStorage on initial render
  useEffect(() => {
    const savedSessionId = localStorage.getItem('chatSessionId');
    if (savedSessionId) {
      setSessionId(savedSessionId);
    }
  }, []);

  // Send message to backend
  const sendMessage = async (text) => {
    if (!text.trim()) return;

    // Add user message to chat
    const userMessage = { text, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Call backend API
      const response = await fetch('http://localhost:5001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: text,
          sessionId: sessionId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      // Save session ID if it's new
      if (data.sessionId && (!sessionId || sessionId !== data.sessionId)) {
        setSessionId(data.sessionId);
        localStorage.setItem('chatSessionId', data.sessionId);
      }
      
      // Add bot response to chat
      setMessages(prev => [...prev, { text: data.message, sender: 'bot' }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        text: 'Sorry, I\'m having trouble connecting right now. Please try again later.', 
        sender: 'bot', 
        error: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Header title="STAN AI Platform" />
      <PlatformContent 
        title="Welcome to STAN AI Platform"
        subtitle="Your intelligent conversational assistant powered by Google Gemini"
      />
      <ChatbotModal 
        messages={messages} 
        isLoading={isLoading} 
        onSendMessage={sendMessage} 
      />
    </div>
  );
}

export default App;
