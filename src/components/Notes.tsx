import React, { useState, useEffect, useRef } from 'react';
import { Settings, Calculator, Timer, FileText, Moon, Sun, Monitor, Palette, Sparkles, Activity, Info, ChevronRight, Hash, Play, Pause, RotateCcw, Plus, Trash2, Edit3, Copy } from 'lucide-react';
import { NoteItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface ToolsAndSettingsProps {
  notes: NoteItem[];
  onUpdateNotes: (newNotes: NoteItem[]) => void;
  isThemeLight?: boolean;
  onToggleTheme?: () => void;
}

const ToolsAndSettings = React.memo(function ToolsAndSettings({ notes, onUpdateNotes, isThemeLight, onToggleTheme }: ToolsAndSettingsProps) {
  const [activeTab, setActiveTab] = useState<'tools' | 'settings'>('settings');
  const [activeTool, setActiveTool] = useState<'calculator' | 'stopwatch' | 'notes'>('notes');

  const [isAnimationsEnabled, setIsAnimationsEnabled] = useState(true);
  const [isLazyLoading, setIsLazyLoading] = useState(true);
  const [isMemoryProtection, setIsMemoryProtection] = useState(true);

  // Notes State
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(notes.length > 0 ? notes[0].id : null);
  const selectedNote = notes.find((n) => n.id === selectedNoteId);

  // Stopwatch State
  const [swTime, setSwTime] = useState(0);
  const [swIsRunning, setSwIsRunning] = useState(false);
  const swIntervalRef = useRef<number | null>(null);

  // Calculator State
  const [calcDisplay, setCalcDisplay] = useState('0');

  useEffect(() => {
    if (swIsRunning) {
      const startTime = Date.now() - swTime;
      swIntervalRef.current = window.setInterval(() => {
        setSwTime(Date.now() - startTime);
      }, 10);
    } else {
      if (swIntervalRef.current) clearInterval(swIntervalRef.current);
    }
    return () => {
      if (swIntervalRef.current) clearInterval(swIntervalRef.current);
    };
  }, [swIsRunning]);

  const handleStartStopwatch = () => setSwIsRunning(true);
  const handlePauseStopwatch = () => setSwIsRunning(false);
  const handleResetStopwatch = () => {
    setSwIsRunning(false);
    setSwTime(0);
  };

  const formatStopwatchTime = (timeMs: number) => {
    const cs = Math.floor((timeMs % 1000) / 10).toString().padStart(2, '0');
    const s = Math.floor((timeMs / 1000) % 60).toString().padStart(2, '0');
    const m = Math.floor((timeMs / 60000) % 60).toString().padStart(2, '0');
    return `${m}:${s}.${cs}`;
  };

  const handleCalcPress = (char: string) => {
    setCalcDisplay((prev) => {
      if (prev === '0' || prev === 'Error') return char;
      return prev + char;
    });
  };

  const handleCalcClear = () => setCalcDisplay('0');
  const handleCalcSolve = () => {
    try {
      const processedExpr = calcDisplay.replace(/x/g, '*').replace(/÷/g, '/');
      const result = new Function(`return ${processedExpr}`)();
      setCalcDisplay(String(result));
    } catch {
      setCalcDisplay('Error');
    }
  };

  const createNote = () => {
    const newNote: NoteItem = {
      id: Date.now().toString(),
      title: 'New Note',
      content: '',
      category: 'General',
      updatedAt: new Date().toLocaleString(),
    };
    onUpdateNotes([newNote, ...notes]);
    setSelectedNoteId(newNote.id);
  };

  const deleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    onUpdateNotes(updated);
    if (selectedNoteId === id) setSelectedNoteId(updated.length > 0 ? updated[0].id : null);
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
            <Settings className="w-8 h-8 text-pink-500" />
            Config
          </h2>
          <p className="text-sm font-medium opacity-60 tracking-wide uppercase">System & Utilities</p>
        </div>

        <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-2xl backdrop-blur-md border border-black/5 dark:border-white/10 w-fit">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-2 text-sm font-bold rounded-xl transition-all duration-300 ${activeTab === 'settings' ? 'bg-white dark:bg-black text-black dark:text-white shadow-md' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'}`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`px-6 py-2 text-sm font-bold rounded-xl transition-all duration-300 ${activeTab === 'tools' ? 'bg-white dark:bg-black text-black dark:text-white shadow-md' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'}`}
          >
            Tools
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'settings' ? (
          <motion.div 
            key="settings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="space-y-6">
              <div className="p-6 rounded-[2rem] backdrop-blur-2xl border bg-white/[0.03] border-black/5 dark:border-white/10 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Palette className="w-32 h-32" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-widest opacity-60 mb-6 flex items-center gap-2 relative z-10">
                  <Palette className="w-4 h-4 text-pink-500" /> Appearance
                </h3>
                
                <div className="space-y-4 relative z-10">
                  <div 
                    onClick={onToggleTheme}
                    className="flex items-center justify-between p-4 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-black/5 dark:hover:border-white/10"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-black/5 dark:bg-white/10 rounded-xl">
                        {isThemeLight ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">Theme Mode</h4>
                        <p className="text-xs opacity-60 mt-0.5">Toggle light & dark ({isThemeLight ? 'Light' : 'Dark'})</p>
                      </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${!isThemeLight ? 'bg-sky-500' : 'bg-black/20 dark:bg-white/20'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform duration-300 ${!isThemeLight ? 'translate-x-7' : 'translate-x-1'}`} />
                    </div>
                  </div>

                  <div 
                    onClick={() => setIsAnimationsEnabled(!isAnimationsEnabled)}
                    className="flex items-center justify-between p-4 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-black/5 dark:hover:border-white/10"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-black/5 dark:bg-white/10 rounded-xl"><Sparkles className="w-5 h-5" /></div>
                      <div>
                        <h4 className="font-bold text-sm">Animations</h4>
                        <p className="text-xs opacity-60 mt-0.5">Motion & Blur effects</p>
                      </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${isAnimationsEnabled ? 'bg-pink-500' : 'bg-black/20 dark:bg-white/20'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all duration-300 ${isAnimationsEnabled ? 'left-7' : 'left-1'}`} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-[2rem] backdrop-blur-2xl border bg-white/[0.03] border-black/5 dark:border-white/10 shadow-xl">
                <h3 className="text-sm font-bold uppercase tracking-widest opacity-60 mb-6 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" /> Performance
                </h3>
                
                <div className="space-y-4">
                  <div 
                    onClick={() => setIsLazyLoading(!isLazyLoading)}
                    className="flex items-center justify-between p-4 rounded-2xl bg-black/5 dark:bg-white/5 cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-black/5 dark:bg-white/10 rounded-xl"><Monitor className="w-5 h-5" /></div>
                      <div>
                        <h4 className="font-bold text-sm">Lazy Loading</h4>
                        <p className="text-xs opacity-60 mt-0.5">Optimized rendering</p>
                      </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${isLazyLoading ? 'bg-emerald-500' : 'bg-black/20 dark:bg-white/20'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all duration-300 ${isLazyLoading ? 'left-7' : 'left-1'}`} />
                    </div>
                  </div>
                  <div 
                    onClick={() => setIsMemoryProtection(!isMemoryProtection)}
                    className="flex items-center justify-between p-4 rounded-2xl bg-black/5 dark:bg-white/5 cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-black/5 dark:bg-white/10 rounded-xl"><Activity className="w-5 h-5" /></div>
                      <div>
                        <h4 className="font-bold text-sm">Memory Leak Protection</h4>
                        <p className="text-xs opacity-60 mt-0.5">Auto-garbage collection</p>
                      </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${isMemoryProtection ? 'bg-emerald-500' : 'bg-black/20 dark:bg-white/20'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all duration-300 ${isMemoryProtection ? 'left-7' : 'left-1'}`} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-8 rounded-[2rem] backdrop-blur-2xl border bg-white/[0.03] border-black/5 dark:border-white/10 shadow-xl text-center relative overflow-hidden h-full flex flex-col justify-center items-center group">
                 <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
                 <div className="relative z-10 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-500 p-1 shadow-2xl shadow-indigo-500/30 mb-6">
                      <div className="w-full h-full rounded-[1.75rem] bg-black/20 backdrop-blur-xl flex items-center justify-center border border-white/20">
                        <span className="text-4xl">👑</span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight mb-2">Jarvis OS</h3>
                    <p className="text-sm opacity-60 mb-6">Version 5.0.0 (Ultimate Build)</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <span className="px-3 py-1 bg-black/5 dark:bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest opacity-80 border border-black/5 dark:border-white/10">iOS Architecture</span>
                      <span className="px-3 py-1 bg-black/5 dark:bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest opacity-80 border border-black/5 dark:border-white/10">120 FPS target</span>
                      <span className="px-3 py-1 bg-black/5 dark:bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest opacity-80 border border-black/5 dark:border-white/10">Edge-to-Edge</span>
                    </div>
                 </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="tools"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex bg-black/5 dark:bg-white/5 p-1.5 rounded-2xl backdrop-blur-md border border-black/5 dark:border-white/10 max-w-md mx-auto">
              {[
                { id: 'notes', icon: FileText, label: 'Notes' },
                { id: 'calculator', icon: Calculator, label: 'Calc' },
                { id: 'stopwatch', icon: Timer, label: 'Timer' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTool(t.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${activeTool === t.id ? 'bg-white dark:bg-black text-black dark:text-white shadow-md' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'}`}
                >
                  <t.icon className="w-4 h-4" /> <span className="hidden sm:inline">{t.label}</span>
                </button>
              ))}
            </div>

            <div className="p-6 rounded-[2rem] backdrop-blur-2xl border bg-white/[0.03] border-black/5 dark:border-white/10 shadow-xl min-h-[500px]">
              <AnimatePresence mode="wait">
                {activeTool === 'notes' && (
                  <motion.div key="notes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/3 flex flex-col gap-4 border-b md:border-b-0 md:border-r border-black/10 dark:border-white/10 pb-4 md:pb-0 md:pr-4">
                       <button onClick={createNote} className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-bold text-sm transition-all shadow-md active:scale-95">
                         <Plus className="w-4 h-4" /> New Note
                       </button>
                       <div className="space-y-2 overflow-y-auto max-h-[400px]">
                         {notes.map(n => (
                           <div 
                             key={n.id} 
                             onClick={() => setSelectedNoteId(n.id)}
                             className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedNoteId === n.id ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-black/5 dark:bg-white/5 border-transparent hover:border-black/10 dark:hover:border-white/10'}`}
                           >
                             <h4 className="font-bold text-sm truncate">{n.title || 'Untitled Note'}</h4>
                             <p className="text-[10px] opacity-50 mt-1">{n.updatedAt}</p>
                           </div>
                         ))}
                       </div>
                    </div>
                    <div className="md:w-2/3 flex flex-col gap-4 min-h-[300px]">
                      {selectedNote ? (
                        <>
                          <div className="flex items-center justify-between">
                            <input 
                              type="text" 
                              value={selectedNote.title} 
                              onChange={(e) => {
                                onUpdateNotes(notes.map(n => n.id === selectedNote.id ? {...n, title: e.target.value} : n));
                              }}
                              className="text-2xl font-bold bg-transparent border-none outline-none focus:ring-0 w-full"
                              placeholder="Note Title"
                            />
                            <button onClick={() => deleteNote(selectedNote.id)} className="p-2 text-black/30 dark:text-white/30 hover:text-rose-500 rounded-xl transition-colors"><Trash2 className="w-5 h-5" /></button>
                          </div>
                          <textarea 
                            value={selectedNote.content}
                            onChange={(e) => {
                               onUpdateNotes(notes.map(n => n.id === selectedNote.id ? {...n, content: e.target.value} : n));
                            }}
                            className="flex-1 w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-4 resize-none outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-sm leading-relaxed"
                            placeholder="Start typing your thoughts..."
                          />
                        </>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center opacity-30">
                          <FileText className="w-16 h-16 mb-4" />
                          <p className="font-bold">Select or create a note</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTool === 'stopwatch' && (
                  <motion.div key="sw" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center py-12">
                    <div className="w-64 h-64 rounded-full border-8 border-black/5 dark:border-white/10 flex items-center justify-center relative shadow-2xl mb-12">
                       <div className="absolute inset-0 rounded-full border-8 border-rose-500/20" />
                       <div className="absolute inset-0 rounded-full border-8 border-rose-500 border-l-transparent border-t-transparent animate-spin-slow opacity-50" style={{ animationDuration: '3s' }} />
                       <span className="text-5xl font-black font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-rose-400 to-orange-500">
                         {formatStopwatchTime(swTime)}
                       </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <button onClick={swIsRunning ? handlePauseStopwatch : handleStartStopwatch} className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 hover:scale-105 active:scale-95 transition-all">
                        {swIsRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                      </button>
                      <button onClick={handleResetStopwatch} className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/20 transition-all">
                        <RotateCcw className="w-6 h-6" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {activeTool === 'calculator' && (
                  <motion.div key="calc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center max-w-sm mx-auto py-8">
                     <div className="w-full bg-black/5 dark:bg-black/30 rounded-3xl p-6 shadow-inner border border-black/10 dark:border-white/5 mb-6 text-right overflow-hidden">
                       <span className="text-5xl font-black font-mono tracking-tighter block w-full overflow-x-auto scrollbar-hide">{calcDisplay}</span>
                     </div>
                     <div className="grid grid-cols-4 gap-3 sm:gap-4 w-full">
                       {['C', '(', ')', '÷', '7', '8', '9', 'x', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '=', '%'].map((btn) => (
                         <button
                           key={btn}
                           onClick={() => {
                             if (btn === 'C') handleCalcClear();
                             else if (btn === '=') handleCalcSolve();
                             else handleCalcPress(btn);
                           }}
                           className={`aspect-square rounded-2xl flex items-center justify-center text-xl font-bold shadow-md hover:-translate-y-1 active:translate-y-0 transition-all ${
                             ['÷', 'x', '-', '+', '='].includes(btn) 
                               ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-indigo-500/25' 
                               : btn === 'C' ? 'bg-rose-500/10 text-rose-500' 
                               : 'bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20'
                           }`}
                         >
                           {btn}
                         </button>
                       ))}
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

export default ToolsAndSettings;
