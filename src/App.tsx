import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Activity, Grid,
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
  Mail,
  MessageCircle,
  Shield
} from 'lucide-react';

import { RoutineItem, GoalItem, NoteItem, AudioTrack, XPHistory, TaskItem, UserStats, Achievement } from './types';
import { DEFAULT_STATS, DEFAULT_ACHIEVEMENTS } from './lib/defaults';
import { useFirestoreCollection, useFirestoreDocument } from './hooks/useFirestoreSync';
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
import CommunityChat from './components/CommunityChat';
import AdminPanel from './components/AdminPanel';
import More from './components/More';
import StudyNav from './components/StudyNav';
import AINav from './components/AINav';
import CommunityNav from './components/CommunityNav';
import ProfileNav from './components/ProfileNav';
import { BookOpen, Users } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { requestNotificationPermissions } from './lib/notifications';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';
import { db } from './lib/firebase';
import { doc, getDoc, writeBatch } from 'firebase/firestore';

export default function App() {
  const { user, loading: authLoading, logout } = useAuth();
  const [showSplash, setShowSplash] = useState(false);
  const [currentView, setCurrentView] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || 'dashboard';
  });
  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastScrollY = useRef(0);

  const handleScroll = React.useCallback((e: React.UIEvent<HTMLElement>) => {
    const target = e.currentTarget;
    if (!target || !target.scrollTop) return;
    const currentScrollY = target.scrollTop;
    if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
      setIsNavVisible(false);
    } else {
      setIsNavVisible(true);
    }
    lastScrollY.current = currentScrollY;
  }, []);

  const handleNavigate = React.useCallback((view: string) => {
    setCurrentView(view);
    window.location.hash = view;
  }, []);

  const handleHapticNavigate = React.useCallback((view: string) => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
    handleNavigate(view);
  }, [handleNavigate]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) setCurrentView(hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Firestore Synced States
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

  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
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


  useEffect(() => {
    requestNotificationPermissions().catch(console.error);
  }, []);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      SplashScreen.hide().catch(console.error);
    }
  }, []);


  useEffect(() => {
    if (isThemeLight) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [isThemeLight]);

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
    const today = new Date().toISOString().slice(0, 10);
    const existing = xpHistory.find(p => p.date === today);
    if (existing) {
      setXpHistory(xpHistory.map(p => p.date === today ? { ...p, xp: p.xp + amount } : p));
    } else {
      setXpHistory([...xpHistory, { date: today, xp: amount }]);
    }

    let nextXP = currentXP + amount;
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
    setCurrentXP(nextXP);
  }, [currentLevel, currentXP, xpHistory, setXpHistory, setCurrentLevel, setCurrentXP]);

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
    // No-op
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
        {(showSplash || authLoading) && (
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

      {!showSplash && !authLoading && !user && (
        <WelcomeScreen />
      )}

      

      {!showSplash && !authLoading && user && (
      <div className={`min-h-screen min-h-screen h-[100dvh] flex flex-col transition-all duration-300 ${getJarvisThemeClass()} bg-transparent`}>
        {!user.emailVerified && (
          <div className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2 z-50 relative">
            <Mail className="w-4 h-4" />
            Please verify your email address ({user.email}). 
            <button onClick={() => window.location.reload()} className="underline font-bold ml-2">Refresh</button>
          </div>
        )}
      
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

      <main id="main-scroll-container" onScroll={handleScroll} className={`flex-1 flex flex-col min-w-0 relative z-10 ${currentView !== 'jarvis' ? 'h-screen h-[100dvh] overflow-y-auto overflow-x-hidden' : ''}`}>
        
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

                  {['routine', 'add-routine'].includes(currentView) && (
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
                  {currentView === 'chat' && (
                    <CommunityChat />
                  )}
                  {currentView === 'admin' && (
                    <AdminPanel />
                  )}
                  {currentView === 'more' && (
                    <More onNavigate={handleNavigate} />
                  )}
                  {currentView === 'study_nav' && (
                    <StudyNav onNavigate={handleNavigate} />
                  )}
                  {currentView === 'ai_nav' && (
                    <AINav onNavigate={handleNavigate} />
                  )}
                  {currentView === 'community_nav' && (
                    <CommunityNav onNavigate={handleNavigate} />
                  )}
                  {currentView === 'profile_nav' && (
                    <ProfileNav onNavigate={handleNavigate} isThemeLight={isThemeLight} onToggleTheme={() => setIsThemeLight(!isThemeLight)} />
                  )}
                </motion.div>
              </AnimatePresence>
            </section>
          </>
        )}

        {currentView === 'jarvis' && (
          <div className="flex-1 w-full h-screen h-[100dvh]">
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

      {/* Premium Floating Bottom Navigation (Material Design 3) */}
      {currentView !== 'jarvis' && (
        <div className={`fixed bottom-0 sm:bottom-8 left-0 right-0 z-50 flex justify-center w-full pointer-events-none transition-transform duration-500 translate-y-0 px-4 pb-6 sm:pb-0 pt-16 bg-gradient-to-t from-white/90 via-white/50 to-transparent dark:from-[#0a0a0a]/90 dark:via-[#0a0a0a]/50 backdrop-blur-[2px]`}>
          <div className="pointer-events-auto flex items-center justify-between sm:justify-center gap-2 sm:gap-8 px-4 py-3 rounded-[2rem] shadow-[0_8px_32px_-4px_rgba(0,0,0,0.1),_0_4px_16px_-4px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_-4px_rgba(0,0,0,0.5),_0_4px_16px_-4px_rgba(0,0,0,0.3)] backdrop-blur-3xl border bg-white/80 dark:bg-[#1a1a1a]/80 border-white/50 dark:border-white/10 w-full sm:w-auto max-w-lg transition-all duration-300">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
              { id: 'study_nav', icon: BookOpen, label: 'Study' }
            ].map((item) => {
              const isSelected = currentView === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleHapticNavigate(item.id)}
                  className={`relative flex-1 sm:flex-none flex flex-col items-center justify-center gap-1.5 transition-all duration-500 group outline-none ${
                    isSelected
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-black/50 dark:text-white/50 hover:text-indigo-600/80 dark:hover:text-indigo-400/80'
                  }`}
                >
                  <div className="relative px-6 py-2 rounded-full flex items-center justify-center transition-colors">
                    {isSelected && (
                      <motion.div 
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-full bg-indigo-50 dark:bg-indigo-500/15 shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_3px_rgba(255,255,255,0.05)]"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <Icon className="w-6 h-6 relative z-10 transition-transform duration-300 group-hover:scale-110 group-active:scale-95" strokeWidth={isSelected ? 2.5 : 2} />
                  </div>
                  <span className={`text-[11px] font-bold tracking-wide transition-all duration-300 ${isSelected ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2 h-0 overflow-hidden'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
            
            {/* Center FAB (AI) */}
            <div className="relative -top-8 sm:-top-10 flex justify-center shrink-0">
              <button
                onClick={() => handleHapticNavigate('ai_nav')}
                className={`group relative p-4 rounded-full flex items-center justify-center transition-all duration-500 outline-none
                  ${currentView === 'ai_nav' ? 'shadow-[0_16px_32px_-8px_rgba(99,102,241,0.8)] scale-105' : 'shadow-[0_12px_24px_-8px_rgba(99,102,241,0.5)] dark:shadow-[0_12px_24px_-8px_rgba(99,102,241,0.4)]'}
                  bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:via-indigo-400 hover:to-cyan-400 text-white
                  hover:-translate-y-1.5 hover:scale-105 hover:shadow-[0_16px_32px_-8px_rgba(99,102,241,0.6)]
                  active:scale-95 active:translate-y-0`}
              >
                <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity blur-md" />
                <Bot className="w-8 h-8 relative z-10 transition-transform duration-300 group-hover:scale-110" strokeWidth={2.5} />
                
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>

            {[
              { id: 'community_nav', icon: Users, label: 'Community' },
              { id: 'profile_nav', icon: User, label: 'Profile' }
            ].map((item) => {
              const isSelected = currentView === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleHapticNavigate(item.id)}
                  className={`relative flex-1 sm:flex-none flex flex-col items-center justify-center gap-1.5 transition-all duration-500 group outline-none ${
                    isSelected
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-black/50 dark:text-white/50 hover:text-indigo-600/80 dark:hover:text-indigo-400/80'
                  }`}
                >
                  <div className="relative px-6 py-2 rounded-full flex items-center justify-center transition-colors">
                    {isSelected && (
                      <motion.div 
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-full bg-indigo-50 dark:bg-indigo-500/15 shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_3px_rgba(255,255,255,0.05)]"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <Icon className="w-6 h-6 relative z-10 transition-transform duration-300 group-hover:scale-110 group-active:scale-95" strokeWidth={isSelected ? 2.5 : 2} />
                  </div>
                  <span className={`text-[11px] font-bold tracking-wide transition-all duration-300 ${isSelected ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2 h-0 overflow-hidden'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
    )}
    </>
  );
}
