'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { Habit } from '../../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from 'recharts';
import { 
  BarChart2, 
  Flame, 
  Heart, 
  Activity, 
  AlertTriangle, 
  Plus, 
  Minus, 
  Check, 
  Brain,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AnalyticsPage() {
  const router = useRouter();
  const { tasks, habits, moodLogs, profile, logHabit, isLoggedIn } = useApp();

  const [mounted, setMounted] = useState(false);
  
  // Auth Guard & Mount hook
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, router]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isLoggedIn || !mounted) {
    return null; // Hydration protection
  }

  const today = new Date().toISOString().split('T')[0];

  // 1. Calculate Burnout Indicator Score (0 - 100)
  const calculateBurnoutScore = () => {
    let score = 25; // Base score

    // Overdue tasks penalty (+15 points per overdue task, max 30)
    const overdueTasks = tasks.filter(t => !t.completed && new Date(t.deadline).getTime() < new Date().getTime());
    score += Math.min(30, overdueTasks.length * 15);

    // Effort overload penalty (if total estimated hours of active tasks > 12h, +20 points)
    const activeTasksEffort = tasks.filter(t => !t.completed).reduce((sum, t) => sum + t.estimatedHours, 0);
    if (activeTasksEffort > 12) {
      score += 20;
    }

    // Mood penalty (if mood is stressed 😫, +25 points)
    const todayMood = moodLogs.find(m => m.date === today)?.mood;
    if (todayMood === '😫') {
      score += 25;
    } else if (todayMood === '😔') {
      score += 15;
    } else if (todayMood === '😊') {
      score -= 10; // Mood relief
    }

    return Math.min(100, Math.max(0, score));
  };

  const burnoutScore = calculateBurnoutScore();

  const getBurnoutLevel = (score: number) => {
    if (score >= 75) return { label: 'Dangerously Overloaded', color: 'text-rose-500', desc: 'Critical risk of burnout. Postpone low-priority tasks, decline meetings, and take a 2-hour offline break immediately.' };
    if (score >= 45) return { label: 'Moderate Stress', color: 'text-amber-500', desc: 'Slightly overloaded. Insert recharge breaks in your schedule and focus on only one primary objective today.' };
    return { label: 'Healthy Pace', color: 'text-emerald-400', desc: 'Workload is fully balanced. You have enough breaks and a comfortable schedule flow.' };
  };

  const burnoutDetails = getBurnoutLevel(burnoutScore);

  // 2. Generate Chart Data
  // Weekly Focus Hours Mock Data
  const weeklyFocusData = [
    { name: 'Mon', hours: 4.5, target: 5.0 },
    { name: 'Tue', hours: 6.0, target: 5.0 },
    { name: 'Wed', hours: 3.5, target: 5.0 },
    { name: 'Thu', hours: 5.5, target: 5.0 },
    { name: 'Fri', hours: 2.0, target: 5.0 },
    { name: 'Sat', hours: 4.0, target: 4.0 },
    { name: 'Sun', hours: 5.0, target: 4.0 },
  ];

  // Category Breakdown Data (Calculate from actual tasks)
  const getCategoryChartData = () => {
    const categories = ['Study', 'Coding', 'Finance', 'Work', 'General'];
    return categories.map(cat => {
      const catTasks = tasks.filter(t => t.category.toLowerCase() === cat.toLowerCase());
      const hours = catTasks.reduce((sum, t) => sum + t.estimatedHours, 0);
      return {
        name: cat,
        hours: hours || Math.floor(Math.random() * 3) + 1 // Add mock values if no tasks
      };
    });
  };

  const categoryChartData = getCategoryChartData();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="border-b border-slate-200/50 dark:border-[rgba(255,255,255,0.06)] pb-6">
        <h2 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-650 dark:from-white dark:via-indigo-100 dark:to-purple-200 bg-clip-text text-transparent">
          AI Analytics & Habits
        </h2>
        <p className="text-slate-400 text-xs">
          Analyze productivity trends, balance active workloads, and track daily habits.
        </p>
      </div>

      {/* Top Split: Burnout Monitor & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Burnout Risk Card */}
        <div className="glass-card p-6 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-gradient-to-br from-indigo-950/5 to-rose-950/10 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-[10px] font-mono text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-500 animate-pulse" /> Burnout Monitor
            </h3>

            {/* Burnout Gauge / Percentage */}
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900 dark:text-white">{burnoutScore}%</span>
              <span className={`text-xs font-bold ${burnoutDetails.color}`}>{burnoutDetails.label}</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-[rgba(255,255,255,0.05)]">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${
                  burnoutScore >= 75 ? 'bg-rose-500' :
                  burnoutScore >= 45 ? 'bg-amber-500' :
                  'bg-emerald-500'
                }`}
                style={{ width: `${burnoutScore}%` }}
              />
            </div>

            <p className="text-slate-400 text-[11px] leading-relaxed">
              {burnoutDetails.desc}
            </p>
          </div>

          <div className="pt-4 border-t border-[rgba(255,255,255,0.05)] mt-4">
            <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider block mb-1">Burnout mitigation tip</span>
            <p className="text-[10px] text-indigo-300 italic leading-relaxed">
              "Working more than 90 minutes consecutively drops output by 40%. Start a 5-minute break now."
            </p>
          </div>
        </div>

        {/* Dynamic Habit Tracker Widget (Remaining 2 columns) */}
        <div className="glass-card p-6 rounded-2xl border border-[rgba(255,255,255,0.06)] lg:col-span-2 space-y-4">
          <h3 className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-cyan-400" /> Daily Habits tracker
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {habits.map((habit) => {
              const currentVal = habit.logs[today] || 0;
              const targetVal = habit.target;
              const percentage = Math.min(100, Math.round((currentVal / targetVal) * 100));
              const isCompleted = currentVal >= targetVal;

              return (
                <div 
                  key={habit.id} 
                  className="p-3 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] rounded-xl space-y-2 relative overflow-hidden"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">{habit.name}</h4>
                      <span className="text-[10px] text-slate-500">Target: {targetVal} {habit.unit}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => logHabit(habit.id, today, -1)}
                        className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-slate-900 dark:text-white px-2">{currentVal}</span>
                      <button
                        onClick={() => logHabit(habit.id, today, 1)}
                        className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Habit Progress bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-[rgba(255,255,255,0.02)]">
                      <div 
                        className={`h-full transition-all duration-300 rounded-full ${
                          isCompleted ? 'bg-emerald-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[8px] text-slate-500 font-mono">
                      <span>{percentage}% Done</span>
                      {isCompleted && <span className="text-emerald-400 flex items-center gap-0.5"><Check className="w-2.5 h-2.5" /> Goal met</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Middle Split: Focus trends & allocations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Weekly Focus trends */}
        <div className="glass-card p-6 rounded-2xl border border-[rgba(255,255,255,0.06)] space-y-4">
          <h3 className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-indigo-400" /> Focus Time Trends (Last 7 Days)
          </h3>

          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyFocusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" unit="h" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#070714', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }} 
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Legend />
                <Line type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={2.5} name="Logged Hours" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="target" stroke="#a855f7" strokeDasharray="5 5" name="Target Target" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category breakdown bar chart */}
        <div className="glass-card p-6 rounded-2xl border border-[rgba(255,255,255,0.06)] space-y-4">
          <h3 className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-400" /> Objective Categories breakdown
          </h3>

          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" unit="h" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#070714', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }} 
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Bar dataKey="hours" fill="url(#colorUv)" name="Estimated Hours" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
