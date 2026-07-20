import { RoutineItem, GoalItem, NoteItem, AudioTrack, XPHistory, TaskItem, UserStats, Achievement } from '../types';
import { DEFAULT_STATS, DEFAULT_ACHIEVEMENTS } from '../lib/defaults';
import { useFirestoreCollection, useFirestoreDocument } from './useFirestoreSync';

export function useUserData() {
  const [routines, setRoutines] = useFirestoreCollection<RoutineItem>('routines', []);
  const [goals, setGoals] = useFirestoreCollection<GoalItem>('goals', []);
  const [notes, setNotes] = useFirestoreCollection<NoteItem>('notes', []);
  const [tasks, setTasks] = useFirestoreCollection<TaskItem>('tasks', []);
  const [loadedTracks, setLoadedTracks] = useFirestoreCollection<AudioTrack>('tracks', []);
  
  const [currentXP, setCurrentXP] = useFirestoreDocument<number>('users/{uid}/stats/data', 'currentXP', 0);
  const [currentLevel, setCurrentLevel] = useFirestoreDocument<number>('users/{uid}/stats/data', 'currentLevel', 1);
  const [xpHistory, setXpHistory] = useFirestoreDocument<XPHistory[]>('users/{uid}/stats/data', 'xpHistory', []);
  const [stats, setStats] = useFirestoreDocument<UserStats>('users/{uid}/stats/data', 'stats', DEFAULT_STATS);
  const [achievements, setAchievements] = useFirestoreDocument<Achievement[]>('users/{uid}/stats/data', 'achievements', DEFAULT_ACHIEVEMENTS);
  
  const [isThemeLight, setIsThemeLight] = useFirestoreDocument<boolean>('users/{uid}/settings/data', 'isThemeLight', false);
  const [jarvisTheme, setJarvisTheme] = useFirestoreDocument<'cyan' | 'red' | 'purple' | 'gold'>('users/{uid}/settings/data', 'jarvisTheme', 'cyan');
  const [alarmTime, setAlarmTime] = useFirestoreDocument<string>('users/{uid}/settings/data', 'alarmTime', '04:45');
  const [isAlarmEnabled, setIsAlarmEnabled] = useFirestoreDocument<boolean>('users/{uid}/settings/data', 'isAlarmEnabled', true);

  return {
    routines, setRoutines,
    goals, setGoals,
    notes, setNotes,
    tasks, setTasks,
    loadedTracks, setLoadedTracks,
    currentXP, setCurrentXP,
    currentLevel, setCurrentLevel,
    xpHistory, setXpHistory,
    stats, setStats,
    achievements, setAchievements,
    isThemeLight, setIsThemeLight,
    jarvisTheme, setJarvisTheme,
    alarmTime, setAlarmTime,
    isAlarmEnabled, setIsAlarmEnabled
  };
}
