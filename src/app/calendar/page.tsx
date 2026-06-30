'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { ScheduleBlock, Task } from '../../types';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Sparkles, 
  Trash2, 
  Plus, 
  ArrowRight, 
  RefreshCw, 
  Check,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Brain,
  Link2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CalendarPage() {
  const router = useRouter();
  const { 
    tasks, 
    scheduleBlocks, 
    settings, 
    rescheduleDay, 
    updateScheduleBlocks, 
    updateSettings, 
    isLoggedIn 
  } = useApp();

  // Auth Guard
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, router]);

  // Selected date
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [isScheduling, setIsScheduling] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Manual block modal states
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [blockTitle, setBlockTitle] = useState('');
  const [blockStart, setBlockStart] = useState('09:00');
  const [blockEnd, setBlockEnd] = useState('10:00');
  const [blockCategory, setBlockCategory] = useState('Study');
  const [isBreak, setIsBreak] = useState(false);

  // Parse hours for timeline
  const timelineHours = Array.from({ length: 15 }, (_, i) => i + 7); // 7 AM to 9 PM

  // Get blocks for selected date
  const selectedDateBlocks = scheduleBlocks
    .filter(b => b.date === selectedDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handlePrevDay = () => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() - 1);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + 1);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const handleAutoSchedule = () => {
    setIsScheduling(true);
    setTimeout(() => {
      rescheduleDay(selectedDate);
      setIsScheduling(false);
    }, 900);
  };

  const handleGoogleSync = () => {
    if (settings.googleCalendarSync) {
      updateSettings({ googleCalendarSync: false });
      return;
    }

    setIsSyncing(true);
    setTimeout(() => {
      updateSettings({ googleCalendarSync: true });
      setIsSyncing(false);
    }, 1200);
  };

  const handleCreateBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockTitle) return;

    const newBlock: ScheduleBlock = {
      id: `block-manual-${Date.now()}`,
      title: isBreak ? `☕ Break: ${blockTitle}` : blockTitle,
      startTime: blockStart,
      endTime: blockEnd,
      date: selectedDate,
      category: isBreak ? 'break' : blockCategory,
      isBreak
    };

    updateScheduleBlocks([...scheduleBlocks, newBlock]);
    setBlockTitle('');
    setIsBlockModalOpen(false);
  };

  const handleDeleteBlock = (blockId: string) => {
    updateScheduleBlocks(scheduleBlocks.filter(b => b.id !== blockId));
  };

  const getCategoryColor = (category: string, isBreakBlock: boolean) => {
    if (isBreakBlock) return 'border-amber-500/20 bg-amber-950/10 text-amber-400';
    switch (category.toLowerCase()) {
      case 'study': return 'border-indigo-500/20 bg-indigo-950/10 text-indigo-400';
      case 'coding': return 'border-pink-500/20 bg-pink-950/10 text-pink-400';
      case 'finance': return 'border-emerald-500/20 bg-emerald-950/10 text-emerald-400';
      case 'work': return 'border-cyan-500/20 bg-cyan-950/10 text-cyan-400';
      default: return 'border-slate-500/20 bg-slate-900/40 text-slate-400';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-[rgba(255,255,255,0.06)] pb-6">
        <div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-650 dark:from-white dark:via-indigo-100 dark:to-purple-200 bg-clip-text text-transparent">
            Schedule Planner
          </h2>
          <p className="text-slate-400 text-xs">
            Manage your daily calendar. Run the AI Autopilot scheduler to organize study and work slots.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Google Calendar Sync Button */}
          <button
            onClick={handleGoogleSync}
            disabled={isSyncing}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all ${
              settings.googleCalendarSync
                ? 'bg-cyan-950/20 border-cyan-500 text-cyan-400 glow-text-cyan shadow-lg shadow-cyan-950/40'
                : 'bg-slate-950/40 border-[rgba(255,255,255,0.08)] text-slate-400 hover:text-white'
            }`}
          >
            {isSyncing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Syncing OAuth...</span>
              </>
            ) : settings.googleCalendarSync ? (
              <>
                <Check className="w-4 h-4" />
                <span>Google Cal Connected</span>
              </>
            ) : (
              <>
                <Link2 className="w-4 h-4" />
                <span>Sync Google Calendar</span>
              </>
            )}
          </button>

          {/* AI Auto Schedule */}
          <button
            onClick={handleAutoSchedule}
            disabled={isScheduling}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            {isScheduling ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Scheduling...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>AI Auto-Schedule</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Calendar Info & Control Panel */}
        <div className="space-y-6">
          {/* Day Navigation card */}
          <div className="glass-card p-6 rounded-2xl border border-[rgba(255,255,255,0.06)] text-center">
            <h3 className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider mb-4">Focus Date</h3>
            <div className="flex items-center justify-between">
              <button 
                onClick={handlePrevDay}
                className="p-2 rounded-xl bg-slate-950/40 hover:bg-slate-900 border border-[rgba(255,255,255,0.05)] text-slate-400 hover:text-white"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="font-bold text-lg text-white">
                {new Date(selectedDate).toLocaleDateString(undefined, { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
              <button 
                onClick={handleNextDay}
                className="p-2 rounded-xl bg-slate-950/40 hover:bg-slate-900 border border-[rgba(255,255,255,0.05)] text-slate-400 hover:text-white"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            {/* Quick date display YYYY-MM-DD */}
            <div className="text-[11px] text-slate-500 mt-2 font-mono">{selectedDate}</div>
          </div>

          {/* AI Workload Summary for this day */}
          <div className="glass-card p-6 rounded-2xl border border-[rgba(255,255,255,0.06)] space-y-4">
            <h3 className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Brain className="w-4 h-4" /> Schedule Health Diagnosis
            </h3>
            
            {selectedDateBlocks.length === 0 ? (
              <p className="text-xs text-slate-400 leading-relaxed">
                You have no scheduled blocks for today. Run the **AI Auto-Schedule** button to automatically map out active tasks, or click **Create Event** to enter custom entries.
              </p>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.03)]">
                    <span className="block text-[9px] uppercase text-slate-500 font-bold mb-0.5">Focus Blocks</span>
                    <span className="text-md font-black text-indigo-400">
                      {selectedDateBlocks.filter(b => !b.isBreak).length}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.03)]">
                    <span className="block text-[9px] uppercase text-slate-500 font-bold mb-0.5">Recharge Breaks</span>
                    <span className="text-md font-black text-amber-500">
                      {selectedDateBlocks.filter(b => b.isBreak).length}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-indigo-950/20 border border-indigo-900/30 text-xs text-indigo-300 leading-relaxed">
                  Your day is structured with optimal 1.5-hour focus intervals followed by 30-minute breaks to avoid cognitive decay and procrastination.
                </div>
              </div>
            )}

            <button
              onClick={() => setIsBlockModalOpen(true)}
              className="w-full py-2.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-600/10 text-indigo-400 hover:text-indigo-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Event Block</span>
            </button>
          </div>
        </div>

        {/* Right Side: Timeline Agenda */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card p-6 rounded-2xl border border-[rgba(255,255,255,0.06)] min-h-[500px]">
            <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.05)] pb-4 mb-6">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-indigo-400" />
                Day Agenda
              </h3>
              
              {selectedDateBlocks.length > 0 && (
                <button
                  onClick={() => updateScheduleBlocks(scheduleBlocks.filter(b => b.date !== selectedDate))}
                  className="text-xs text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            {/* Vertical timeline blocks */}
            {selectedDateBlocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Clock className="w-12 h-12 text-slate-700 mb-4" />
                <p className="text-slate-400 text-sm font-medium">Timeline is currently clear.</p>
                <p className="text-slate-600 text-xs mt-1">Let the AI engine draft your schedule or manually customize it.</p>
              </div>
            ) : (
              <div className="space-y-4 relative pl-4 border-l border-[rgba(255,255,255,0.05)]">
                {selectedDateBlocks.map((block) => (
                  <motion.div
                    key={block.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 rounded-xl border flex items-center justify-between gap-4 group transition-all relative ${getCategoryColor(block.category, block.isBreak)}`}
                  >
                    {/* Glow circle indicator */}
                    <div className={`absolute -left-[21px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 bg-[#050512] ${
                      block.isBreak ? 'border-amber-500' : 'border-indigo-500'
                    }`} />

                    <div className="flex items-center gap-4">
                      {block.isBreak ? (
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                          <Coffee className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                          <Clock className="w-4 h-4" />
                        </div>
                      )}

                      <div>
                        <h4 className="font-bold text-xs text-white">{block.title}</h4>
                        <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                          <span className="font-mono">{block.startTime} - {block.endTime}</span>
                          {!block.isBreak && (
                            <span className="bg-slate-900 border border-slate-800 px-1.5 py-0.2 rounded uppercase text-[8px] font-bold text-slate-300">
                              {block.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteBlock(block.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-rose-950/20 text-slate-500 hover:text-rose-400 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CREATE EVENT BLOCK MODAL */}
      <AnimatePresence>
        {isBlockModalOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card max-w-sm w-full p-6 rounded-2xl border border-[rgba(139,92,246,0.2)]"
            >
              <div className="flex items-center justify-between mb-6 border-b border-[rgba(255,255,255,0.06)] pb-4">
                <h3 className="text-md font-bold text-white">Create Custom Block</h3>
                <button 
                  onClick={() => setIsBlockModalOpen(false)}
                  className="p-1 rounded hover:bg-[rgba(255,255,255,0.05)] text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateBlock} className="space-y-4">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Block Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Read Project Guidelines"
                    value={blockTitle}
                    onChange={(e) => setBlockTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input text-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Start Time</label>
                    <input
                      type="time"
                      required
                      value={blockStart}
                      onChange={(e) => setBlockStart(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs glass-input text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">End Time</label>
                    <input
                      type="time"
                      required
                      value={blockEnd}
                      onChange={(e) => setBlockEnd(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs glass-input text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-[rgba(255,255,255,0.02)] p-3 rounded-xl border border-[rgba(255,255,255,0.04)]">
                  <input
                    type="checkbox"
                    id="isBreakCheck"
                    checked={isBreak}
                    onChange={(e) => setIsBreak(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                  <label htmlFor="isBreakCheck" className="text-xs text-slate-300 select-none cursor-pointer">
                    Is this a recharge break?
                  </label>
                </div>

                {!isBreak && (
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Category</label>
                    <select
                      value={blockCategory}
                      onChange={(e) => setBlockCategory(e.target.value)}
                      className="w-full bg-slate-900 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none cursor-pointer"
                    >
                      <option value="Study">Study / Academics</option>
                      <option value="Coding">Coding / Development</option>
                      <option value="Finance">Finance / Bills</option>
                      <option value="Work">Professional Work</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/10 transition-all cursor-pointer"
                >
                  Create Event
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
