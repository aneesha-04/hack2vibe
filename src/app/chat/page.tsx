'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { getAIChatResponse } from '../../utils/aiEngine';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  User, 
  Clock, 
  RefreshCw, 
  Zap,
  Paperclip,
  Trash2,
  Brain,
  TrendingUp,
  Award,
  AlertTriangle,
  Calendar,
  ChevronRight,
  Flame,
  MessageSquare,
  ShieldAlert,
  HelpCircle,
  BarChart2,
  CheckCircle,
  Activity,
  Plus,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const router = useRouter();
  const { 
    tasks, 
    settings, 
    rescheduleDay, 
    triggerRescueMode, 
    isLoggedIn, 
    moodLogs,
    profile 
  } = useApp();

  // Auth Guard
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, router]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm TickTock AI, your proactive productivity coach. I track your workloads, calculate deadline risks, and generate optimized day plans. How can I help you today? You can ask me \"What should I do next?\", \"Do I have any deadline risks?\", or tell me how you are feeling!",
      timestamp: new Date()
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceOutputEnabled, setIsVoiceOutputEnabled] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Speech Recognition hook
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'en-US';

        rec.onstart = () => setIsListening(true);
        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputValue(transcript);
          setTimeout(() => {
            handleSendMessage(transcript);
          }, 800);
        };
        rec.onerror = () => setIsListening(false);
        rec.onend = () => setIsListening(false);
        setRecognition(rec);
      }
    }
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    setInputValue('');

    const userMessage: Message = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    const today = new Date().toISOString().split('T')[0];
    const todayMood = moodLogs.find(m => m.date === today)?.mood || 'Neutral';
    const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));

    try {
      let responseContent = '';
      const lowercaseMsg = text.toLowerCase();

      if (lowercaseMsg.includes('reschedule') && (lowercaseMsg.includes('today') || lowercaseMsg.includes('work'))) {
        rescheduleDay(today);
        responseContent = "I've reorganized your schedule slots for today! High-priority tasks have been prioritized, lower priority ones shifted, and recharge buffers inserted around your active windows. Check out the **Schedule Calendar** to see the changes.";
      } else if (lowercaseMsg.includes('rescue') || (lowercaseMsg.includes('emergency') && lowercaseMsg.includes('plan'))) {
        const highRisk = tasks.find(t => !t.completed && (t.riskLevel === 'Critical Risk' || t.riskLevel === 'High Risk'));
        if (highRisk) {
          triggerRescueMode(highRisk.id);
          responseContent = `⚠️ **Emergency Rescue Mode Triggered** for *"${highRisk.title}"*. I've blocked out your calendar hour-by-hour with action steps, study blocks, and timed breaks leading up to the deadline. Please navigate to the Calendar to view this plan.`;
        } else {
          responseContent = "I analyzed your workspace: you don't have any Critical/High Risk tasks due within 24 hours. There is no need for Rescue Mode today. Keep up the great pace!";
        }
      } else {
        responseContent = await getAIChatResponse(text, history, tasks, settings, todayMood);
      }

      const botMessage: Message = {
        id: `msg-bot-${Date.now()}`,
        role: 'assistant',
        content: responseContent,
        timestamp: new Date()
      };

      setIsTyping(false);
      setMessages(prev => [...prev, botMessage]);

      if (isVoiceOutputEnabled) {
        speakResponse(responseContent);
      }
    } catch (e) {
      console.error(e);
      setIsTyping(false);
    }
  };

  const toggleListening = () => {
    if (!recognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    if (isListening) recognition.stop();
    else recognition.start();
  };

  const speakResponse = (text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#_`\-\[\]]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleVoiceOutput = () => {
    if (isVoiceOutputEnabled) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsVoiceOutputEnabled(false);
    } else {
      setIsVoiceOutputEnabled(true);
      speakResponse("Voice feedback enabled. I will read response answers aloud.");
    }
  };

  const startNewChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: "Hello! I'm TickTock AI. I have analyzed your workspace. How can I assist you with your workload right now?",
        timestamp: new Date()
      }
    ]);
  };

  const clearChat = () => {
    setMessages([]);
  };

  // Suggesion Prompts Configuration
  const suggestionCards = [
    {
      title: "What should I do next?",
      desc: "Calculates priority scores and suggests immediate focus blocks.",
      icon: Play,
      color: "from-blue-500/10 to-indigo-500/10 text-primary border-blue-500/20"
    },
    {
      title: "Analyze my deadlines",
      desc: "Checks threat risk coefficients and logs safety indicators.",
      icon: ShieldAlert,
      color: "from-rose-500/10 to-purple-500/10 text-danger border-rose-500/20"
    },
    {
      title: "Reschedule today's work",
      desc: "Autopilot scheduler optimization for buffer time slots.",
      icon: RefreshCw,
      color: "from-emerald-500/10 to-teal-500/10 text-success border-emerald-500/20"
    },
    {
      title: "Give me a coaching tip",
      desc: "Proactive tips to counter procrastination and fatigue.",
      icon: Brain,
      color: "from-amber-500/10 to-orange-500/10 text-warning border-amber-500/20"
    }
  ];

  // Heuristics calculations for right insights panel
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const activeTasks = tasks.filter(t => !t.completed);
  const highRiskCount = tasks.filter(t => !t.completed && (t.riskLevel === 'Critical Risk' || t.riskLevel === 'High Risk')).length;
  
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const baseScore = totalTasks > 0 ? 60 + Math.round((completedTasks / totalTasks) * 40) : 84;
  const productivityScore = isLoggedIn ? Math.min(100, baseScore + profile.focusStreak * 2) : 84;
  
  const nextTask = activeTasks.sort((a, b) => b.priorityScore - a.priorityScore)[0]?.title || "All Caught Up!";

  const todayStr = new Date().toISOString().split('T')[0];
  const todayMood = moodLogs.find(m => m.date === todayStr)?.mood || '😊';

  return (
    <div className="flex h-[calc(100vh-3.5rem)] lg:h-screen w-full relative overflow-hidden text-xs">
      
      {/* BACKGROUND DECORATIONS */}
      <div className="absolute top-[20%] right-[10%] w-[35vw] h-[35vw] rounded-full bg-primary/5 dark:bg-primary/8 blur-[120px] pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-[10%] left-[20%] w-[30vw] h-[30vw] rounded-full bg-secondary/5 dark:bg-secondary/8 blur-[100px] pointer-events-none -z-10 animate-pulse" />

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        
        {/* 1. TOP AI DIAGNOSTIC STATUS BANNER */}
        <div className="w-full px-6 py-2 bg-slate-100/50 dark:bg-slate-950/20 border-b border-slate-200/50 dark:border-slate-800/60 flex items-center justify-between flex-wrap gap-2 shrink-0">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-350">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-ping" />
              <span>AI Engine Online</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
              Last Analysis: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="flex items-center gap-4 text-[10px] font-mono text-slate-650 dark:text-slate-400">
            <span>Mood Focus: <b className="text-slate-800 dark:text-slate-200">{todayMood} Optimized</b></span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">Schedule Auto-Synced</span>
          </div>
        </div>

        {/* 2. CHAT SESSION HEADER */}
        <header className="px-6 py-4 glass-panel border-b border-slate-200/50 dark:border-white/5 bg-white/60 dark:bg-slate-950/40 backdrop-blur-md flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary via-secondary to-accent flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
              <Sparkles className="w-5.5 h-5.5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-[15px] text-slate-900 dark:text-white leading-none">
                AI Coach Workspace
              </h2>
              <p className="text-[10px] text-slate-500 mt-1">
                Your empathetic productivity guide
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleVoiceOutput}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isVoiceOutputEnabled 
                  ? 'bg-primary/10 border-primary/20 text-primary' 
                  : 'bg-slate-50 dark:bg-white/3 border-slate-200/60 dark:border-white/5 text-slate-650 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
              }`}
              title="Toggle Audio Feedback"
            >
              {isVoiceOutputEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={startNewChat}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-white/3 dark:hover:bg-white/5 border border-slate-200/60 dark:border-white/5 text-slate-650 dark:text-slate-350 font-semibold cursor-pointer"
              title="Reset Chat"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={clearChat}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-white/3 dark:hover:bg-white/5 border border-slate-200/60 dark:border-white/5 text-slate-650 dark:text-slate-350 font-semibold cursor-pointer"
              title="Clear Thread"
            >
              <Trash2 className="w-4 h-4 text-danger/80" />
            </button>
          </div>
        </header>

        {/* 3. SCROLLABLE CONVERSATION FEED */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          
          {/* Empty Conversation State */}
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-4 py-8">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center text-primary shadow-sm shadow-indigo-150">
                <Brain className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-md font-bold text-slate-900 dark:text-white">Start Coaching Conversation</h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5">
                  Ask me about your daily workload, rescheduling routines, or mitigating upcoming deadline threats.
                </p>
              </div>
              <button
                onClick={startNewChat}
                className="px-4 py-2 rounded-xl bg-primary text-white font-semibold text-xs hover:opacity-90 shadow-md shadow-primary/10 transition-all cursor-pointer"
              >
                Launch Assistant
              </button>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-5">
              <AnimatePresence initial={false}>
                {messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                    >
                      {/* Avatar Bubble */}
                      <div className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center shrink-0 border font-bold text-xs shadow-sm ${
                        isUser
                          ? 'bg-gradient-to-tr from-cyan-500 to-primary border-primary/20 text-white'
                          : 'bg-gradient-to-tr from-primary to-secondary border-primary/10 text-white'
                      }`}>
                        {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                      </div>

                      {/* Message bubble card */}
                      <div className={`p-4 rounded-2xl relative border ${
                        isUser
                          ? 'bg-primary/10 border-primary/15 text-slate-850 dark:text-indigo-100 rounded-tr-none'
                          : 'glass-card bg-white/70 dark:bg-slate-950/50 border-slate-200/50 dark:border-white/5 text-slate-800 dark:text-slate-200 rounded-tl-none font-medium'
                      }`}>
                        <div className="whitespace-pre-line leading-relaxed text-[13px] font-sans">
                          {msg.content}
                        </div>
                        <span className="block text-[8px] text-slate-400 dark:text-slate-500 text-right mt-2.5 font-mono">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Typing indicators */}
              {isTyping && (
                <div className="flex gap-3 mr-auto max-w-[80%]">
                  <div className="w-8.5 h-8.5 rounded-xl flex items-center justify-center shrink-0 bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 text-primary">
                    <Sparkles className="w-4.5 h-4.5 animate-pulse text-primary" />
                  </div>
                  <div className="p-4 rounded-2xl rounded-tl-none bg-slate-50 dark:bg-slate-950/50 border border-slate-200/50 dark:border-white/5 text-slate-500 text-xs italic flex items-center gap-3">
                    <span className="flex gap-1.2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                    <span>AI Coach drafting diagnosis...</span>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 4. SUGGESTION CARDS GRID (Visible only if messages count is low) */}
        {messages.length <= 1 && (
          <div className="px-6 py-4 max-w-3xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-3 shrink-0">
            {suggestionCards.map((card) => {
              const Icon = card.icon;
              return (
                <button
                  key={card.title}
                  onClick={() => handleSendMessage(card.title)}
                  className={`p-3.5 rounded-2xl border text-left bg-gradient-to-br ${card.color} hover:scale-[1.01] hover:shadow-sm cursor-pointer transition-all flex items-start gap-3`}
                >
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-white/5 shadow-sm shrink-0">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[13px] text-slate-850 dark:text-white leading-tight">{card.title}</h4>
                    <p className="text-[10px] text-slate-500 mt-1 leading-normal">{card.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* 5. REDESIGNED STICKY INPUT FORM */}
        <div className="px-6 pb-6 pt-2 bg-gradient-to-t from-white dark:from-[#070714] to-transparent shrink-0">
          <div className="max-w-3xl mx-auto">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
              className="flex items-center gap-2.5 p-2 rounded-2xl bg-white/70 dark:bg-slate-950/50 backdrop-blur-md border border-slate-200/50 dark:border-white/5 focus-within:ring-2 focus-within:ring-primary/20 shadow-lg"
            >
              {/* Attachment Button */}
              <button
                type="button"
                className="p-2.5 rounded-xl text-slate-500 hover:text-slate-850 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer shrink-0"
                title="Add attachment"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Microphone Input */}
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2.5 rounded-xl transition-all cursor-pointer shrink-0 relative overflow-hidden ${
                  isListening 
                    ? 'bg-danger text-white shadow-md shadow-danger/25' 
                    : 'text-slate-500 hover:text-slate-850 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
                title="Voice Input Mode"
              >
                {isListening ? <Mic className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {isListening && (
                  <span className="absolute inset-0 bg-white/20 animate-ping rounded-xl pointer-events-none" />
                )}
              </button>

              <input
                type="text"
                placeholder={isListening ? "Listening closely... speak now" : "Message AI Coach assistant..."}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isListening}
                className="flex-1 pl-1 pr-4 py-2 text-xs bg-transparent border-none text-slate-850 dark:text-white focus:outline-none placeholder-slate-450 dark:placeholder-slate-500"
              />

              <button
                type="submit"
                className="p-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 shadow-md shadow-primary/10 cursor-pointer transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* RIGHT SIDEBAR: AI INSIGHTS DIALOG */}
      <div className="w-80 border-l border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/20 glass-panel shrink-0 p-5 hidden xl:flex flex-col gap-4 overflow-y-auto">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
          <Brain className="w-5 h-5 text-primary animate-pulse" />
          <h3 className="font-bold text-[14px] text-slate-900 dark:text-white">AI Coach Insights</h3>
        </div>

        {/* 1. Productivity score card */}
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 space-y-2.5 shadow-sm">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-bold">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span>Productivity Score</span>
            </span>
            <span className="font-mono font-black text-slate-850 dark:text-white">{productivityScore}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full" style={{ width: `${productivityScore}%` }} />
          </div>
        </div>

        {/* 2. Tasks stats progress */}
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 space-y-2.5 shadow-sm">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-bold">
              <Award className="w-4 h-4 text-success" />
              <span>Completion Rate</span>
            </span>
            <span className="font-mono font-black text-slate-850 dark:text-white">{completionRate}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-success rounded-full" style={{ width: `${completionRate}%` }} />
          </div>
        </div>

        {/* 3. Proactive Coach Diagnosis box */}
        <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/15 border border-indigo-100/50 dark:border-indigo-900/30 space-y-2">
          <span className="text-[10px] font-bold text-primary flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-secondary animate-bounce" /> Focus Recommendation
          </span>
          <p className="text-slate-650 dark:text-indigo-300 leading-relaxed font-semibold">
            {highRiskCount > 0 
              ? `⚠️ You have ${highRiskCount} assignment${highRiskCount !== 1 ? 's' : ''} at high risk. Beginning your schedule block within the next hour increases completion rate to 92%.` 
              : "✅ Good diagnosis. All active workloads have sufficient buffer spaces for the week."
            }
          </p>
        </div>

        {/* 4. Upcoming Deadlines Info */}
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 space-y-3 shadow-sm">
          <h4 className="font-bold text-slate-900 dark:text-white text-[11px] uppercase tracking-wider">Threat Parameters</h4>
          
          <div className="space-y-2 font-mono">
            <div className="flex justify-between items-center text-slate-650 dark:text-slate-400">
              <span>Risk Deadlines:</span>
              <span className={`font-bold ${highRiskCount > 0 ? 'text-danger font-black' : 'text-success'}`}>{highRiskCount}</span>
            </div>
            
            <div className="flex justify-between items-center text-slate-650 dark:text-slate-400">
              <span>Next Suggested Focus:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[130px]">{nextTask}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
