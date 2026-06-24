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
  Cpu
} from 'lucide-react';

import { RoutineItem, GoalItem, NoteItem, AudioTrack } from './types';
import Dashboard from './components/Dashboard';
import Routine from './components/Routine';
import Goals from './components/Goals';
import Notes from './components/Notes';
import CalendarBS from './components/CalendarBS';
import Jarvis from './components/Jarvis';
import Entertainment from './components/Entertainment';

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
    title: "Prince Engine Manual",
    content: "👑 WELCOME TO PRINCE ENGINE v5 — ULTIMATE PRODUCTION COCKPIT\n=======================================================\n\nThis system is fully automated. \nIt runs a dedicated local scheduler to track sequence directives seamlessly.\n\n⚡ SPECIAL CONTROLS:\n• Synthesizer Alarms: Tested and triggered at scheduled intervals.\n• Multi-Page Notebook: Formatted specifically for syllabus concepts and homework proofs.\n• Browser Focus Synthesizers: Built-in binaural study beats located in the Audio Beats tab.\n• Jarvis Ultra X Assistant: Fully voice-integrated companion utilizing Google Gemini models on the server.\n\nStay consistent!",
    category: "Scratchpad",
    updatedAt: new Date().toLocaleString()
  }
];

export default function App() {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isThemeLight, setIsThemeLight] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Gamification Engine State
  const [currentXP, setCurrentXP] = useState<number>(() => {
    const local = localStorage.getItem('prince_xp');
    return local ? parseInt(local) : 0;
  });

  const [currentLevel, setCurrentLevel] = useState<number>(() => {
    const local = localStorage.getItem('prince_level');
    return local ? parseInt(local) : 1;
  });

  // Controls for active Jarvis cockpit style ("cyan", "red", "purple", "gold")
  const [jarvisTheme, setJarvisTheme] = useState<'cyan' | 'red' | 'purple' | 'gold'>('cyan');

  // Core schedules and local-database states with client-side persistence
  const [routines, setRoutines] = useState<RoutineItem[]>(() => {
    const local = localStorage.getItem('prince_routines');
    return local ? JSON.parse(local) : DEFAULT_ROUTINES;
  });

  const [goals, setGoals] = useState<GoalItem[]>(() => {
    const local = localStorage.getItem('prince_goals');
    return local ? JSON.parse(local) : DEFAULT_GOALS;
  });

  const [notes, setNotes] = useState<NoteItem[]>(() => {
    const local = localStorage.getItem('prince_notes');
    return local ? JSON.parse(local) : DEFAULT_NOTES;
  });

  // Music state synchronization
  const [loadedTracks, setLoadedTracks] = useState<AudioTrack[]>(() => {
    const local = localStorage.getItem('prince_tracks');
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

  // Sync state data to storage
  useEffect(() => {
    localStorage.setItem('prince_routines', JSON.stringify(routines));
  }, [routines]);

  useEffect(() => {
    localStorage.setItem('prince_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('prince_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('prince_tracks', JSON.stringify(loadedTracks));
  }, [loadedTracks]);

  useEffect(() => {
    localStorage.setItem('prince_xp', currentXP.toString());
  }, [currentXP]);

  useEffect(() => {
    localStorage.setItem('prince_level', currentLevel.toString());
  }, [currentLevel]);

  // Clock runner ticker thread
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // XP addition and Level coordination
  const handleAwardXP = (amount: number) => {
    setCurrentXP((prevXP) => {
      let nextXP = prevXP + amount;
      let nextLevel = currentLevel;
      const threshold = nextLevel * 500;

      if (nextXP >= threshold) {
        nextXP -= threshold;
        nextLevel += 1;
        setCurrentLevel(nextLevel);
        setTimeout(() => {
          speakVoiceAnnouncement(`Congratulations Prince. Performance milestone crossed. You have leveled up to Level ${nextLevel}!`);
          alert(`👑 LEVEL UP! Prince is now Level ${nextLevel}!`);
        }, 100);
      } else if (nextXP < 0) {
        nextXP = 0;
      }
      return nextXP;
    });
  };

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
        speakVoiceAnnouncement("Wake up Prince! It is time to wake up and start your ultimate morning routing.");
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
        speakVoiceAnnouncement(`Attention Prince, scheduling change detected. It is time for ${activeTask.title}`);
      }
    } else if (!activeTask && lastAnnouncedTaskIdRef.current !== 'idle') {
      lastAnnouncedTaskIdRef.current = 'idle';
      speakVoiceAnnouncement("Take a quick break Prince. You are currently in a personal transition slot.");
    }
  }, [currentTime, routines, alarmTime, isAlarmEnabled, activeTask]);

  // Triggers for browser evaluation center
  const runBuzzerDemoTester = () => {
    let count = 0;
    const interval = setInterval(() => {
      playSoundAlarmBeep();
      count++;
      if (count >= 3) clearInterval(interval);
    }, 550);
  };

  const runSpeechDemoTester = () => {
    speakVoiceAnnouncement("Acoustic synthesis complete. Prince Engine operations are fully active and calibrated!");
  };

  const dismissAlarmTrigger = () => {
    setIsAlarmActive(false);
    window.speechSynthesis.cancel();
  };

  const loadDemoSequences = () => {
    setRoutines(DEFAULT_ROUTINES);
  };

  // Select tone styling based on current Jarvis settings
  const getJarvisThemeClass = () => {
    if (jarvisTheme === 'red') return 'theme-red';
    if (jarvisTheme === 'purple') return 'theme-purple';
    if (jarvisTheme === 'gold') return 'theme-gold';
    return '';
  };

  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-all duration-300 ${getJarvisThemeClass()} ${
      isThemeLight 
        ? 'bg-slate-100 text-slate-800' 
        : 'bg-slate-950 text-slate-100'
    }`}>
      
      {/* Sidebar navigation system layout */}
      <aside className={`w-full md:w-64 flex-shrink-0 md:min-h-screen border-b md:border-b-0 md:border-r transition-all duration-300 z-10 ${
        isThemeLight 
          ? 'bg-white border-slate-200 shadow-md' 
          : 'bg-slate-900/60 border-slate-900 shadow-2xl'
      }`}>
        <div className="p-5 flex items-center justify-between border-b border-slate-800/10">
          <div className="flex items-center gap-3">
            <span className="text-xl">👑</span>
            <div className="leading-none">
              <h1 className="text-sm font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">
                PRINCE ENGINE
              </h1>
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-violet-400">
                V5 · ULTIMATE AI
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setIsThemeLight(!isThemeLight)}
              className="p-1.5 rounded-lg border border-slate-800 flex items-center justify-center hover:bg-slate-800"
            >
              {isThemeLight ? <Moon className="w-4 h-4 text-slate-600" /> : <Sun className="w-4 h-4 text-amber-450" />}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Sidebar Nav items wrapper */}
        <nav className={`p-4 space-y-1.5 flex-col md:flex ${
          isMobileMenuOpen ? 'flex border-b border-slate-800/20' : 'hidden md:flex'
        }`}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-sky-450' },
            { id: 'routine', label: 'Daily Routine', icon: Sliders, color: 'text-indigo-400' },
            { id: 'goals', label: 'Goals Matrix', icon: Target, color: 'text-emerald-450' },
            { id: 'calendar', label: 'Calendar AD/BS', icon: CalendarIcon, color: 'text-amber-500' },
            { id: 'jarvis', label: 'Jarvis Ultra X', icon: Bot, color: 'text-cyan-400', specialBorder: true },
            { id: 'tools', label: 'Utilities & Timer', icon: FileText, color: 'text-violet-400' },
            { id: 'music', label: 'Audio Beats', icon: Music, color: 'text-rose-450' },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer border ${
                  isSelected
                    ? isThemeLight
                      ? 'bg-slate-100 border-slate-350 text-sky-650 shadow-sm font-black'
                      : 'bg-sky-500/[0.04] border-sky-505/25 text-sky-400'
                    : item.specialBorder
                    ? 'border-cyan-400/20 hover:border-cyan-400/50 text-cyan-400/80 hover:text-cyan-400'
                    : isThemeLight
                    ? 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-805'
                    : 'border-transparent text-slate-400 hover:bg-slate-900/40 hover:text-white'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isSelected ? item.color : 'text-slate-500'}`} />
                {item.label}
              </button>
            );
          })}

          {/* Quick theme toggler control inside sidebar */}
          <div className="pt-4 border-t border-slate-800/20 mt-4 space-y-2">
            <button
              onClick={() => setIsThemeLight(!isThemeLight)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-slate-800 hover:border-slate-700 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer hover:bg-slate-900/20 text-slate-400 hover:text-white"
            >
              {isThemeLight ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
              {isThemeLight ? 'Dark Matrix Mode' : 'Light Theme'}
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Panel Core screen space */}
      <main className="flex-1 flex flex-col min-w-0 md:h-screen md:overflow-y-auto">
        
        {/* Urgent Warning Banner notification for alarms */}
        <AnimatePresence>
          {isAlarmActive && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-gradient-to-r from-rose-600 to-amber-655 text-white font-bold px-6 py-4.5 shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4 z-40 border-b border-rose-500/20"
            >
              <div className="flex items-center gap-3">
                <AlertOctagon className="w-6 h-6 animate-bounce" />
                <div className="text-center sm:text-left">
                  <h4 className="text-sm font-extrabold uppercase tracking-widest text-white">
                    ⚠️ ALARM SEQUENCE IN PROCESS
                  </h4>
                  <p className="text-[11px] opacity-90 font-mono mt-0.5">
                    Triggered wake-up buzzer sequence. Time: {currentTime.toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <button
                onClick={dismissAlarmTrigger}
                className="bg-white text-rose-600 hover:bg-slate-100 font-extrabold text-xs px-5 py-2 rounded-xl transition-all shadow active:scale-95 cursor-pointer uppercase tracking-wider flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                Dismiss Alarm
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard Top bar view indicator HUD */}
        <header className={`px-6 py-5 border-b border-slate-800/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isThemeLight ? 'bg-white' : 'bg-slate-950/20'
        }`}>
          <div>
            <h2 className="text-lg font-black tracking-tight uppercase font-sans text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
              PRINCE COMMAND EXECUTIVE COCKPIT
            </h2>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-mono">
              Workspace & Active Schedulers • Viewing {currentView}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 text-[10px] font-mono leading-none tracking-widest font-bold py-2 px-4 rounded-full border bg-emerald-500/10 border-emerald-500/35 text-emerald-400 w-fit self-start uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot" />
            Engine Active
          </div>
        </header>

        {/* Active main screen tabs container with frame animation wrapper */}
        <section className="flex-grow p-6 md:p-8 space-y-6">
          
          {/* Global Gamification level-container block HUD */}
          <div className="w-full max-w-6xl mx-auto">
            <div className={`border rounded-2xl p-4.5 shadow-md relative overflow-hidden transition-all duration-300 ${
              isThemeLight ? 'bg-white border-slate-200' : 'bg-slate-900/30 border-slate-800/80'
            }`}>
              {/* background ambient blur */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-400/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex justify-between items-center mb-2 font-mono text-[11px] font-extrabold tracking-wider">
                <span className="text-sky-400 uppercase flex items-center gap-1">
                  👑 PRINCE COGNITION STAGE: LEVEL {currentLevel}
                </span>
                <span className="text-slate-500">
                  {currentXP} / {currentLevel * 500} XP
                </span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-850">
                <div
                  className="bg-gradient-to-r from-violet-500 to-sky-400 h-full transition-all duration-500"
                  style={{ width: `${(currentXP / (currentLevel * 500)) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-6xl mx-auto"
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
                  onNavigate={(view) => setCurrentView(view)}
                  onAwardXP={handleAwardXP}
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

              {currentView === 'jarvis' && (
                <Jarvis
                  onNavigate={(v) => setCurrentView(v)}
                  selectedTheme={jarvisTheme}
                  onChangeTheme={setJarvisTheme}
                  isThemeLight={isThemeLight}
                  onToggleLightDarkTheme={() => setIsThemeLight(!isThemeLight)}
                />
              )}

              {currentView === 'tools' && (
                <Notes
                  notes={notes}
                  onUpdateNotes={setNotes}
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
            </motion.div>
          </AnimatePresence>
        </section>

        {/* Bottom signature block */}
        <footer className={`py-6 text-center text-slate-500 border-t border-slate-800/10 ${
          isThemeLight ? 'bg-slate-50' : 'bg-slate-950/20'
        }`}>
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#a78bfa] font-mono leading-none">
            PRINCE ENGINE OPERATIONAL
          </h3>
          <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-widest font-mono">
            Designed for Ultimate Productivity Execution Cockpit
          </p>
        </footer>

      </main>
    </div>
  );
}
