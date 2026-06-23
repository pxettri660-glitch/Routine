import React, { useState } from 'react';
import { Target, Plus, Check, Square, Trash2, ShieldAlert } from 'lucide-react';
import { GoalItem } from '../types';

interface GoalsProps {
  goals: GoalItem[];
  onUpdateGoals: (newGoals: GoalItem[]) => void;
  onAwardXP: (amount: number) => void;
}

export default function Goals({ goals, onUpdateGoals, onAwardXP }: GoalsProps) {
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
    const updated = goals.map((g) => {
      if (g.id === id) {
        const nextCompleted = !g.completed;
        // Award +100 XP for check, -100 XP for uncheck:
        onAwardXP(nextCompleted ? 100 : -100);
        return { ...g, completed: nextCompleted };
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
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'coding':
        return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
      case 'fitness':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      default:
        return 'text-violet-400 bg-violet-500/10 border-violet-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Target className="text-emerald-400 w-5 h-5" />
            CORE CRITICAL TARGET DIRECTIVES
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Key milestones, assignments, workouts, and personal objectives.
          </p>
        </div>

        {/* Filter Navigation row */}
        <div className="flex flex-wrap gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
          {['all', 'active', 'completed', 'academic', 'coding', 'fitness'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-xs font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
                filter === f
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Goal creation Form layout */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-emerald-400" /> Spawn New Directives
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Type task details like: Complete Maths pg 8..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addGoal()}
            className="flex-1 bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
          />
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="academic">⚡ Academic / Study</option>
            <option value="coding">💻 Coding consitency</option>
            <option value="fitness">💪 Fitness / Sports</option>
            <option value="personal">👑 Personal Project</option>
          </select>
          <button
            onClick={addGoal}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2 rounded-xl text-sm transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1"
          >
            Spawn
          </button>
        </div>
      </div>

      {/* Goal Items rendering list */}
      <div className="space-y-2.5">
        {filteredGoals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-slate-900/10 border border-dashed border-slate-800/65 rounded-xl text-slate-500 text-center space-y-2">
            <h4 className="font-semibold text-slate-400">No matching directives found</h4>
            <p className="text-xs">Adjust your status/category filter or spawn a new directive.</p>
          </div>
        ) : (
          filteredGoals.map((g) => (
            <div
              key={g.id}
              onClick={() => toggleGoal(g.id)}
              className="flex items-center justify-between p-4 bg-slate-950/30 border border-slate-800/60 hover:border-slate-700/80 rounded-xl transition-all cursor-pointer group hover:bg-slate-900/10"
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <button
                  type="button"
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all border flex-shrink-0 ${
                    g.completed
                      ? 'bg-emerald-500 border-emerald-400 text-slate-950 scale-102 shadow-sm'
                      : 'border-slate-700 text-transparent group-hover:border-slate-500'
                  }`}
                >
                  <Check className="w-4 h-4 font-black" />
                </button>

                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-semibold truncate transition-all ${
                      g.completed ? 'text-slate-500 line-through' : 'text-slate-200'
                    }`}
                  >
                    {g.title}
                  </p>
                </div>

                <span
                  className={`text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded border flex-shrink-0 font-mono ${getCategoryTheme(
                    g.category
                  )}`}
                >
                  {g.category}
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteGoal(g.id);
                }}
                className="p-1.5 ml-4 text-slate-600 hover:text-rose-400 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800 cursor-pointer transition-all flex-shrink-0"
                title="Delete this directive"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
