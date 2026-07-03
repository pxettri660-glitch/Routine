export interface RoutineItem {
  id: string;
  start: string; // "HH:MM" 24-hour format
  end: string;   // "HH:MM" 24-hour format
  title: string;
  desc: string;
  isCompleted?: boolean;
  repeatDays?: number[]; // 0=Sun, 1=Mon, etc.
  category?: string;
  reminder?: boolean;
  order?: number;
}

export interface GoalItem {
  id: string;
  title: string;
  completed: boolean;
  category: 'academic' | 'coding' | 'fitness' | 'personal';
  deadline?: string;
  streak?: number;
  lastCompletedDate?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  subject?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  completed: boolean;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  category: string;
  updatedAt: string;
}

export interface AudioTrack {
  id: string;
  name: string;
  url: string;
  duration?: string;
}

export interface XPHistory {
  date: string; // YYYY-MM-DD
  xp: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  isUnlocked: boolean;
  xpReward: number;
}

export interface FocusSession {
  id: string;
  startTime: number;
  endTime: number;
  duration: number; // in seconds
  date: string;
  category: string;
  deviceTimestamp: number;
}

export interface UserStats {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  tasksCompleted: number;
  goalsCompleted: number;
  focusHours: number;
}
