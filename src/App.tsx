import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  Target,
  FileText,
  Music,
  Sun,
  Moon,
  AlertOctagon,
  XCircle,
  Menu,
  X,
  Bot,
  Sliders,
  Cpu,
  BrainCircuit,
  Sparkles,
  Settings,
  Timer,
  Flame,
  User,
  Mail
} from 'lucide-react';

import { RoutineItem, GoalItem, NoteItem, AudioTrack, XPHistory, TaskItem, UserStats, Achievement } from './types';
import Dashboard from './components/Dashboard';
import Routine from './components/Routine';
import Goals from './components/Goals';
import Tasks from './components/Tasks';
import Notes from './components/Notes';
import CalendarBS from './components/CalendarBS';
import Jarvis from './components/Jarvis';
import Entertainment from './components/Entertainment';
import Focus from './components/Focus';
import WelcomeScreen from './components/WelcomeScreen';
import UserProfile from './components/UserProfile';
import { useAuth } from './contexts/AuthContext';
import { db } from './lib/firebase';
import { doc, getDoc, setDoc, collection, getDocs, writeBatch } from 'firebase/firestore';

// Standard Initial Seeds
const DEFAULT_ROUTINES: RoutineItem[] = [
  { id: 'r1', start: "04:45", end: "05:00", title: "Wake Up & Fresh (Alarm Active)", desc: "Triggering hard alarm buzzer sequence." },
  { id: 'r2', start: "05:00", end: "05:45", title: "Ready for Study", desc: "Get fresh, prepare your workspace, get focused." },
  { id: 'r3', start: "05:45", end: "13:00", title: "College Study hours Session", desc: "Focus intensely on lectures and revision." },
  { id: 'r4', start: "13:30", end: "15:00", title: "Time for Homework", desc: "Complete all regular written tasks." },
  { id: 'r5', start: "15:00", end: "17:00", title: "Time for Coding", desc: "Code daily, stay consistent." },
  { id: 'r6', start: "17:00", end: "21:00", title: "Reading time for PCM", desc: "Read carefully, focus on concepts of the questions." },
  { id: 'r7', start: "21:00", end: "22:00", title: "Family time & dinner time", desc: "Listen to music or relax with mobile entertainment streams." }
];

const DEFAULT_GOALS: GoalItem[] = [
  { id: 'g1', title: "Complete Homework Assignments", completed: false, category: 'academic' },
  { id: 'g2', title: "Read Science Chapter Thoroughly", completed: false, category: 'academic' },
  { id: 'g3', title: "Daily Coding Practise", completed: false, category: 'coding' },
  { id: 'g4', title: "Maintain Dashboard Log updates", completed: false, category: 'personal' }
];

const DEFAULT_NOTES: NoteItem[] = [
  {
    id: 'n1',
    title: "Study Engine Manual",
    content: "🎓 WELCOME TO STUDY ENGINE v5 — ULTIMATE PRODUCTION COCKPIT\n=======================================================\n\nThis system is fully automated. \nIt runs a dedicated local scheduler to track sequence directives seamlessly.\n\n⚡ SPECIAL CONTROLS:\n• Synthesizer Alarms: Tested and triggered at scheduled intervals.\n• Multi-Page Notebook: Formatted specifically for syllabus concepts and homework proofs.\n• Browser Focus Synthesizers: Built-in binaural study beats located in the Audio Beats tab.\n• Study Assistant AI: Fully voice-integrated companion utilizing Google Gemini models on the server.\n\nStay consistent!",
    category: "Scratchpad",
    updatedAt: new Date().toLocaleString()
  }
];

const DEFAULT_STATS: UserStats = {
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: '',
  tasksCompleted: 0,
  goalsCompleted: 0,
  focusHours: 0
};

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'a1', name: 'First Step', description: 'Complete your first task', icon: '🎯', isUnlocked: false, xpReward: 50 },
  { id: 'a2', name: 'Focus Master', description: 'Study for 10 hours total', icon: '⏱️', isUnlocked: false, xpReward: 200 },
  { id: 'a3', name: 'Streak 7', description: 'Maintain a 7-day streak', icon: '🔥', isUnlocked: false, xpReward: 500 },
];

