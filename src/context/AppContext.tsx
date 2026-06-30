'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, ScheduleBlock, Habit, MoodLog, DailyReport, AppSettings, UserProfile, SubTask } from '../types';
import { calculateTaskPriority, predictDeadlineRisk, generateDailySchedule, getSubtaskBreakdown, getDailyReport, generateDeadlineRescuePlan, getAIChatResponse } from '../utils/aiEngine';

interface AppContextProps {
  tasks: Task[];
  scheduleBlocks: ScheduleBlock[];
  habits: Habit[];
  moodLogs: MoodLog[];
  reports: DailyReport[];
  settings: AppSettings;
  profile: UserProfile;
  activeFocusTaskId: string | null;
  isLoggedIn: boolean;
  currentUser: UserProfile | null;
  
  // Tasks Actions
  addTask: (taskData: Omit<Task, 'id' | 'priorityLevel' | 'priorityScore' | 'priorityExplanation' | 'riskLevel' | 'riskProbability' | 'riskExplanation' | 'subtasks' | 'completed' | 'createdAt'>) => Promise<Task>;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  toggleSubTask: (taskId: string, subTaskId: string) => void;
  generateSubtasks: (taskId: string) => Promise<void>;
  
  // Scheduling Actions
  rescheduleDay: (dateStr: string) => void;
  updateScheduleBlocks: (blocks: ScheduleBlock[]) => void;
  triggerRescueMode: (taskId: string) => { time: string; action: string; duration: number }[];
  
  // Habits & Mood Actions
  logHabit: (habitId: string, dateStr: string, increment: number) => void;
  addMoodLog: (mood: '😊' | '😐' | '😔' | '😫') => void;
  
  // Reports Actions
  generateBriefing: (dateStr: string, mood?: string) => Promise<void>;
  generateEveningSummary: (dateStr: string) => Promise<void>;
  
  // Settings & Profile
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  updateProfile: (newProfile: Partial<UserProfile>) => void;
  setActiveFocusTaskId: (taskId: string | null) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  
  // Auth Actions
  login: (email: string) => boolean;
  register: (name: string, email: string) => void;
  logout: () => void;
}

const defaultSettings: AppSettings = {
  geminiApiKey: '',
  openaiApiKey: '',
  aiProvider: 'mock',
  googleCalendarSync: false,
  sleepStart: '22:00',
  sleepEnd: '06:00',
  workStartTime: '09:00',
  workEndTime: '18:00',
  preferredFocusHours: ['morning', 'evening']
};

const defaultProfile: UserProfile = {
  name: 'Alex Johnson',
  email: 'alex@example.com',
  joinedDate: '2026-06-30',
  focusStreak: 3
};

const initialHabits: Habit[] = [
  { id: 'h-1', name: 'Study Hours', category: 'study', target: 4, unit: 'hours', logs: {} },
  { id: 'h-2', name: 'Workout Session', category: 'exercise', target: 1, unit: 'session', logs: {} },
  { id: 'h-3', name: 'Coding Progress', category: 'coding', target: 2, unit: 'hours', logs: {} },
  { id: 'h-4', name: 'Water Intake', category: 'water', target: 8, unit: 'glasses', logs: {} },
  { id: 'h-5', name: 'Read Book', category: 'reading', target: 15, unit: 'pages', logs: {} },
  { id: 'h-6', name: 'Sleep', category: 'sleep', target: 8, unit: 'hours', logs: {} }
];

