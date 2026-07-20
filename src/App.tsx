import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Mail } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';

import { useAuth } from './contexts/AuthContext';
import { useUserData } from './hooks/useUserData';
import { useAlarmSystem } from './hooks/useAlarmSystem';
import { useXP } from './hooks/useXP';
import { getMinutesOfDay, isTaskActive } from './utils/time';

import WelcomeScreen from './components/WelcomeScreen';
import { BottomNav } from './layouts/BottomNav';

// Views
import Dashboard from './components/Dashboard';
import Goals from './components/Goals';
import CalendarBS from './components/CalendarBS';
import Focus from './components/focus/Focus';
import Notes from './components/Notes';
import Entertainment from './components/entertainment/Entertainment';
import UserProfile from './components/UserProfile';
import Tasks from './components/Tasks';
import AdminPanel from './components/AdminPanel';
import More from './components/More';
import StudyNav from './components/StudyNav';
import AINav from './components/AINav';
import CommunityNav from './components/CommunityNav';
import CodePractice from './components/CodePractice';
import ProfileNav from './components/ProfileNav';
import Jarvis from './components/jarvis/Jarvis';

export default function App() {
  const { user, loading: authLoading, logout } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [currentView, setCurrentView] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || 'dashboard';
  });

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isAlarmActive, setIsAlarmActive] = useState<boolean>(false);
  const lastAnnouncedTaskIdRef = useRef<string | null>(null);

  const { speakVoiceAnnouncement, playSoundAlarmBeep, playMilestonePing } = useAlarmSystem();

  const {
    routines, goals, setGoals, notes, setNotes, tasks, setTasks,
    loadedTracks, setLoadedTracks, currentXP, setCurrentXP,
    currentLevel, setCurrentLevel, xpHistory, setXpHistory,
    stats, achievements, isThemeLight, setIsThemeLight,
    jarvisTheme, setJarvisTheme, alarmTime, setAlarmTime, isAlarmEnabled, setIsAlarmEnabled
  } = useUserData();

  const { handleAwardXP } = useXP({
    currentXP,
    currentLevel,
    xpHistory,
    setCurrentXP,
    setCurrentLevel,
    setXpHistory,
    playMilestonePing,
    speakVoiceAnnouncement
  });

  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

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

  useEffect(() => {
    const splashTimer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(splashTimer);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      Notification.requestPermission().catch(console.error);
    }
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

  // Clock
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Alarm and Routine logic
  const activeTask = routines.find((task) => isTaskActive(task.start, task.end, currentTime)) || null;
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

  useEffect(() => {
    const hh = currentTime.getHours();
    const mm = currentTime.getMinutes();
    const ss = currentTime.getSeconds();

    const alarmParts = alarmTime.split(':');
    const matchesAlarmTime = 
      isAlarmEnabled && 
      alarmParts.length === 2 && 
      hh === Number(alarmParts[0]) && 
      mm === Number(alarmParts[1]);

    if (matchesAlarmTime) {
      setIsAlarmActive(true);
      if (ss % 2 === 0) playSoundAlarmBeep();
      if (ss === 0 || ss === 20 || ss === 40) {
        speakVoiceAnnouncement("Wake up! It is time to wake up and start your ultimate morning routing.");
      }
    } else {
      if (isAlarmActive && ss === 0) setIsAlarmActive(false);
    }

    if (activeTask && lastAnnouncedTaskIdRef.current !== activeTask.id) {
      lastAnnouncedTaskIdRef.current = activeTask.id;
      if (!matchesAlarmTime) {
        playMilestonePing();
        speakVoiceAnnouncement(`Attention, scheduling change detected. It is time for ${activeTask.title}`);
      }
    } else if (!activeTask && lastAnnouncedTaskIdRef.current !== 'idle') {
      lastAnnouncedTaskIdRef.current = 'idle';
      speakVoiceAnnouncement("Take a quick break. You are currently in a personal transition slot.");
    }
  }, [currentTime, alarmTime, isAlarmEnabled, activeTask, playSoundAlarmBeep, speakVoiceAnnouncement, playMilestonePing, isAlarmActive]);

  const getJarvisThemeClass = () => {
    if (jarvisTheme === 'red') return 'theme-red';
    if (jarvisTheme === 'purple') return 'theme-purple';
    if (jarvisTheme === 'gold') return 'theme-gold';
    return 'theme-cyan';
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard currentTime={currentTime} currentTask={activeTask} taskProgress={taskProgress} goals={goals} alarmTime={alarmTime} isAlarmEnabled={isAlarmEnabled} onToggleAlarm={() => setIsAlarmEnabled(!isAlarmEnabled)} onSetAlarmTime={setAlarmTime} triggerBuzzerDemo={() => playSoundAlarmBeep()} triggerVoiceDemo={() => speakVoiceAnnouncement('Demo announcement')} onNavigate={handleNavigate} onAwardXP={handleAwardXP} xpHistory={xpHistory} />;
      case 'goals':
        return <Goals goals={goals} onUpdateGoals={setGoals} onAwardXP={handleAwardXP} />;
      case 'calendar':
        return <CalendarBS />;
      case 'focus':
        return <Focus onAwardXP={handleAwardXP} />;
      case 'tools':
        return <Notes notes={notes} onUpdateNotes={setNotes} isThemeLight={isThemeLight} onToggleTheme={() => setIsThemeLight(!isThemeLight)} />;
      case 'music':
        return <Entertainment loadedTracks={loadedTracks} onUploadTracks={setLoadedTracks} audioElementRef={audioElementRef} currentTrackIndex={currentTrackIndex} setCurrentTrackIndex={setCurrentTrackIndex} isPlaying={isPlaying} setIsPlaying={setIsPlaying} />;
      case 'profile':
        return <UserProfile currentLevel={currentLevel} currentXP={currentXP} stats={stats} achievements={achievements} />;
      case 'tasks':
        return <Tasks tasks={tasks} onUpdateTasks={setTasks} onAwardXP={handleAwardXP} />;
      case 'admin':
        return <AdminPanel />;
      case 'more':
        return <More onNavigate={handleNavigate} />;
      case 'study_nav':
        return <StudyNav onNavigate={handleNavigate} />;
      case 'ai_nav':
        return <AINav onNavigate={handleNavigate} />;
      case 'community_nav':
        return <CommunityNav onNavigate={handleNavigate} />;
      case 'code-practice':
        return <CodePractice onAwardXP={handleAwardXP} />;
      case 'profile_nav':
        return <ProfileNav onNavigate={handleNavigate} isThemeLight={isThemeLight} onToggleTheme={() => setIsThemeLight(!isThemeLight)} />;
      default:
        return <Dashboard currentTime={currentTime} currentTask={activeTask} taskProgress={taskProgress} goals={goals} alarmTime={alarmTime} isAlarmEnabled={isAlarmEnabled} onToggleAlarm={() => setIsAlarmEnabled(!isAlarmEnabled)} onSetAlarmTime={setAlarmTime} triggerBuzzerDemo={() => playSoundAlarmBeep()} triggerVoiceDemo={() => speakVoiceAnnouncement('Demo announcement')} onNavigate={handleNavigate} onAwardXP={handleAwardXP} xpHistory={xpHistory} />;
    }
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

      {!showSplash && !authLoading && !user && <WelcomeScreen />}

      {!showSplash && !authLoading && user && (
        <div className={`min-h-screen min-h-screen h-[100dvh] flex flex-col transition-all duration-300 ${getJarvisThemeClass()} bg-transparent`}>
          {!user.emailVerified && (
            <div className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2 z-50 relative">
              <Mail className="w-4 h-4" />
              Please verify your email address ({user.email}). 
              <button onClick={() => window.location.reload()} className="underline font-bold ml-2">Refresh</button>
            </div>
          )}
          
          <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {!isThemeLight && (
              <>
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full mix-blend-screen filter blur-[80px] opacity-20 bg-gradient-to-br from-sky-400 to-blue-600 will-change-transform transform-gpu" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full mix-blend-screen filter blur-[80px] opacity-20 bg-gradient-to-tr from-violet-400 to-fuchsia-600 will-change-transform transform-gpu" />
              </>
            )}
            <div className={`absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] ${isThemeLight ? 'opacity-10 mix-blend-multiply' : 'opacity-20 brightness-100 contrast-150 mix-blend-overlay'}`}></div>
          </div>

          <main id="main-scroll-container" className={`flex-1 flex flex-col min-w-0 relative z-10 ${currentView !== 'jarvis' ? 'h-screen h-[100dvh] overflow-y-auto overflow-x-hidden' : ''}`}>
            {currentView !== 'jarvis' && (
              <>
                {isAlarmActive && (
                  <div className="sticky top-0 z-50 bg-red-500 text-white px-4 py-3 flex items-center justify-between shadow-lg animate-pulse">
                    <div className="font-bold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                      ALARM ACTIVE - WAKE UP
                    </div>
                    <button onClick={() => { setIsAlarmActive(false); window.speechSynthesis.cancel(); }} className="px-4 py-1.5 bg-black/20 hover:bg-black/30 rounded-full font-bold text-sm transition-colors">DISMISS</button>
                  </div>
                )}
                
                <section className="flex-1 w-full max-w-[1600px] mx-auto pb-24 sm:pb-32 relative">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentView}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="w-full max-w-4xl mx-auto"
                    >
                      {renderView()}
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

          {currentView !== 'jarvis' && (
            <BottomNav currentView={currentView} onNavigate={handleHapticNavigate} />
          )}
        </div>
      )}
    </>
  );
}
