import React, { useState, useEffect, useRef } from 'react';
import { Clock, Bell, CheckSquare, Award, Play, Pause, RotateCcw, Volume2, Sparkles, Flame, ChevronRight, Activity, CalendarDays, Zap, Coffee, Target } from 'lucide-react';
import { RoutineItem, GoalItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';

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

const Dashboard = React.memo(function Dashboard({
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
            setPomoIsActive(false);
            if (pomoTimerRef.current) clearInterval(pomoTimerRef.current);
            setTimeout(() => {
              onAwardXP(250);
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
    hour12: true,
  });

  const dateString = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const greeting = currentTime.getHours() < 12 ? 'Good morning' : currentTime.getHours() < 18 ? 'Good afternoon' : 'Good evening';

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      className="space-y-6 sm:space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
      layout
    >
      
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex items-end justify-between pt-2 px-2">
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-1">{timeString}</h2>
          <p className="text-sm font-medium opacity-60 tracking-wide uppercase">{dateString}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <h3 className="text-sm font-bold">{greeting}, Prince</h3>
            <p className="text-xs opacity-50">Ready to conquer today?</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-0.5 shadow-lg cursor-pointer hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center border border-white/20">
              <span className="text-xl">👑</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Focus Card (Active Routine) */}
      <motion.div variants={itemVariants} className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-[2rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
        <div className="relative p-6 sm:p-8 rounded-[2rem] overflow-hidden backdrop-blur-2xl border bg-white/[0.03] border-black/5 dark:border-white/10 shadow-2xl">
          {/* Progress Background */}
          <div className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 transition-all duration-1000 ease-out" style={{ width: `${taskProgress}%` }}></div>
          
          <div className="relative z-10 flex flex-col sm:flex-row gap-6 sm:items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500"></span>
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-sky-500">Current Focus</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
                {currentTask ? currentTask.title : 'Free Time'}
              </h3>
              <p className="text-sm opacity-70 leading-relaxed max-w-md">
                {currentTask ? currentTask.desc : 'No active blocks scheduled. Take a break or prepare for the next task.'}
              </p>
              
              {currentTask && (
                <div className="mt-6 flex items-center gap-4">
                  <div className="flex-1 max-w-[200px] h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                    <div className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full" style={{ width: `${taskProgress}%` }}></div>
                  </div>
                  <span className="text-xs font-bold font-mono w-10 text-right">{taskProgress}%</span>
                </div>
              )}
            </div>
            
            <div className="flex sm:flex-col gap-3 justify-center mt-6 sm:mt-0">
              <button onClick={() => onNavigate('routine')} className="p-4 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 backdrop-blur-md transition-colors border border-black/5 dark:border-white/10 flex items-center justify-center" title="Routine">
                <Activity className="w-5 h-5" />
              </button>
              <button onClick={() => onNavigate('calendar')} className="p-4 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 backdrop-blur-md transition-colors border border-black/5 dark:border-white/10 flex items-center justify-center" title="Calendar">
                <CalendarDays className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Pomodoro Card */}
        <motion.div variants={itemVariants} onClick={() => onNavigate('focus')} className="p-6 rounded-[2rem] backdrop-blur-2xl border bg-white/[0.03] border-black/5 dark:border-white/10 shadow-xl flex flex-col justify-between relative overflow-hidden group cursor-pointer hover:border-black/10 dark:hover:border-white/20">
          <div className="absolute top-0 right-0 p-6 opacity-10 dark:opacity-20 group-hover:opacity-20 dark:group-hover:opacity-40 transition-opacity duration-500">
             <Coffee className="w-24 h-24" strokeWidth={1} />
          </div>
          <div className="relative z-10">
            <h3 className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" /> Focus & Stopwatch
            </h3>
            <div className="text-5xl font-mono font-bold tracking-tighter my-6 text-transparent bg-clip-text bg-gradient-to-br from-orange-400 to-red-500 drop-shadow-sm">
              {formatPomoTime(pomoTime)}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => { e.stopPropagation(); pomoIsActive ? handlePausePomo() : handleStartPomo(); }}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-sm shadow-lg hover:shadow-orange-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {pomoIsActive ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Start Focus</>}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleResetPomo(); }}
                className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 backdrop-blur-md transition-colors border border-black/5 dark:border-white/10"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Goals Summary Card */}
        <motion.div variants={itemVariants} className="p-6 rounded-[2rem] backdrop-blur-2xl border bg-white/[0.03] border-black/5 dark:border-white/10 shadow-xl relative overflow-hidden group cursor-pointer hover:border-black/10 dark:hover:border-white/20" onClick={() => onNavigate('goals')}>
          <div className="absolute top-0 right-0 p-6 opacity-10 dark:opacity-20 group-hover:opacity-20 dark:group-hover:opacity-40 transition-opacity duration-500">
             <Target className="w-24 h-24" strokeWidth={1} />
          </div>
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-500" /> Today's Goals
              </h3>
              <div className="mt-4">
                <span className="text-4xl font-bold">{completedGoals}</span>
                <span className="text-lg opacity-50">/{totalGoals}</span>
                <span className="ml-2 text-sm font-medium opacity-70">Completed</span>
              </div>
            </div>
            
            <div className="mt-6 space-y-3">
              <div className="w-full h-3 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-1000 ease-out shadow-inner" style={{ width: `${goalsProgress}%` }}></div>
              </div>
              <div className="flex justify-between items-center text-xs font-bold opacity-60">
                <span>Progress</span>
                <span>{goalsProgress}%</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Alarm & Quick Actions */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pb-6">
        <div className="p-6 rounded-[2rem] backdrop-blur-2xl border bg-white/[0.03] border-black/5 dark:border-white/10 shadow-xl flex items-center justify-between group hover:border-black/10 dark:hover:border-white/20 transition-colors">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${isAlarmEnabled ? 'bg-sky-500/20 text-sky-500' : 'bg-black/5 dark:bg-white/10 opacity-50'}`}>
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Morning Alarm</h4>
              <p className="text-xs opacity-60 font-mono mt-0.5">{alarmTime}</p>
            </div>
          </div>
          <button 
            onClick={onToggleAlarm}
            className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${isAlarmEnabled ? 'bg-sky-500' : 'bg-black/20 dark:bg-white/20'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all duration-300 ${isAlarmEnabled ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        <div className="p-6 rounded-[2rem] backdrop-blur-2xl border bg-white/[0.03] border-black/5 dark:border-white/10 shadow-xl flex items-center justify-between group hover:border-black/10 dark:hover:border-white/20 transition-colors cursor-pointer" onClick={() => onNavigate('music')}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-violet-500/20 text-violet-500 group-hover:scale-110 transition-transform">
              <Volume2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Music & Audio</h4>
              <p className="text-xs opacity-60 mt-0.5">Focus frequencies</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity" />
        </div>
      </motion.div>

    </motion.div>
  );
});

export default Dashboard;
