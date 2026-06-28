import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Trophy, Target, TrendingUp, Award, Zap, Flame, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';

const Focus = React.memo(function Focus({ onAwardXP }: { onAwardXP?: (amount: number) => void }) {
  const [mode, setMode] = useState<'pomodoro' | 'stopwatch'>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);

  // Stats
  const [streak, setStreak] = useState(3);
  const [focusScore, setFocusScore] = useState(85);
  const [totalFocusTime, setTotalFocusTime] = useState(120);

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      if (mode === 'pomodoro' && timeLeft > 0) {
        interval = setInterval(() => {
          setTimeLeft((prev) => prev - 1);
        }, 1000);
      } else if (mode === 'stopwatch') {
        interval = setInterval(() => {
          setTimeLeft((prev) => prev + 1);
        }, 1000);
      } else if (mode === 'pomodoro' && timeLeft === 0) {
        setIsActive(false);
        setSessionCount((prev) => prev + 1);
        setTotalFocusTime((prev) => prev + 25);
        if (onAwardXP) onAwardXP(50);
        alert('Focus session completed! +50 XP');
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode, onAwardXP]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'pomodoro' ? 25 * 60 : 0);
  };

  const switchMode = (newMode: 'pomodoro' | 'stopwatch') => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === 'pomodoro' ? 25 * 60 : 0);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      className="space-y-6 sm:space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-3">
            <Flame className="w-8 h-8 text-orange-500" />
            Focus
          </h2>
          <p className="text-sm font-medium opacity-60 tracking-wide uppercase">Deep Work Sessions</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Study Streak', value: `${streak} Days`, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Focus Score', value: focusScore, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Sessions', value: sessionCount, icon: Target, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
          { label: 'Total Focus', value: `${Math.floor(totalFocusTime / 60)}h ${totalFocusTime % 60}m`, icon: Trophy, color: 'text-purple-500', bg: 'bg-purple-500/10' }
        ].map((stat, i) => (
          <div key={i} className="p-4 sm:p-5 rounded-2xl sm:rounded-[1.5rem] backdrop-blur-2xl border bg-white/[0.03] border-black/5 dark:border-white/10 shadow-lg flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest opacity-50">{stat.label}</p>
              <p className="text-lg sm:text-xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Timer UI */}
        <div className="md:col-span-2 p-8 sm:p-12 rounded-[2rem] backdrop-blur-2xl border bg-white/[0.03] border-black/5 dark:border-white/10 shadow-xl flex flex-col items-center justify-center relative overflow-hidden group">
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-96 sm:h-96 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none transition-all duration-1000 ${isActive ? 'bg-orange-500/30 dark:bg-orange-500/20 scale-110' : 'bg-black/5 dark:bg-white/5 scale-90'}`} />
          
          <div className="flex bg-black/5 dark:bg-white/5 p-1.5 rounded-full border border-black/5 dark:border-white/10 z-10 mb-8 sm:mb-12">
            <button 
              onClick={() => switchMode('pomodoro')}
              className={`px-6 sm:px-8 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold uppercase tracking-widest transition-all duration-300 ${mode === 'pomodoro' ? 'bg-white dark:bg-black text-black dark:text-white shadow-lg' : 'opacity-50 hover:opacity-100'}`}
            >
              Pomodoro
            </button>
            <button 
              onClick={() => switchMode('stopwatch')}
              className={`px-6 sm:px-8 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold uppercase tracking-widest transition-all duration-300 ${mode === 'stopwatch' ? 'bg-white dark:bg-black text-black dark:text-white shadow-lg' : 'opacity-50 hover:opacity-100'}`}
            >
              Stopwatch
            </button>
          </div>

          <div className="text-[5rem] sm:text-[8rem] font-black tracking-tighter tabular-nums leading-none z-10 font-mono text-transparent bg-clip-text bg-gradient-to-b from-black to-black/60 dark:from-white dark:to-white/60 drop-shadow-sm mb-4">
            {formatTime(timeLeft)}
          </div>

          <p className={`font-mono text-xs sm:text-sm tracking-[0.2em] font-bold z-10 transition-colors duration-500 ${isActive ? 'text-orange-500' : 'opacity-40'}`}>
            {mode === 'pomodoro' ? 'DEEP FOCUS SESSION' : 'OPEN FOCUS TRACKING'}
          </p>

          <div className="flex gap-4 sm:gap-6 mt-10 sm:mt-12 z-10">
            <button
              onClick={toggleTimer}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${isActive ? 'bg-black/10 dark:bg-white/10 text-black dark:text-white hover:scale-105 border border-black/10 dark:border-white/10' : 'bg-gradient-to-br from-orange-500 to-red-500 text-white hover:scale-105 shadow-orange-500/30'}`}
            >
              {isActive ? <Pause className="w-6 h-6 sm:w-8 sm:h-8" /> : <Play className="w-6 h-6 sm:w-8 sm:h-8 ml-1" />}
            </button>
            <button
              onClick={resetTimer}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-300 flex items-center justify-center"
            >
              <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 opacity-70" />
            </button>
          </div>
        </div>

        {/* Targets & Achievements */}
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-[2rem] backdrop-blur-2xl border bg-white/[0.03] border-black/5 dark:border-white/10 shadow-xl">
            <h3 className="text-sm font-bold uppercase tracking-widest opacity-60 mb-6 flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-500" /> Daily Targets
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Complete 4 Pomodoros', progress: 50 },
                { label: 'Read Physics Ch.3', progress: 0 },
                { label: 'Code 2 Hours', progress: 75 }
              ].map((target, idx) => (
                <div key={idx} className="p-3 sm:p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-transparent hover:border-black/5 dark:hover:border-white/10 transition-colors">
                  <div className="flex justify-between text-xs sm:text-sm font-bold mb-3">
                    <span>{target.label}</span>
                    <span className="text-indigo-500">{target.progress}%</span>
                  </div>
                  <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-1.5 sm:h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-1000" style={{ width: `${target.progress}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 sm:p-8 rounded-[2rem] backdrop-blur-2xl border bg-white/[0.03] border-black/5 dark:border-white/10 shadow-xl">
            <h3 className="text-sm font-bold uppercase tracking-widest opacity-60 mb-6 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" /> Achievements
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Iron Focus', desc: '10 hours total study', unlocked: true },
                { label: 'Master of Time', desc: '50 pomodoros', unlocked: false },
                { label: 'Early Bird', desc: 'Wake up 5AM 3x', unlocked: true }
              ].map((ach, idx) => (
                <div key={idx} className={`flex items-center gap-4 p-3 sm:p-4 rounded-2xl border transition-all ${ach.unlocked ? 'bg-amber-500/10 border-amber-500/20 shadow-sm' : 'bg-black/5 dark:bg-white/5 border-transparent opacity-50'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${ach.unlocked ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30' : 'bg-black/10 dark:bg-white/10'}`}>
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`text-xs sm:text-sm font-bold ${ach.unlocked ? 'text-amber-600 dark:text-amber-400' : ''}`}>{ach.label}</p>
                    <p className="text-[10px] sm:text-xs font-medium opacity-60 mt-0.5">{ach.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
});

export default Focus;
