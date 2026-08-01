import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Sparkles, Store, ShoppingCart, Shield, Camera, LogOut, Cloud, MessageCircle } from 'lucide-react';
import MacDock, { DockItem } from '../components/ui/MacDock';
import AdminLayout from '../components/AdminLayout';
import api from '../services/api';

interface MessageSource {
  title: string;
  url: string;
  date?: string;
}

interface Message {
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  badgeType?: 'verified_gov' | 'verified_private' | 'unverified_mocked';
  generationProvenance?: string;
  sources?: MessageSource[];
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: 'Hello! I\'m AgroBot, your AI agricultural assistant. You can ask me about government agricultural guidelines, or check your private farm data like orders and harvest status.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      sender: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Call real API
    try {
      const res = await api.post('/chat', { message: input });
      const data = res.data;

      if (data.success) {
        const botMsg: Message = {
          sender: 'bot',
          text: data.reply,
          timestamp: new Date(),
          sources: data.sources,
          badgeType: data.badgeType,
          generationProvenance: data.generationProvenance
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        throw new Error(data.message || 'Failed to get response');
      }
    } catch (error) {
      console.error('API Error:', error);
      const botMsg: Message = {
        sender: 'bot',
        text: 'Failed to connect to the server.',
        timestamp: new Date(),
        badgeType: 'unverified_mocked',
        generationProvenance: 'MOCKED'
      };
      setMessages(prev => [...prev, botMsg]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isAuthenticated = !!localStorage.getItem('user');

  const quickQuestions = [
    'Best crop for 5 acres?',
    'Tractor price for small farm',
    'When to plant wheat?',
    'How to save water?'
  ];

  return (
    <div className="p-4 md:p-8">
      <div className={`max-w-4xl mx-auto ${isAuthenticated ? 'pb-32' : ''}`}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 mb-6 shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">🤖 Agro Assistant</h1>
              <p className="text-green-100 mt-1">Your AI-powered farming companion</p>
            </div>
          </div>
        </motion.div>

        {/* Chat Messages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6"
        >
          <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-gray-50">
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-start gap-3 ${
                  msg.sender === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div className={`p-2 rounded-full ${
                  msg.sender === 'user' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-green-100 text-green-600'
                }`}>
                  {msg.sender === 'user' ? (
                    <User className="w-5 h-5" />
                  ) : (
                    <Bot className="w-5 h-5" />
                  )}
                </div>
                <div className={`max-w-[70%] p-4 rounded-2xl ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white text-gray-900 shadow-md rounded-bl-none'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-line">{msg.text}</p>
                  
                  {/* RAG Provenance Badges & Sources */}
                  {msg.sender === 'bot' && msg.badgeType && (
                    <div className="mt-3 space-y-2 border-t border-gray-100 pt-2">
                      <div className="flex items-center">
                        {msg.badgeType === 'verified_gov' && (
                          <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold mr-2">
                            <Shield className="w-3 h-3" /> Verified: Gov Ag Resource
                          </span>
                        )}
                        {msg.badgeType === 'verified_private' && (
                          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold mr-2">
                            <Shield className="w-3 h-3" /> Verified: Private Record
                          </span>
                        )}
                        {msg.generationProvenance === 'MOCKED' && (
                          <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-semibold">
                            <Sparkles className="w-3 h-3" /> Unverified / MOCKED Generation
                          </span>
                        )}
                      </div>

                      {msg.sources && msg.sources.length > 0 && (
                        <div className="flex flex-col gap-1 mt-2">
                          <span className="text-xs font-medium text-gray-500">Sources:</span>
                          {msg.sources.map((src, i) => (
                            <a 
                              key={i} 
                              href={src.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                            >
                              - {src.title} {src.date && `(${new Date(src.date).toLocaleDateString()})`}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <p className={`text-xs mt-2 ${
                    msg.sender === 'user' ? 'text-blue-200' : 'text-gray-400'
                  }`}>
                    {msg.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </motion.div>

        {/* Quick Questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4"
        >
          <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Quick questions:
          </p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setInput(question)}
                className="px-4 py-2 bg-white border border-green-200 text-green-700 rounded-full text-sm hover:bg-green-50 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Input Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-4"
        >
          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about crops, equipment, weather, or farming tips..."
              className="flex-1 resize-none border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={2}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Send
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Press Enter to send • AI-powered farming assistant
          </p>
        </motion.div>
      </div>
      
      {/* macOS-style magnification dock */}
      {isAuthenticated && <MacDock activeId="chatbot" />}
    </div>
  );
}
