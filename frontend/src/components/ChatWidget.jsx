import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { getImageUrl } from '../utils/getImageUrl';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Search,
  PlusCircle,
  ArrowRight,
  MapPin,
  Tag as TagIcon,
  HelpCircle,
  ShieldCheck,
  AlertCircle,
  Bot,
  User,
  RefreshCw
} from 'lucide-react';

const SUGGESTIONS = [
  'I lost a black Samsung phone near the library',
  'Did anyone find a set of keys with a blue keychain?',
  'I left a college ID card in the science complex',
  'I lost my black backpack in the cafeteria'
];

const ChatWidget = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Greetings! I am the Reclaim Search Assistant. Describe any lost property in natural language and I will scan our active found items register.',
      matchedItems: [],
      suggestReport: false
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const handleToggleChat = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setIsOpen(true);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, loading]);

  const handleSend = async (textToSend) => {
    const queryText = (textToSend || input).trim();
    if (!queryText || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: queryText
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      // Build conversation history format for API
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.role,
          content: m.text
        }));

      const res = await api.post('/chat', {
        message: queryText,
        history
      });

      const data = res.data;

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: data.reply || 'Here is what I found in our records.',
        matchedItems: data.matchedItems || [],
        suggestReport: Boolean(data.suggestReport),
        prefillData: data.prefillData
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: "I experienced a temporary network issue checking the ledger records. You can try asking again or register a lost item report directly.",
        matchedItems: [],
        suggestReport: true,
        prefillData: {
          title: queryText.slice(0, 50),
          description: queryText,
          category: 'Other',
          location: 'Main Library',
          type: 'lost'
        }
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleHandoffToReport = (prefillData) => {
    setIsOpen(false);
    navigate('/report', {
      state: { prefillData }
    });
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={handleToggleChat}
          className="group relative bg-[#4B6E48] hover:bg-[#3D5B3A] text-[#F2F0EF] p-4 shadow-xl border border-[#3D5B3A] transition-all duration-300 flex items-center gap-3 cursor-pointer"
          title="Open Reclaim AI Assistant"
        >
          <div className="relative">
            <Bot className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#B2AC88] rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#B2AC88] rounded-full" />
          </div>
          <span className="font-mono text-xs font-bold uppercase tracking-wider hidden sm:inline-block">
            AI Ledger Assistant
          </span>
        </button>
      )}

      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[420px] h-[600px] max-h-[85vh] bg-[#F2F0EF] border border-[#898989] shadow-2xl flex flex-col overflow-hidden text-[#333333] transition-all animate-fade-in">
          
          {/* Header */}
          <div className="bg-[#4B6E48] text-[#F2F0EF] px-4 py-3 border-b border-[#3D5B3A] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#F2F0EF]/10 border border-[#F2F0EF]/30 flex items-center justify-center">
                <Bot className="w-5 h-5 text-[#F2F0EF]" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm tracking-wide leading-tight">
                  RECLAIM AI ASSISTANT
                </h3>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#F2F0EF]/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>GROQ LEDGER SEARCH</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-[#F2F0EF]/20 text-[#F2F0EF] transition-colors cursor-pointer"
              title="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F2F0EF]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* Assistant Icon */}
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 shrink-0 border border-[#898989] bg-[#B2AC88]/20 flex items-center justify-center text-[#4B6E48] mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                {/* Message Bubble Container */}
                <div className={`max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  
                  <div
                    className={`p-3 text-xs font-mono border ${
                      msg.role === 'user'
                        ? 'bg-[#4B6E48] text-[#F2F0EF] border-[#4B6E48]'
                        : 'bg-[#E5E2E0] text-[#333333] border-[#898989]'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  </div>

                  {/* Matched Items Cards List */}
                  {msg.matchedItems && msg.matchedItems.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="text-[10px] font-mono font-bold text-[#4B6E48] uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#B2AC88]" />
                        <span>Possible Ledger Matches ({msg.matchedItems.length})</span>
                      </div>

                      {msg.matchedItems.map((item) => (
                        <div
                          key={item._id}
                          onClick={() => {
                            setIsOpen(false);
                            navigate(`/items/${item._id}`);
                          }}
                          className="group p-3 bg-[#F2F0EF] border border-[#898989] hover:border-[#4B6E48] cursor-pointer transition-all space-y-2 text-left"
                        >
                          <div className="flex gap-3 items-center">
                            <div className="w-12 h-12 bg-[#E5E2E0] border border-[#898989] shrink-0 overflow-hidden flex items-center justify-center">
                              {item.hasImage ? (
                                <img
                                  src={getImageUrl(item._id)}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <ShieldCheck className="w-6 h-6 text-[#898989]" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <h4 className="font-serif font-bold text-xs text-[#333333] group-hover:text-[#4B6E48] truncate">
                                {item.title}
                              </h4>
                              <div className="flex items-center gap-2 text-[10px] font-mono text-[#898989]">
                                <span className="truncate">{item.category}</span>
                                <span>•</span>
                                <span className="truncate flex items-center gap-0.5">
                                  <MapPin className="w-2.5 h-2.5 text-[#B2AC88]" />
                                  {item.location}
                                </span>
                              </div>
                            </div>
                          </div>

                          {item.matchReason && (
                            <div className="p-1.5 bg-[#B2AC88]/15 border border-[#898989]/40 text-[10px] font-mono text-[#333333] italic">
                              "{item.matchReason}"
                            </div>
                          )}

                          <div className="flex items-center justify-between text-[10px] font-mono text-[#4B6E48] pt-1 border-t border-dashed border-[#898989]">
                            <span>VIEW RECORD</span>
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Report Handoff Suggestion Button */}
                  {msg.suggestReport && (
                    <div className="mt-3 p-3 bg-[#B2AC88]/20 border border-[#898989] space-y-2">
                      <p className="text-[11px] font-mono text-[#333333]">
                        No exact match found in current active found records? Register a lost item report.
                      </p>
                      <button
                        onClick={() => handleHandoffToReport(msg.prefillData)}
                        className="w-full py-2 px-3 bg-[#4B6E48] hover:bg-[#3D5B3A] text-[#F2F0EF] text-xs font-mono font-bold uppercase tracking-wider border border-[#3D5B3A] flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Log Lost Item Report</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* User Icon */}
                {msg.role === 'user' && (
                  <div className="w-7 h-7 shrink-0 border border-[#898989] bg-[#4B6E48] text-[#F2F0EF] flex items-center justify-center mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex gap-2.5 justify-start items-center">
                <div className="w-7 h-7 shrink-0 border border-[#898989] bg-[#B2AC88]/20 flex items-center justify-center text-[#4B6E48]">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3 bg-[#E5E2E0] border border-[#898989] text-xs font-mono text-[#898989] flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-[#4B6E48] border-t-transparent rounded-full animate-spin" />
                  <span>Scanning active found ledger...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips (only when user hasn't typed many messages) */}
          {messages.length <= 2 && !loading && (
            <div className="p-2.5 bg-[#E5E2E0] border-t border-[#898989] overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-thin">
              {SUGGESTIONS.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(chip)}
                  className="px-2.5 py-1 bg-[#F2F0EF] hover:bg-[#B2AC88]/30 border border-[#898989] text-[10px] font-mono text-[#333333] transition-colors cursor-pointer shrink-0"
                >
                  "{chip.slice(0, 35)}..."
                </button>
              ))}
            </div>
          )}

          {/* Message Input Controls */}
          <div className="p-3 bg-[#F2F0EF] border-t border-[#898989] flex items-center gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe what you lost..."
              rows={1}
              className="flex-1 px-3 py-2 bg-[#F2F0EF] border border-[#898989] text-xs font-mono text-[#333333] placeholder-[#898989] focus:outline-none focus:border-[#4B6E48] resize-none"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="p-2.5 bg-[#4B6E48] hover:bg-[#3D5B3A] text-[#F2F0EF] border border-[#3D5B3A] disabled:opacity-50 transition-all cursor-pointer shrink-0"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default ChatWidget;
