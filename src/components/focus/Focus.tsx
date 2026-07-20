import React, { useState } from 'react';
import { Square, Trophy, Target, TrendingUp, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { useFirestoreCollection } from '../../hooks/useFirestoreSync';
import { FocusSession } from '../../types';

import { FocusAnalytics } from './components/FocusAnalytics';
import { FocusTimer } from './components/FocusTimer';
import { FocusTargets } from './components/FocusTargets';
import { useBasicFocusStats } from './hooks/useFocusStats';
import { useFocusTimer } from './hooks/useFocusTimer';

const Focus = React.memo(function Focus({ onAwardXP }: { onAwardXP?: (amount: number) => void }) {
  const [mode, setMode] = useState<'pomodoro' | 'stopwatch'>('pomodoro');
  const [focusSessions, setFocusSessions] = useFirestoreCollection<FocusSession>('focusSessions', []);
  const [goals] = useFirestoreCollection<any>('goals', []);
  const [achievements] = useFirestoreCollection<any>('achievements', []);

  // Filter today's goals
  const todayGoals = goals.filter(g => {
    if (g.category !== 'daily') return false;
    const gDate = new Date(g.createdAt);
    const today = new Date();
    return gDate.toDateString() === today.toDateString();
  });

  const { streak, focusScore, sessionCount, totalFocusTime } = useBasicFocusStats(focusSessions);
  
  const { 
    timeLeft, 
    isActive, 
    isFullscreen, 
    toggleTimer, 
    resetTimer, 
    formatTime 
  } = useFocusTimer(mode, focusSessions, setFocusSessions, onAwardXP);

  return (
    <motion.div 
      className="space-y-6 sm:space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-3">
            <Square className="w-8 h-8 text-orange-500" />
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
        
        <FocusTimer 
          mode={mode} 
          switchMode={setMode} 
          isFullscreen={isFullscreen} 
          isActive={isActive} 
          timeLeft={timeLeft} 
          formatTime={formatTime} 
          toggleTimer={toggleTimer} 
          resetTimer={resetTimer} 
        />

        <FocusTargets 
          todayGoals={todayGoals} 
          achievements={achievements} 
        />
        
      </div>
    </motion.div>
  );
});

export default Focus;
