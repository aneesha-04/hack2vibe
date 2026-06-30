'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { Task, ScheduleBlock } from '../../types';
import { 
  Zap, 
  Flame, 
  Sparkles, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Coffee, 
  Plus, 
  ArrowRight, 
  RefreshCw,
  TrendingUp,
  BrainCircuit,
  ShieldAlert,
  Award,
  ChevronRight,
  HelpCircle,
  Play,
  Calendar,
  Layers,
  ArrowUpRight,
  CheckSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, Tooltip, XAxis } from 'recharts';

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
    rescheduleDay,
    isLoggedIn 
  } = useApp();

  const [isBriefingLoading, setIsBriefingLoading] = useState(false);
  const [typedRecommendation, setTypedRecommendation] = useState('');
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Auth Guard
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, router]);

  const todayStr = new Date().toISOString().split('T')[0];

  // Live Metrics calculations
  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);
  const totalTasksCount = tasks.length;
  const completedCount = completedTasks.length;
  const completionRate = totalTasksCount > 0 ? Math.round((completedCount / totalTasksCount) * 100) : 0;
  
  // High risk tasks filter
  const highRiskTasks = tasks.filter(t => !t.completed && (t.riskLevel === 'Critical Risk' || t.riskLevel === 'High Risk'));
  const overdueTasksCount = tasks.filter(t => !t.completed && new Date(t.deadline).getTime() < Date.now()).length;

  // Heuristic estimates
  const baseScore = totalTasksCount > 0 ? 60 + Math.round((completedCount / totalTasksCount) * 40) : 84;
  const productivityScore = isLoggedIn ? Math.min(100, baseScore + profile.focusStreak * 2) : 84;
  
  // Calculate average risk probability
  const avgRiskProb = activeTasks.length > 0 
    ? Math.round(activeTasks.reduce((acc, curr) => acc + curr.riskProbability, 0) / activeTasks.length)
    : 10;
  const estimatedCompletionChance = Math.max(0, 100 - avgRiskProb);

  // Suggested Recommendation based on tasks
  const getAISuggestedRecommendation = () => {
    if (activeTasks.length === 0) {
      return "You are fully caught up! Enjoy your free time or schedule a quick learning habit.";
    }
    const criticalTask = activeTasks.find(t => t.priorityLevel === 'Critical' || t.riskLevel === 'Critical Risk');
    if (criticalTask) {
      return `Start your "${criticalTask.title}" focus block immediately. You have only ${criticalTask.estimatedHours} hours scheduled but it requires active focus to mitigate risk.`;
    }
    const topTask = [...activeTasks].sort((a, b) => b.priorityScore - a.priorityScore)[0];
    return `Start your "${topTask.title}" before lunch. You have the highest probability of finishing it today with current focus buffers.`;
  };

  const recommendationText = getAISuggestedRecommendation();

  // Typing effect simulation
  useEffect(() => {
    let index = 0;
    setTypedRecommendation('');
    const timer = setInterval(() => {
      if (index < recommendationText.length) {
        setTypedRecommendation((prev) => prev + recommendationText.charAt(index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 15);
    return () => clearInterval(timer);
  }, [recommendationText]);

  // Today's schedule blocks
  const todayBlocks = scheduleBlocks
    .filter(b => b.date === todayStr)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleMoodSelect = (mood: '😊' | '😐' | '😔' | '😫') => {
    addMoodLog(mood);
    confetti({ particleCount: 15, spread: 25, origin: { y: 0.8 }, colors: ['#6366F1', '#8B5CF6'] });
  };

  const handleRescueTrigger = (task: Task) => {
    triggerRescueMode(task.id);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ['#EF4444', '#8B5CF6', '#6366F1'] });
    alert(`Deadline Rescue Plan generated for "${task.title}". The scheduler has reorganized your day with hour-by-hour focus tasks.`);
    router.push('/calendar');
  };

  const handleTaskComplete = (task: Task) => {
    const updated = { ...task, completed: !task.completed };
    updateTask(updated);
    if (updated.completed) {
      confetti({ particleCount: 30, spread: 45, origin: { y: 0.8 }, colors: ['#10B981', '#6366F1'] });
    }
  };

  const handleReschedule = () => {
    setIsRescheduling(true);
    setTimeout(() => {
      rescheduleDay(todayStr);
      setIsRescheduling(false);
      confetti({ particleCount: 30, spread: 40, colors: ['#8B5CF6', '#06B6D4'] });
      alert("Autopilot has reorganized today's schedule blocks around your workload.");
    }, 1000);
  };

  // Mock analytics history for the chart
  const analyticsData = [
    { name: 'Mon', score: 72, hours: 2 },
    { name: 'Tue', score: 78, hours: 3.5 },
    { name: 'Wed', score: 81, hours: 4 },
    { name: 'Thu', score: 76, hours: 3 },
    { name: 'Fri', score: 85, hours: 5.5 },
    { name: 'Sat', score: 89, hours: 6 },
    { name: 'Sun', score: productivityScore, hours: completedCount * 1.5 },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* 1. HERO AI MORNING BRIEF */}
      <div className="w-full glass-card p-6 md:p-8 rounded-[24px] border border-primary/10 bg-gradient-to-br from-primary/5 via-secondary/5 to-transparent relative overflow-hidden">
        
        {/* Glow Spheres */}
        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-secondary/10 blur-[80px] rounded-full pointer-events-none -z-10" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Greeting and Typing Rec */}
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary animate-pulse">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono font-bold text-primary tracking-wider uppercase">AI Daily Briefing</span>
            </div>
            
            <h2 className="text-[32px] md:text-[40px] font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Good Morning, {profile.name.split(' ')[0]} 👋
            </h2>
            
            <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/40 dark:border-white/5 backdrop-blur-sm min-h-[60px] flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
              <p className="text-[14px] text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                {typedRecommendation}
                <span className="inline-block w-1.5 h-3.5 bg-secondary ml-1 animate-pulse" />
              </p>
            </div>
          </div>

          {/* Quick Metrics Dials */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 shrink-0 lg:w-auto w-full">
            
            <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex flex-col justify-between min-h-[90px] shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Activity Level</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">{activeTasks.length}</span>
                <span className="text-[10px] text-slate-500 font-mono">active</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex flex-col justify-between min-h-[90px] shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Streak Tracker</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl font-black text-warning">🔥 {profile.focusStreak}</span>
                <span className="text-[10px] text-slate-500 font-mono">days</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex flex-col justify-between min-h-[90px] shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Productivity</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl font-black text-primary">{productivityScore}%</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex flex-col justify-between min-h-[90px] shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Est. Completion</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl font-black text-success">{estimatedCompletionChance}%</span>
              </div>
            </div>

          </div>
        </div>

        {/* Hero Actions Bar */}
        <div className="flex flex-wrap items-center gap-3 mt-6 pt-5 border-t border-slate-200/50 dark:border-slate-800/40">
          <button
            onClick={() => router.push('/focus')}
            className="px-4 py-2 rounded-xl bg-primary hover:opacity-90 text-white font-semibold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-primary/20"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Start Focus Session</span>
          </button>
          <button
            onClick={() => router.push('/calendar')}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 font-semibold text-xs flex items-center gap-2 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>View Timeline Agenda</span>
          </button>
          <button
            onClick={() => router.push('/chat')}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-secondary" />
            <span>Ask AI Assistant</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN LAYOUT COLUMNS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT TWO COLUMNS */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Today's Priorities */}
          <div className="glass-card p-6 rounded-[22px] border border-slate-200/50 dark:border-white/5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-primary" />
                <h3 className="text-[16px] font-bold text-slate-900 dark:text-white">Today's Focus Objectives</h3>
              </div>
              <button 
                onClick={() => router.push('/tasks')}
                className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Task Center</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {activeTasks.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 flex flex-col items-center gap-3">
                <span>🎉 You are all caught up! Let's schedule something new.</span>
                <button
                  onClick={() => router.push('/tasks')}
                  className="px-4 py-2 rounded-xl bg-primary text-white font-bold"
                >
                  + Create Task
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {activeTasks.slice(0, 4).map((task) => {
                  const subTotal = task.subtasks?.length || 0;
                  const subDone = task.subtasks?.filter(s => s.completed).length || 0;
                  const taskPercent = subTotal > 0 ? Math.round((subDone / subTotal) * 100) : 0;
                  const diffLevel = task.estimatedHours > 4 ? 'Hard' : task.estimatedHours > 2 ? 'Medium' : 'Easy';
                  
                  return (
                    <div 
                      key={task.id}
                      className="p-4 rounded-2xl bg-white/50 dark:bg-slate-950/20 hover:bg-slate-50/70 dark:hover:bg-slate-900/30 border border-slate-100 dark:border-white/5 transition-all group flex items-start justify-between gap-4"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <button 
                          onClick={() => handleTaskComplete(task)}
                          className="w-5.5 h-5.5 mt-0.5 rounded-full border-2 border-slate-350 dark:border-slate-700 hover:border-primary flex items-center justify-center shrink-0 cursor-pointer"
                        >
                          <span className="w-2.5 h-2.5 rounded-full hover:bg-primary transition-colors" />
                        </button>
                        
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <h4 className="font-bold text-[14px] text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">
                            {task.title}
                          </h4>
                          
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 font-mono">
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {task.estimatedHours}h</span>
                            <span>•</span>
                            <span className={`px-1.5 py-0.2 rounded font-bold uppercase text-[9px] ${
                              diffLevel === 'Hard' ? 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400' :
                              diffLevel === 'Medium' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400' :
                              'bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400'
                            }`}>
                              {diffLevel}
                            </span>
                            <span>•</span>
                            <span className="text-slate-600 dark:text-slate-400 font-semibold">{task.priorityLevel} Priority</span>
                          </div>

                          {/* Task progress bar if subtasks exist */}
                          {subTotal > 0 && (
                            <div className="space-y-1 pt-1 max-w-[200px]">
                              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                                <span>Subtasks</span>
                                <span>{subDone}/{subTotal} ({taskPercent}%)</span>
                              </div>
                              <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: `${taskPercent}%` }} />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleRescueTrigger(task)}
                        className="px-2.5 py-1.5 rounded-lg border border-danger/25 bg-danger/5 hover:bg-danger text-danger hover:text-white font-bold text-[9px] uppercase tracking-wider transition-all cursor-pointer shrink-0"
                      >
                        Autopilot Rescue
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Productivity Trends & Focus Analytics */}
          <div className="glass-card p-6 rounded-[22px] border border-slate-200/50 dark:border-white/5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-secondary" />
                <h3 className="text-[16px] font-bold text-slate-900 dark:text-white">Productivity Trends & Focus History</h3>
              </div>
              <button 
                onClick={() => router.push('/analytics')}
                className="text-[11px] text-secondary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Analytics Center</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                      borderColor: '#e2e8f0',
                      borderRadius: '12px',
                      fontSize: '11px',
                      color: '#0f172a'
                    }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (Timeline, Threat Board, AI Coach) */}
        <div className="space-y-6">
          
          {/* AI Coach Card */}
          <div className="glass-card p-6 rounded-[22px] border border-secondary/20 bg-gradient-to-br from-secondary/5 to-transparent relative">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200/60 dark:border-slate-800 mb-4">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                <BrainCircuit className="w-4.5 h-4.5 animate-bounce" style={{ animationDuration: '3s' }} />
              </div>
              <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">🤖 AI Coach Panel</h3>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/65 text-slate-700 dark:text-slate-250 leading-relaxed font-medium relative">
                "Good morning! You have {highRiskTasks.length} assignment{highRiskTasks.length !== 1 ? 's' : ''} at high risk today. If you begin focus blocks within the next hour, your overall completion probability climbs to 94%. Shall I update your timeline?"
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleReschedule}
                  disabled={isRescheduling}
                  className="p-2 rounded-xl bg-secondary text-white font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-90 shadow-md shadow-secondary/15 transition-all"
                >
                  <RefreshCw className={`w-3 h-3 ${isRescheduling ? 'animate-spin' : ''}`} />
                  <span>Reschedule</span>
                </button>
                <button
                  onClick={() => router.push('/focus')}
                  className="p-2 rounded-xl bg-primary text-white font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-90 shadow-md shadow-primary/15 transition-all"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>Start Now</span>
                </button>
              </div>

              <button
                onClick={() => router.push('/chat')}
                className="w-full py-2.5 rounded-xl bg-slate-100/80 dark:bg-white/3 border border-slate-200/50 dark:border-white/5 hover:bg-slate-200/60 dark:hover:bg-white/8 text-slate-750 dark:text-slate-350 font-semibold text-center transition-colors cursor-pointer"
              >
                Ask AI Coach Details
              </button>
            </div>
          </div>

          {/* AI Risk Center (Threat Board) */}
          <div className="glass-card p-6 rounded-[22px] border border-rose-200/50 dark:border-rose-950/20 bg-gradient-to-br from-rose-500/5 to-transparent">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200/60 dark:border-slate-800 mb-4">
              <ShieldAlert className="w-5 h-5 text-danger" />
              <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">AI Risk Dashboard</h3>
            </div>

            {highRiskTasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No high risk deadlines detected. You have sufficient scheduling buffer windows!
              </div>
            ) : (
              <div className="space-y-4">
                {highRiskTasks.slice(0, 2).map((task) => (
                  <div key={task.id} className="p-3 bg-white/60 dark:bg-slate-950/50 border border-rose-100 dark:border-rose-900/30 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-[170px]">{task.title}</h4>
                      <span className="text-[11px] font-black text-danger">{task.riskProbability}% Risk</span>
                    </div>

                    <p className="text-[10px] text-slate-600 dark:text-rose-300 bg-rose-50/50 dark:bg-rose-950/10 p-2 rounded border border-rose-100/40 dark:border-rose-900/20 leading-relaxed font-mono">
                      {task.riskExplanation}
                    </p>

                    <button
                      onClick={() => handleRescueTrigger(task)}
                      className="w-full py-2 rounded-xl bg-danger hover:opacity-90 text-white font-bold text-[9px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-danger/10 cursor-pointer"
                    >
                      <Flame className="w-3 h-3 fill-white" />
                      <span>Trigger Emergency Plan</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Today's Agenda (Daily Timeline) */}
          <div className="glass-card p-6 rounded-[22px] border border-slate-200/50 dark:border-white/5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent" />
                <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">Timeline Agenda</h3>
              </div>
              <button 
                onClick={() => router.push('/calendar')}
                className="text-[11px] text-accent hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Calendar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {todayBlocks.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                <span>Timeline Agenda is empty.</span>
                <button
                  onClick={handleReschedule}
                  className="text-primary font-bold text-xs hover:underline mt-1"
                >
                  Generate AI Autopilot Plan
                </button>
              </div>
            ) : (
              <div className="space-y-3 relative pl-3 border-l border-slate-200/60 dark:border-slate-800/60">
                {todayBlocks.slice(0, 5).map((block) => (
                  <div 
                    key={block.id}
                    className={`p-3 rounded-xl border text-[11px] flex items-center justify-between transition-all ${
                      block.isBreak 
                        ? 'border-warning/10 bg-warning/5 text-warning' 
                        : 'border-primary/10 bg-primary/5 text-primary'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      {block.isBreak ? <Coffee className="w-3.5 h-3.5 shrink-0" /> : <Clock className="w-3.5 h-3.5 shrink-0" />}
                      <span className="truncate font-bold text-[12px] text-slate-800 dark:text-slate-100">{block.title}</span>
                    </div>
                    <span className="font-mono text-[9px] text-slate-500 shrink-0">{block.startTime}</span>
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
