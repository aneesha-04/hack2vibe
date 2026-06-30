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
  CheckSquare as CheckSquareIcon,
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
      case 'Critical': return 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 border-red-100 dark:border-red-900/20';
      case 'High': return 'bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400 border-purple-100 dark:border-purple-900/20';
      case 'Medium': return 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/20';
      case 'Low': return 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400 border-slate-200 dark:border-slate-800';
      default: return 'bg-slate-50 text-slate-500 border-transparent';
    }
  };

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'Critical Risk': return 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 border-red-100 dark:border-red-900/20';
      case 'High Risk': return 'bg-orange-50 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400 border-orange-100 dark:border-orange-900/20';
      case 'Moderate Risk': return 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 border-amber-100 dark:border-amber-900/20';
      case 'Safe': return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-450 border-emerald-100 dark:border-emerald-900/20';
      default: return 'bg-slate-50 text-slate-400 border-transparent';
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
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 }, colors: ['#6366F1', '#8B5CF6', '#06B6D4'] });
  };

  const handleToggleComplete = (task: Task) => {
    const updated = { ...task, completed: !task.completed };
    updateTask(updated);
    if (updated.completed) {
      confetti({ particleCount: 30, spread: 40, origin: { y: 0.8 }, colors: ['#10B981', '#6366F1'] });
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-slate-800/60 pb-6">
        <div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-650 dark:from-white dark:via-indigo-100 dark:to-purple-200 bg-clip-text text-transparent">
            Task Center
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs">
            Create commitment objectives, analyze risk parameters, and trigger emergency schedules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-100 dark:bg-slate-950/40 p-1 rounded-xl border border-slate-200/40 dark:border-white/5 flex">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'list' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'kanban' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
            >
              <KanbanSquare className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-primary hover:opacity-90 text-white text-xs font-semibold uppercase tracking-wider shadow-lg shadow-primary/10 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-200/50 dark:border-white/5 flex flex-wrap gap-4 items-center">
        {/* Search */}
        <div className="flex-1 min-w-[240px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search objectives..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs glass-input focus:outline-none"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-primary" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
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
          className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
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
          className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
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
        <div className="space-y-3.5">
          {filteredTasks.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-3xl border border-slate-200/50 dark:border-white/5 bg-white/40 dark:bg-slate-950/20">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center text-primary mx-auto mb-4 shadow-sm">
                <CheckSquareIcon className="w-8 h-8" />
              </div>
              <h4 className="text-md font-bold text-slate-900 dark:text-white">🎉 You're all caught up!</h4>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5 max-w-xs mx-auto">Let's create your first task block to analyze risk parameters and manage buffer schedules.</p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-5 px-4 py-2 rounded-xl bg-primary text-white font-semibold text-xs hover:opacity-90 shadow-md shadow-primary/10 transition-all inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Task</span>
              </button>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const diffLevel = task.estimatedHours > 4 ? 'Hard' : task.estimatedHours > 2 ? 'Medium' : 'Easy';
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`glass-card p-4.5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:border-primary/20 ${
                    task.completed ? 'border-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/5 opacity-70' : 'border-slate-200/60 dark:border-white/5'
                  }`}
                  onClick={() => setSelectedTask(task)}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Complete Checkbox */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleComplete(task);
                      }}
                      className={`w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                        task.completed 
                          ? 'border-emerald-500 bg-emerald-500 text-white' 
                          : 'border-slate-450 hover:border-primary'
                      }`}
                    >
                      {task.completed && <CheckCircle className="w-3.5 h-3.5" />}
                    </button>

                    <div className="overflow-hidden min-w-0">
                      <h3 className={`font-bold text-[14px] text-slate-900 dark:text-white truncate ${task.completed ? 'line-through text-slate-400' : ''}`}>
                        {task.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] text-slate-500 font-mono">
                        <span className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-600 dark:text-slate-350">
                          {task.category}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {task.estimatedHours}h effort
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                          Due: {new Date(task.deadline).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span className={`px-1.5 py-0.2 rounded font-bold uppercase text-[9px] ${
                          diffLevel === 'Hard' ? 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400' :
                          diffLevel === 'Medium' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400' :
                          'bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400'
                        }`}>
                          {diffLevel}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* AI Scores Badges */}
                  <div className="flex items-center gap-3 flex-wrap shrink-0">
                    <div className={`px-2.5 py-1 rounded-xl border text-[11px] font-bold ${getPriorityColor(task.priorityLevel)}`}>
                      {task.priorityLevel} Priority
                    </div>
                    <div className={`px-2.5 py-1 rounded-xl border text-[11px] font-bold ${getRiskColor(task.riskLevel)}`}>
                      {task.riskProbability}% Risk
                    </div>
                    {task.subtasks.length > 0 && (
                      <span className="text-[11px] text-slate-500 font-medium">
                        Subtasks: {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-400 hidden md:block" />
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* KANBAN VIEW */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kanbanColumns.map((col) => {
            const colTasks = getKanbanColumnTasks(col);
            
            return (
              <div key={col} className="bg-slate-100/50 dark:bg-slate-950/15 border border-slate-200/50 dark:border-white/5 p-4 rounded-2xl flex flex-col min-h-[500px]">
                <div className="flex items-center justify-between mb-4 border-b border-slate-200/50 dark:border-slate-800 pb-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      col === 'Todo' ? 'bg-primary' :
                      col === 'In Progress' ? 'bg-warning' :
                      col === 'Review' ? 'bg-secondary' :
                      'bg-success'
                    }`} />
                    {col}
                  </h3>
                  <span className="text-[10px] font-bold text-slate-650 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-full">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colTasks.length === 0 ? (
                    <div className="h-28 border border-dashed border-slate-200 dark:border-white/5 rounded-xl flex items-center justify-center p-6 text-center text-[10px] text-slate-400">
                      Empty Column
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        layoutId={`kanban-${task.id}`}
                        onClick={() => setSelectedTask(task)}
                        className={`p-4 rounded-xl border glass-card cursor-pointer flex flex-col gap-3 ${
                          task.completed ? 'border-emerald-500/25 bg-emerald-50/10' : 'border-slate-200/60 dark:border-white/5 hover:border-primary/20'
                        }`}
                      >
                        <h4 className={`font-bold text-[13px] text-slate-950 dark:text-white line-clamp-2 ${task.completed ? 'line-through text-slate-400' : ''}`}>
                          {task.title}
                        </h4>

                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded">
                            {task.category}
                          </span>
                          <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" /> {task.estimatedHours}h
                          </span>
                        </div>

                        {/* Kanban Bottom Action */}
                        <div className="flex gap-2 items-center justify-between border-t border-slate-100 dark:border-slate-850 pt-2.5 mt-1">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getPriorityColor(task.priorityLevel)}`}>
                            {task.priorityLevel}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getRiskColor(task.riskLevel)}`}>
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
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50 overflow-y-auto backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card max-w-lg w-full p-6 md:p-8 rounded-3xl border border-primary/20 bg-white dark:bg-slate-950"
            >
              <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-900 pb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create Productivity Objective</h3>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Task Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Build Portfolio Landing Page"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Provide details about what needs to be achieved..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-slate-900 dark:text-white focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-350 focus:outline-none cursor-pointer"
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
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Est. Effort (Hours)</label>
                    <input
                      type="number"
                      required
                      min="0.5"
                      step="0.5"
                      value={estimatedHours}
                      onChange={(e) => setEstimatedHours(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Deadline Time & Date</label>
                  <input
                    type="datetime-local"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <input
                    type="checkbox"
                    id="recurring"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="w-4 h-4 accent-primary rounded cursor-pointer"
                  />
                  <label htmlFor="recurring" className="text-slate-650 dark:text-slate-350 select-none cursor-pointer font-medium">
                    Is this a recurring habit / task?
                  </label>
                </div>

                {isRecurring && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Recurrence Frequency</label>
                    <select
                      value={recurrencePattern}
                      onChange={(e) => setRecurrencePattern(e.target.value as any)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-350 focus:outline-none cursor-pointer"
                    >
                      <option value="daily">Every Single Day</option>
                      <option value="weekly">Weekly Frequency</option>
                      <option value="monthly">Monthly Frequency</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Extra Notes</label>
                  <input
                    type="text"
                    placeholder="URL links, checklists notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-primary text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/10 transition-all cursor-pointer hover:opacity-90"
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
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="relative w-full max-w-md h-full bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-850 glass-panel p-6 flex flex-col z-10 shadow-2xl"
            >
              {/* Drawer Close */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-4 mb-6">
                <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-bold tracking-widest uppercase">Objective Details</span>
                <button 
                  onClick={() => setSelectedTask(null)}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Main Contents */}
              <div className="flex-1 overflow-y-auto space-y-6 pb-20 text-xs">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedTask.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 mt-2 leading-relaxed bg-slate-50 dark:bg-[rgba(255,255,255,0.02)] p-3 border border-slate-100 dark:border-[rgba(255,255,255,0.03)] rounded-xl">
                    {selectedTask.description || 'No description provided.'}
                  </p>
                </div>

                {/* AI Scores Explanation */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                    AI Engine Diagnosis
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 dark:bg-white/3 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">Priority Index</span>
                      <span className={`text-sm font-black ${selectedTask.priorityLevel === 'Critical' ? 'text-danger' : 'text-primary'}`}>
                        {selectedTask.priorityLevel}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-white/3 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">Risk Factor</span>
                      <span className="text-sm font-black text-warning">
                        {selectedTask.riskProbability}%
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 leading-relaxed text-slate-700 dark:text-indigo-300">
                    {selectedTask.priorityExplanation}
                  </div>
                </div>

                {/* Subtasks Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Subtask Checklist</h4>
                    <button
                      onClick={() => triggerAISubtasks(selectedTask.id)}
                      disabled={isSubtaskGenerating}
                      className="px-2.5 py-1 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary hover:text-white transition-all text-[10px] text-primary font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
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
                    <div className="p-6 text-center border border-dashed border-slate-200 dark:border-white/5 rounded-xl text-[11px] text-slate-550">
                      No checklist steps generated yet. Click AI Breakdown to formulate a structured schedule checklist.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedTask.subtasks.map((st) => (
                        <div 
                          key={st.id}
                          className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-white/3 border border-slate-100 dark:border-slate-900/40 hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={st.completed}
                            onChange={() => toggleSubTask(selectedTask.id, st.id)}
                            className="w-4 h-4 accent-success rounded cursor-pointer"
                          />
                          <span className={`text-[12px] ${st.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
                            {st.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Target Rescue Mode */}
                {(selectedTask.riskLevel === 'Critical Risk' || selectedTask.riskLevel === 'High Risk') && (
                  <div className="p-4 bg-red-50 dark:bg-rose-950/20 border border-red-100 dark:border-rose-900/30 rounded-2xl space-y-3">
                    <div className="flex gap-2 text-danger">
                      <AlertOctagon className="w-5 h-5 shrink-0" />
                      <div>
                        <h5 className="text-xs font-bold">Threat Parameter Triggered</h5>
                        <p className="text-[10px] text-danger/80 mt-0.5 leading-relaxed">
                          This objective is at critical risk of breaching its deadline. Set buffer focus schedules.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRescueMode(selectedTask)}
                      className="w-full py-2.5 rounded-xl bg-danger text-white font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 hover:opacity-90 transition-all cursor-pointer shadow-md shadow-danger/15"
                    >
                      <Flame className="w-3.5 h-3.5 fill-white" />
                      <span>Trigger Autopilot Rescue Plan</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Drawer Bottom Actions */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-850 flex gap-3">
                <button
                  onClick={() => handleToggleComplete(selectedTask)}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    selectedTask.completed
                      ? 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900'
                      : 'bg-primary border-transparent text-white hover:opacity-90 shadow-md shadow-primary/10'
                  }`}
                >
                  {selectedTask.completed ? 'Mark Incomplete' : 'Complete Task'}
                </button>

                <button
                  onClick={() => {
                    deleteTask(selectedTask.id);
                    setSelectedTask(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-red-150 dark:border-rose-900/30 text-danger hover:bg-red-50 dark:hover:bg-rose-950/20 transition-all flex items-center justify-center cursor-pointer"
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
