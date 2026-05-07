import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Sparkles, Store, ShoppingCart, Shield, Camera, LogOut, Cloud, MessageCircle } from 'lucide-react';
import MacDock, { DockItem } from '../components/ui/MacDock';
import AdminLayout from '../components/AdminLayout';

interface Message {
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: 'Hello! I\'m your Agro Assistant 🌾. Ask me about crops, equipment, weather, or farming tips!',
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

  const getBotReply = (text: string): string => {
    const lowerText = text.toLowerCase();

    // Crop recommendations
    if (lowerText.includes('rice') || lowerText.includes('paddy')) {
      return 'Rice grows best in wet conditions with temperatures between 20-35°C. For 5+ acres, consider using a rice transplanter and combine harvester. Best season: Kharif (June-July). 💧';
    }
    
    if (lowerText.includes('wheat')) {
      return 'Wheat thrives in moderate temperatures (15-25°C). For optimal yield, use seed drill machines and proper irrigation. Best season: Rabi (Oct-Nov). Planting density: 100kg seeds/acre. 🌾';
    }
    
    if (lowerText.includes('corn') || lowerText.includes('maize')) {
      return 'Maize requires well-drained soil and 500-800mm rainfall. Use ridge ploughing and consider drip irrigation. Harvest in 90-120 days. Great for both food and fodder! 🌽';
    }
    
    if (lowerText.includes('cotton')) {
      return 'Cotton needs black soil, 25-35°C temperature, and 600-800mm rainfall. Use BT cotton seeds for better yield. Harvest in 150-180 days. Watch out for pest control! 🌿';
    }

    // Equipment recommendations
    if (lowerText.includes('tractor') || lowerText.includes('equipment')) {
      if (lowerText.includes('small') || lowerText.includes('1') || lowerText.includes('2')) {
        return 'For 1-2 acres: Power tiller (₹40,000-80,000), sprayer (₹3,000-8,000), and basic hand tools. Consider renting larger equipment through our platform! 🚜';
      } else if (lowerText.includes('medium') || lowerText.includes('3') || lowerText.includes('5')) {
        return 'For 3-5 acres: Mini tractor (25-35 HP, ₹3-5 lakhs), rotavator, cultivator, and sprayer. Check government subsidies available! 💰';
      } else {
        return 'For 5+ acres: Full-size tractor (45+ HP, ₹6-10 lakhs), harvester, thresher, and seeder. ROI in 2-3 years with proper utilization. Book through our platform! 🚜';
      }
    }

    // Weather queries
    if (lowerText.includes('weather') || lowerText.includes('rain') || lowerText.includes('monsoon')) {
      return 'Check IMD forecasts before sowing. Monsoon typically arrives June in most regions. Install weather sensors for real-time updates. Avoid spraying pesticides before rain! ☁️';
    }

    // Pest control
    if (lowerText.includes('pest') || lowerText.includes('disease') || lowerText.includes('insect')) {
      return 'Integrated Pest Management (IPM) recommended: 1) Regular field inspection 2) Neem-based pesticides 3) Crop rotation 4) Beneficial insects. Contact local agricultural officer for specific advice! 🐛';
    }

    // Fertilizer
    if (lowerText.includes('fertilizer') || lowerText.includes('nutrient')) {
      return 'NPK ratio varies by crop. General recommendation: 100:60:40 kg/acre for cereals. Get soil tested every 2 years. Organic manure improves long-term soil health! 🌱';
    }

    // Irrigation
    if (lowerText.includes('water') || lowerText.includes('irrigation')) {
      return 'Drip irrigation saves 40-60% water vs flood irrigation. Best for vegetables and orchards. Government provides 50-75% subsidy! Sprinkler suits field crops. 💧';
    }

    // Market prices
    if (lowerText.includes('price') || lowerText.includes('market') || lowerText.includes('sell')) {
      return 'Check MSP on goportal. Current market rates vary by quality and location. Consider forming FPO for better bargaining power. Our marketplace connects you directly to buyers! 💰';
    }

    // Default response
    return 'That\'s a great question! I specialize in crop advice, equipment recommendations, weather guidance, and farming best practices. Try asking about specific crops or farm sizes! 🌾';
  };

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
      const res = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      
      const data = await res.json();
      
      const botMsg: Message = {
        sender: 'bot',
        text: data.reply || getBotReply(input), // Fallback to local if API fails
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('API Error:', error);
      // Fallback to local responses
      const botMsg: Message = {
        sender: 'bot',
        text: getBotReply(input),
        timestamp: new Date()
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

  const isAuthenticated = !!localStorage.getItem('token');

  const dockItems: DockItem[] = [
    { id: 'market',    icon: Store,         label: 'Marketplace',               gradient: 'linear-gradient(135deg,#06b6d4,#0e7490)',  onClick: () => window.location.href='/marketplace' },
    { id: 'orders',    icon: ShoppingCart,  label: 'My Orders',                  gradient: 'linear-gradient(135deg,#f59e0b,#d97706)',  onClick: () => window.location.href='/marketplace' },
    { id: 'blockchain',icon: Shield,        label: 'Blockchain',                gradient: 'linear-gradient(135deg,#8b5cf6,#6d28d9)',  onClick: () => window.location.href='/blockchain' },
    { id: 'chatbot',   icon: MessageCircle, label: 'AgroBot AI',  active: true, gradient: 'linear-gradient(135deg,#3b82f6,#1d4ed8)',  onClick: () => window.location.href='/chatbot' },
    { id: 'weather',   icon: Cloud,         label: 'Weather AI',                gradient: 'linear-gradient(135deg,#3b82f6,#1d4ed8)',  onClick: () => window.location.href='/weather' },
    { id: 'gallery',   icon: Camera,        label: 'Farm Gallery',              gradient: 'linear-gradient(135deg,#0ea5e9,#0369a1)',  onClick: () => window.location.href='/gallery' },
    { id: 'logout',    icon: LogOut,        label: 'Logout',                    gradient: 'linear-gradient(135deg,#ef4444,#b91c1c)',  onClick: () => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href='/login'; } },
  ];

  const quickQuestions = [
    'Best crop for 5 acres?',
    'Tractor price for small farm',
    'When to plant wheat?',
    'How to save water?'
  ];

  return (
    <AdminLayout>
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
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <p className={`text-xs mt-2 ${
                    msg.sender === 'user' ? 'text-blue-200' : 'text-gray-500'
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
      {isAuthenticated && <MacDock items={dockItems} />}
    </AdminLayout>
  );
}
