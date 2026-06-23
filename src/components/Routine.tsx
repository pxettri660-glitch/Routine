import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Plus, Trash2, Edit2, RotateCcw, AlertTriangle } from 'lucide-react';
import { RoutineItem } from '../types';

interface RoutineProps {
  routines: RoutineItem[];
  currentTask: RoutineItem | null;
  onUpdateRoutines: (newRoutines: RoutineItem[]) => void;
  onResetToDefault: () => void;
}

export default function Routine({
  routines,
  currentTask,
  onUpdateRoutines,
  onResetToDefault,
}: RoutineProps) {
  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // Creation State
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

  const cancelEdit = () => {
    setEditingId(null);
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
    if (confirm('Are you sure you want to delete this sequence block?')) {
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

  // Sort by start time chronological
  const sortedRoutines = [...routines].sort((a, b) => {
    return a.start.localeCompare(b.start);
  });

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="text-sky-400 w-5 h-5" />
            PROGRAMMED SEQUENCE TIMELINE
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic timeline blocks tracking your core schedule.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            Create Block
          </button>
          
          <button
            onClick={onResetToDefault}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all border border-slate-700 shadow-md active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Restore Default Default
          </button>
        </div>
      </div>

      {/* Creation form */}
      <AnimatePresence>
        {isCreating && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl space-y-4 shadow-xl overflow-hidden"
          >
            <h3 className="text-sm font-semibold text-sky-400">Add New Sequence Block</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Coding Practice"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">End Time</label>
                  <input
                    type="time"
                    value={newEnd}
                    onChange={(e) => setNewEnd(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Description</label>
              <input
                type="text"
                placeholder="Context or criteria for completion..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div className="flex justify-end gap-2 text-xs pt-1">
              <button
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg font-bold"
              >
                Cancel
              </button>
              <button
                onClick={createItem}
                className="px-4 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-lg font-bold"
              >
                Add Schedule
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Routine list blocks */}
      <motion.div className="space-y-4" layout>
        <AnimatePresence>
          {sortedRoutines.map((item) => {
            const isActive = currentTask?.id === item.id;
            const isEditing = editingId === item.id;

            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                key={item.id}
                className={`transition-all duration-300 rounded-xl border p-4 backdrop-blur bg-slate-950/20 ${
                  isActive
                    ? 'border-emerald-500/80 bg-emerald-500/[0.04] shadow-lg shadow-emerald-500/10'
                    : 'border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {isEditing ? (
                  /* Editable form block */
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="bg-slate-900 border border-slate-800 text-sm rounded-lg px-3 py-1.5 text-white font-bold w-full focus:outline-none focus:border-sky-500"
                      />
                      <div className="flex gap-2 items-center">
                        <input
                          type="time"
                          value={editStart}
                          onChange={(e) => setEditStart(e.target.value)}
                          className="bg-slate-900 border border-slate-800 text-xs rounded-lg px-2 py-1 text-white font-mono"
                        />
                        <span className="text-slate-600 text-xs">-</span>
                        <input
                          type="time"
                          value={editEnd}
                          onChange={(e) => setEditEnd(e.target.value)}
                          className="bg-slate-900 border border-slate-800 text-xs rounded-lg px-2 py-1 text-white font-mono"
                        />
                      </div>
                    </div>
                    <input
                      type="text"
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      placeholder="Short description..."
                      className="bg-slate-900 border border-slate-800 text-xs rounded-lg px-3 py-1.5 text-slate-300 w-full focus:outline-none focus:border-sky-500"
                    />
                    <div className="flex justify-end gap-2 text-xs pt-1">
                      <button
                        onClick={cancelEdit}
                        className="px-2.5 py-1 bg-slate-850 hover:bg-slate-800 text-slate-400 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => saveEdit(item.id)}
                        className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Main interactive card block */
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/15">
                          {convertTo12Hour(item.start)} - {convertTo12Hour(item.end)}
                        </span>
                        {isActive && (
                          <span className="animate-pulse bg-emerald-500 text-slate-950 font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-full shadow-md shadow-emerald-500/20">
                            Active Now
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-slate-200 mt-1">{item.title}</h4>
                      <p className="text-xs text-slate-400">{item.desc}</p>
                    </div>

                    <div className="flex items-center gap-2 border-t border-slate-900 sm:border-0 pt-2 sm:pt-0">
                      <button
                        onClick={() => startEdit(item)}
                        className="p-1.5 text-slate-450 hover:text-sky-400 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800 cursor-pointer transition-all"
                        title="Edit item"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="p-1.5 text-slate-450 hover:text-rose-400 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800 cursor-pointer transition-all"
                        title="Delete item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
