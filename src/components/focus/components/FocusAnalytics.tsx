import React from 'react';
import { Activity } from 'lucide-react';
import { FocusSession } from '../../../types';
import { useFocusStats } from '../hooks/useFocusStats';

export function FocusAnalytics({ sessions }: { sessions: FocusSession[] }) {
  const stats = useFocusStats(sessions);
  
  const avgSession = sessions.length > 0 ? stats.totalTime / sessions.length : 0;
  
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
          { label: "Today's Focus", value: format(stats.todayTime) },
          { label: "Yesterday", value: format(stats.yesterdayTime) },
          { label: "Last 7 Days", value: format(stats.last7DaysTime) },
          { label: "Last 30 Days", value: format(stats.last30DaysTime) },
          { label: "Monthly Total", value: format(stats.monthlyTime) },
          { label: "Yearly Total", value: format(stats.yearlyTime) },
          { label: "Current Streak", value: stats.currentStreak + " Days" },
          { label: "Longest Streak", value: stats.longestStreak + " Days" },
          { label: "Average Session", value: format(avgSession) },
          { label: "Longest Session", value: format(stats.longestSession) },
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
