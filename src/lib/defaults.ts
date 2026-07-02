import { RoutineItem, GoalItem, NoteItem, UserStats, Achievement } from '../types';

export const DEFAULT_ROUTINES: RoutineItem[] = [
  { id: 'r1', start: "04:45", end: "05:00", title: "Wake Up & Fresh (Alarm Active)", desc: "Triggering hard alarm buzzer sequence." },
  { id: 'r2', start: "05:00", end: "05:45", title: "Ready for Study", desc: "Get fresh, prepare your workspace, get focused." },
  { id: 'r3', start: "05:45", end: "13:00", title: "College Study hours Session", desc: "Focus intensely on lectures and revision." },
  { id: 'r4', start: "13:30", end: "15:00", title: "Time for Homework", desc: "Complete all regular written tasks." },
  { id: 'r5', start: "15:00", end: "17:00", title: "Time for Coding", desc: "Code daily, stay consistent." },
  { id: 'r6', start: "17:00", end: "21:00", title: "Reading time for PCM", desc: "Read carefully, focus on concepts of the questions." },
  { id: 'r7', start: "21:00", end: "22:00", title: "Family time & dinner time", desc: "Listen to music or relax with mobile entertainment streams." }
];

export const DEFAULT_GOALS: GoalItem[] = [
  { id: 'g1', title: "Complete Homework Assignments", completed: false, category: 'academic' },
  { id: 'g2', title: "Read Science Chapter Thoroughly", completed: false, category: 'academic' },
  { id: 'g3', title: "Daily Coding Practise", completed: false, category: 'coding' },
  { id: 'g4', title: "Maintain Dashboard Log updates", completed: false, category: 'personal' }
];

export const DEFAULT_NOTES: NoteItem[] = [
  {
    id: 'n1',
    title: "Study Engine Manual",
    content: "🎓 WELCOME TO STUDY ENGINE v5 — ULTIMATE PRODUCTION COCKPIT\n=======================================================\n\nThis system is fully automated. \nIt runs a dedicated local scheduler to track sequence directives seamlessly.\n\n⚡ SPECIAL CONTROLS:\n• Synthesizer Alarms: Tested and triggered at scheduled intervals.\n• Multi-Page Notebook: Formatted specifically for syllabus concepts and homework proofs.\n• Browser Focus Synthesizers: Built-in binaural study beats located in the Audio Beats tab.\n• Study Assistant AI: Fully voice-integrated companion utilizing Google Gemini models on the server.\n\nStay consistent!",
    category: "Scratchpad",
    updatedAt: new Date().toLocaleString()
  }
];

export const DEFAULT_STATS: UserStats = {
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: '',
  tasksCompleted: 0,
  goalsCompleted: 0,
  focusHours: 0
};

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'a1', name: 'First Step', description: 'Complete your first task', icon: '🎯', isUnlocked: false, xpReward: 50 },
  { id: 'a2', name: 'Focus Master', description: 'Study for 10 hours total', icon: '⏱️', isUnlocked: false, xpReward: 200 },
  { id: 'a3', name: 'Streak 7', description: 'Maintain a 7-day streak', icon: '🔥', isUnlocked: false, xpReward: 500 },
];
