import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Plus, Trash2, Edit2, RotateCcw, Activity, CalendarDays, Clock, Play, CheckCircle2, Circle, Bell, Tag, ArrowUp, ArrowDown } from 'lucide-react';
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
  const [editForm, setEditForm] = useState<Partial<RoutineItem>>({});

  const [isCreating, setIsCreating] = useState(false);
  const [newForm, setNewForm] = useState<Partial<RoutineItem>>({
    title: '', start: '12:00', end: '13:00', desc: '', category: 'Work', reminder: false, repeatDays: [1,2,3,4,5]
  });

  const startEdit = (item: RoutineItem) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  const saveEdit = (id: string) => {
    const updated = routines.map((item) => {
      if (item.id === id) {
        return { ...item, ...editForm } as RoutineItem;
      }
      return item;
    });
    onUpdateRoutines(updated);
    setEditingId(null);
  };

  const createItem = () => {
    if (!newForm.title?.trim()) return;
    const newItem: RoutineItem = {
      id: Date.now().toString(),
      title: newForm.title,
      start: newForm.start || '12:00',
      end: newForm.end || '13:00',
      desc: newForm.desc || '',
      category: newForm.category,
      reminder: newForm.reminder,
      repeatDays: newForm.repeatDays || [],
      order: routines.length,
      isCompleted: false
    };
    onUpdateRoutines([...routines, newItem]);
    setNewForm({ title: '', start: '12:00', end: '13:00', desc: '', category: 'Work', reminder: false, repeatDays: [1,2,3,4,5] });
    setIsCreating(false);
  };

  const deleteItem = (id: string) => {
    const updated = routines.filter((r) => r.id !== id);
    onUpdateRoutines(updated);
  };

  const toggleComplete = (id: string) => {
    const updated = routines.map(r => r.id === id ? { ...r, isCompleted: !r.isCompleted } : r);
    onUpdateRoutines(updated);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newRoutines = [...sortedRoutines];
    if (direction === 'up' && index > 0) {
      const temp = newRoutines[index];
      newRoutines[index] = newRoutines[index - 1];
      newRoutines[index - 1] = temp;
    } else if (direction === 'down' && index < newRoutines.length - 1) {
      const temp = newRoutines[index];
      newRoutines[index] = newRoutines[index + 1];
      newRoutines[index + 1] = temp;
    }
    // Update order values
    const updated = newRoutines.map((r, i) => ({ ...r, order: i }));
    onUpdateRoutines(updated);
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
    if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
    return a.start.localeCompare(b.start);
  });

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const toggleDay = (dayIndex: number, isNew: boolean) => {
    if (isNew) {
      const days = newForm.repeatDays || [];
      const newDays = days.includes(dayIndex) ? days.filter(d => d !== dayIndex) : [...days, dayIndex];
      setNewForm({ ...newForm, repeatDays: newDays });
    } else {
      const days = editForm.repeatDays || [];
      const newDays = days.includes(dayIndex) ? days.filter(d => d !== dayIndex) : [...days, dayIndex];
      setEditForm({ ...editForm, repeatDays: newDays });
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
                  value={newForm.title}
                  onChange={(e) => setNewForm({...newForm, title: e.target.value})}
                  className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold opacity-60 uppercase mb-2">Start</label>
                  <input
                    type="time"
                    value={newForm.start}
                    onChange={(e) => setNewForm({...newForm, start: e.target.value})}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold opacity-60 uppercase mb-2">End</label>
                  <input
                    type="time"
                    value={newForm.end}
                    onChange={(e) => setNewForm({...newForm, end: e.target.value})}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-bold opacity-60 uppercase mb-2">Category</label>
                <input
                  type="text"
                  placeholder="Work, Study, Fitness..."
                  value={newForm.category || ''}
                  onChange={(e) => setNewForm({...newForm, category: e.target.value})}
                  className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div>
                 <label className="block text-xs font-bold opacity-60 uppercase mb-2">Options</label>
                 <label className="flex items-center gap-3 p-3 rounded-xl bg-black/5 dark:bg-white/5 cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                    <input type="checkbox" checked={newForm.reminder || false} onChange={e => setNewForm({...newForm, reminder: e.target.checked})} className="rounded text-indigo-500 w-4 h-4 bg-transparent border-black/20 dark:border-white/20" />
                    <span className="text-sm font-bold opacity-80 flex items-center gap-2"><Bell className="w-4 h-4" /> Reminder Alert</span>
                 </label>
              </div>
            </div>
            <div className="mt-4">
               <label className="block text-xs font-bold opacity-60 uppercase mb-2">Repeat Days</label>
               <div className="flex gap-2">
                 {daysOfWeek.map((day, i) => (
                   <button key={i} onClick={() => toggleDay(i, true)} className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full font-bold text-xs transition-colors ${newForm.repeatDays?.includes(i) ? 'bg-indigo-500 text-white' : 'bg-black/5 dark:bg-white/10 opacity-50'}`}>
                     {day}
                   </button>
                 ))}
               </div>
            </div>
            <div className="mt-4">
              <label className="block text-xs font-bold opacity-60 uppercase mb-2">Description</label>
              <input
                type="text"
                placeholder="What will you accomplish?"
                value={newForm.desc}
                onChange={(e) => setNewForm({...newForm, desc: e.target.value})}
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
          {sortedRoutines.map((task, index) => {
            const isActive = currentTask?.id === task.id;
            const isEditing = editingId === task.id;

            if (isEditing) {
              return (
                <div key={task.id} className="p-6 rounded-[2rem] backdrop-blur-2xl border bg-white/[0.03] border-indigo-500/30 shadow-xl ml-16 relative">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <input type="text" value={editForm.title} onChange={(e) => setEditForm({...editForm, title: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all mb-3" />
                      <input type="text" value={editForm.category || ''} placeholder="Category" onChange={(e) => setEditForm({...editForm, category: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="flex gap-2">
                        <input type="time" value={editForm.start} onChange={(e) => setEditForm({...editForm, start: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono" />
                        <input type="time" value={editForm.end} onChange={(e) => setEditForm({...editForm, end: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono" />
                      </div>
                      <label className="flex items-center gap-3 p-3 rounded-xl bg-black/5 dark:bg-white/5 cursor-pointer">
                          <input type="checkbox" checked={editForm.reminder || false} onChange={e => setEditForm({...editForm, reminder: e.target.checked})} className="rounded text-indigo-500 w-4 h-4 bg-transparent border-black/20" />
                          <span className="text-sm font-bold opacity-80">Reminder Alert</span>
                      </label>
                    </div>
                  </div>
                  <div className="mt-4">
                     <div className="flex gap-2 mb-4">
                       {daysOfWeek.map((day, i) => (
                         <button key={i} onClick={() => toggleDay(i, false)} className={`w-8 h-8 rounded-full font-bold text-xs transition-colors ${editForm.repeatDays?.includes(i) ? 'bg-indigo-500 text-white' : 'bg-black/5 dark:bg-white/10 opacity-50'}`}>
                           {day}
                         </button>
                       ))}
                     </div>
                     <input type="text" value={editForm.desc} onChange={(e) => setEditForm({...editForm, desc: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                  </div>
                  <div className="flex justify-end gap-3 mt-4">
                    <button onClick={() => setEditingId(null)} className="px-4 py-2 rounded-xl font-bold text-xs bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors">Cancel</button>
                    <button onClick={() => saveEdit(task.id)} className="px-4 py-2 bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg">Save</button>
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
                    isActive ? 'bg-indigo-500 border-indigo-500 ring-4 ring-indigo-500/20 scale-125' : 
                    task.isCompleted ? 'bg-emerald-500 border-emerald-500' : 'bg-[#18181b] border-white/20 dark:bg-white/10 group-hover:border-indigo-400'
                  }`}>
                    {isActive && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                  </div>
                  <span className="text-xs font-bold font-mono opacity-40 mt-2">{convertTo12Hour(task.end)}</span>
                </div>

                {/* Card */}
                <div className={`flex-1 p-5 sm:p-6 rounded-[2rem] backdrop-blur-2xl border shadow-xl transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isActive ? 'bg-indigo-500/10 border-indigo-500/30 ring-1 ring-indigo-500/20' : 
                  task.isCompleted ? 'bg-emerald-500/5 border-emerald-500/20 opacity-70' : 'bg-white/[0.03] border-black/5 dark:border-white/10 hover:border-black/10 dark:hover:border-white/20'
                }`}>
                  <div className="flex-1 flex gap-4 items-start">
                    <button onClick={() => toggleComplete(task.id)} className="mt-1 flex-shrink-0 text-black/20 dark:text-white/20 hover:text-emerald-500 transition-colors">
                      {task.isCompleted ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <Circle className="w-6 h-6" />}
                    </button>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className={`text-lg font-bold tracking-tight ${isActive ? 'text-indigo-600 dark:text-indigo-400' : ''} ${task.isCompleted ? 'line-through opacity-50' : ''}`}>
                          {task.title}
                        </h3>
                        {task.category && <span className="px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 text-[10px] font-bold uppercase tracking-widest opacity-60 flex items-center gap-1"><Tag className="w-3 h-3" /> {task.category}</span>}
                        {task.reminder && <Bell className="w-3 h-3 text-amber-500" />}
                      </div>
                      <p className="text-sm opacity-60 leading-relaxed">{task.desc}</p>
                      {task.repeatDays && task.repeatDays.length > 0 && (
                        <div className="flex gap-1 mt-3">
                           {daysOfWeek.map((d, i) => (
                             <span key={i} className={`w-4 h-4 flex items-center justify-center rounded-full text-[8px] font-bold ${task.repeatDays?.includes(i) ? 'bg-indigo-500/20 text-indigo-500' : 'bg-black/5 dark:bg-white/5 opacity-30'}`}>{d}</span>
                           ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity self-end sm:self-auto">
                    <div className="flex flex-col gap-1 mr-2">
                       <button onClick={() => moveItem(index, 'up')} disabled={index === 0} className="p-1 rounded bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 disabled:opacity-20"><ArrowUp className="w-3 h-3" /></button>
                       <button onClick={() => moveItem(index, 'down')} disabled={index === sortedRoutines.length - 1} className="p-1 rounded bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 disabled:opacity-20"><ArrowDown className="w-3 h-3" /></button>
                    </div>
                    <button onClick={() => startEdit(task)} className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                      <Edit2 className="w-4 h-4 opacity-70" />
                    </button>
                    <button onClick={() => deleteItem(task.id)} className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-rose-500/10 hover:text-rose-500 transition-colors">
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