const getExampleTasks = (): Task[] => {
  const today = new Date();
  
  const dsaDeadline = new Date(today);
  dsaDeadline.setHours(today.getHours() + 18);

  const physicsDeadline = new Date(today);
  physicsDeadline.setDate(today.getDate() + 1);
  physicsDeadline.setHours(17, 0, 0, 0);

  const taxDeadline = new Date(today);
  taxDeadline.setDate(today.getDate() + 3);

  return [
    {
      id: 'task-example-1',
      title: 'Finish DSA Presentation Slides',
      description: 'Prepare 10 slides covering advanced graph algorithms for final evaluation.',
      deadline: dsaDeadline.toISOString(),
      estimatedHours: 4,
      category: 'Study',
      isRecurring: false,
      completed: false,
      createdAt: today.toISOString(),
      priorityLevel: 'Critical',
      priorityScore: 92,
      priorityExplanation: 'High estimated effort relative to deadline. Graph algorithms requires deep cognitive load.',
      riskLevel: 'Critical Risk',
      riskProbability: 78,
      riskExplanation: 'You only have 1 hour of study slots allocated but the task requires 4 hours of focus work.',
      subtasks: [
        { id: 'sub-1-1', title: 'Outline graph structures', completed: true },
        { id: 'sub-1-2', title: 'Add visualization graphics', completed: false },
        { id: 'sub-1-3', title: 'Draft speech notes', completed: false }
      ]
    },
    {
      id: 'task-example-2',
      title: 'Physics Lab Report 4',
      description: 'Write up experimental results on electromagnetic induction buffers.',
      deadline: physicsDeadline.toISOString(),
      estimatedHours: 2.5,
      category: 'Study',
      isRecurring: false,
      completed: false,
      createdAt: today.toISOString(),
      priorityLevel: 'High',
      priorityScore: 78,
      priorityExplanation: 'Physics report requires statistical calculations and data graphs.',
      riskLevel: 'Moderate Risk',
      riskProbability: 35,
      riskExplanation: 'Sufficient focus windows are available, but deadline is within 36 hours.',
      subtasks: []
    },
    {
      id: 'task-example-3',
      title: 'File Personal Tax Returns',
      description: 'Submit calculated reports and receipts to accounting portal.',
      deadline: taxDeadline.toISOString(),
      estimatedHours: 1.5,
      category: 'Finance',
      isRecurring: false,
      completed: false,
      createdAt: today.toISOString(),
      priorityLevel: 'Medium',
      priorityScore: 55,
      priorityExplanation: 'Financial compliance deadline approaching in 3 days.',
      riskLevel: 'Safe',
      riskProbability: 12,
      riskExplanation: 'Ample time buffer and low complexity.',
      subtasks: []
    }
  ];
};

const getExampleScheduleBlocks = (): ScheduleBlock[] => {
  const todayStr = new Date().toISOString().split('T')[0];
  return [
    {
      id: 'block-ex-1',
      title: '📚 Focus: Finish DSA Presentation Slides',
      startTime: '09:00',
      endTime: '10:30',
      date: todayStr,
      category: 'Study',
      isBreak: false
    },
    {
      id: 'block-ex-2',
      title: '☕ Rest Buffer',
      startTime: '10:30',
      endTime: '11:00',
      date: todayStr,
      category: 'break',
      isBreak: true
    },
    {
      id: 'block-ex-3',
      title: '💻 Coding: Hackathon UI styling',
      startTime: '11:00',
      endTime: '12:30',
      date: todayStr,
      category: 'Coding',
      isBreak: false
    },
    {
      id: 'block-ex-4',
      title: '🍱 Lunch Break',
      startTime: '12:30',
      endTime: '13:30',
      date: todayStr,
      category: 'break',
      isBreak: true
    },
    {
      id: 'block-ex-5',
      title: '🔬 Study: Physics Lab Report 4',
      startTime: '13:30',
      endTime: '15:00',
      date: todayStr,
      category: 'Study',
      isBreak: false
    }
  ];
};

