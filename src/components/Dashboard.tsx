import React, { useState, useEffect, useRef } from 'react';
import { Clock, Bell, CheckSquare, Award, Play, Pause, RotateCcw, Volume2, Sparkles, Flame } from 'lucide-react';
import { RoutineItem, GoalItem } from '../types';
import { motion } from 'motion/react';

interface DashboardProps {
  currentTime: Date;
  currentTask: RoutineItem | null;
  taskProgress: number;
  goals: GoalItem[];
  alarmTime: string;
  isAlarmEnabled: boolean;
  onToggleAlarm: () => void;
  onSetAlarmTime: (time: string) => void;
  triggerBuzzerDemo: () => void;
  triggerVoiceDemo: () => void;
  onNavigate: (view: string) => void;
  onAwardXP: (amount: number) => void;
}

export default function Dashboard({
  currentTime,
  currentTask,
  taskProgress,
  goals,
  alarmTime,
  isAlarmEnabled,
  onToggleAlarm,
  onSetAlarmTime,
  triggerBuzzerDemo,
  triggerVoiceDemo,
  onNavigate,
  onAwardXP,
}: DashboardProps) {
  const completedGoals = goals.filter((g) => g.completed).length;
  const totalGoals = goals.length;
  const goalsProgress = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  // Active Pomodoro States
  const [pomoTime, setPomoTime] = useState(1500); // 25:00 minutes initial
  const [pomoIsActive, setPomoIsActive] = useState(false);
  const pomoTimerRef = useRef<number | null>(null);

  // Run Pomodoro countdown ticker
  useEffect(() => {
    if (pomoIsActive) {
      pomoTimerRef.current = window.setInterval(() => {
        setPomoTime((prev) => {
          if (prev <= 1) {
            // Completed! Restore defaults and reward user
            setPomoIsActive(false);
            if (pomoTimerRef.current) clearInterval(pomoTimerRef.current);
            setTimeout(() => {
              onAwardXP(250);
              alert('🍅 POMODORO TARGET MET! Focus reward: +250 XP bestowed upon Prince!');
            }, 100);
            return 1500;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (pomoTimerRef.current) {
        clearInterval(pomoTimerRef.current);
      }
    }

    return () => {
      if (pomoTimerRef.current) clearInterval(pomoTimerRef.current);
    };
  }, [pomoIsActive]);

  const handleStartPomo = () => setPomoIsActive(true);
  const handlePausePomo = () => setPomoIsActive(false);
  const handleResetPomo = () => {
    setPomoIsActive(false);
    setPomoTime(1500);
  };

  const formatPomoTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60).toString().padStart(2, '0');
    const secs = (totalSecs % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const timeString = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const dateString = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
      layout
    >
      
      {/* HUD Overview Row: Progress Ring & Pomodoro */}
      <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-6" variants={itemVariants} layout>
        
        {/* Core Ring Card */}
        <motion.div 
          className="lg:col-span-2 bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl relative overflow-hidden transition-all duration-300 hover:border-sky-500/25"
          layout
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold tracking-wider text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot" />
              FOCUS COCKPIT SYSTEM
            </h3>
            <span className="bg-sky-500/10 text-sky-400 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-sky-500/15">
              Live chronometer
            </span>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-around gap-8 py-4">
            {/* Dynamic circle */}
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="68"
                  className="stroke-slate-850"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="68"
                  className="stroke-emerald-500 transition-all duration-500 ease-out"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 68}
                  strokeDashoffset={2 * Math.PI * 68 * (1 - Math.max(0, Math.min(100, taskProgress)) / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-450 to-sky-450 font-mono">
                  {taskProgress}%
                </span>
                <span className="text-[9px] uppercase tracking-widest text-slate-500 mt-1 font-bold">
                  Block progress
                </span>
              </div>
            </div>

            {/* Program details */}
            <div className="flex-1 space-y-3.5 text-center md:text-left">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-emerald-400">
                  Active Timelines
                </span>
                <motion.h4 
                  key={currentTask?.id || 'none'}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-lg font-bold text-white mt-0.5"
                >
                  {currentTask ? currentTask.title : 'No active program scheduled'}
                </motion.h4>
              </div>
              <motion.p 
                key={(currentTask?.desc || 'none') + '-desc'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-slate-400 text-xs sm:text-sm max-w-md leading-relaxed"
              >
                {currentTask ? currentTask.desc : 'Personal transitional slot. Setup buffers.'}
              </motion.p>
              {currentTask && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center md:justify-start gap-3 mt-1.5 text-[10px] font-mono text-slate-500 bg-slate-950/45 py-2 px-3.5 rounded-lg border border-slate-800/40 w-fit"
                >
                  <span>Start: {currentTask.start}</span>
                  <span className="text-slate-755">|</span>
                  <span>End: {currentTask.end}</span>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Pomodoro Timer unit */}
        <motion.div 
          className="bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl flex flex-col justify-between transition-all duration-300 hover:border-rose-500/20 relative overflow-hidden"
          layout
        >
          
          {/* Ambient Glow */}
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-rose-505/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <h3 className="text-xs font-semibold tracking-wider text-slate-400 flex items-center gap-1.5 mb-4 uppercase">
              <Flame className="w-4 h-4 text-rose-505 animate-pulse" />
              Pomodoro Focus Engine
            </h3>
            <div className="bg-slate-950/60 rounded-xl p-4 text-center border border-slate-800/60 font-mono relative overflow-hidden">
              <motion.div 
                key={pomoTime}
                initial={{ scale: 0.95, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-400 tracking-wider"
              >
                {formatPomoTime(pomoTime)}
              </motion.div>
              <span className="text-[9px] uppercase tracking-widest text-slate-500 block mt-1 font-bold">
                Interval Countdown (+250 XP)
              </span>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            {!pomoIsActive ? (
              <button
                onClick={handleStartPomo}
                className="flex-1 py-2 px-3 rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
              >
                Start
              </button>
            ) : (
              <button
                onClick={handlePausePomo}
                className="flex-1 py-2 px-3 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-400 hover:bg-rose-500/15 font-bold text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
              >
                Pause
              </button>
            )}
            <button
              onClick={handleResetPomo}
              className="px-3.5 py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-xs font-bold transition-all"
              title="Reset timer"
            >
              Reset
            </button>
          </div>
        </motion.div>

      </motion.div>

      {/* Clocks, alarm configs & Stats */}
      <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={itemVariants} layout>
        
        {/* Clock Card */}
        <motion.div className="bg-slate-900/30 border border-slate-800/60 rounded-xl p-5 hover:border-violet-500/20 transition-all font-mono" layout>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
              System UTC Clock
            </span>
            <Clock className="w-3.5 h-3.5 text-violet-400" />
          </div>
          <div className="text-2xl font-black text-violet-400 tracking-wider">
            {timeString}
          </div>
          <span className="text-[9px] text-slate-550 block mt-1 font-sans">
            {dateString}
          </span>
        </motion.div>

        {/* Alarm Card */}
        <motion.div className="bg-slate-900/30 border border-slate-800/60 rounded-xl p-5 hover:border-amber-500/20 transition-all" layout>
          <div className="flex items-center justify-between mb-2 inline-flex w-full">
            <span className="text-[10px] font-bold tracking-widest text-slate-550 uppercase">
              Morning Alarm Wakeup
            </span>
            <Bell className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="flex items-center gap-2.5">
            <input
              type="time"
              value={alarmTime}
              onChange={(e) => onSetAlarmTime(e.target.value)}
              className="bg-slate-950 border border-slate-800/80 px-2 py-1 rounded-lg text-xs text-amber-400 font-mono focus:outline-none w-20"
            />
            <button
              onClick={onToggleAlarm}
              className={`flex-1 py-1 px-2.5 rounded text-[10px] font-bold uppercase transition-all border font-mono ${
                isAlarmEnabled
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/15'
                  : 'bg-slate-850 hover:bg-slate-800 border-slate-750 text-slate-500'
              }`}
            >
              {isAlarmEnabled ? 'Enabled' : 'Muted'}
            </button>
          </div>
        </motion.div>

        {/* Directives completion */}
        <motion.div className="bg-slate-900/30 border border-slate-800/60 rounded-xl p-5 hover:border-emerald-500/20 transition-all" layout>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
              Directives Matrix
            </span>
            <CheckSquare className="w-3.5 h-3.5 text-emerald-450" />
          </div>
          <motion.div 
            key={`${completedGoals}-${totalGoals}`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-2xl font-bold font-mono text-emerald-400"
          >
            {completedGoals} / {totalGoals}
          </motion.div>
          <div className="w-full bg-slate-950 rounded-full h-1 mt-2.5">
            <motion.div
              layout
              className="bg-emerald-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${goalsProgress}%` }}
            />
          </div>
        </motion.div>

      </motion.div>

      {/* Audio Engine Acoustics evaluation */}
      <motion.div 
        variants={itemVariants}
        layout
        className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden transition-all duration-300 hover:border-sky-500/20"
      >
        <h3 className="text-sm font-bold text-white mb-1.5 flex items-center gap-2 uppercase tracking-wide">
          <Volume2 className="w-4 h-4 text-sky-400" />
          System Acoustics Demonstrator
        </h3>
        <p className="text-xs text-slate-400 mb-4 max-w-xl">
          Instantly execute the custom synthesizer bell and voice announcement triggers to test system acoustics and speakers in your browser.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={triggerBuzzerDemo}
            className="flex items-center justify-center gap-2.5 p-3.5 rounded-xl border border-rose-500/15 bg-rose-500/5 hover:bg-rose-500/15 text-rose-300 font-bold text-xs transition-all shadow active:scale-95 cursor-pointer uppercase font-mono tracking-wider "
          >
            <Bell className="w-4.5 h-4.5 text-rose-450" />
            Buzzer test
          </button>
          
          <button
            onClick={triggerVoiceDemo}
            className="flex items-center justify-center gap-2.5 p-3.5 rounded-xl border border-sky-500/15 bg-sky-500/5 hover:bg-sky-500/15 text-sky-300 font-bold text-xs transition-all shadow active:scale-95 cursor-pointer uppercase font-mono tracking-wider "
          >
            <Volume2 className="w-4.5 h-4.5 text-sky-405" />
            Voice test
          </button>
        </div>
      </motion.div>

    </motion.div>
  );
}

