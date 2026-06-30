export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low';
export type RiskLevel = 'Safe' | 'Moderate Risk' | 'High Risk' | 'Critical Risk';
export type HabitCategory = 'study' | 'exercise' | 'reading' | 'coding' | 'sleep' | 'water';

export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string; // ISO date-time string
  priorityLevel: PriorityLevel;
  priorityScore: number; // 0 - 100
  priorityExplanation: string;
  riskLevel: RiskLevel;
  riskProbability: number; // 0 - 100
  riskExplanation: string;
  estimatedHours: number;
  category: string;
  isRecurring: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'none';
  notes?: string;
  subtasks: SubTask[];
  completed: boolean;
  createdAt: string;
}

export interface ScheduleBlock {
  id: string;
  taskId?: string; // Optional task link
  title: string;
  startTime: string; // e.g. "18:00"
  endTime: string; // e.g. "19:00"
  date: string; // YYYY-MM-DD
  category: string;
  isBreak: boolean;
}

export interface HabitLog {
  date: string; // YYYY-MM-DD
  value: number;
}

export interface Habit {
  id: string;
  name: string;
  category: HabitCategory;
  target: number; // Daily target value
  unit: string; // e.g., "glasses", "hours", "pages"
  logs: { [date: string]: number }; // date (YYYY-MM-DD) -> value logged
}

export interface MoodLog {
  date: string; // YYYY-MM-DD
  mood: '😊' | '😐' | '😔' | '😫';
}

export interface DailyReport {
  date: string; // YYYY-MM-DD
  morningBriefing?: {
    overview: string;
    priorities: string[];
    risks: string[];
    suggestions: string[];
  };
  eveningReport?: {
    completedCount: number;
    productivityScore: number;
    timeSpent: number;
    summary: string;
    suggestionsTomorrow: string[];
  };
}

export interface AppSettings {
  geminiApiKey: string;
  openaiApiKey: string;
  aiProvider: 'gemini' | 'openai' | 'mock';
  googleCalendarSync: boolean;
  sleepStart: string; // "22:00"
  sleepEnd: string; // "06:00"
  workStartTime: string; // "09:00"
  workEndTime: string; // "17:00"
  preferredFocusHours: string[]; // ["morning", "afternoon", "evening"]
}

export interface UserProfile {
  name: string;
  email: string;
  joinedDate: string;
  focusStreak: number;
}
