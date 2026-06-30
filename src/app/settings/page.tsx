'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { 
  Settings, 
  User, 
  Key, 
  Clock, 
  Sparkles, 
  Check, 
  Save, 
  Link2,
  Lock,
  Moon,
  Sun,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function SettingsPage() {
  const router = useRouter();
  const { 
    settings, 
    profile, 
    updateSettings, 
    updateProfile, 
    isLoggedIn 
  } = useApp();

  // Auth Guard
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, router]);

  // Profile Form States
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  
  // API settings
  const [aiProvider, setAiProvider] = useState(settings.aiProvider);
  const [geminiApiKey, setGeminiApiKey] = useState(settings.geminiApiKey);
  const [openaiApiKey, setOpenaiApiKey] = useState(settings.openaiApiKey);
  
  // Schedule settings
  const [sleepStart, setSleepStart] = useState(settings.sleepStart);
  const [sleepEnd, setSleepEnd] = useState(settings.sleepEnd);
  const [workStartTime, setWorkStartTime] = useState(settings.workStartTime);
  const [workEndTime, setWorkEndTime] = useState(settings.workEndTime);
  const [preferredFocusHours, setPreferredFocusHours] = useState<string[]>(settings.preferredFocusHours);

  const [isSaved, setIsSaved] = useState(false);

  const handleToggleFocusHour = (period: string) => {
    if (preferredFocusHours.includes(period)) {
      setPreferredFocusHours(preferredFocusHours.filter(p => p !== period));
    } else {
      setPreferredFocusHours([...preferredFocusHours, period]);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateProfile({ name, email });
    updateSettings({
      aiProvider,
      geminiApiKey,
      openaiApiKey,
      sleepStart,
      sleepEnd,
      workStartTime,
      workEndTime,
      preferredFocusHours
    });

    setIsSaved(true);
    confetti({ particleCount: 30, spread: 40, origin: { y: 0.8 }, colors: ['#6366f1', '#10b981'] });
    
    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  if (!isLoggedIn) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="border-b border-slate-200/50 dark:border-[rgba(255,255,255,0.06)] pb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-650 dark:from-white dark:via-indigo-100 dark:to-purple-200 bg-clip-text text-transparent">
            System Settings
          </h2>
          <p className="text-slate-400 text-xs">
            Configure system configurations, security credentials, sleep patterns, and AI keys.
          </p>
        </div>

        {isSaved && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 text-xs font-bold"
          >
            <Check className="w-4 h-4" />
            <span>Changes Saved!</span>
          </motion.div>
        )}
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Split Grid: Profile Left, Keys Right */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* User Profile Info Card */}
          <div className="glass-card p-6 rounded-2xl border border-[rgba(255,255,255,0.06)] space-y-4">
            <h3 className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-indigo-400" /> Account Profile
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Display Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs glass-input text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs glass-input text-white focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <span className="block text-[8px] text-slate-500 font-mono">Workspace account registered on {profile.joinedDate}</span>
              </div>
            </div>
          </div>

          {/* AI Engines settings */}
          <div className="glass-card p-6 rounded-2xl border border-[rgba(255,255,255,0.06)] space-y-4">
            <h3 className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-4 h-4 text-purple-400" /> AI Provider & Credentials
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Active AI Provider</label>
                <select
                  value={aiProvider}
                  onChange={(e) => setAiProvider(e.target.value as any)}
                  className="w-full bg-slate-900 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="mock">Smart Offline Simulator (Free & Fast)</option>
                  <option value="gemini">Google Gemini LLM</option>
                  <option value="openai">OpenAI GPT Engines</option>
                </select>
              </div>

              {aiProvider === 'gemini' && (
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Gemini API Key
                  </label>
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input text-white focus:outline-none"
                  />
                  <span className="text-[9px] text-slate-500 block leading-tight">Key remains saved locally inside your browser cache.</span>
                </div>
              )}

              {aiProvider === 'openai' && (
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> OpenAI API Key
                  </label>
                  <input
                    type="password"
                    placeholder="sk-proj-..."
                    value={openaiApiKey}
                    onChange={(e) => setOpenaiApiKey(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input text-white focus:outline-none"
                  />
                  <span className="text-[9px] text-slate-500 block leading-tight">Key remains saved locally inside your browser cache.</span>
                </div>
              )}

              {aiProvider === 'mock' && (
                <div className="p-3 bg-indigo-950/20 border border-indigo-900/30 rounded-xl text-[11px] text-indigo-300 leading-relaxed">
                  The **Offline Simulator** runs direct heuristic planning calculations instantly. You do not need any internet connection or paid API keys.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Focus Calendar scheduling window Settings */}
        <div className="glass-card p-6 rounded-2xl border border-[rgba(255,255,255,0.06)] space-y-4">
          <h3 className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-cyan-400" /> Auto-Scheduler Parameters
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sleep Limits */}
            <div className="space-y-3">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Moon className="w-3.5 h-3.5" /> Sleep Window (No Tasks)
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] text-slate-500 uppercase font-bold mb-1">Sleep Start</label>
                  <input
                    type="time"
                    value={sleepStart}
                    onChange={(e) => setSleepStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-slate-500 uppercase font-bold mb-1">Wake Time</label>
                  <input
                    type="time"
                    value={sleepEnd}
                    onChange={(e) => setSleepEnd(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Core Work window */}
            <div className="space-y-3">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Sun className="w-3.5 h-3.5" /> Core Working Hours
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] text-slate-500 uppercase font-bold mb-1">Work Start</label>
                  <input
                    type="time"
                    value={workStartTime}
                    onChange={(e) => setWorkStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-slate-500 uppercase font-bold mb-1">Work End</label>
                  <input
                    type="time"
                    value={workEndTime}
                    onChange={(e) => setWorkEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preferred Focus Periods */}
          <div className="pt-2 space-y-2.5">
            <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">Preferred Focus Windows</label>
            <div className="flex flex-wrap gap-3">
              {['morning', 'afternoon', 'evening'].map((period) => {
                const isSelected = preferredFocusHours.includes(period);
                return (
                  <button
                    key={period}
                    type="button"
                    onClick={() => handleToggleFocusHour(period)}
                    className={`px-4 py-2 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-indigo-950/20 border-indigo-500 text-indigo-400 font-bold' 
                        : 'bg-slate-900/30 border-slate-800 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom submit button */}
        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes Settings</span>
        </button>
      </form>
    </div>
  );
}