export default function App() {
  const { user, loading: authLoading, isGuest, logout } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [showMigrationPrompt, setShowMigrationPrompt] = useState(false);
  const [currentView, setCurrentView] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || 'dashboard';
  });

  const handleNavigate = React.useCallback((view: string) => {
    setCurrentView(view);
    window.location.hash = view;
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) setCurrentView(hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isThemeLight, setIsThemeLight] = useState<boolean>(() => {
    const local = localStorage.getItem('study_theme_light');
    if (local !== null) return local === 'true';
    return false; // Default to dark mode
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Gamification Engine State
  const [currentXP, setCurrentXP] = useState<number>(() => {
    const local = localStorage.getItem('study_xp');
    return local ? parseInt(local) : 0;
  });

  const [currentLevel, setCurrentLevel] = useState<number>(() => {
    const local = localStorage.getItem('study_level');
    return local ? parseInt(local) : 1;
  });

  const [xpHistory, setXpHistory] = useState<XPHistory[]>(() => {
    const local = localStorage.getItem('study_xp_history');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Controls for active Jarvis cockpit style ("cyan", "red", "purple", "gold")
  const [jarvisTheme, setJarvisTheme] = useState<'cyan' | 'red' | 'purple' | 'gold'>('cyan');

  // Core schedules and local-database states with client-side persistence
  const [routines, setRoutines] = useState<RoutineItem[]>(() => {
    const local = localStorage.getItem('study_routines');
    return local ? JSON.parse(local) : DEFAULT_ROUTINES;
  });

  const [goals, setGoals] = useState<GoalItem[]>(() => {
    const local = localStorage.getItem('study_goals');
    return local ? JSON.parse(local) : DEFAULT_GOALS;
  });

  const [notes, setNotes] = useState<NoteItem[]>(() => {
    const local = localStorage.getItem('study_notes');
    return local ? JSON.parse(local) : DEFAULT_NOTES;
  });

  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const local = localStorage.getItem('study_tasks');
    return local ? JSON.parse(local) : [];
  });

  const [stats, setStats] = useState<UserStats>(() => {
    const local = localStorage.getItem('study_stats');
    return local ? JSON.parse(local) : DEFAULT_STATS;
  });

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const local = localStorage.getItem('study_achievements');
    return local ? JSON.parse(local) : DEFAULT_ACHIEVEMENTS;
  });

  // Music state synchronization
  const [loadedTracks, setLoadedTracks] = useState<AudioTrack[]>(() => {
    const local = localStorage.getItem('study_tracks');
    return local ? JSON.parse(local) : [];
  });
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Alarm options state
  const [alarmTime, setAlarmTime] = useState<string>('04:45');
  const [isAlarmEnabled, setIsAlarmEnabled] = useState<boolean>(true);
  const [isAlarmActive, setIsAlarmActive] = useState<boolean>(false);

  // Tracking logic references
  const lastAnnouncedTaskIdRef = useRef<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(splashTimer);
  }, []);

  // Fetch data from Firebase on login
  useEffect(() => {
    if (user && user.emailVerified && !authLoading) {
      const fetchData = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.currentLevel) setCurrentLevel(data.currentLevel);
            if (data.currentXP !== undefined) setCurrentXP(data.currentXP);
            if (data.xpHistory) setXpHistory(data.xpHistory);
            if (data.isThemeLight !== undefined) setIsThemeLight(data.isThemeLight);
            if (data.stats) setStats(data.stats);
            if (data.achievements) setAchievements(data.achievements);
          }

          const routinesSnap = await getDocs(collection(db, 'users', user.uid, 'routines'));
          if (!routinesSnap.empty) {
            setRoutines(routinesSnap.docs.map(d => d.data() as RoutineItem));
          }
          
          const goalsSnap = await getDocs(collection(db, 'users', user.uid, 'goals'));
          if (!goalsSnap.empty) {
            setGoals(goalsSnap.docs.map(d => d.data() as GoalItem));
          }

          const notesSnap = await getDocs(collection(db, 'users', user.uid, 'notes'));
          if (!notesSnap.empty) {
            setNotes(notesSnap.docs.map(d => d.data() as NoteItem));
          }

          const tasksSnap = await getDocs(collection(db, 'users', user.uid, 'tasks'));
          if (!tasksSnap.empty) {
            setTasks(tasksSnap.docs.map(d => d.data() as TaskItem));
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

      // Check if they have guest data
      const hadGuestData = localStorage.getItem('study_guest_mode_migration_pending') === 'true';
      if (hadGuestData) {
        setShowMigrationPrompt(true);
      } else {
        fetchData();
      }
    }
  }, [user, authLoading]);

  const handleMigration = async (migrate: boolean) => {
    setShowMigrationPrompt(false);
    localStorage.removeItem('study_guest_mode_migration_pending');
    
    if (migrate && user) {
      // Push local data to firebase
      try {
        const batch = writeBatch(db);
        const userRef = doc(db, 'users', user.uid);
        batch.update(userRef, {
          currentLevel,
          currentXP,
          xpHistory,
          isThemeLight,
          stats,
          achievements
        });

        routines.forEach(r => {
          const ref = doc(db, 'users', user.uid, 'routines', r.id);
          batch.set(ref, r);
        });

        goals.forEach(g => {
          const ref = doc(db, 'users', user.uid, 'goals', g.id);
          batch.set(ref, g);
        });

        notes.forEach(n => {
          const ref = doc(db, 'users', user.uid, 'notes', n.id);
          batch.set(ref, n);
        });

        tasks.forEach(t => {
          const ref = doc(db, 'users', user.uid, 'tasks', t.id);
          batch.set(ref, t);
        });

        await batch.commit();
        alert('Data migrated successfully!');
      } catch (err) {
        console.error("Migration failed", err);
        alert('Failed to migrate data.');
      }
    } else {
      // Just fetch from Firebase (overwrite local)
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.currentLevel) setCurrentLevel(data.currentLevel);
            if (data.currentXP !== undefined) setCurrentXP(data.currentXP);
            if (data.xpHistory) setXpHistory(data.xpHistory);
            if (data.isThemeLight !== undefined) setIsThemeLight(data.isThemeLight);
            if (data.stats) setStats(data.stats);
            if (data.achievements) setAchievements(data.achievements);
          }

          const routinesSnap = await getDocs(collection(db, 'users', user.uid, 'routines'));
          if (!routinesSnap.empty) {
            setRoutines(routinesSnap.docs.map(d => d.data() as RoutineItem));
          }
          
          const goalsSnap = await getDocs(collection(db, 'users', user.uid, 'goals'));
          if (!goalsSnap.empty) {
            setGoals(goalsSnap.docs.map(d => d.data() as GoalItem));
          }

          const notesSnap = await getDocs(collection(db, 'users', user.uid, 'notes'));
          if (!notesSnap.empty) {
            setNotes(notesSnap.docs.map(d => d.data() as NoteItem));
          }

          const tasksSnap = await getDocs(collection(db, 'users', user.uid, 'tasks'));
          if (!tasksSnap.empty) {
            setTasks(tasksSnap.docs.map(d => d.data() as TaskItem));
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
    }
  };

  // Sync state data to storage
  useEffect(() => {
    localStorage.setItem('study_routines', JSON.stringify(routines));
    if (user && user.emailVerified) {
      routines.forEach(r => {
        setDoc(doc(db, 'users', user.uid, 'routines', r.id), r).catch(console.error);
      });
    }
  }, [routines, user]);

  useEffect(() => {
    localStorage.setItem('study_goals', JSON.stringify(goals));
    if (user && user.emailVerified) {
      goals.forEach(g => {
        setDoc(doc(db, 'users', user.uid, 'goals', g.id), g).catch(console.error);
      });
    }
  }, [goals, user]);

  useEffect(() => {
    localStorage.setItem('study_notes', JSON.stringify(notes));
    if (user && user.emailVerified) {
      notes.forEach(n => {
        setDoc(doc(db, 'users', user.uid, 'notes', n.id), n).catch(console.error);
      });
    }
  }, [notes, user]);

  useEffect(() => {
    localStorage.setItem('study_tasks', JSON.stringify(tasks));
    if (user && user.emailVerified) {
      tasks.forEach(t => {
        setDoc(doc(db, 'users', user.uid, 'tasks', t.id), t).catch(console.error);
      });
    }
  }, [tasks, user]);

  useEffect(() => {
    localStorage.setItem('study_tracks', JSON.stringify(loadedTracks));
  }, [loadedTracks]);

  useEffect(() => {
    localStorage.setItem('study_stats', JSON.stringify(stats));
    if (user && user.emailVerified) {
      setDoc(doc(db, 'users', user.uid), { stats }, { merge: true }).catch(console.error);
    }
  }, [stats, user]);

  useEffect(() => {
    localStorage.setItem('study_achievements', JSON.stringify(achievements));
    if (user && user.emailVerified) {
      setDoc(doc(db, 'users', user.uid), { achievements }, { merge: true }).catch(console.error);
    }
  }, [achievements, user]);

  useEffect(() => {
    localStorage.setItem('study_xp', currentXP.toString());
    if (user && user.emailVerified) {
      setDoc(doc(db, 'users', user.uid), { currentXP }, { merge: true }).catch(console.error);
    }
  }, [currentXP, user]);

  useEffect(() => {
    localStorage.setItem('study_level', currentLevel.toString());
    if (user && user.emailVerified) {
      setDoc(doc(db, 'users', user.uid), { currentLevel }, { merge: true }).catch(console.error);
    }
  }, [currentLevel, user]);

  useEffect(() => {
    localStorage.setItem('study_xp_history', JSON.stringify(xpHistory));
    if (user && user.emailVerified) {
      setDoc(doc(db, 'users', user.uid), { xpHistory }, { merge: true }).catch(console.error);
    }
  }, [xpHistory, user]);

  useEffect(() => {
    localStorage.setItem('study_theme_light', isThemeLight.toString());
    if (isThemeLight) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
    if (user && user.emailVerified) {
      setDoc(doc(db, 'users', user.uid), { isThemeLight }, { merge: true }).catch(console.error);
    }
  }, [isThemeLight, user]);

  // Clock runner ticker thread
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // XP addition and Level coordination
  const handleAwardXP = React.useCallback((amount: number) => {
    // Record history
    setXpHistory(prev => {
      const today = new Date().toISOString().slice(0, 10);
      const existing = prev.find(p => p.date === today);
      if (existing) {
        return prev.map(p => p.date === today ? { ...p, xp: p.xp + amount } : p);
      } else {
        return [...prev, { date: today, xp: amount }];
      }
    });

    setCurrentXP((prevXP) => {
      let nextXP = prevXP + amount;
      let nextLevel = currentLevel;
      const threshold = nextLevel * 500;

      if (nextXP >= threshold) {
        nextXP -= threshold;
        nextLevel += 1;
        setCurrentLevel(nextLevel);
        setTimeout(() => {
          speakVoiceAnnouncement(`Congratulations. Performance milestone crossed. You have leveled up to Level ${nextLevel}!`);
          alert(`👑 LEVEL UP! You are now Level ${nextLevel}!`);
        }, 100);
      } else if (nextXP < 0) {
        nextXP = 0;
      }
      return nextXP;
    });
  }, [currentLevel]);

  // Web Audio Synthesizer: aggressive wake-up alarm chime
  const playSoundAlarmBeep = () => {
    try {
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // high pitch chirp
      gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn('Audio Synthesis action bypassed or locked by browser sandbox rules.', e);
    }
  };

  // Web Audio Synthesizer: gentle milestone tone
  const playMilestonePing = () => {
    try {
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // Clean C5 chord note
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.65);
    } catch (e) {
      console.warn(e);
    }
  };

  // Native HTML Speech Synthesis announcer loop
  const speakVoiceAnnouncement = (textMessage: string) => {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel(); // Flush previous stack
        const speech = new SpeechSynthesisUtterance(textMessage);
        speech.rate = 1.0;
        speech.pitch = 1.05;
        speech.volume = 1.0;
        window.speechSynthesis.speak(speech);
      } catch (e) {
        console.warn('Speech Engine not active or waiting gesture permission.', e);
      }
    }
  };

  // Helpers to parse HH:MM string to absolute duration moments
  const getMinutesOfDay = (hhmmStr: string) => {
    const [h, m] = hhmmStr.split(':').map(Number);
    return h * 60 + m;
  };

  // Helper checking if a scheduled item is active right now
  const isTaskActive = (start: string, end: string, date: Date) => {
    const currentMins = date.getHours() * 60 + date.getMinutes();
    const startMins = getMinutesOfDay(start);
    const endMins = getMinutesOfDay(end);

    if (startMins < endMins) {
      return currentMins >= startMins && currentMins < endMins;
    } else {
      // Midnight wrap-around item
      return currentMins >= startMins || currentMins < endMins;
    }
  };

  // Locate active schedule
  const activeTask = routines.find((task) => isTaskActive(task.start, task.end, currentTime)) || null;

  // Calculate percentage of elapsed schedule
  let taskProgress = 0;
  if (activeTask) {
    const currentMins = currentTime.getHours() * 60 + currentTime.getMinutes();
    const startMins = getMinutesOfDay(activeTask.start);
    const endMins = getMinutesOfDay(activeTask.end);

    const totalMinutes = endMins > startMins ? endMins - startMins : (1440 - startMins) + endMins;
    const elapsedMinutes = currentMins >= startMins ? currentMins - startMins : (1440 - startMins) + currentMins;

    taskProgress = Math.round((elapsedMinutes / totalMinutes) * 100);
    taskProgress = Math.max(0, Math.min(100, taskProgress));
  }

  // Master Routine state scheduler listener
  useEffect(() => {
    const hh = currentTime.getHours();
    const mm = currentTime.getMinutes();
    const ss = currentTime.getSeconds();

    // Match morning wakeup alarm
    const alarmParts = alarmTime.split(':');
    const matchesAlarmTime = 
      isAlarmEnabled && 
      alarmParts.length === 2 && 
      hh === Number(alarmParts[0]) && 
      mm === Number(alarmParts[1]);

    if (matchesAlarmTime) {
      setIsAlarmActive(true);

      // Play buzzer sound on even seconds to create pulse warning
      if (ss % 2 === 0) {
        playSoundAlarmBeep();
      }

      // Read announcement text every 20 seconds
      if (ss === 0 || ss === 20 || ss === 40) {
        speakVoiceAnnouncement("Wake up! It is time to wake up and start your ultimate morning routing.");
      }
    } else {
      // Auto-deactivate alarm visual widget once past the active minute
      if (isAlarmActive && !matchesAlarmTime && ss === 0) {
        setIsAlarmActive(false);
      }
    }

    // Monitor routine blocks and trigger synthesizer tone + speech when item shifts
    if (activeTask && lastAnnouncedTaskIdRef.current !== activeTask.id) {
      lastAnnouncedTaskIdRef.current = activeTask.id;
      
      // Delay milestone warning slightly if alarm is not actively sounding
      if (!matchesAlarmTime) {
        playMilestonePing();
        speakVoiceAnnouncement(`Attention, scheduling change detected. It is time for ${activeTask.title}`);
      }
    } else if (!activeTask && lastAnnouncedTaskIdRef.current !== 'idle') {
      lastAnnouncedTaskIdRef.current = 'idle';
      speakVoiceAnnouncement("Take a quick break. You are currently in a personal transition slot.");
    }
  }, [currentTime, routines, alarmTime, isAlarmEnabled, activeTask]);

  // Triggers for browser evaluation center
  const runBuzzerDemoTester = React.useCallback(() => {
    let count = 0;
    const interval = setInterval(() => {
      playSoundAlarmBeep();
      count++;
      if (count >= 3) clearInterval(interval);
    }, 550);
  }, []);

  const runSpeechDemoTester = React.useCallback(() => {
    speakVoiceAnnouncement("Acoustic synthesis complete. Study Engine operations are fully active and calibrated!");
  }, []);

  const dismissAlarmTrigger = () => {
    setIsAlarmActive(false);
    window.speechSynthesis.cancel();
  };

  const loadDemoSequences = React.useCallback(() => {
    setRoutines(DEFAULT_ROUTINES);
  }, []);

  // Select tone styling based on current Jarvis settings
  const getJarvisThemeClass = () => {
    if (jarvisTheme === 'red') return 'theme-red';
    if (jarvisTheme === 'purple') return 'theme-purple';
    if (jarvisTheme === 'gold') return 'theme-gold';
    return 'theme-cyan';
  };

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, filter: 'blur(20px)' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black overflow-hidden"
          >
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/30 rounded-full mix-blend-screen filter blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/30 rounded-full mix-blend-screen filter blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
            
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, type: 'spring' }}
              className="relative z-10 flex flex-col items-center"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white/[0.05] border border-white/[0.08] backdrop-blur-2xl flex items-center justify-center shadow-2xl mb-8">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter text-white mb-3">STUDY ENGINE</h1>
              <p className="text-white/50 tracking-widest uppercase text-sm font-semibold">Premium Intelligence</p>
              
              <div className="mt-12 flex gap-2">
                <div className="w-2 h-2 rounded-full bg-white/80 animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 rounded-full bg-white/80 animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                <div className="w-2 h-2 rounded-full bg-white/80 animate-bounce" style={{ animationDelay: '0.3s' }}></div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showSplash && !authLoading && !user && !isGuest && (
        <WelcomeScreen />
      )}

      {!showSplash && !authLoading && user && !user.emailVerified && !isGuest && (
        <div className="fixed inset-0 z-[150] bg-black text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white/10 backdrop-blur-xl p-8 rounded-3xl text-center border border-white/20">
            <Mail className="w-16 h-16 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl font-bold mb-4">Verify Your Email</h2>
            <p className="opacity-70 mb-8 text-sm">
              We've sent a verification link to {user.email}. Please check your inbox and verify your email to access the engine.
            </p>
            <button onClick={() => window.location.reload()} className="w-full py-4 bg-white text-black font-bold rounded-xl mb-4 transition-transform active:scale-95">
              I have verified
            </button>
            <button onClick={logout} className="w-full py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all active:scale-95">
              Sign Out
            </button>
          </div>
        </div>
      )}

      {showMigrationPrompt && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-black/10 dark:border-white/10">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Migrate Guest Data?</h2>
            <p className="text-sm opacity-70 mb-6 dark:text-white">
              Would you like to transfer your guest progress to this account?
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => handleMigration(true)}
                className="flex-1 py-3 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-xl"
              >
                Yes
              </button>
              <button 
                onClick={() => handleMigration(false)}
                className="flex-1 py-3 bg-black/5 dark:bg-white/10 dark:text-white font-semibold rounded-xl"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`min-h-[100dvh] flex flex-col transition-all duration-300 ${getJarvisThemeClass()} bg-transparent`}>
      
      {/* Background Ambient Layers */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {!isThemeLight && (
           <>
             <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full mix-blend-screen filter blur-[80px] opacity-20 bg-gradient-to-br from-sky-400 to-blue-600 will-change-transform transform-gpu" />
             <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full mix-blend-screen filter blur-[80px] opacity-20 bg-gradient-to-tr from-violet-400 to-fuchsia-600 will-change-transform transform-gpu" />
           </>
        )}
        <div className={`absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] ${isThemeLight ? 'opacity-10 mix-blend-multiply' : 'opacity-20 brightness-100 contrast-150 mix-blend-overlay'}`}></div>
      </div>

      <main className={`flex-1 flex flex-col min-w-0 relative z-10 ${currentView !== 'jarvis' ? 'h-[100dvh] overflow-y-auto overflow-x-hidden' : ''}`}>
        
        {currentView !== 'jarvis' && (
          <>
            <AnimatePresence>
              {isAlarmActive && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-gradient-to-r from-rose-500 to-orange-500 text-white px-6 py-4 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4 z-40"
                >
                  <div className="flex items-center gap-3">
                    <AlertOctagon className="w-6 h-6 animate-pulse" />
                    <div className="text-center sm:text-left">
                      <h4 className="text-sm font-bold uppercase tracking-widest">
                        ALARM TRIGGERED
                      </h4>
                      <p className="text-[11px] opacity-90 mt-0.5 font-medium">
                        Time: {currentTime.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={dismissAlarmTrigger}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-xs px-5 py-2.5 rounded-full transition-all active:scale-95 cursor-pointer uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    Dismiss
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <section className="flex-grow pb-32">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentView}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4, type: 'spring', bounce: 0 }}
                  className="w-full max-w-4xl mx-auto"
                >
                  {currentView === 'dashboard' && (
                    <Dashboard
                      currentTime={currentTime}
                      currentTask={activeTask}
                      taskProgress={taskProgress}
                      goals={goals}
                      alarmTime={alarmTime}
                      isAlarmEnabled={isAlarmEnabled}
                      onToggleAlarm={() => setIsAlarmEnabled(!isAlarmEnabled)}
                      onSetAlarmTime={(time) => setAlarmTime(time)}
                      triggerBuzzerDemo={runBuzzerDemoTester}
                      triggerVoiceDemo={runSpeechDemoTester}
                      onNavigate={handleNavigate}
                      onAwardXP={handleAwardXP}
                      xpHistory={xpHistory}
                    />
                  )}

                  {currentView === 'routine' && (
                    <Routine
                      routines={routines}
                      currentTask={activeTask}
                      onUpdateRoutines={setRoutines}
                      onResetToDefault={loadDemoSequences}
                    />
                  )}

                  {currentView === 'goals' && (
                    <Goals
                      goals={goals}
                      onUpdateGoals={setGoals}
                      onAwardXP={handleAwardXP}
                    />
                  )}

                  {currentView === 'calendar' && (
                    <CalendarBS />
                  )}

                  {currentView === 'focus' && (
                    <Focus onAwardXP={handleAwardXP} />
                  )}

                  {currentView === 'tools' && (
                    <Notes
                      notes={notes}
                      onUpdateNotes={setNotes}
                      isThemeLight={isThemeLight}
                      onToggleTheme={() => setIsThemeLight(!isThemeLight)}
                    />
                  )}

                  {currentView === 'music' && (
                    <Entertainment
                      loadedTracks={loadedTracks}
                      onUploadTracks={setLoadedTracks}
                      audioElementRef={audioElementRef}
                      currentTrackIndex={currentTrackIndex}
                      setCurrentTrackIndex={setCurrentTrackIndex}
                      isPlaying={isPlaying}
                      setIsPlaying={setIsPlaying}
                    />
                  )}

                  {currentView === 'profile' && (
                    <UserProfile currentLevel={currentLevel} currentXP={currentXP} stats={stats} achievements={achievements} />
                  )}

                  {currentView === 'tasks' && (
                    <Tasks tasks={tasks} onUpdateTasks={setTasks} onAwardXP={handleAwardXP} />
                  )}
                </motion.div>
              </AnimatePresence>
            </section>
          </>
        )}

        {currentView === 'jarvis' && (
          <div className="flex-1 w-full h-[100dvh]">
            <Jarvis
              onNavigate={handleNavigate}
              selectedTheme={jarvisTheme}
              onChangeTheme={setJarvisTheme}
              isThemeLight={isThemeLight}
              onToggleLightDarkTheme={() => setIsThemeLight(!isThemeLight)}
            />
          </div>
        )}

      </main>

      {/* Floating Premium Bottom Navigation */}
      {currentView !== 'jarvis' && (
        <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
          <div className="pointer-events-auto flex items-center justify-between gap-1 sm:gap-2 px-3 py-2 rounded-[2rem] shadow-2xl backdrop-blur-2xl border bg-white/70 dark:bg-[#18181b]/80 border-black/5 dark:border-white/10 shadow-black/5 dark:shadow-black/50 transition-colors duration-300 w-full max-w-fit overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
              { id: 'routine', icon: Sliders, label: 'Routine' },
              { id: 'focus', icon: Timer, label: 'Focus' },
            ].map((item) => {
              const isSelected = currentView === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`relative p-2.5 sm:px-4 sm:py-3 rounded-full flex items-center justify-center transition-all duration-500 group overflow-hidden ${
                    isSelected
                      ? 'text-black dark:text-white'
                      : 'text-black/40 dark:text-white/40 hover:text-black/70 dark:hover:text-white/70 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {isSelected && (
                    <motion.div 
                      layoutId="bottom-nav-indicator"
                      className="absolute inset-0 rounded-full z-0 bg-black/5 dark:bg-white/10 transition-colors duration-300"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 relative z-10 transition-transform duration-300 group-hover:scale-110" strokeWidth={isSelected ? 2.5 : 2} />
                </button>
              );
            })}
            
            {/* FAB Middle Button */}
            <button
              onClick={() => handleNavigate('jarvis')}
              className="relative mx-1 sm:mx-2 p-4 sm:p-5 rounded-full flex items-center justify-center transition-all duration-500 group shadow-lg bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 hover:-translate-y-1"
            >
              <Bot className="w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-300 group-hover:scale-110" strokeWidth={2.5} />
            </button>

            {[
              { id: 'goals', icon: Target, label: 'Goals' },
              { id: 'tasks', icon: FileText, label: 'Tasks' },
              { id: 'music', icon: Music, label: 'Music' },
              { id: 'tools', icon: Settings, label: 'Settings' }, 
              { id: 'profile', icon: User, label: 'Profile' },
            ].map((item) => {
              const isSelected = currentView === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`relative p-2.5 sm:px-4 sm:py-3 rounded-full flex items-center justify-center transition-all duration-500 group overflow-hidden ${
                    isSelected
                      ? 'text-black dark:text-white'
                      : 'text-black/40 dark:text-white/40 hover:text-black/70 dark:hover:text-white/70 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {isSelected && (
                    <motion.div 
                      layoutId="bottom-nav-indicator"
                      className="absolute inset-0 rounded-full z-0 bg-black/5 dark:bg-white/10 transition-colors duration-300"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 relative z-10 transition-transform duration-300 group-hover:scale-110" strokeWidth={isSelected ? 2.5 : 2} />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
    </>
  );
}
