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

  // Track the active calendar month (Starts at current system date in 2026)
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 5, 30)); // 2026 default start

  // Selected date YYYY-MM-DD
  const [selectedDate, setSelectedDate] = useState(() => {
    return "2026-06-30";
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

  // Get blocks for selected date
  const selectedDateBlocks = scheduleBlocks
    .filter(b => b.date === selectedDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
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
    if (isBreakBlock) return 'border-amber-250 bg-amber-50/50 dark:bg-amber-950/10 text-warning';
    switch (category.toLowerCase()) {
      case 'study': return 'border-indigo-250 bg-indigo-50/50 dark:bg-indigo-950/10 text-primary';
      case 'coding': return 'border-pink-250 bg-pink-50/50 dark:bg-pink-950/10 text-danger';
      case 'finance': return 'border-emerald-250 bg-emerald-50/50 dark:bg-emerald-950/10 text-success';
      case 'work': return 'border-cyan-250 bg-cyan-50/50 dark:bg-cyan-950/10 text-cyan-600 dark:text-accent';
      default: return 'border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/40 text-slate-800 dark:text-slate-350';
    }
  };

  // Helper values to draw calendar month grid
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  // Array of day grids
  const calendarCells: { dayNum: number; dateStr: string; isCurrentMonth: boolean }[] = [];

  // 1. Prefix days from previous month
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayVal = prevMonthTotalDays - i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dayVal).padStart(2, '0')}`;
    calendarCells.push({ dayNum: dayVal, dateStr, isCurrentMonth: false });
  }

  // 2. Days of current month
  for (let i = 1; i <= totalDays; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    calendarCells.push({ dayNum: i, dateStr, isCurrentMonth: true });
  }

  // 3. Post-days from next month to fill grid (42 standard cells)
  const remainingCells = 42 - calendarCells.length;
  for (let i = 1; i <= remainingCells; i++) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    calendarCells.push({ dayNum: i, dateStr, isCurrentMonth: false });
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-slate-800 pb-6">
        <div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-650 dark:from-white dark:via-indigo-100 dark:to-purple-200 bg-clip-text text-transparent">
            Schedule Planner
          </h2>
          <p className="text-slate-550 dark:text-slate-400 text-xs">
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
                ? 'bg-cyan-950/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400'
                : 'bg-slate-100 hover:bg-slate-200/60 dark:bg-slate-950/40 border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
            className="px-4 py-2.5 rounded-xl bg-primary hover:opacity-90 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-primary/10 transition-all flex items-center gap-2 cursor-pointer"
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
        
        {/* Left Columns: Interactive Month Grid & Diagnostics */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* MONTHLY CALENDAR CARD FOR 2026 */}
          <div className="glass-card p-5 rounded-3xl border border-slate-200/50 dark:border-white/5">
            
            {/* Header: Month & Year */}
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {monthNames[month]} {year}
              </h3>
              
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Day of Week Headers */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-mono font-bold text-slate-500 mb-2">
              <span>S</span>
              <span>M</span>
              <span>T</span>
              <span>W</span>
              <span>T</span>
              <span>F</span>
              <span>S</span>
            </div>

            {/* Days Cells Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold">
              {calendarCells.map((cell, idx) => {
                const isSelected = cell.dateStr === selectedDate;
                
                // Indicators check
                const hasTasks = tasks.some(t => !t.completed && t.deadline.split('T')[0] === cell.dateStr);
                const hasBlocks = scheduleBlocks.some(b => b.date === cell.dateStr);

                return (
                  <button
                    key={`${cell.dateStr}-${idx}`}
                    onClick={() => setSelectedDate(cell.dateStr)}
                    className={`py-2 rounded-xl relative flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-white font-bold shadow-md shadow-primary/20 scale-105'
                        : cell.isCurrentMonth
                          ? 'text-slate-850 dark:text-slate-205 hover:bg-slate-100 dark:hover:bg-white/5'
                          : 'text-slate-350 dark:text-slate-650 hover:bg-slate-50/50 dark:hover:bg-white/3'
                    }`}
                  >
                    <span>{cell.dayNum}</span>
                    
                    {/* Dot indicators */}
                    <div className="flex gap-0.5 mt-0.5 absolute bottom-1">
                      {hasTasks && (
                        <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-danger'}`} />
                      )}
                      {hasBlocks && (
                        <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-primary'}`} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-4 justify-center text-[10px] text-slate-500 font-mono mt-4 pt-3 border-t border-slate-100 dark:border-slate-850">
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-danger" /> Deadlines</span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> Focus Agenda</span>
            </div>

          </div>

          {/* AI Workload Summary for this day */}
          <div className="glass-card p-6 rounded-3xl border border-slate-200/50 dark:border-white/5 space-y-4">
            <h3 className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Brain className="w-4 h-4" /> Schedule Health Diagnosis
            </h3>
            
            {selectedDateBlocks.length === 0 ? (
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                You have no scheduled blocks for today. Run the **AI Auto-Schedule** button to automatically map out active tasks, or click **Create Event** to enter custom entries.
              </p>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-center text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/3 border border-slate-100 dark:border-slate-850">
                    <span className="block text-[9px] uppercase text-slate-500 font-bold mb-0.5">Focus Blocks</span>
                    <span className="text-md font-black text-primary">
                      {selectedDateBlocks.filter(b => !b.isBreak).length}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/3 border border-slate-100 dark:border-slate-850">
                    <span className="block text-[9px] uppercase text-slate-500 font-bold mb-0.5">Recharge Breaks</span>
                    <span className="text-md font-black text-warning">
                      {selectedDateBlocks.filter(b => b.isBreak).length}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 text-xs text-slate-700 dark:text-indigo-300 leading-relaxed">
                  Your day is structured with optimal 1.5-hour focus intervals followed by 30-minute breaks to avoid cognitive decay and procrastination.
                </div>
              </div>
            )}

            <button
              onClick={() => setIsBlockModalOpen(true)}
              className="w-full py-2.5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary hover:text-white text-primary font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Event Block</span>
            </button>
          </div>
        </div>

        {/* Right Side: Timeline Agenda */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card p-6 rounded-3xl border border-slate-200/50 dark:border-white/5 min-h-[500px]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-4 mb-6">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-primary" />
                Day Agenda: <span className="font-mono text-xs font-normal text-slate-500">{selectedDate}</span>
              </h3>
              
              {selectedDateBlocks.length > 0 && (
                <button
                  onClick={() => updateScheduleBlocks(scheduleBlocks.filter(b => b.date !== selectedDate))}
                  className="text-xs text-danger hover:underline transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            {/* Vertical timeline blocks */}
            {selectedDateBlocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Clock className="w-12 h-12 text-slate-400 mb-4" />
                <p className="text-slate-650 dark:text-slate-400 text-sm font-medium">Timeline is currently clear.</p>
                <p className="text-slate-500 dark:text-slate-450 text-xs mt-1">Let the AI engine draft your schedule or manually customize it.</p>
              </div>
            ) : (
              <div className="space-y-4 relative pl-4 border-l border-slate-200 dark:border-slate-800">
                {selectedDateBlocks.map((block) => (
                  <motion.div
                    key={block.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 rounded-2xl border flex items-center justify-between gap-4 group transition-all relative ${getCategoryColor(block.category, block.isBreak)}`}
                  >
                    {/* Glow circle indicator */}
                    <div className={`absolute -left-[21.5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 bg-white dark:bg-[#070714] ${
                      block.isBreak ? 'border-warning' : 'border-primary'
                    }`} />

                    <div className="flex items-center gap-4">
                      {block.isBreak ? (
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-warning shrink-0">
                          <Coffee className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <Clock className="w-4 h-4" />
                        </div>
                      )}

                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">{block.title}</h4>
                        <div className="text-[10px] text-slate-550 dark:text-slate-400 mt-1 flex items-center gap-2">
                          <span className="font-mono">{block.startTime} - {block.endTime}</span>
                          {!block.isBreak && (
                            <span className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-1.5 py-0.2 rounded uppercase text-[8px] font-bold text-slate-650 dark:text-slate-350">
                              {block.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteBlock(block.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-red-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-danger transition-all cursor-pointer"
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
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card max-w-sm w-full p-6 rounded-3xl border border-primary/20 bg-white dark:bg-slate-950"
            >
              <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-900 pb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Create Custom Block</h3>
                <button 
                  onClick={() => setIsBlockModalOpen(false)}
                  className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateBlock} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Block Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Read Project Guidelines"
                    value={blockTitle}
                    onChange={(e) => setBlockTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Start Time</label>
                    <input
                      type="time"
                      required
                      value={blockStart}
                      onChange={(e) => setBlockStart(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">End Time</label>
                    <input
                      type="time"
                      required
                      value={blockEnd}
                      onChange={(e) => setBlockEnd(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <input
                    type="checkbox"
                    id="isBreakCheck"
                    checked={isBreak}
                    onChange={(e) => setIsBreak(e.target.checked)}
                    className="w-4 h-4 accent-warning rounded cursor-pointer"
                  />
                  <label htmlFor="isBreakCheck" className="text-slate-650 dark:text-slate-350 select-none cursor-pointer font-medium">
                    Is this a recharge break?
                  </label>
                </div>

                {!isBreak && (
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Category</label>
                    <select
                      value={blockCategory}
                      onChange={(e) => setBlockCategory(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-350 focus:outline-none cursor-pointer"
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
                  className="w-full py-2.5 rounded-xl bg-primary text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/10 transition-all cursor-pointer hover:opacity-90"
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
