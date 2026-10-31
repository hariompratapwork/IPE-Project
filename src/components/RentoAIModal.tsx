import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Sparkles, Send, Bot, User, ArrowRight, ShieldCheck, 
  HelpCircle, Tag, RefreshCw, Zap, CheckCircle2, ChevronRight
} from 'lucide-react';
import { RentalItem, Campus } from '../types';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  actionItems?: RentalItem[];
  suggestedPrompts?: string[];
}

interface RentoAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: RentalItem[];
  onSelectItem: (item: RentalItem) => void;
  currentCampus: Campus;
  onOpenListItemModal: () => void;
}

export const RentoAIModal: React.FC<RentoAIModalProps> = ({
  isOpen,
  onClose,
  items,
  onSelectItem,
  currentCampus,
  onOpenListItemModal,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: `Hello! I'm **RentoAI**, your intelligent campus rental companion for **${currentCampus.name}**. How can I help you save money or find gear today?`,
      timestamp: 'Just now',
      suggestedPrompts: [
        'Calculators for Semester Exams',
        'DSLR Camera for Campus Fest',
        'Laptops & Lab Accessories',
        'How does Campus Security Deposit work?'
      ]
    }
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateAIResponse(query, items, currentCampus);
      setIsTyping(false);
      setMessages(prev => [...prev, response]);
    }, 600);
  };

  const generateAIResponse = (query: string, availableItems: RentalItem[], campus: Campus): Message => {
    const q = query.toLowerCase();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Calculator search
    if (q.includes('calculator') || q.includes('fx-991') || q.includes('calc') || q.includes('exam') || q.includes('math')) {
      const matched = availableItems.filter(i => 
        i.title.toLowerCase().includes('calculator') || i.category === 'Electronics'
      ).slice(0, 3);

      return {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `Here are the top scientific calculators available for rent on **${campus.name}**. Perfect for university exams, calculus, and lab assignments:`,
        timestamp: timeStr,
        actionItems: matched,
        suggestedPrompts: [
          'Can I rent for just 3 hours?',
          'Where is the pickup spot?',
          'How do I list my own calculator?'
        ]
      };
    }

    // 2. Camera / Fest / Video search
    if (q.includes('camera') || q.includes('dslr') || q.includes('sony') || q.includes('shoot') || q.includes('fest') || q.includes('photo')) {
      const matched = availableItems.filter(i => 
        i.title.toLowerCase().includes('camera') || i.category === 'Photography'
      ).slice(0, 3);

      return {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `Found verified photography and creative gear for university fests, sports events, and portfolio shoots at ${campus.name}:`,
        timestamp: timeStr,
        actionItems: matched,
        suggestedPrompts: [
          'Book an admin photographer instead',
          'What is the deposit policy?',
          'Show tripods & lenses'
        ]
      };
    }

    // 3. Deposit & Verification query
    if (q.includes('deposit') || q.includes('security') || q.includes('safe') || q.includes('otp') || q.includes('verification')) {
      return {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `**Rentozi Campus Trust & Security System:**\n\n1. **University Verification:** Only verified students with \`@marwadiuniversity.ac.in\` IDs can rent or list.\n2. **Security Deposit Hold:** Deposits are safely escrowed and returned instantly when the item is verified intact during handover.\n3. **6-Digit OTP Handover:** Both renter and owner verify identity on campus using a unique 6-digit OTP code before any exchange takes place.\n4. **Designated Campus Zones:** Exchanges happen in safe campus hubs (Central Library, Student Canteen, Academic Blocks).`,
        timestamp: timeStr,
        suggestedPrompts: [
          'What if an item is damaged?',
          'Browse available items',
          'List an item for rent'
        ]
      };
    }

    // 4. Laptop / Tech / Monitor search
    if (q.includes('laptop') || q.includes('macbook') || q.includes('monitor') || q.includes('charger') || q.includes('electronics')) {
      const matched = availableItems.filter(i => 
        i.category === 'Electronics' || i.title.toLowerCase().includes('laptop')
      ).slice(0, 3);

      return {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `Here are laptops, monitors, and chargers currently available from peer students at ${campus.name}:`,
        timestamp: timeStr,
        actionItems: matched,
        suggestedPrompts: [
          'Hourly rentals for coding lab',
          'Rent a scientific calculator',
          'View campus pickup locations'
        ]
      };
    }

    // 5. General matching query
    const fuzzy = availableItems.filter(i => 
      i.title.toLowerCase().includes(q) || 
      i.category.toLowerCase().includes(q) ||
      i.description.toLowerCase().includes(q)
    ).slice(0, 3);

    if (fuzzy.length > 0) {
      return {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `I analyzed the campus catalog for "${query}". Here are the best peer matches right now:`,
        timestamp: timeStr,
        actionItems: fuzzy,
        suggestedPrompts: [
          'How does pickup work?',
          'Can I negotiate price?',
          'List an item myself'
        ]
      };
    }

    // Default Fallback
    return {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      text: `I searched across all active listings at **${campus.name}** for "${query}". While we don't have an exact title match right now, you can request an admin service, list this item for other students to rent, or ask me for price estimations!`,
      timestamp: timeStr,
      suggestedPrompts: [
        'Calculators for Semester Exams',
        'DSLR Camera for Campus Fest',
        'How does Campus Security Deposit work?',
        'List an item for rent'
      ]
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0B0F12] border border-[#24313C] rounded-2xl w-full max-w-2xl h-[90vh] max-h-[750px] flex flex-col shadow-2xl overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="px-5 py-4 border-b border-[#24313C] bg-[#10171D] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#C8FF00] to-emerald-400 text-black flex items-center justify-center font-black shadow-lg shadow-[#C8FF00]/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white tracking-tight">RentoAI Campus Co-Pilot</h3>
                <span className="text-[10px] bg-[#C8FF00]/15 text-[#C8FF00] font-bold px-2 py-0.5 rounded-full border border-[#C8FF00]/30">
                  MU Edition
                </span>
              </div>
              <p className="text-xs text-[#94A3B8]">
                Instant Smart Search • Fair Price Estimator • Campus Safety Bot
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#1A232C] hover:bg-[#24313C] text-[#94A3B8] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CHAT MESSAGES BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m) => (
            <div 
              key={m.id} 
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-8 h-8 rounded-lg bg-[#C8FF00] text-black flex items-center justify-center shrink-0 mt-1 shadow-sm font-bold text-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[85%] sm:max-w-[78%] ${
                m.sender === 'user' 
                  ? 'bg-[#C8FF00] text-black rounded-2xl rounded-tr-xs p-3.5 shadow-md font-medium text-sm'
                  : 'bg-[#151D24] text-[#E2E8F0] border border-[#24313C] rounded-2xl rounded-tl-xs p-4 shadow-sm text-sm'
              }`}>
                {/* Formatted Text */}
                <div className="whitespace-pre-wrap leading-relaxed">
                  {m.text}
                </div>

                {/* Attached Interactive Action Items */}
                {m.actionItems && m.actionItems.length > 0 && (
                  <div className="mt-3.5 pt-3 border-t border-[#24313C] space-y-2">
                    <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                      Matches at {currentCampus.shortName}:
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {m.actionItems.map(item => (
                        <div 
                          key={item.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B0F12] border border-[#24313C] hover:border-[#C8FF00] transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img 
                              src={item.imageUrl} 
                              alt={item.title} 
                              className="w-10 h-10 rounded-lg object-cover bg-gray-800 shrink-0" 
                              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                            />
                            <div className="truncate">
                              <p className="text-xs font-bold text-white truncate">{item.title}</p>
                              <p className="text-[11px] text-[#C8FF00] font-semibold">
                                ₹{item.pricePerDay}/day • <span className="text-[#94A3B8]">{item.location}</span>
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              onSelectItem(item);
                              onClose();
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#C8FF00] hover:bg-[#b2e600] text-black text-xs font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
                          >
                            Rent <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Prompt Chips */}
                {m.suggestedPrompts && (
                  <div className="mt-3 pt-2.5 border-t border-[#24313C] flex flex-wrap gap-1.5">
                    {m.suggestedPrompts.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (chip === 'List an item for rent') {
                            onClose();
                            onOpenListItemModal();
                          } else {
                            handleSend(chip);
                          }
                        }}
                        className="text-xs bg-[#1E293B] hover:bg-[#C8FF00] hover:text-black text-[#94A3B8] px-2.5 py-1 rounded-lg transition-all cursor-pointer font-medium border border-[#334155]/40"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}

                <span className={`block text-[10px] mt-2 ${m.sender === 'user' ? 'text-black/60 text-right' : 'text-[#64748B]'}`}>
                  {m.timestamp}
                </span>
              </div>

              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-[#1E293B] text-white flex items-center justify-center shrink-0 mt-1 font-bold text-xs border border-[#334155]">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-lg bg-[#C8FF00] text-black flex items-center justify-center font-bold text-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-[#151D24] border border-[#24313C] rounded-2xl rounded-tl-xs px-4 py-3 text-xs text-[#94A3B8] flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C8FF00]" />
                RentoAI is reasoning over campus listings...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT FORM BAR */}
        <div className="p-3.5 sm:p-4 bg-[#10171D] border-t border-[#24313C]">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for gear (e.g. 'Casio fx-991 for calculus exam') or pricing advice..."
              className="flex-1 bg-[#151D24] border border-[#24313C] focus:border-[#C8FF00] rounded-xl px-4 py-3 text-sm text-white placeholder-[#64748B] focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="px-4 py-3 rounded-xl bg-[#C8FF00] hover:bg-[#b2e600] disabled:opacity-40 disabled:hover:bg-[#C8FF00] text-black font-extrabold text-sm flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-[#C8FF00]/10"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>
          </form>

          <div className="flex items-center justify-between mt-2.5 px-1 text-[11px] text-[#64748B]">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#C8FF00]" />
              AI Prompting Engine • Marwadi University CSE AI/ML
            </span>
            <span className="hidden sm:inline">Press Enter to send</span>
          </div>
        </div>

      </div>
    </div>
  );
};
