import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TaskItem } from '../types';
import { Plus, Trash2, Check, Clock, AlertCircle, X, Search, Filter } from 'lucide-react';

interface TasksProps {
  tasks: TaskItem[];
  onUpdateTasks: (tasks: TaskItem[]) => void;
  onAwardXP: (amount: number) => void;
}

export default function Tasks({ tasks, onUpdateTasks, onAwardXP }: TasksProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  
  // New task form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [subject, setSubject] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask: TaskItem = {
      id: `t_${Date.now()}`,
      title,
      description,
      priority,
      subject,
      dueDate,
      completed: false
    };

    onUpdateTasks([...tasks, newTask]);
    setTitle('');
    setDescription('');
    setPriority('medium');
    setSubject('');
    setDueDate('');
    setIsAdding(false);
  };

  const handleToggleComplete = (id: string) => {
    onUpdateTasks(tasks.map(t => {
      if (t.id === id) {
        if (!t.completed) {
          onAwardXP(10); // Reward for completion
        }
        return { ...t, completed: !t.completed };
      }
      return t;
    }));
  };

  const handleDelete = (id: string) => {
    onUpdateTasks(tasks.filter(t => t.id !== id));
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'completed' && !t.completed) return false;
    if (filter === 'pending' && t.completed) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      if (!t.title.toLowerCase().includes(s) && !(t.subject || '').toLowerCase().includes(s)) {
        return false;
      }
    }
    return true;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-4 sm:p-6 pb-32">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Advanced Task Manager</h2>
            <p className="text-sm opacity-60">Manage assignments, projects, and deadlines.</p>
          </div>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="px-6 py-3 rounded-xl bg-indigo-500 text-white font-semibold shadow-lg hover:shadow-indigo-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {isAdding ? 'Cancel' : 'New Task'}
          </button>
        </div>

        {/* Add Form */}
        <AnimatePresence>
          {isAdding && (
            <motion.form 
              initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAddTask}
              className="p-6 rounded-[2rem] bg-white/[0.03] backdrop-blur-2xl border border-black/5 dark:border-white/10 shadow-xl space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider opacity-60">Task Title</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="E.g., Math Assignment 4" className="w-full px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 outline-none focus:border-indigo-500 transition-colors" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider opacity-60">Subject (Optional)</label>
                  <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="E.g., Mathematics" className="w-full px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 outline-none focus:border-indigo-500 transition-colors" />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider opacity-60">Description (Optional)</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Task details..." className="w-full px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 outline-none focus:border-indigo-500 transition-colors resize-none h-24" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider opacity-60">Priority</label>
                  <select value={priority} onChange={e => setPriority(e.target.value as any)} className="w-full px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 outline-none focus:border-indigo-500 transition-colors">
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider opacity-60">Due Date (Optional)</label>
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 outline-none focus:border-indigo-500 transition-colors dark:text-white" />
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full sm:w-auto px-8 py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all">
                  Create Task
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/[0.03] backdrop-blur-md border border-black/5 dark:border-white/10 outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div className="flex bg-black/5 dark:bg-white/5 rounded-xl p-1 w-full sm:w-auto">
            <button onClick={() => setFilter('all')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === 'all' ? 'bg-white dark:bg-black shadow-md' : 'opacity-60 hover:opacity-100'}`}>All</button>
            <button onClick={() => setFilter('pending')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === 'pending' ? 'bg-white dark:bg-black shadow-md' : 'opacity-60 hover:opacity-100'}`}>Pending</button>
            <button onClick={() => setFilter('completed')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === 'completed' ? 'bg-white dark:bg-black shadow-md' : 'opacity-60 hover:opacity-100'}`}>Completed</button>
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredTasks.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 opacity-50">
                <Check className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No tasks found. You're all caught up!</p>
              </motion.div>
            )}
            {filteredTasks.map(task => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-5 rounded-2xl border transition-all ${task.completed ? 'bg-black/5 dark:bg-white/5 border-transparent opacity-60' : 'bg-white/[0.03] backdrop-blur-md border-black/5 dark:border-white/10 shadow-sm'}`}
              >
                <div className="flex gap-4 items-start">
                  <button 
                    onClick={() => handleToggleComplete(task.id)}
                    className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${task.completed ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-black/20 dark:border-white/20 hover:border-indigo-500'}`}
                  >
                    {task.completed && <Check className="w-4 h-4" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className={`text-lg font-bold truncate ${task.completed ? 'line-through' : ''}`}>{task.title}</h3>
                      {task.priority === 'high' && <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-600 dark:text-red-400 text-[10px] font-bold uppercase tracking-widest border border-red-500/20">High</span>}
                      {task.priority === 'medium' && <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-600 dark:text-orange-400 text-[10px] font-bold uppercase tracking-widest border border-orange-500/20">Medium</span>}
                      {task.subject && <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-widest border border-indigo-500/20">{task.subject}</span>}
                    </div>
                    {task.description && (
                      <p className={`text-sm opacity-70 mb-3 line-clamp-2 ${task.completed ? 'line-through' : ''}`}>{task.description}</p>
                    )}
                    {task.dueDate && (
                      <div className="flex items-center gap-1 text-xs font-semibold opacity-60">
                        <Clock className="w-3.5 h-3.5" /> Due: {task.dueDate}
                      </div>
                    )}
                  </div>
                  <button onClick={() => handleDelete(task.id)} className="p-2 text-red-500 opacity-0 group-hover:opacity-100 sm:opacity-100 hover:bg-red-500/10 rounded-xl transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>
    </motion.div>
  );
}
