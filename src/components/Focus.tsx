import React, { useState, useEffect, useMemo } from 'react';
import { Play, Pause, Activity, Square, Trophy, Target, TrendingUp, Award, Zap, Flame, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { useFirestoreCollection } from '../hooks/useFirestoreSync';
import { FocusSession } from '../types';


function FocusAnalytics({ sessions }: { sessions: FocusSession[] }) {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split('T')[0];

  let todayTime = 0, yesterdayTime = 0, last7DaysTime = 0, last30DaysTime = 0, monthlyTime = 0, yearlyTime = 0;
  let totalTime = 0;
  let longestStreak = 0;
  let currentStreak = 0;
  let longestSession = 0;
  
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  sessions.forEach(s => {
    const sDate = new Date(s.date);
    const d = s.duration;
    totalTime += d;
    if (d > longestSession) longestSession = d;

    if (s.date === today) todayTime += d;
    if (s.date === yesterday) yesterdayTime += d;

    const diffDays = Math.floor((now.getTime() - sDate.getTime()) / (1000 * 3600 * 24));
    if (diffDays <= 7) last7DaysTime += d;
    if (diffDays <= 30) last30DaysTime += d;
    if (sDate.getMonth() === currentMonth && sDate.getFullYear() === currentYear) monthlyTime += d;
    if (sDate.getFullYear() === currentYear) yearlyTime += d;
  });

  
  // calculate streak
  const dates = [...new Set(sessions.map(s => s.date))].sort((a, b) => b.localeCompare(a));
  if (dates.length > 0) {
    let _streak = 1;
    let _maxStreak = 1;
    let checkDate = new Date(dates[0]);
    if (dates[0] === today || dates[0] === yesterday) {
      currentStreak = 1;
    }
    
    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(checkDate);
      prevDate.setDate(prevDate.getDate() - 1);
      if (dates[i] === prevDate.toISOString().split('T')[0]) {
        _streak++;
        if (_streak > _maxStreak) _maxStreak = _streak;
        if (currentStreak > 0 && i === currentStreak) currentStreak++; // still on current streak
        checkDate = prevDate;
      } else {
        _streak = 1;
        checkDate = new Date(dates[i]);
      }
    }
    longestStreak = _maxStreak;
  }

  const avgSession = sessions.length > 0 ? totalTime / sessions.length : 0;

  const format = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="p-6 sm:p-8 rounded-[2rem] backdrop-blur-2xl border bg-white/[0.03] border-black/5 dark:border-white/10 shadow-xl mt-6">
      <h3 className="text-sm font-bold uppercase tracking-widest opacity-60 mb-6 flex items-center gap-2">
        <Activity className="w-4 h-4 text-sky-500" /> Focus Analytics
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Today's Focus", value: format(todayTime) },
          { label: "Yesterday", value: format(yesterdayTime) },
          { label: "Last 7 Days", value: format(last7DaysTime) },
          { label: "Last 30 Days", value: format(last30DaysTime) },
          { label: "Monthly Total", value: format(monthlyTime) },
          { label: "Yearly Total", value: format(yearlyTime) },
          { label: "Current Streak", value: currentStreak + " Days" },
          { label: "Longest Streak", value: longestStreak + " Days" },
          { label: "Average Session", value: format(avgSession) },
          { label: "Longest Session", value: format(longestSession) },
          { label: "Total Sessions", value: sessions.length.toString() }
        ].map((s, i) => (
          <div key={i} className="p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-transparent hover:border-black/5 dark:hover:border-white/10 transition-colors">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">{s.label}</p>
            <p className="text-sm font-bold">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const Focus = React.memo(function Focus({ onAwardXP }: { onAwardXP?: (amount: number) => void }) {
  const [mode, setMode] = useState<'pomodoro' | 'stopwatch'>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  const [focusSessions, setFocusSessions] = useFirestoreCollection<FocusSession>('focusSessions', []);

  const [isFullscreen, setIsFullscreen] = useState(false);

  // Computed stats
  const { streak, focusScore, sessionCount, totalFocusTime } = useMemo(() => {
    let _totalFocusTime = 0; // in minutes
    let _sessionCount = focusSessions.length;
    let _streak = 0;
    
    // Sort sessions by deviceTimestamp descending
    const sorted = [...focusSessions].sort((a, b) => b.deviceTimestamp - a.deviceTimestamp);
    
    // Calculate total focus time
    sorted.forEach(s => {
      _totalFocusTime += s.duration / 60;
    });

    // Calculate streak (consecutive days)
    const dates = [...new Set(sorted.map(s => s.date))].sort((a, b) => b.localeCompare(a));
    if (dates.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterday = yesterdayDate.toISOString().split('T')[0];

      let checkDate = new Date();
      if (dates[0] === today || dates[0] === yesterday) {
        checkDate = new Date(dates[0]);
        _streak = 1;
        for (let i = 1; i < dates.length; i++) {
          const prevDate = new Date(checkDate);
          prevDate.setDate(prevDate.getDate() - 1);
          if (dates[i] === prevDate.toISOString().split('T')[0]) {
            _streak++;
            checkDate = prevDate;
          } else {
            break;
          }
        }
      }
    }

    // Productivity Score (0-100 based on consistency & total time)
    let _focusScore = Math.min(100, Math.floor((_streak * 5) + (_totalFocusTime / 60 * 2)));
    if (_sessionCount === 0) _focusScore = 0;

    return {
      streak: _streak,
      focusScore: _focusScore,
      sessionCount: _sessionCount,
      totalFocusTime: _totalFocusTime
    };
  }, [focusSessions]);


  const finishSession = (durationSeconds: number) => {
    if (durationSeconds <= 0 || !startTime) return;
    const now = Date.now();
    const newSession: FocusSession = {
      id: now.toString(),
      startTime: startTime,
      endTime: now,
      duration: durationSeconds,
      date: new Date().toISOString().split('T')[0],
      category: mode === 'pomodoro' ? 'Pomodoro' : 'Stopwatch',
      deviceTimestamp: now,
    };
    
    setFocusSessions([...focusSessions, newSession]);
    setStartTime(null);
    if (onAwardXP) onAwardXP(Math.floor(durationSeconds / 60) * 2); // 2 XP per minute
  };

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      if (!startTime) setStartTime(Date.now());
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
        finishSession(25 * 60);
        if (isFullscreen && document.fullscreenElement) document.exitFullscreen();
        setIsFullscreen(false);
        alert('Focus session completed!');
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode, onAwardXP, isFullscreen, startTime]);

  const toggleTimer = async () => {
    if (!isActive && !isFullscreen) {
      try {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.warn("Fullscreen API failed", err);
      }
      setIsActive(true);
    } else if (isActive) {
      // Pause or stop
      if (mode === 'stopwatch') {
        // If they pause stopwatch, we might consider saving it, but typically they might resume.
        // For simplicity, let's just let it pause, and they can click "Reset" to save and finish.
      }
      if (isFullscreen) {
        try {
          if (document.fullscreenElement) await document.exitFullscreen();
          setIsFullscreen(false);
        } catch (err) {
          console.warn("Fullscreen exit failed", err);
        }
      }
      setIsActive(false);
    } else {
      setIsActive(true);
    }
  };

  const resetTimer = async () => {
    if (mode === 'stopwatch' && startTime) {
      // Finish stopwatch session
      const duration = Math.floor((Date.now() - startTime) / 1000);
      finishSession(duration);
    }
    setIsActive(false);
    setStartTime(null);
    setTimeLeft(mode === 'pomodoro' ? 25 * 60 : 0);
    if (isFullscreen) {
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (err) {
        console.warn("Fullscreen exit failed", err);
      }
    }
  };

  const switchMode = (newMode: 'pomodoro' | 'stopwatch') => {
    if (isActive) resetTimer(); // save current if needed
    setMode(newMode);
    setIsActive(false);
    setStartTime(null);
    setTimeLeft(newMode === 'pomodoro' ? 25 * 60 : 0);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const [goals] = useFirestoreCollection<any>('goals', []);
  const [achievements] = useFirestoreCollection<any>('achievements', []);

  // Filter today's goals
  const todayGoals = goals.filter(g => {
    // Basic check if it's a daily goal or just show all incomplete ones
    return !g.completed || g.completed; // show all for now
  });

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

      <FocusAnalytics sessions={focusSessions} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
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

        {/* Targets & Achievements */}
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-[2rem] backdrop-blur-2xl border bg-white/[0.03] border-black/5 dark:border-white/10 shadow-xl">
            <h3 className="text-sm font-bold uppercase tracking-widest opacity-60 mb-6 flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-500" /> Daily Targets
            </h3>
            <div className="space-y-4">
              {todayGoals.length === 0 ? (
                <div className="text-sm opacity-50">No targets set for today.</div>
              ) : (
                todayGoals.slice(0, 3).map((target, idx) => (
                  <div key={idx} className="p-3 sm:p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-transparent hover:border-black/5 dark:hover:border-white/10 transition-colors">
                    <div className="flex justify-between text-xs sm:text-sm font-bold mb-3">
                      <span>{target.title}</span>
                      <span className="text-indigo-500">{target.completed ? '100' : '0'}%</span>
                    </div>
                    <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-1.5 sm:h-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-1000" style={{ width: `${target.completed ? 100 : 0}%` }}></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-6 sm:p-8 rounded-[2rem] backdrop-blur-2xl border bg-white/[0.03] border-black/5 dark:border-white/10 shadow-xl">
            <h3 className="text-sm font-bold uppercase tracking-widest opacity-60 mb-6 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" /> Achievements
            </h3>
            <div className="space-y-3">
              {achievements.length === 0 ? (
                <div className="text-sm opacity-50">No achievements yet.</div>
              ) : (
                achievements.slice(0, 3).map((ach, idx) => (
                  <div key={idx} className={`flex items-center gap-4 p-3 sm:p-4 rounded-2xl border transition-all ${ach.isUnlocked ? 'bg-amber-500/10 border-amber-500/20 shadow-sm' : 'bg-black/5 dark:bg-white/5 border-transparent opacity-50'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${ach.isUnlocked ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30' : 'bg-black/10 dark:bg-white/10'}`}>
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`text-xs sm:text-sm font-bold ${ach.isUnlocked ? 'text-amber-600 dark:text-amber-400' : ''}`}>{ach.name}</p>
                      <p className="text-[10px] sm:text-xs font-medium opacity-60 mt-0.5">{ach.description}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
});

export default Focus;
