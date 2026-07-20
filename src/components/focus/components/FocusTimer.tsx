import React from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface FocusTimerProps {
  mode: 'pomodoro' | 'stopwatch';
  switchMode: (mode: 'pomodoro' | 'stopwatch') => void;
  isFullscreen: boolean;
  isActive: boolean;
  timeLeft: number;
  formatTime: (sec: number) => string;
  toggleTimer: () => void;
  resetTimer: () => void;
}

export function FocusTimer({
  mode, switchMode, isFullscreen, isActive, timeLeft,
  formatTime, toggleTimer, resetTimer
}: FocusTimerProps) {
  return (
    <div className={isFullscreen 
      ? "fixed inset-0 z-[100] bg-white dark:bg-[#09090b] flex flex-col items-center justify-center" 
      : "md:col-span-2 p-8 sm:p-12 rounded-[2rem] backdrop-blur-2xl border bg-white/[0.03] border-black/5 dark:border-white/10 shadow-xl flex flex-col items-center justify-center relative overflow-hidden group"}>
      
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-96 sm:h-96 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none transition-all duration-1000 ${isActive ? 'bg-orange-500/30 dark:bg-orange-500/20 scale-110' : 'bg-black/5 dark:bg-white/5 scale-90'}`} />
      
      {!isFullscreen && (
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
      )}

      <div className={`font-black tracking-tighter tabular-nums leading-none z-10 font-mono text-transparent bg-clip-text bg-gradient-to-b from-black to-black/60 dark:from-white dark:to-white/60 drop-shadow-sm mb-4 ${isFullscreen ? 'text-[8rem] sm:text-[15rem]' : 'text-[5rem] sm:text-[8rem]'}`}>
        {formatTime(timeLeft)}
      </div>
      
      <p className={`font-mono text-xs sm:text-sm tracking-[0.2em] font-bold z-10 transition-colors duration-500 ${isActive ? 'text-orange-500' : 'opacity-40'}`}>
        {isFullscreen ? 'DISTRACTION-FREE DEEP WORK' : mode === 'pomodoro' ? 'DEEP FOCUS SESSION' : 'OPEN FOCUS TRACKING'}
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
  );
}
