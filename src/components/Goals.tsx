import React, { useState } from 'react';
import { Target, Plus, Check, Square, Trash2, ShieldAlert, Award, Flame } from 'lucide-react';
import { GoalItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface GoalsProps {
  goals: GoalItem[];
  onUpdateGoals: (newGoals: GoalItem[]) => void;
  onAwardXP: (amount: number) => void;
}

const Goals = React.memo(function Goals({ goals, onUpdateGoals, onAwardXP }: GoalsProps) {
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'academic' | 'coding' | 'fitness' | 'personal'>('academic');
  const [filter, setFilter] = useState<string>('all');

  const addGoal = () => {
    if (!newTitle.trim()) return;
    const newGoal: GoalItem = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      completed: false,
      category: newCategory,
    };
    onUpdateGoals([...goals, newGoal]);
    setNewTitle('');
  };

  const toggleGoal = (id: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const updated = goals.map((g) => {
      if (g.id === id) {
        const nextCompleted = !g.completed;
        onAwardXP(nextCompleted ? 100 : -100);

        let newStreak = g.streak || 0;
        let newLastCompletedDate = g.lastCompletedDate;

        if (nextCompleted) {
          if (g.lastCompletedDate === yesterdayStr) {
            newStreak += 1;
          } else if (g.lastCompletedDate !== todayStr) {
             newStreak = 1;
          }
          newLastCompletedDate = todayStr;
        } else {
          if (g.lastCompletedDate === todayStr) {
             newStreak = Math.max(0, newStreak - 1);
             newLastCompletedDate = newStreak > 0 ? yesterdayStr : undefined;
          }
        }

        return { ...g, completed: nextCompleted, streak: newStreak, lastCompletedDate: newLastCompletedDate };
      }
      return g;
    });
    onUpdateGoals(updated);
  };

  const deleteGoal = (id: string) => {
    const updated = goals.filter((g) => g.id !== id);
    onUpdateGoals(updated);
  };

  const filteredGoals = goals.filter((g) => {
    if (filter === 'all') return true;
    if (filter === 'completed') return g.completed;
    if (filter === 'active') return !g.completed;
    return g.category === filter;
  });

  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'academic':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'coding':
        return 'text-sky-500 bg-sky-500/10 border-sky-500/20';
      case 'fitness':
        return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      default:
        return 'text-violet-500 bg-violet-500/10 border-violet-500/20';
    }
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
            <Target className="w-8 h-8 text-emerald-500" />
            Goals
          </h2>
          <p className="text-sm font-medium opacity-60 tracking-wide uppercase">Your Daily Objectives</p>
        </div>

        <div className="flex flex-wrap gap-1 p-1 rounded-2xl bg-black/5 dark:bg-white/5 backdrop-blur-md border border-black/5 dark:border-white/10">
          {['all', 'active', 'completed', 'academic', 'coding', 'fitness'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold rounded-xl uppercase tracking-wider transition-all duration-300 ${
                filter === f
                  ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm'
                  : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 rounded-[2rem] backdrop-blur-2xl border bg-white/[0.03] border-black/5 dark:border-white/10 shadow-xl overflow-hidden relative">
        <h3 className="text-sm font-bold uppercase tracking-widest opacity-60 mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-500" /> Create Objective
        </h3>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="e.g. Complete React tutorial..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addGoal()}
            className="flex-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
          <div className="flex gap-3">
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as any)}
              className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer outline-none"
            >
              <option value="academic">Academic</option>
              <option value="coding">Coding</option>
              <option value="fitness">Fitness</option>
              <option value="personal">Personal</option>
            </select>
            <button
              onClick={addGoal}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredGoals.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-16 bg-black/5 dark:bg-white/5 border border-dashed border-black/10 dark:border-white/10 rounded-[2rem] text-center"
            >
              <Target className="w-12 h-12 opacity-20 mb-3" />
              <h4 className="font-bold opacity-70">No goals found</h4>
              <p className="text-sm opacity-50 mt-1">Add a new goal to get started</p>
            </motion.div>
          ) : (
            filteredGoals.map((g) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={g.id}
                onClick={() => toggleGoal(g.id)}
                className={`flex items-center justify-between p-4 sm:p-5 rounded-[1.5rem] backdrop-blur-2xl border transition-all duration-300 cursor-pointer group ${
                  g.completed 
                    ? 'bg-black/5 dark:bg-white/5 border-transparent opacity-60' 
                    : 'bg-white/[0.03] border-black/5 dark:border-white/10 hover:border-black/10 dark:hover:border-white/20 shadow-md hover:shadow-lg'
                }`}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                      g.completed
                        ? 'bg-emerald-500 text-white shadow-md scale-110'
                        : 'bg-black/10 dark:bg-white/10 group-hover:bg-black/20 dark:group-hover:bg-white/20 text-transparent'
                    }`}
                  >
                    <Check className="w-4 h-4" strokeWidth={3} />
                  </div>

                  <div className="min-w-0 flex-1 flex items-center gap-3">
                    <p
                      className={`text-[15px] font-semibold truncate transition-all duration-300 ${
                        g.completed ? 'line-through opacity-70' : ''
                      }`}
                    >
                      {g.title}
                    </p>
                    {g.streak && g.streak > 0 ? (
                      <div className="flex items-center gap-1 text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-md flex-shrink-0 text-xs font-bold" title={`${g.streak} Day Streak!`}>
                        <Flame className="w-3 h-3" />
                        <span>{g.streak}</span>
                      </div>
                    ) : null}
                  </div>

                  <span
                    className={`hidden sm:inline-flex text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border flex-shrink-0 ${getCategoryTheme(g.category)}`}
                  >
                    {g.category}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteGoal(g.id);
                  }}
                  className="p-2 ml-4 text-black/30 dark:text-white/30 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

export default Goals;
