'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  Plus, 
  Sparkles, 
  Bell, 
  Calendar as CalendarIcon, 
  CloudSun,
  User, 
  Settings, 
  LogOut,
  Check,
  Flame,
  ChevronDown,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CommandBar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { 
    isLoggedIn, 
    profile, 
    addMoodLog, 
    moodLogs, 
    addTask,
    toggleTheme,
    theme
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskHours, setTaskHours] = useState('2');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Hidden on landing page and auth pages
  const noBarPages = ['/', '/login', '/register'];
  if (!isLoggedIn || noBarPages.includes(pathname)) {
    return null;
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const activeMood = moodLogs.find(m => m.date === todayStr)?.mood || null;

  const handleMoodSelect = (mood: '😊' | '😐' | '😔' | '😫') => {
    addMoodLog(mood);
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;
    
    const deadlineVal = taskDeadline || new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16); // Default 2 days out
    await addTask({
      title: taskTitle,
      description: 'Quick added task from Command Bar.',
      deadline: new Date(deadlineVal).toISOString(),
      estimatedHours: parseFloat(taskHours),
      category: 'General',
      isRecurring: false
    });

    setTaskTitle('');
    setIsQuickAddOpen(false);
    alert('Task successfully created!');
  };

  const formattedDate = new Date().toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="w-full px-6 pt-4 pb-2 shrink-0 relative z-30">
      <div className="w-full glass-panel rounded-2xl border border-slate-200/50 dark:border-white/5 bg-white/60 dark:bg-slate-950/40 backdrop-blur-md px-4 py-2.5 flex items-center justify-between gap-4 shadow-sm shadow-slate-100/50 dark:shadow-none">
        
        {/* Left Side: Search & Commands */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search or ask command..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-xl text-xs bg-slate-100/60 dark:bg-white/5 border border-slate-200/40 dark:border-white/5 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all placeholder-slate-400"
            />
          </div>
        </div>

        {/* Right Side: Quick Add, Moods, Actions, Date */}
        <div className="flex items-center gap-3">
          
          {/* Quick Mood Tracker */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 dark:bg-white/3 border border-slate-100 dark:border-slate-800/40">
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider mr-1">Mood:</span>
            {([ '😊', '😐', '😔', '😫' ] as const).map((m) => (
              <button
                key={m}
                onClick={() => handleMoodSelect(m)}
                className={`text-[13px] p-0.5 rounded transition-transform hover:scale-110 cursor-pointer ${
                  activeMood === m ? 'bg-primary/10 border border-primary/20 scale-110' : 'opacity-60'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Quick Add Task Button */}
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-primary hover:opacity-90 text-white text-[12px] font-medium flex items-center gap-1.5 cursor-pointer shadow-md shadow-primary/15 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Task</span>
          </button>

          {/* Ask AI Page Shortcut */}
          <button
            onClick={() => router.push('/chat')}
            className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/40 dark:border-white/5 text-slate-800 dark:text-slate-300 hover:text-primary dark:hover:text-white cursor-pointer hover:bg-slate-200/50 transition-colors"
            title="Ask AI Assistant"
          >
            <Sparkles className="w-4 h-4" />
          </button>

          {/* Notifications Center */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/40 dark:border-white/5 text-slate-800 dark:text-slate-300 hover:text-primary dark:hover:text-white cursor-pointer hover:bg-slate-200/50 transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-danger rounded-full" />
            </button>

            {/* Dropdown notifications */}
            <AnimatePresence>
              {isNotificationsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-72 glass-panel border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xl z-50 text-xs"
                  >
                    <h4 className="font-bold text-slate-800 dark:text-white mb-2 pb-1.5 border-b border-slate-100 dark:border-slate-800">
                      Productivity Feeds
                    </h4>
                    <div className="space-y-2.5">
                      <div className="flex gap-2.5 items-start">
                        <span className="w-2 h-2 mt-1.5 rounded-full bg-danger shrink-0" />
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">Burnout risk check</p>
                          <p className="text-[10px] text-slate-600 dark:text-slate-400">Stress parameters indicate you should insert rest intervals.</p>
                        </div>
                      </div>
                      <div className="flex gap-2.5 items-start">
                        <span className="w-2 h-2 mt-1.5 rounded-full bg-primary shrink-0" />
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">Daily planner ready</p>
                          <p className="text-[10px] text-slate-600 dark:text-slate-400">Autopilot has scheduled focus periods for TickTock tasks.</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Date Widget */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/50 dark:bg-white/3 border border-slate-200/30 dark:border-white/3 text-[11px] font-mono text-slate-750 dark:text-slate-350">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>{formattedDate}</span>
          </div>

        </div>
      </div>

      {/* QUICK ADD TASK DIALOG */}
      <AnimatePresence>
        {isQuickAddOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card max-w-sm w-full p-6 rounded-2xl border border-primary/20 bg-white dark:bg-slate-900"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-primary" />
                  Quick Add Task
                </h3>
                <button 
                  onClick={() => setIsQuickAddOpen(false)}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleQuickAdd} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Task Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Finish DSA presentation"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Est. Hours</label>
                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      required
                      value={taskHours}
                      onChange={(e) => setTaskHours(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Deadline</label>
                    <input
                      type="datetime-local"
                      required
                      value={taskDeadline}
                      onChange={(e) => setTaskDeadline(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-primary text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/10 transition-all cursor-pointer hover:opacity-90"
                >
                  Create Task
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
