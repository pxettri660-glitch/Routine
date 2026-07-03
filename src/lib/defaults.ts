import { UserStats, Achievement } from '../types';

export const DEFAULT_STATS: UserStats = {
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: new Date().toISOString(),
  tasksCompleted: 0,
  goalsCompleted: 0,
  focusHours: 0
};

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'a1', name: 'First Step', description: 'Complete your first task', icon: '🎯', isUnlocked: false, xpReward: 50 },
  { id: 'a2', name: 'Focus Master', description: 'Study for 10 hours total', icon: '⏱️', isUnlocked: false, xpReward: 200 },
  { id: 'a3', name: '7-Day Streak', description: 'Login 7 days in a row', icon: '🔥', isUnlocked: false, xpReward: 500 },
  { id: 'a4', name: 'Night Owl', description: 'Study after midnight', icon: '🦉', isUnlocked: false, xpReward: 100 },
];
