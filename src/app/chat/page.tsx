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
  ChevronRight, 
  Compass, 
  Flame, 
  RefreshCw,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const router = useRouter();
  const { tasks, settings, rescheduleDay, triggerRescueMode, isLoggedIn, moodLogs } = useApp();

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
      content: "Hello! I'm LastMinute AI, your proactive productivity coach. I track your workloads, calculate deadline risks, and generate optimized day plans. How can I help you today? You can ask me \"What should I do next?\", \"Do I have any deadline risks?\", or tell me how you are feeling!",
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

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'en-US';

        rec.onstart = () => {
          setIsListening(true);
        };

        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputValue(transcript);
          // Auto send after 1s
          setTimeout(() => {
            handleSendMessage(transcript);
          }, 800);
        };

        rec.onerror = (e: any) => {
          console.error("Speech recognition error", e);
          setIsListening(false);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        setRecognition(rec);
      }
    }
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    // Clear input
    setInputValue('');

    const userMessage: Message = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Get today's mood for AI context
    const today = new Date().toISOString().split('T')[0];
    const todayMood = moodLogs.find(m => m.date === today)?.mood || 'Neutral';

    // Compile chat history context
    const history = messages.slice(-6).map(m => ({
      role: m.role,
      content: m.content
    }));

    try {
      // 1. Process local shortcut actions if command matches voice command overrides
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
        // Query Gemini/OpenAI API or Heuristic Mock Fallback
        responseContent = await getAIChatResponse(
          text,
          history,
          tasks,
          settings,
          todayMood
        );
      }

      const botMessage: Message = {
        id: `msg-bot-${Date.now()}`,
        role: 'assistant',
        content: responseContent,
        timestamp: new Date()
      };

      setIsTyping(false);
      setMessages(prev => [...prev, botMessage]);

      // Trigger Voice Synthesis if enabled
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
      alert("Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  const speakResponse = (text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      // Cancel ongoing speech
      window.speechSynthesis.cancel();
      
      // Remove markdown text formatting for cleaner speech synthesis
      const cleanText = text.replace(/[*#_`\-\[\]]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
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

  const quickPrompts = [
    "What should I do next?",
    "Do I have any deadline risks?",
    "Reschedule today's work.",
    "Tell me a coaching tip!"
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto h-[calc(100vh-3.5rem)] lg:h-screen flex flex-col justify-between">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] pb-4 shrink-0">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            AI Productivity Coach
          </h2>
          <p className="text-xs text-slate-500">
            Empathetic coaching, voice scheduling shortcuts, and task analysis warnings.
          </p>
        </div>

        {/* Text to Speech Toggle */}
        <button
          onClick={toggleVoiceOutput}
          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
            isVoiceOutputEnabled 
              ? 'bg-indigo-950/20 border-indigo-500 text-indigo-400' 
              : 'bg-slate-950/40 border-[rgba(255,255,255,0.08)] text-slate-500 hover:text-slate-300'
          }`}
        >
          {isVoiceOutputEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Middle: Chat bubble container */}
      <div className="flex-1 overflow-y-auto py-6 space-y-4 pr-2">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Profile Icon */}
              <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border font-bold text-xs ${
                msg.role === 'user'
                  ? 'bg-gradient-to-tr from-cyan-500 to-indigo-500 border-[rgba(255,255,255,0.1)] text-white'
                  : 'bg-gradient-to-tr from-indigo-500 to-purple-600 border-[rgba(255,255,255,0.1)] text-white shadow-md'
              }`}>
                {msg.role === 'user' ? <User className="w-4.5 h-4.5" /> : <Zap className="w-4.5 h-4.5" />}
              </div>

              {/* Chat Bubble Body */}
              <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600/10 border-indigo-500/20 text-indigo-100 rounded-tr-none'
                  : 'bg-slate-950/50 border-[rgba(255,255,255,0.05)] text-slate-200 rounded-tl-none font-medium'
              }`}>
                {/* Parse newlines as line breaks */}
                <div className="whitespace-pre-line space-y-2">
                  {msg.content}
                </div>
                <span className="block text-[8px] text-slate-500 text-right mt-2 font-mono">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <div className="flex items-start gap-3 mr-auto max-w-[80%]">
            <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center bg-slate-900 border border-[rgba(255,255,255,0.08)] text-indigo-400">
              <Zap className="w-4 h-4 animate-pulse" />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-none bg-slate-950/50 border border-[rgba(255,255,255,0.05)] text-slate-500 text-xs italic flex items-center gap-2">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
              <span>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom: Quick Prompts and Form */}
      <div className="pt-4 shrink-0 space-y-3 bg-[#03030b] pb-4">
        {/* Quick Suggestion buttons */}
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSendMessage(prompt)}
              className="text-[10px] bg-slate-950/40 hover:bg-slate-900 border border-[rgba(255,255,255,0.05)] text-slate-400 hover:text-white px-3 py-1.5 rounded-xl transition-all cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
          className="flex items-center gap-2 bg-slate-950/40 p-1.5 rounded-2xl border border-[rgba(255,255,255,0.08)] relative"
        >
          {/* Voice Input Microphone */}
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2.5 rounded-xl transition-all cursor-pointer shrink-0 relative overflow-hidden ${
              isListening 
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            {isListening ? <Mic className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            
            {/* Record Pulsing Wave overlay */}
            {isListening && (
              <span className="absolute inset-0 bg-white/20 animate-ping rounded-xl pointer-events-none" />
            )}
          </button>

          <input
            type="text"
            placeholder={isListening ? "Listening closely... speak now" : "Ask coach what to do next..."}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isListening}
            className="flex-1 pl-2 pr-4 py-2 text-xs bg-transparent border-none text-white focus:outline-none placeholder-slate-500"
          />

          <button
            type="submit"
            className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
