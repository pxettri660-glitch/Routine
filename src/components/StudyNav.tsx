import React from 'react';
import { motion } from 'motion/react';
import { CalendarIcon, Sliders, Target, CheckSquare, FileText, Timer, Clock, Calculator, BookOpen, Activity, Focus } from 'lucide-react';

interface Props {
  onNavigate: (view: string) => void;
}

const StudyNav: React.FC<Props> = ({ onNavigate }) => {
  const cards = [
    { id: 'calendar', title: 'Calendar', icon: CalendarIcon, color: 'from-blue-500 to-cyan-400' },
    { id: 'routine', title: 'Routine', icon: Sliders, color: 'from-indigo-500 to-purple-500' },
    { id: 'goals', title: 'Goals', icon: Target, color: 'from-rose-500 to-orange-400' },
    { id: 'tasks', title: 'Tasks', icon: CheckSquare, color: 'from-emerald-500 to-teal-400' },
    { id: 'tools', title: 'Notes', icon: FileText, color: 'from-amber-500 to-yellow-400' },
    { id: 'focus', title: 'Pomodoro Timer', icon: Timer, color: 'from-red-500 to-rose-400' },
    { id: 'focus', title: 'Stopwatch', icon: Clock, color: 'from-slate-500 to-gray-400' },
    { id: 'tools', title: 'Calculator', icon: Calculator, color: 'from-sky-500 to-blue-400' },
    { id: 'more', title: 'Flashcards', icon: BookOpen, color: 'from-fuchsia-500 to-pink-400' },
    { id: 'profile', title: 'Statistics', icon: Activity, color: 'from-violet-500 to-purple-400' },
    { id: 'focus', title: 'Focus Mode', icon: Focus, color: 'from-indigo-600 to-blue-600' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 pb-32 max-w-4xl mx-auto space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
          Study Hub
        </h2>
        <p className="text-black/50 dark:text-white/50">Your complete toolkit for academic excellence</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <button
              key={idx}
              onClick={() => onNavigate(card.id)}
              className="relative group p-4 rounded-3xl overflow-hidden flex flex-col items-center text-center gap-3 transition-all duration-300 hover:scale-105 active:scale-95 bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] backdrop-blur-md"
            >
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br ${card.color}`} />
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${card.color} shadow-lg text-white`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="font-semibold text-sm">{card.title}</span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default StudyNav;
