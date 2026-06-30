'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { Task, DailyReport, MoodLog } from '../../types';
import { 
  Zap, 
  Flame, 
  Sparkles, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Coffee, 
  Smile, 
  Plus, 
  ArrowRight, 
  RefreshCw,
  TrendingUp,
  BrainCircuit,
  Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function DashboardPage() {
  const router = useRouter();
  const { 
    tasks, 
    scheduleBlocks, 
    reports, 
    moodLogs, 
    profile, 
    generateBriefing, 
    addMoodLog, 
    updateTask,
    triggerRescueMode,
    isLoggedIn 
  } = useApp();

  // Auth Guard
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, router]);

  const [isBriefingLoading, setIsBriefingLoading] = useState(false);
  const [selectedTaskToRescue, setSelectedTaskToRescue] = useState<Task | null>(null);

  const today = new Date().toISOString().split('T')[0];

  // Get today's briefing
  const todayReport = reports.find(r => r.date === today);
  const morningBrief = todayReport?.morningBriefing;

  // Get today's mood
  const todayMoodLog = moodLogs.find(m => m.date === today);
  const currentMood = todayMoodLog?.mood || null;

  // Get today's schedule blocks
  const todayBlocks = scheduleBlocks
    .filter(b => b.date === today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Get high risk tasks
  const highRiskTasks = tasks.filter(t => !t.completed && (t.riskLevel === 'Critical Risk' || t.riskLevel === 'High Risk'));

  // Calculate metrics
  const completedTodayCount = tasks.filter(t => t.completed).length;
  const activeCount = tasks.filter(t => !t.completed).length;
  const completionRate = tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0;

  // Auto-generate briefing on load if missing
  useEffect(() => {
    if (isLoggedIn && !morningBrief && !isBriefingLoading) {
      handleLoadBriefing();
    }
  }, [isLoggedIn, morningBrief]);

  const handleLoadBriefing = async (selectedMood?: string) => {
    setIsBriefingLoading(true);
    await generateBriefing(today, selectedMood);
    setIsBriefingLoading(false);
  };

  const handleMoodSelect = (mood: '😊' | '😐' | '😔' | '😫') => {
    addMoodLog(mood);
    handleLoadBriefing(mood);
    confetti({ particleCount: 15, spread: 20, origin: { y: 0.8 }, colors: ['#a855f7', '#06b6d4'] });
  };

  const handleRescueTrigger = (task: Task) => {
    triggerRescueMode(task.id);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ['#f43f5e', '#ec4899', '#a855f7'] });
    alert(`Deadline Rescue Plan generated for "${task.title}". The scheduler has reorganized your day with hour-by-hour focus tasks.`);
    router.push('/calendar');
  };

  const handleTaskComplete = (task: Task) => {
    const updated = { ...task, completed: !task.completed };
    updateTask(updated);
    if (updated.completed) {
      confetti({ particleCount: 30, spread: 45, origin: { y: 0.8 }, colors: ['#10b981', '#6366f1'] });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[rgba(255,255,255,0.06)] pb-6">
        <div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-600 dark:from-white dark:via-slate-100 dark:to-indigo-200 bg-clip-text text-transparent">
            Welcome, {profile.name}
          </h2>
          <p className="text-slate-400 text-xs">
            Here is your daily AI briefing, risk warning diagnosis, and auto-timeline agenda.
          </p>
        </div>

        {/* Mood Tracker Widget */}
        <div className="glass-card px-4 py-2 rounded-2xl border border-[rgba(255,255,255,0.08)] flex items-center gap-3">
          <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">Log Mood:</span>
          <div className="flex items-center gap-1.5">
            {(['😊', '😐', '😔', '😫'] as const).map((mood) => (
              <button
                key={mood}
                onClick={() => handleMoodSelect(mood)}
                className={`text-lg p-1.5 rounded-lg hover:bg-slate-900 transition-all ${
                  currentMood === mood 
                    ? 'bg-indigo-900/40 border border-indigo-500/50 scale-110 shadow' 
                    : 'border border-transparent hover:scale-105'
                }`}
              >
                {mood}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column (Stats & Briefing), Right Column (Timeline & Threat Board) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Briefing & Productivity stats */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* AI Morning Briefing */}
          <div className="glass-card p-6 rounded-2xl border border-[rgba(255,255,255,0.06)] relative overflow-hidden">
            {/* Ambient backglow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-4 border-b border-[rgba(255,255,255,0.05)] pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-indigo-400" />
                AI Morning Coach Briefing
              </h3>
              <button
                onClick={() => handleLoadBriefing(currentMood || undefined)}
                disabled={isBriefingLoading}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isBriefingLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {isBriefingLoading ? (
              <div className="py-12 text-center text-xs text-slate-500 flex flex-col items-center gap-3">
                <span className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                <span>Running workload regression analysis...</span>
              </div>
            ) : morningBrief ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {morningBrief.overview}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* Today Priorities */}
                  <div className="p-4 rounded-xl bg-indigo-950/10 border border-indigo-900/30 space-y-2">
                    <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider">Top Priorities</span>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {morningBrief.priorities.map((p, i) => (
                        <li key={i} className="flex gap-2 items-start">
                          <span className="text-indigo-400 font-mono">0{i+1}.</span>
                          <span className="truncate">{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Suggestions */}
                  <div className="p-4 rounded-xl bg-purple-950/10 border border-purple-900/30 space-y-2">
                    <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider">Coach suggestions</span>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {morningBrief.suggestions.map((s, i) => (
                        <li key={i} className="flex gap-2 items-start">
                          <span className="text-purple-400 font-mono">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {morningBrief.risks && morningBrief.risks.length > 0 && (
                  <div className="p-3.5 bg-rose-950/10 border border-rose-900/30 rounded-xl space-y-1 text-xs text-rose-300">
                    <span className="block text-[9px] font-mono text-rose-400 font-bold uppercase tracking-wider">Risks Identified</span>
                    <ul className="space-y-1 list-disc pl-4 text-[11px] leading-relaxed">
                      {morningBrief.risks.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-500">
                Briefing could not be loaded. Click refresh to retry.
              </div>
            )}
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card p-4 rounded-2xl border border-[rgba(255,255,255,0.06)] flex items-center justify-between">
              <div>
                <span className="block text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider">Completed Today</span>
                <span className="text-2xl font-black text-white mt-1 block">{completedTodayCount}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-[rgba(255,255,255,0.06)] flex items-center justify-between">
              <div>
                <span className="block text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider">Active Objectives</span>
                <span className="text-2xl font-black text-white mt-1 block">{activeCount}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Zap className="w-5 h-5" />
              </div>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-[rgba(255,255,255,0.06)] flex items-center justify-between">
              <div>
                <span className="block text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider">Focus Streak</span>
                <span className="text-2xl font-black text-orange-500 mt-1 block">🔥 {profile.focusStreak} Days</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400">
                <Flame className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Quick Tasks List */}
          <div className="glass-card p-6 rounded-2xl border border-[rgba(255,255,255,0.06)]">
            <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.05)] pb-4 mb-4">
              <h3 className="font-bold text-sm text-white">Focus Objectives</h3>
              <button 
                onClick={() => router.push('/tasks')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-bold tracking-wider flex items-center gap-1 cursor-pointer"
              >
                <span>Manage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {tasks.filter(t => !t.completed).length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No active focus tasks. Take a breath or schedule one!
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.filter(t => !t.completed).slice(0, 3).map((task) => (
                  <div 
                    key={task.id}
                    className="p-3 bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.04)] hover:border-indigo-500/10 rounded-xl flex items-center justify-between gap-4 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleTaskComplete(task)}
                        className="w-5 h-5 rounded-full border border-slate-600 hover:border-indigo-400 flex items-center justify-center"
                      >
                        <span className="w-2.5 h-2.5 rounded-full hover:bg-indigo-400 transition-colors" />
                      </button>
                      <div>
                        <h4 className="font-bold text-xs text-white truncate max-w-[200px] sm:max-w-md">{task.title}</h4>
                        <span className="text-[10px] text-slate-400 mt-1 block">Due: {new Date(task.deadline).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      task.priorityLevel === 'Critical' ? 'bg-rose-500/10 text-rose-400' :
                      task.priorityLevel === 'High' ? 'bg-purple-500/10 text-purple-400' :
                      'bg-indigo-500/10 text-indigo-400'
                    }`}>
                      {task.priorityLevel}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Threats & Schedule Agenda */}
        <div className="space-y-6">
          
          {/* Threat Board (High-Risk tasks) */}
          <div className="glass-card p-6 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-gradient-to-br from-indigo-950/10 to-rose-950/10">
            <h3 className="font-bold text-sm text-white flex items-center gap-2 mb-4 border-b border-[rgba(255,255,255,0.05)] pb-3">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              Threat Board
            </h3>

            {highRiskTasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 leading-relaxed">
                No high-risk deadlines detected! All commitments have sufficient scheduled buffers.
              </div>
            ) : (
              <div className="space-y-4">
                {highRiskTasks.map((task) => (
                  <div key={task.id} className="p-3 bg-slate-950/50 border border-rose-900/30 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-white truncate max-w-[150px]">{task.title}</h4>
                      <span className="text-[11px] font-black text-rose-500">{task.riskProbability}% Risk</span>
                    </div>

                    <div className="text-[10px] text-rose-300 bg-rose-950/20 p-2 rounded-lg border border-rose-900/20 leading-relaxed">
                      {task.riskExplanation}
                    </div>

                    <button
                      onClick={() => handleRescueTrigger(task)}
                      className="w-full py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[9px] uppercase tracking-wider flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Flame className="w-3 h-3" />
                      <span>Rescue Plan</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Today's Schedule timeline */}
          <div className="glass-card p-6 rounded-2xl border border-[rgba(255,255,255,0.06)]">
            <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.05)] pb-4 mb-4">
              <h3 className="font-bold text-sm text-white">Today's Agenda</h3>
              <button 
                onClick={() => router.push('/calendar')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-bold tracking-wider flex items-center gap-1 cursor-pointer"
              >
                <span>Full Calendar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {todayBlocks.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                <Clock className="w-8 h-8 text-slate-700" />
                <span>Timeline is empty.</span>
                <button
                  onClick={() => router.push('/calendar')}
                  className="text-indigo-400 font-bold text-xs hover:underline mt-1 cursor-pointer"
                >
                  Generate Plan
                </button>
              </div>
            ) : (
              <div className="space-y-3 relative pl-3 border-l border-[rgba(255,255,255,0.05)]">
                {todayBlocks.slice(0, 5).map((block) => (
                  <div 
                    key={block.id}
                    className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                      block.isBreak 
                        ? 'border-amber-500/10 bg-amber-950/5 text-amber-400' 
                        : 'border-indigo-500/10 bg-indigo-950/5 text-indigo-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      {block.isBreak ? <Coffee className="w-3.5 h-3.5 shrink-0" /> : <Clock className="w-3.5 h-3.5 shrink-0" />}
                      <span className="truncate font-bold text-[11px] text-white">{block.title}</span>
                    </div>
                    <span className="font-mono text-[9px] text-slate-400 shrink-0">{block.startTime}</span>
                  </div>
                ))}
                {todayBlocks.length > 5 && (
                  <div className="text-[10px] text-center text-slate-500 pt-1">
                    + {todayBlocks.length - 5} more blocks scheduled
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
