import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Plus, Trash2, Edit2, RotateCcw, Activity, CalendarDays, Clock, Play } from 'lucide-react';
import { RoutineItem } from '../types';

interface RoutineProps {
  routines: RoutineItem[];
  currentTask: RoutineItem | null;
  onUpdateRoutines: (newRoutines: RoutineItem[]) => void;
  onResetToDefault: () => void;
}

const Routine = React.memo(function Routine({
  routines,
  currentTask,
  onUpdateRoutines,
  onResetToDefault,
}: RoutineProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newStart, setNewStart] = useState('12:00');
  const [newEnd, setNewEnd] = useState('13:00');
  const [newDesc, setNewDesc] = useState('');

  const startEdit = (item: RoutineItem) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditStart(item.start);
    setEditEnd(item.end);
    setEditDesc(item.desc);
  };

  const saveEdit = (id: string) => {
    const updated = routines.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          title: editTitle,
          start: editStart,
          end: editEnd,
          desc: editDesc,
        };
      }
      return item;
    });
    onUpdateRoutines(updated);
    setEditingId(null);
  };

  const createItem = () => {
    if (!newTitle.trim()) return;
    const newItem: RoutineItem = {
      id: Date.now().toString(),
      title: newTitle,
      start: newStart,
      end: newEnd,
      desc: newDesc,
    };
    onUpdateRoutines([...routines, newItem]);
    setNewTitle('');
    setNewDesc('');
    setIsCreating(false);
  };

  const deleteItem = (id: string) => {
    if (confirm('Delete this routine block?')) {
      const updated = routines.filter((r) => r.id !== id);
      onUpdateRoutines(updated);
    }
  };

  const convertTo12Hour = (time24: string) => {
    if (!time24) return '';
    try {
      const [h, m] = time24.split(':');
      let hr = Number(h);
      const ampm = hr >= 12 ? 'PM' : 'AM';
      hr = hr % 12 || 12;
      return `${hr.toString().padStart(2, '0')}:${m} ${ampm}`;
    } catch {
      return time24;
    }
  };

  const sortedRoutines = [...routines].sort((a, b) => {
    return a.start.localeCompare(b.start);
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
            <CalendarDays className="w-8 h-8 text-indigo-500" />
            Routine
          </h2>
          <p className="text-sm font-medium opacity-60 tracking-wide uppercase">Your Daily Timeline</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-bold text-sm rounded-2xl transition-all shadow-lg active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Block
          </button>
          
          <button
            onClick={onResetToDefault}
            className="p-2.5 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 backdrop-blur-md transition-colors border border-black/5 dark:border-white/10 rounded-2xl"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isCreating && (
          <motion.div 
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            className="p-6 rounded-[2rem] backdrop-blur-2xl border bg-white/[0.03] border-black/5 dark:border-white/10 shadow-xl overflow-hidden"
          >
            <h3 className="text-sm font-bold uppercase tracking-widest opacity-60 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-500" /> New Block
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold opacity-60 uppercase mb-2">Title</label>
                <input
                  type="text"
                  placeholder="Focus Session"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold opacity-60 uppercase mb-2">Start</label>
                  <input
                    type="time"
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold opacity-60 uppercase mb-2">End</label>
                  <input
                    type="time"
                    value={newEnd}
                    onChange={(e) => setNewEnd(e.target.value)}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                  />
                </div>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-xs font-bold opacity-60 uppercase mb-2">Description</label>
              <input
                type="text"
                placeholder="What will you accomplish?"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsCreating(false)}
                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createItem}
                className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-indigo-500/20"
              >
                Save Block
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-[38px] top-6 bottom-6 w-px bg-gradient-to-b from-indigo-500/0 via-indigo-500/20 to-indigo-500/0"></div>

        <div className="space-y-4">
          {sortedRoutines.map((task) => {
            const isActive = currentTask?.id === task.id;
            const isEditing = editingId === task.id;

            if (isEditing) {
              return (
                <div key={task.id} className="p-6 rounded-[2rem] backdrop-blur-2xl border bg-white/[0.03] border-indigo-500/30 shadow-xl ml-16 relative">
                   <div className="absolute -left-16 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center">
                     <div className="w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-indigo-500/20"></div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="time"
                        value={editStart}
                        onChange={(e) => setEditStart(e.target.value)}
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                      />
                      <input
                        type="time"
                        value={editEnd}
                        onChange={(e) => setEditEnd(e.target.value)}
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                     <input
                        type="text"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                  </div>
                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 rounded-xl font-bold text-xs bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => saveEdit(task.id)}
                      className="px-4 py-2 bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg"
                    >
                      Save
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative flex items-center gap-6 group`}
              >
                {/* Timeline Dot & Time */}
                <div className="flex flex-col items-center w-20 shrink-0 z-10">
                  <span className="text-xs font-bold font-mono opacity-60 mb-2">{convertTo12Hour(task.start)}</span>
                  <div className={`w-4 h-4 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                    isActive 
                      ? 'bg-indigo-500 border-indigo-500 ring-4 ring-indigo-500/20 scale-125' 
                      : 'bg-[#18181b] border-white/20 dark:bg-white/10 group-hover:border-indigo-400'
                  }`}>
                    {isActive && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                  </div>
                  <span className="text-xs font-bold font-mono opacity-40 mt-2">{convertTo12Hour(task.end)}</span>
                </div>

                {/* Card */}
                <div className={`flex-1 p-5 sm:p-6 rounded-[2rem] backdrop-blur-2xl border shadow-xl transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isActive 
                    ? 'bg-indigo-500/10 border-indigo-500/30 ring-1 ring-indigo-500/20' 
                    : 'bg-white/[0.03] border-black/5 dark:border-white/10 hover:border-black/10 dark:hover:border-white/20'
                }`}>
                  <div className="flex-1">
                    <h3 className={`text-lg font-bold tracking-tight ${isActive ? 'text-indigo-600 dark:text-indigo-400' : ''}`}>
                      {task.title}
                    </h3>
                    <p className="text-sm opacity-60 mt-1 leading-relaxed">{task.desc}</p>
                    
                    {isActive && (
                      <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 bg-indigo-500/10 text-indigo-500 rounded-full text-xs font-bold uppercase tracking-wider">
                        <Play className="w-3 h-3" /> In Progress
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity self-end sm:self-auto">
                    <button
                      onClick={() => startEdit(task)}
                      className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                    >
                      <Edit2 className="w-4 h-4 opacity-70" />
                    </button>
                    <button
                      onClick={() => deleteItem(task.id)}
                      className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 opacity-70" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
});

export default Routine;
