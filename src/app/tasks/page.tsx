'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { Task, PriorityLevel, RiskLevel } from '../../types';
import { 
  Plus, 
  Search, 
  Filter, 
  KanbanSquare, 
  List, 
  Clock, 
  Calendar as CalendarIcon, 
  Flame, 
  AlertOctagon, 
  ChevronRight, 
  Sparkles, 
  Trash2, 
  CheckCircle, 
  X, 
  RefreshCw, 
  Play, 
  ArrowRightLeft,
  CircleDot
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function TasksPage() {
  const router = useRouter();
  const { 
    tasks, 
    addTask, 
    updateTask, 
    deleteTask, 
    toggleSubTask, 
    generateSubtasks, 
    triggerRescueMode,
    isLoggedIn 
  } = useApp();

  // Auth Guard
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, router]);

  // Views state
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSubtaskGenerating, setIsSubtaskGenerating] = useState(false);

  // Form states for new task
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('2');
  const [category, setCategory] = useState('Study');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<'daily' | 'weekly' | 'monthly' | 'none'>('none');
  const [notes, setNotes] = useState('');

  // Extract unique categories
  const categories = ['all', ...Array.from(new Set(tasks.map(t => t.category)))];

  // Filtering tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || task.priorityLevel === priorityFilter;
    const matchesRisk = riskFilter === 'all' || task.riskLevel === riskFilter;

    return matchesSearch && matchesCategory && matchesPriority && matchesRisk;
  });

  const getPriorityColor = (level: PriorityLevel) => {
    switch (level) {
      case 'Critical': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'High': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Medium': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'Low': return 'bg-slate-500/10 text-slate-400 border-slate-500/10';
      default: return 'bg-slate-500/10 text-slate-400 border-transparent';
    }
  };

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'Critical Risk': return 'bg-red-950/20 text-red-500 border-red-900/30';
      case 'High Risk': return 'bg-orange-950/20 text-orange-400 border-orange-900/30';
      case 'Moderate Risk': return 'bg-amber-950/20 text-amber-500 border-amber-900/30';
      case 'Safe': return 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30';
      default: return 'bg-slate-500/10 text-slate-400 border-transparent';
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !deadline) return;

    await addTask({
      title,
      description,
      deadline: new Date(deadline).toISOString(),
      estimatedHours: parseFloat(estimatedHours) || 1,
      category,
      isRecurring,
      recurrencePattern: isRecurring ? recurrencePattern : 'none',
      notes
    });

    // Reset Form
    setTitle('');
    setDescription('');
    setDeadline('');
    setEstimatedHours('2');
    setCategory('Study');
    setIsRecurring(false);
    setRecurrencePattern('none');
    setNotes('');
    setIsAddModalOpen(false);

    // Trigger success audio / feedback
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 }, colors: ['#6366f1', '#a855f7', '#06b6d4'] });
  };

  const handleToggleComplete = (task: Task) => {
    const updated = { ...task, completed: !task.completed };
    updateTask(updated);
    if (updated.completed) {
      confetti({ particleCount: 30, spread: 40, origin: { y: 0.8 }, colors: ['#10b981', '#6366f1'] });
    }
  };

  const triggerAISubtasks = async (taskId: string) => {
    setIsSubtaskGenerating(true);
    await generateSubtasks(taskId);
    setIsSubtaskGenerating(false);

    // Refresh selected task reference to show subtasks in drawer
    const updatedTask = tasks.find(t => t.id === taskId);
    if (updatedTask) setSelectedTask(updatedTask);
  };

  const handleRescueMode = (task: Task) => {
    triggerRescueMode(task.id);
    setSelectedTask(null);
    alert(`Deadline Rescue Mode triggered for "${task.title}". Active rescue schedule has been mapped directly to your Calendar!`);
    router.push('/calendar');
  };

  const handleStatusChange = (task: Task, column: string) => {
    let completed = task.completed;
    if (column === 'Completed') completed = true;
    else if (task.completed) completed = false;

    // Simulate different estimated hour values or statuses
    updateTask({
      ...task,
      completed
    });
  };

  // Kanban Columns
  const getKanbanColumnTasks = (colName: string) => {
    return filteredTasks.filter(t => {
      if (colName === 'Completed') return t.completed;
      if (colName === 'Todo' && !t.completed && t.priorityLevel === 'Low') return true;
      if (colName === 'In Progress' && !t.completed && (t.priorityLevel === 'Medium' || t.priorityLevel === 'High')) return true;
      if (colName === 'Review' && !t.completed && t.priorityLevel === 'Critical') return true;
      return false;
    });
  };

  const kanbanColumns = ['Todo', 'In Progress', 'Review', 'Completed'];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-[rgba(255,255,255,0.06)] pb-6">
        <div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-650 dark:from-white dark:via-indigo-100 dark:to-purple-200 bg-clip-text text-transparent">
            Task Center
          </h2>
          <p className="text-slate-400 text-xs">
            Create commitment objectives, analyze risk parameters, and trigger emergency schedules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950/40 p-1.5 rounded-xl border border-[rgba(255,255,255,0.05)] flex">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              <KanbanSquare className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 rounded-2xl border border-[rgba(255,255,255,0.06)] flex flex-wrap gap-4 items-center">
        {/* Search */}
        <div className="flex-1 min-w-[240px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search objectives..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs glass-input text-white focus:outline-none"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-indigo-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-900 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="bg-slate-900 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
        >
          <option value="all">All Priorities</option>
          <option value="Critical">Critical Only</option>
          <option value="High">High Only</option>
          <option value="Medium">Medium Only</option>
          <option value="Low">Low Only</option>
        </select>

        {/* Risk Filter */}
        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          className="bg-slate-900 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
        >
          <option value="all">All Risks</option>
          <option value="Critical Risk">Critical Risk</option>
          <option value="High Risk">High Risk</option>
          <option value="Moderate Risk">Moderate Risk</option>
          <option value="Safe">Safe Only</option>
        </select>
      </div>

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl border border-[rgba(255,255,255,0.05)]">
              <CircleDot className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-sm font-medium">No objectives found matching criteria.</p>
              <p className="text-slate-600 text-xs mt-1">Create a new task to configure its AI parameters.</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`glass-card p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:border-indigo-500/25 ${
                  task.completed ? 'border-emerald-500/20 bg-emerald-950/5 opacity-70' : 'border-[rgba(139,92,246,0.15)]'
                }`}
                onClick={() => setSelectedTask(task)}
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Complete Checkbox */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleComplete(task);
                    }}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      task.completed 
                        ? 'border-emerald-500 bg-emerald-500 text-white' 
                        : 'border-slate-600 hover:border-indigo-400'
                    }`}
                  >
                    {task.completed && <CheckCircle className="w-4 h-4" />}
                  </button>

                  <div className="overflow-hidden">
                    <h3 className={`font-bold text-sm text-white truncate ${task.completed ? 'line-through text-slate-500' : ''}`}>
                      {task.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                      <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-300">
                        {task.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {task.estimatedHours}h effort
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-3.5 h-3.5 text-slate-500" />
                        Due: {new Date(task.deadline).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI Scores Badges */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold ${getPriorityColor(task.priorityLevel)}`}>
                    Priority: {task.priorityLevel}
                  </div>
                  <div className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold ${getRiskColor(task.riskLevel)}`}>
                    {task.riskProbability}% Missing Risk
                  </div>
                  {task.subtasks.length > 0 && (
                    <span className="text-[11px] text-slate-400 font-medium">
                      Subtasks: {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
                    </span>
                  )}
                  <ChevronRight className="w-5 h-5 text-slate-600 hidden md:block" />
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* KANBAN VIEW */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kanbanColumns.map((col) => {
            const colTasks = getKanbanColumnTasks(col);
            
            return (
              <div key={col} className="bg-[#050512]/60 border border-[rgba(255,255,255,0.03)] p-4 rounded-2xl flex flex-col min-h-[500px]">
                <div className="flex items-center justify-between mb-4 border-b border-[rgba(255,255,255,0.05)] pb-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      col === 'Todo' ? 'bg-indigo-500' :
                      col === 'In Progress' ? 'bg-amber-500' :
                      col === 'Review' ? 'bg-purple-500' :
                      'bg-emerald-500'
                    }`} />
                    {col}
                  </h3>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colTasks.length === 0 ? (
                    <div className="h-full border border-dashed border-[rgba(255,255,255,0.02)] rounded-xl flex items-center justify-center p-6 text-center text-[10px] text-slate-600">
                      Empty column
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        layoutId={`kanban-${task.id}`}
                        onClick={() => setSelectedTask(task)}
                        className={`p-4 rounded-xl border glass-card cursor-pointer flex flex-col gap-3 ${
                          task.completed ? 'border-emerald-500/20' : 'border-[rgba(139,92,246,0.15)]'
                        }`}
                      >
                        <h4 className={`font-bold text-xs text-white line-clamp-2 ${task.completed ? 'line-through text-slate-500' : ''}`}>
                          {task.title}
                        </h4>

                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                            {task.category}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                            <Clock className="w-3 h-3" /> {task.estimatedHours}h
                          </span>
                        </div>

                        {/* Kanban Bottom Action: Click status switch */}
                        <div className="flex gap-2 items-center justify-between border-t border-[rgba(255,255,255,0.05)] pt-2.5 mt-1">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${getPriorityColor(task.priorityLevel)}`}>
                            {task.priorityLevel}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${getRiskColor(task.riskLevel)}`}>
                            {task.riskProbability}%
                          </span>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE TASK MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card max-w-lg w-full p-6 md:p-8 rounded-2xl border border-[rgba(139,92,246,0.2)]"
            >
              <div className="flex items-center justify-between mb-6 border-b border-[rgba(255,255,255,0.06)] pb-4">
                <h3 className="text-lg font-bold text-white">Create Productivity Objective</h3>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded hover:bg-[rgba(255,255,255,0.05)] text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Task Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Build Portfolio Landing Page"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Provide details about what needs to be achieved..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input text-white focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-900 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none cursor-pointer"
                    >
                      <option value="Study">Study / Academics</option>
                      <option value="Coding">Coding / Development</option>
                      <option value="Finance">Bill / Finance</option>
                      <option value="Exercise">Exercise / Sport</option>
                      <option value="Work">Professional Work</option>
                      <option value="General">General Task</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Est. Effort (Hours)</label>
                    <input
                      type="number"
                      required
                      min="0.5"
                      step="0.5"
                      value={estimatedHours}
                      onChange={(e) => setEstimatedHours(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs glass-input text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Deadline Time & Date</label>
                  <input
                    type="datetime-local"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input text-white focus:outline-none cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-3 bg-[rgba(255,255,255,0.02)] p-3 rounded-xl border border-[rgba(255,255,255,0.04)]">
                  <input
                    type="checkbox"
                    id="recurring"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                  <label htmlFor="recurring" className="text-xs text-slate-300 select-none cursor-pointer">
                    Is this a recurring habit / task?
                  </label>
                </div>

                {isRecurring && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Recurrence Frequency</label>
                    <select
                      value={recurrencePattern}
                      onChange={(e) => setRecurrencePattern(e.target.value as any)}
                      className="w-full bg-slate-900 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none cursor-pointer"
                    >
                      <option value="daily">Every Single Day</option>
                      <option value="weekly">Weekly Frequency</option>
                      <option value="monthly">Monthly Frequency</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Extra Notes</label>
                  <input
                    type="text"
                    placeholder="URL links, checklists notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input text-white focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/10 transition-all cursor-pointer"
                >
                  Schedule Objective
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TASK DETAIL SLIDER DRAWER */}
      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div 
              onClick={() => setSelectedTask(null)}
              className="absolute inset-0 bg-black/50" 
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="relative w-full max-w-md h-full bg-[#050512] border-l border-[rgba(139,92,246,0.15)] glass-panel p-6 flex flex-col z-10"
            >
              {/* Drawer Close */}
              <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] pb-4 mb-6">
                <span className="text-[10px] font-mono text-cyan-400 font-bold tracking-widest uppercase">Objective Details</span>
                <button 
                  onClick={() => setSelectedTask(null)}
                  className="p-1 rounded hover:bg-[rgba(255,255,255,0.05)] text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Main Contents */}
              <div className="flex-1 overflow-y-auto space-y-6 pb-20">
                <div>
                  <h3 className="text-xl font-black text-white">{selectedTask.title}</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed bg-[rgba(255,255,255,0.02)] p-3 border border-[rgba(255,255,255,0.03)] rounded-lg">
                    {selectedTask.description || 'No description provided.'}
                  </p>
                </div>

                {/* AI Scores Explanation */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    AI Engine Diagnosis
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-[rgba(255,255,255,0.02)] rounded-lg border border-[rgba(255,255,255,0.04)]">
                      <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">Priority Index</span>
                      <span className={`text-sm font-black ${selectedTask.priorityLevel === 'Critical' ? 'text-rose-500' : 'text-indigo-400'}`}>
                        {selectedTask.priorityLevel}
                      </span>
                    </div>

                    <div className="p-3 bg-[rgba(255,255,255,0.02)] rounded-lg border border-[rgba(255,255,255,0.04)]">
                      <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">Risk Factor</span>
                      <span className="text-sm font-black text-amber-500">
                        {selectedTask.riskProbability}%
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-indigo-950/20 border border-indigo-900/30 text-xs leading-relaxed text-indigo-300">
                    {selectedTask.priorityExplanation}
                  </div>
                </div>

                {/* Subtasks Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Subtask Steps</h4>
                    <button
                      onClick={() => triggerAISubtasks(selectedTask.id)}
                      disabled={isSubtaskGenerating}
                      className="px-2.5 py-1 rounded bg-indigo-600/10 border border-indigo-500/20 hover:bg-indigo-600 hover:text-white transition-all text-[10px] text-indigo-400 font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isSubtaskGenerating ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3" />
                          <span>AI Breakdown</span>
                        </>
                      )}
                    </button>
                  </div>

                  {selectedTask.subtasks.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-[rgba(255,255,255,0.05)] rounded-lg text-xs text-slate-500">
                      No subtasks generated yet. Click AI Breakdown to generate a structured step-by-step checklist.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedTask.subtasks.map((st) => (
                        <div 
                          key={st.id}
                          className="flex items-center gap-2.5 p-2 rounded-lg bg-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={st.completed}
                            onChange={() => toggleSubTask(selectedTask.id, st.id)}
                            className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                          />
                          <span className={`text-xs ${st.completed ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                            {st.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Target Rescue Mode */}
                {(selectedTask.riskLevel === 'Critical Risk' || selectedTask.riskLevel === 'High Risk') && (
                  <div className="p-4 bg-rose-950/20 border border-rose-900/30 rounded-xl space-y-3">
                    <div className="flex gap-2 text-rose-500">
                      <AlertOctagon className="w-5 h-5 shrink-0" />
                      <div>
                        <h5 className="text-xs font-bold">Threat: Procrastination Risk</h5>
                        <p className="text-[10px] text-rose-400 mt-0.5 leading-relaxed">
                          This objective is at critical risk of breaching its deadline. You do not have enough scheduled buffer slots.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRescueMode(selectedTask)}
                      className="w-full py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Flame className="w-3.5 h-3.5" />
                      <span>Trigger Deadline Rescue Plan</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Drawer Bottom Actions */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-[#050512] border-t border-[rgba(255,255,255,0.06)] flex gap-3">
                <button
                  onClick={() => handleToggleComplete(selectedTask)}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    selectedTask.completed
                      ? 'border-emerald-500/20 text-emerald-400 hover:bg-emerald-950/20'
                      : 'bg-emerald-600 border-transparent text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/10'
                  }`}
                >
                  {selectedTask.completed ? 'Mark Incomplete' : 'Complete Task'}
                </button>

                <button
                  onClick={() => {
                    deleteTask(selectedTask.id);
                    setSelectedTask(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-rose-900/30 text-rose-400 hover:text-white hover:bg-rose-950/30 transition-all flex items-center justify-center cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
