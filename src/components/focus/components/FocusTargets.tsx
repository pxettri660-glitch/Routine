import React from 'react';
import { Target, Award, Trophy } from 'lucide-react';

interface FocusTargetsProps {
  todayGoals: any[];
  achievements: any[];
}

export function FocusTargets({ todayGoals, achievements }: FocusTargetsProps) {
  return (
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
  );
}
