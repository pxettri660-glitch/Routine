import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Trophy, Target, TrendingUp, Award, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export default function Focus({ onAwardXP }: { onAwardXP?: (amount: number) => void }) {
  const [mode, setMode] = useState<'pomodoro' | 'stopwatch'>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);

  // Stats
  const [streak, setStreak] = useState(3);
  const [focusScore, setFocusScore] = useState(85);
  const [totalFocusTime, setTotalFocusTime] = useState(120); // in minutes

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((timeLeft) => timeLeft - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      clearInterval(interval);
      setIsActive(false);
      setSessionCount((prev) => prev + 1);
      setTotalFocusTime((prev) => prev + (mode === 'pomodoro' ? 25 : 0));
      if (onAwardXP) onAwardXP(50);
      alert('Focus session completed! +50 XP');
    }
    return () => clearInterval(interval);
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

  useEffect(() => {
    if (mode === 'stopwatch' && isActive) {
      const interval = setInterval(() => {
        setTimeLeft((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [mode, isActive]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      
      {/* Header Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl flex items-center gap-4 shadow-lg backdrop-blur-sm">
          <div className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Study Streak</p>
            <p className="text-xl font-black text-slate-200">{streak} Days</p>
          </div>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl flex items-center gap-4 shadow-lg backdrop-blur-sm">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Focus Score</p>
            <p className="text-xl font-black text-slate-200">{focusScore}</p>
          </div>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl flex items-center gap-4 shadow-lg backdrop-blur-sm">
          <div className="w-10 h-10 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Sessions</p>
            <p className="text-xl font-black text-slate-200">{sessionCount}</p>
          </div>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl flex items-center gap-4 shadow-lg backdrop-blur-sm">
          <div className="w-10 h-10 rounded-full bg-violet-500/10 text-violet-400 flex items-center justify-center">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Total Focus</p>
            <p className="text-xl font-black text-slate-200">{Math.floor(totalFocusTime / 60)}h {totalFocusTime % 60}m</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Timer UI */}
        <div className="md:col-span-2 bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 flex flex-col items-center justify-center relative shadow-xl backdrop-blur-md overflow-hidden">
          {/* Ambient Glow */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-[100px] opacity-20 pointer-events-none transition-colors duration-1000 ${isActive ? 'bg-sky-500' : 'bg-slate-500'}`} />
          
          <div className="flex bg-slate-950/50 rounded-full p-1.5 border border-slate-800/50 z-10 mb-8">
            <button 
              onClick={() => switchMode('pomodoro')}
              className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all ${mode === 'pomodoro' ? 'bg-sky-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.3)]' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Pomodoro
            </button>
            <button 
              onClick={() => switchMode('stopwatch')}
              className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all ${mode === 'stopwatch' ? 'bg-sky-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.3)]' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Stopwatch
            </button>
          </div>

          <div className="text-[6rem] sm:text-[8rem] font-black tracking-tighter tabular-nums leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 z-10 drop-shadow-2xl font-mono">
            {formatTime(timeLeft)}
          </div>

          <p className="text-sky-400 font-mono text-sm tracking-[0.2em] font-bold mt-4 z-10">
            {mode === 'pomodoro' ? 'DEEP FOCUS SESSION' : 'OPEN FOCUS TRACKING'}
          </p>

          <div className="flex gap-4 mt-10 z-10">
            <button
              onClick={toggleTimer}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.4)]' : 'bg-sky-500 text-white shadow-[0_0_20px_rgba(14,165,233,0.4)] hover:scale-105'}`}
            >
              {isActive ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 translate-x-0.5" />}
            </button>
            <button
              onClick={resetTimer}
              className="w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all hover:scale-105"
            >
              <Square className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Targets & Achievements */}
        <div className="space-y-6">
          
          {/* Daily Targets */}
          <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl shadow-xl backdrop-blur-sm">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-sky-400" /> Daily Targets
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Complete 4 Pomodoros', progress: 50 },
                { label: 'Read Physics Ch.3', progress: 0 },
                { label: 'Code 2 Hours', progress: 75 }
              ].map((target, idx) => (
                <div key={idx} className="bg-slate-950/50 rounded-xl p-3 border border-slate-800/50">
                  <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                    <span>{target.label}</span>
                    <span className="text-sky-400">{target.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div className="bg-sky-500 h-1.5 rounded-full" style={{ width: `${target.progress}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl shadow-xl backdrop-blur-sm">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" /> Achievements
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Iron Focus', desc: '10 hours total study', unlocked: true },
                { label: 'Master of Time', desc: '50 pomodoros', unlocked: false },
                { label: 'Early Bird', desc: 'Wake up 5AM 3x', unlocked: true }
              ].map((ach, idx) => (
                <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl border ${ach.unlocked ? 'bg-amber-500/10 border-amber-500/20' : 'bg-slate-950/50 border-slate-800/50 opacity-50'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${ach.unlocked ? 'bg-amber-500 text-white shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-slate-800 text-slate-500'}`}>
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${ach.unlocked ? 'text-amber-400' : 'text-slate-400'}`}>{ach.label}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{ach.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