const getExampleMoodLogs = (): MoodLog[] => {
  const todayStr = new Date().toISOString().split('T')[0];
  return [
    {
      date: todayStr,
      mood: '😊'
    }
  ];
};

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>([]);
  const [habits, setHabits] = useState<Habit[]>(initialHabits);
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [activeFocusTaskId, setActiveFocusTaskId] = useState<string | null>(null);
  
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Theme State (defaulting to light as requested)
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Load theme on client mount
  useEffect(() => {
    const storedTheme = localStorage.getItem('lm_theme') as 'light' | 'dark' | null;
    if (storedTheme) {
      setTheme(storedTheme);
    } else {
      setTheme('light');
    }
  }, []);

  // Update HTML class list and save to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
      localStorage.setItem('lm_theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // 1. Load data from local storage
  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem('lm_tasks');
      const storedBlocks = localStorage.getItem('lm_scheduleBlocks');
      const storedHabits = localStorage.getItem('lm_habits');
      const storedMood = localStorage.getItem('lm_moodLogs');
      const storedReports = localStorage.getItem('lm_reports');
      const storedSettings = localStorage.getItem('lm_settings');
      const storedProfile = localStorage.getItem('lm_profile');
      const storedAuth = localStorage.getItem('lm_isLoggedIn');

      if (storedTasks && JSON.parse(storedTasks).length > 0) {
        setTasks(JSON.parse(storedTasks));
      } else {
        const defaultTasks = getExampleTasks();
        setTasks(defaultTasks);
        localStorage.setItem('lm_tasks', JSON.stringify(defaultTasks));
      }

      if (storedBlocks && JSON.parse(storedBlocks).length > 0) {
        setScheduleBlocks(JSON.parse(storedBlocks));
      } else {
        const defaultBlocks = getExampleScheduleBlocks();
        setScheduleBlocks(defaultBlocks);
        localStorage.setItem('lm_scheduleBlocks', JSON.stringify(defaultBlocks));
      }

      if (storedHabits) setHabits(JSON.parse(storedHabits));

      if (storedMood && JSON.parse(storedMood).length > 0) {
        setMoodLogs(JSON.parse(storedMood));
      } else {
        const defaultMoods = getExampleMoodLogs();
        setMoodLogs(defaultMoods);
        localStorage.setItem('lm_moodLogs', JSON.stringify(defaultMoods));
      }

      if (storedReports) setReports(JSON.parse(storedReports));
      
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      } else {
        localStorage.setItem('lm_settings', JSON.stringify(defaultSettings));
      }
      
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
        setCurrentUser(JSON.parse(storedProfile));
      } else {
        localStorage.setItem('lm_profile', JSON.stringify(defaultProfile));
        setCurrentUser(defaultProfile);
      }
      
      if (storedAuth === 'true') {
        setIsLoggedIn(true);
      } else if (storedAuth === null) {
        setIsLoggedIn(true);
        localStorage.setItem('lm_isLoggedIn', 'true');
      }
    } catch (e) {
      console.error('Error loading localStorage data', e);
    }
    setIsLoaded(true);
  }, []);

  // 2. Save data to local storage when state changes
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('lm_tasks', JSON.stringify(tasks));
  }, [tasks, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('lm_scheduleBlocks', JSON.stringify(scheduleBlocks));
  }, [scheduleBlocks, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('lm_habits', JSON.stringify(habits));
  }, [habits, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('lm_moodLogs', JSON.stringify(moodLogs));
  }, [moodLogs, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('lm_reports', JSON.stringify(reports));
  }, [reports, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('lm_settings', JSON.stringify(settings));
  }, [settings, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('lm_profile', JSON.stringify(profile));
  }, [profile, isLoaded]);

  // ==========================================
  // TASKS ACTIONS
  // ==========================================
  const addTask = async (taskData: Omit<Task, 'id' | 'priorityLevel' | 'priorityScore' | 'priorityExplanation' | 'riskLevel' | 'riskProbability' | 'riskExplanation' | 'subtasks' | 'completed' | 'createdAt'>) => {
    const id = `task-${Date.now()}`;
    const createdAt = new Date().toISOString();
    
    // Run AI Engine priority calculator
    const priority = calculateTaskPriority(
      taskData.title,
      taskData.deadline,
      taskData.estimatedHours,
      false,
      taskData.notes
    );

    // Run AI Engine risk calculator
    const risk = predictDeadlineRisk(
      taskData.deadline,
      taskData.estimatedHours,
      false
    );

    const newTask: Task = {
      ...taskData,
      id,
      priorityLevel: priority.level,
      priorityScore: priority.score,
      priorityExplanation: priority.explanation,
      riskLevel: risk.level,
      riskProbability: risk.probability,
      riskExplanation: risk.reason,
      subtasks: [],
      completed: false,
      createdAt
    };

    setTasks(prev => {
      const updated = [newTask, ...prev];
      return updated;
    });

    // Auto-scheduler hook: If auto-scheduler is active, trigger schedule regen
    setTimeout(() => {
      const today = new Date().toISOString().split('T')[0];
      rescheduleDay(today);
    }, 100);

    return newTask;
  };

  const updateTask = (updatedTask: Task) => {
    // Re-run calculations in case deadline or estimated hours changed
    const priority = calculateTaskPriority(
      updatedTask.title,
      updatedTask.deadline,
      updatedTask.estimatedHours,
      false,
      updatedTask.notes
    );

    const risk = predictDeadlineRisk(
      updatedTask.deadline,
      updatedTask.estimatedHours,
      updatedTask.completed
    );

    const reCalculatedTask = {
      ...updatedTask,
      priorityLevel: priority.level,
      priorityScore: priority.score,
      priorityExplanation: priority.explanation,
      riskLevel: risk.level,
      riskProbability: risk.probability,
      riskExplanation: risk.reason
    };

    setTasks(prev => prev.map(t => t.id === updatedTask.id ? reCalculatedTask : t));

    // Re-schedule dynamically
    setTimeout(() => {
      const today = new Date().toISOString().split('T')[0];
      rescheduleDay(today);
    }, 100);
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setScheduleBlocks(prev => prev.filter(b => b.taskId !== taskId));
  };

  const toggleSubTask = (taskId: string, subTaskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updatedSub = t.subtasks.map(st => st.id === subTaskId ? { ...st, completed: !st.completed } : st);
        
        // If all subtasks are finished, check if we auto-complete parent (optional, but keep it manual for user satisfaction, or mark progress)
        return {
          ...t,
          subtasks: updatedSub
        };
      }
      return t;
    }));
  };

  const generateSubtasks = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      const subtaskTitles = await getSubtaskBreakdown(
        task.title,
        task.description,
        task.category,
        settings
      );

      const subtasks: SubTask[] = subtaskTitles.map((title, index) => ({
        id: `sub-${taskId}-${index}-${Date.now()}`,
        title,
        completed: false
      }));

      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, subtasks } : t));
    } catch (e) {
      console.error("Failed to generate subtasks", e);
    }
  };

  // ==========================================
  // SCHEDULING ACTIONS
  // ==========================================
  const rescheduleDay = (dateStr: string) => {
    // Clone tasks to prevent state mutation inside scheduling algorithms
    const tasksCopy = JSON.parse(JSON.stringify(tasks));
    const generatedBlocks = generateDailySchedule(tasksCopy, dateStr, settings);
    
    // Keep manually scheduled breaks/blocks not linked to automated tasks, or overwrite for day reset
    setScheduleBlocks(prev => {
      const otherDays = prev.filter(b => b.date !== dateStr);
      return [...otherDays, ...generatedBlocks];
    });
  };

  const updateScheduleBlocks = (newBlocks: ScheduleBlock[]) => {
    setScheduleBlocks(newBlocks);
  };

  const triggerRescueMode = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return [];
    
    const rescuePlan = generateDeadlineRescuePlan(task);
    
    // Schedule rescue focus blocks starting immediately
    const today = new Date().toISOString().split('T')[0];
    const newBlocks: ScheduleBlock[] = [];
    const now = new Date();
    let currentHour = now.getHours();
    let currentMin = now.getMinutes() >= 30 ? 30 : 0;

    rescuePlan.forEach((planItem, index) => {
      const startStr = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
      
      currentMin += planItem.duration;
      while (currentMin >= 60) {
        currentHour += 1;
        currentMin -= 60;
      }
      const endStr = `${String(currentHour % 24).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;

      newBlocks.push({
        id: `rescue-${taskId}-${index}`,
        taskId: task.id,
        title: `⚠️ RESCUE: ${planItem.action}`,
        startTime: startStr,
        endTime: endStr,
        date: today,
        category: task.category,
        isBreak: planItem.action.toLowerCase().includes('break')
      });
    });

    setScheduleBlocks(prev => {
      const otherBlocks = prev.filter(b => b.date !== today);
      return [...otherBlocks, ...newBlocks];
    });

    return rescuePlan;
  };

  // ==========================================
  // HABITS & MOOD ACTIONS
  // ==========================================
  const logHabit = (habitId: string, dateStr: string, increment: number) => {
    setHabits(prev => prev.map(h => {
      if (h.id === habitId) {
        const currentVal = h.logs[dateStr] || 0;
        const newVal = Math.max(0, currentVal + increment);
        return {
          ...h,
          logs: {
            ...h.logs,
            [dateStr]: newVal
          }
        };
      }
      return h;
    }));
  };

  const addMoodLog = (mood: '😊' | '😐' | '😔' | '😫') => {
    const today = new Date().toISOString().split('T')[0];
    setMoodLogs(prev => {
      const updated = prev.filter(m => m.date !== today);
      return [...updated, { date: today, mood }];
    });

    // If stressed, recommend focus adjustments
    if (mood === '😫') {
      // Trigger a light warning alert
    }
  };

  // ==========================================
  // REPORTS ACTIONS
  // ==========================================
  const generateBriefing = async (dateStr: string, mood?: string) => {
    try {
      const report = await getDailyReport(tasks, dateStr, settings, 'morning', mood);
      setReports(prev => {
        const filtered = prev.filter(r => r.date !== dateStr);
        const existingReport = prev.find(r => r.date === dateStr);
        return [...filtered, { 
          date: dateStr, 
          morningBriefing: report.morningBriefing,
          eveningReport: existingReport?.eveningReport
        }];
      });
    } catch (e) {
      console.error(e);
    }
  };

  const generateEveningSummary = async (dateStr: string) => {
    try {
      const report = await getDailyReport(tasks, dateStr, settings, 'evening');
      setReports(prev => {
        const filtered = prev.filter(r => r.date !== dateStr);
        const existingReport = prev.find(r => r.date === dateStr);
        return [...filtered, { 
          date: dateStr, 
          morningBriefing: existingReport?.morningBriefing,
          eveningReport: report.eveningReport
        }];
      });
    } catch (e) {
      console.error(e);
    }
  };

  // ==========================================
  // SETTINGS & PROFILE ACTIONS
  // ==========================================
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const updateProfile = (newProfile: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...newProfile }));
    setCurrentUser(prev => prev ? { ...prev, ...newProfile } : null);
  };

  // ==========================================
  // AUTHENTICATION ACTIONS
  // ==========================================
  const login = (email: string): boolean => {
    // Simulated Auth check
    if (email) {
      setIsLoggedIn(true);
      localStorage.setItem('lm_isLoggedIn', 'true');
      const updatedProfile = { ...profile, email };
      setProfile(updatedProfile);
      setCurrentUser(updatedProfile);
      return true;
    }
    return false;
  };

  const register = (name: string, email: string) => {
    setIsLoggedIn(true);
    localStorage.setItem('lm_isLoggedIn', 'true');
    const newProf = {
      name,
      email,
      joinedDate: new Date().toISOString().split('T')[0],
      focusStreak: 0
    };
    setProfile(newProf);
    setCurrentUser(newProf);
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.setItem('lm_isLoggedIn', 'false');
    setCurrentUser(null);
  };

  return (
    <AppContext.Provider value={{
      tasks,
      scheduleBlocks,
      habits,
      moodLogs,
      reports,
      settings,
      profile,
      activeFocusTaskId,
      isLoggedIn,
      currentUser,
      
      addTask,
      updateTask,
      deleteTask,
      toggleSubTask,
      generateSubtasks,
      rescheduleDay,
      updateScheduleBlocks,
      triggerRescueMode,
      logHabit,
      addMoodLog,
      generateBriefing,
      generateEveningSummary,
      updateSettings,
      updateProfile,
      setActiveFocusTaskId,
      login,
      register,
      logout,
      theme,
      toggleTheme
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
