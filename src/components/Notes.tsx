import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit3, Search, Sparkles, Copy, Hash, Play, Pause, RotateCcw, HelpCircle } from 'lucide-react';
import { NoteItem } from '../types';

interface NotesProps {
  notes: NoteItem[];
  onUpdateNotes: (newNotes: NoteItem[]) => void;
}

const DEFAULT_CATEGORIES = ['All', 'College & PCM', 'Coding Tasks', 'Homework Logs', 'Scratchpad'];

export default function Notes({ notes, onUpdateNotes }: NotesProps) {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(
    notes.length > 0 ? notes[0].id : null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState('Scratchpad');

  // Interactive Stopwatch State
  const [swTime, setSwTime] = useState(0);
  const [swIsRunning, setSwIsRunning] = useState(false);
  const swIntervalRef = useRef<number | null>(null);

  // Keyboard-Friendly Calculator State
  const [calcDisplay, setCalcDisplay] = useState('0');

  // Master Note object
  const selectedNote = notes.find((n) => n.id === selectedNoteId);

  // Stopwatch Logic
  useEffect(() => {
    if (swIsRunning) {
      const startTime = Date.now() - swTime;
      swIntervalRef.current = window.setInterval(() => {
        setSwTime(Date.now() - startTime);
      }, 10);
    } else {
      if (swIntervalRef.current) {
        clearInterval(swIntervalRef.current);
      }
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
    const s = Math.floor((timeMs / 1000) % 65).toString().padStart(2, '0');
    const m = Math.floor((timeMs / 60000) % 65).toString().padStart(2, '0');
    return `${m}:${s}.${cs}`;
  };

  // Calculator Logic
  const handleCalcPress = (char: string) => {
    setCalcDisplay((prev) => {
      if (prev === '0' || prev === 'Error') {
        return char;
      }
      return prev + char;
    });
  };

  const handleCalcClear = () => {
    setCalcDisplay('0');
  };

  const handleCalcSolve = () => {
    try {
      // Explicitly evaluate mathematical expression securely using Function constructor
      // This is a safe browser approach representing the user's intent:
      const processedExpr = calcDisplay.replace(/x/g, '*');
      const result = new Function(`return ${processedExpr}`)();
      setCalcDisplay(String(result));
    } catch (e) {
      setCalcDisplay('Error');
    }
  };

  // Notes state updates
  const createNote = () => {
    const title = newNoteTitle.trim() || `New Note ${notes.length + 1}`;
    const newNote: NoteItem = {
      id: Date.now().toString(),
      title,
      content: '',
      category: newNoteCategory,
      updatedAt: new Date().toLocaleString(),
    };
    const updated = [newNote, ...notes];
    onUpdateNotes(updated);
    setSelectedNoteId(newNote.id);
    setNewNoteTitle('');
  };

  const updateSelectedContent = (content: string) => {
    if (!selectedNoteId) return;
    const updated = notes.map((item) => {
      if (item.id === selectedNoteId) {
        return {
          ...item,
          content,
          updatedAt: new Date().toLocaleString(),
        };
      }
      return item;
    });
    onUpdateNotes(updated);
  };

  const updateSelectedTitle = (title: string) => {
    if (!selectedNoteId) return;
    const updated = notes.map((item) => {
      if (item.id === selectedNoteId) {
        return {
          ...item,
          title,
          updatedAt: new Date().toLocaleString(),
        };
      }
      return item;
    });
    onUpdateNotes(updated);
  };

  const updateSelectedCategory = (category: string) => {
    if (!selectedNoteId) return;
    const updated = notes.map((item) => {
      if (item.id === selectedNoteId) {
        return {
          ...item,
          category,
          updatedAt: new Date().toLocaleString(),
        };
      }
      return item;
    });
    onUpdateNotes(updated);
  };

  const deleteNote = (id: string) => {
    if (confirm('De-compile this notes container permanently?')) {
      const updated = notes.filter((item) => item.id !== id);
      onUpdateNotes(updated);
      if (selectedNoteId === id) {
        setSelectedNoteId(updated.length > 0 ? updated[0].id : null);
      }
    }
  };

  const copyToClipboard = () => {
    if (!selectedNote) return;
    navigator.clipboard.writeText(selectedNote.content);
    alert('Note content copied to clipboard!');
  };

  const triggerPCMTemplate = () => {
    if (!selectedNote) return;
    const pcmTemplate = `📍 PHYSICS / CHEMISTRY / MATHS CONCEPT DIARY\n` +
      `--------------------------------------------------\n` +
      `📅 Subject: \n` +
      `📚 Topic: \n\n` +
      `📝 Core Equations & Theorems:\n` +
      `• Formula 1: \n` +
      `• Formula 2: \n\n` +
      `🤔 Problem Patterns & Steps:\n` +
      `1. \n` +
      `2. \n\n` +
      `💡 Key Concepts / Intuitions:\n\n`;
    updateSelectedContent(selectedNote.content + pcmTemplate);
  };

  const triggerHomeworkTemplate = () => {
    if (!selectedNote) return;
    const hwTemplate = `📝 COLLEGE HOMEWORK LOG SHEET\n` +
      `-------------------------------------------\n` +
      `📅 Date Issued: ${new Date().toLocaleDateString()}\n` +
      `⏳ Subject & Assignment Focus:\n` +
      `• \n\n` +
      `📌 Criteria for Completion:\n` +
      `• [ ] Solve exercise questions\n` +
      `• [ ] Draw relevant diagrams / proof graphs\n` +
      `• [ ] Verify answers with answers sheet\n\n` +
      `✍️ Solution draft / notes:\n\n`;
    updateSelectedContent(selectedNote.content + hwTemplate);
  };

  const filteredNotes = notes.filter((n) => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || n.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* View Title */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles className="text-violet-400 w-5 h-5 animate-pulse" />
          UTILITIES & SCAMP WORKSPACE
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Tactical toolkits housing an integrated stopwatch, calculation engine, and notes scratchpad.
        </p>
      </div>

      {/* Top row: Stopwatch + Calculator */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Stopwatch Card */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 shadow-xl relative overflow-hidden transition-all duration-300 hover:border-sky-500/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase flex items-center gap-1.5">
              <span>⏱️</span> stopwatch unit
            </h3>
            <span className="text-[9px] font-mono font-bold text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded border border-sky-500/20">
              Chronominder
            </span>
          </div>

          <div className="flex flex-col items-center py-4 bg-slate-950/40 rounded-xl border border-slate-800/60 pb-6">
            <span className="text-4xl font-extrabold font-mono tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">
              {formatStopwatchTime(swTime)}
            </span>
            <span className="text-[10px] uppercase tracking-widest font-mono text-slate-505 block mt-1.5">
              minutes : seconds . millis
            </span>
          </div>

          <div className="flex items-center gap-3 mt-4">
            {!swIsRunning ? (
              <button
                onClick={handleStartStopwatch}
                className="flex-1 py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" /> Start
              </button>
            ) : (
              <button
                onClick={handlePauseStopwatch}
                className="flex-1 py-2 px-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-450 hover:bg-rose-500/25 font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Pause className="w-3.5 h-3.5 fill-current" /> Pause
              </button>
            )}

            <button
              onClick={handleResetStopwatch}
              className="flex-1 py-2 px-4 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-350 font-bold text-xs border border-slate-800 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
        </div>

        {/* Calculator Card */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 shadow-xl relative overflow-hidden transition-all duration-300 hover:border-emerald-500/10">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase flex items-center gap-1.5">
              <span>🧮</span> math calculator
            </h3>
            <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
              Expression solver
            </span>
          </div>

          <div className="space-y-2.5">
            {/* Input Display screen */}
            <div className="bg-slate-955/70 rounded-xl border border-slate-800/80 p-3 text-right text-lg font-mono font-bold text-white shadow-inner truncate">
              {calcDisplay}
            </div>

            {/* Buttons Grid layout */}
            <div className="grid grid-cols-4 gap-1.5">
              <button
                onClick={handleCalcClear}
                className="p-2 bg-rose-500/15 border border-rose-500/20 text-rose-450 rounded-lg text-xs font-extrabold hover:bg-rose-500/25 active:scale-95 cursor-pointer font-mono"
              >
                C
              </button>
              <button
                onClick={() => handleCalcPress('(')}
                className="p-2 bg-slate-950/60 border border-slate-800/80 rounded-lg text-xs font-bold text-slate-300 hover:bg-slate-900/80 active:scale-95 cursor-pointer font-mono"
              >
                (
              </button>
              <button
                onClick={() => handleCalcPress(')')}
                className="p-2 bg-slate-950/60 border border-slate-800/80 rounded-lg text-xs font-bold text-slate-300 hover:bg-slate-900/80 active:scale-95 cursor-pointer font-mono"
              >
                )
              </button>
              <button
                onClick={() => handleCalcPress('/')}
                className="p-2 bg-slate-950/60 border border-slate-800/80 rounded-lg text-xs font-bold text-sky-400 hover:bg-slate-900/80 active:scale-95 cursor-pointer font-mono"
              >
                /
              </button>

              <button
                onClick={() => handleCalcPress('7')}
                className="p-2 bg-slate-950/40 border border-slate-850 rounded-lg text-xs font-bold text-slate-200 hover:bg-slate-900/50 active:scale-95 cursor-pointer font-mono"
              >
                7
              </button>
              <button
                onClick={() => handleCalcPress('8')}
                className="p-2 bg-slate-950/40 border border-slate-850 rounded-lg text-xs font-bold text-slate-200 hover:bg-slate-900/50 active:scale-95 cursor-pointer font-mono"
              >
                8
              </button>
              <button
                onClick={() => handleCalcPress('9')}
                className="p-2 bg-slate-950/40 border border-slate-850 rounded-lg text-xs font-bold text-slate-200 hover:bg-slate-900/50 active:scale-95 cursor-pointer font-mono"
              >
                9
              </button>
              <button
                onClick={() => handleCalcPress('x')}
                className="p-2 bg-slate-950/60 border border-slate-800/80 rounded-lg text-xs font-bold text-sky-400 hover:bg-slate-900/80 active:scale-95 cursor-pointer font-mono"
              >
                x
              </button>

              <button
                onClick={() => handleCalcPress('4')}
                className="p-2 bg-slate-950/40 border border-slate-850 rounded-lg text-xs font-bold text-slate-200 hover:bg-slate-900/50 active:scale-95 cursor-pointer font-mono"
              >
                4
              </button>
              <button
                onClick={() => handleCalcPress('5')}
                className="p-2 bg-slate-950/40 border border-slate-850 rounded-lg text-xs font-bold text-slate-200 hover:bg-slate-900/50 active:scale-95 cursor-pointer font-mono"
              >
                5
              </button>
              <button
                onClick={() => handleCalcPress('6')}
                className="p-2 bg-slate-950/40 border border-slate-850 rounded-lg text-xs font-bold text-slate-200 hover:bg-slate-900/50 active:scale-95 cursor-pointer font-mono"
              >
                6
              </button>
              <button
                onClick={() => handleCalcPress('-')}
                className="p-2 bg-slate-950/60 border border-slate-800/80 rounded-lg text-xs font-bold text-sky-400 hover:bg-slate-900/80 active:scale-95 cursor-pointer font-mono"
              >
                -
              </button>

              <button
                onClick={() => handleCalcPress('1')}
                className="p-2 bg-slate-950/40 border border-slate-850 rounded-lg text-xs font-bold text-slate-200 hover:bg-slate-900/50 active:scale-95 cursor-pointer font-mono"
              >
                1
              </button>
              <button
                onClick={() => handleCalcPress('2')}
                className="p-2 bg-slate-950/40 border border-slate-850 rounded-lg text-xs font-bold text-slate-200 hover:bg-slate-900/50 active:scale-95 cursor-pointer font-mono"
              >
                2
              </button>
              <button
                onClick={() => handleCalcPress('3')}
                className="p-2 bg-slate-950/40 border border-slate-850 rounded-lg text-xs font-bold text-slate-200 hover:bg-slate-900/50 active:scale-95 cursor-pointer font-mono"
              >
                3
              </button>
              <button
                onClick={() => handleCalcPress('+')}
                className="p-2 bg-slate-950/60 border border-slate-800/80 rounded-lg text-xs font-bold text-sky-400 hover:bg-slate-900/80 active:scale-95 cursor-pointer font-mono"
              >
                +
              </button>

              <button
                onClick={() => handleCalcPress('0')}
                className="col-span-2 p-2 bg-slate-950/40 border border-slate-850 rounded-lg text-xs font-bold text-slate-200 hover:bg-slate-900/50 active:scale-95 cursor-pointer font-mono"
              >
                0
              </button>
              <button
                onClick={() => handleCalcPress('.')}
                className="p-2 bg-slate-950/40 border border-slate-850 rounded-lg text-xs font-bold text-slate-200 hover:bg-slate-900/50 active:scale-95 cursor-pointer font-mono"
              >
                .
              </button>
              <button
                onClick={handleCalcSolve}
                className="p-2 bg-sky-500 hover:bg-sky-400 text-slate-95 bg-sky-500 rounded-lg text-xs font-extrabold active:scale-95 cursor-pointer font-mono"
              >
                =
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Dynamic Multi-Page Scratchpad */}
      <h3 className="text-sm font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-2 pt-4">
        <span>💾</span> Notes Scratchpad Archive
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar notes list */}
        <div className="lg:col-span-1 bg-slate-900/30 border border-slate-800/80 rounded-2xl p-4 flex flex-col h-[480px]">
          {/* Search */}
          <div className="relative mb-3.5">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search cells..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Categories select wrap */}
          <div className="flex gap-1 overflow-x-auto pb-2.5 mb-3.5 border-b border-slate-800/60 no-scrollbar">
            {DEFAULT_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/20'
                    : 'text-slate-500 border border-transparent hover:text-slate-300'
                }`}
              >
                {cat.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Spawn Header details */}
          <div className="space-y-2 mb-4">
            <div className="flex gap-1.5">
              <input
                type="text"
                placeholder="Spawn name..."
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-sky-500 font-sans"
              />
              <button
                onClick={createNote}
                className="bg-sky-500 hover:bg-sky-400 text-slate-950 p-1.5 rounded-lg active:scale-95 transition-all text-xs font-bold cursor-pointer"
                title="Spawn item"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <select
              value={newNoteCategory}
              onChange={(e) => setNewNoteCategory(e.target.value)}
              className="w-full bg-[#0c1020] border border-slate-800 text-[10px] text-slate-400 rounded-lg py-1 px-2 focus:outline-none cursor-pointer"
            >
              <option value="College & PCM">🏢 College & PCM</option>
              <option value="Coding Tasks">💻 Coding Tasks</option>
              <option value="Homework Logs">📝 Homework Logs</option>
              <option value="Scratchpad">📚 Scratchpad</option>
            </select>
          </div>

          {/* List entries */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
            {filteredNotes.length === 0 ? (
              <div className="text-[11px] text-slate-500 text-center py-8">
                No entries found.
              </div>
            ) : (
              filteredNotes.map((n) => (
                <div
                  key={n.id}
                  onClick={() => setSelectedNoteId(n.id)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    selectedNoteId === n.id
                      ? 'bg-sky-500/[0.04] border-sky-500/40'
                      : 'bg-slate-950/20 border-slate-800/40 hover:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <h4 className={`text-xs font-bold truncate ${selectedNoteId === n.id ? 'text-sky-400' : 'text-slate-300'}`}>
                      {n.title || 'Untitled sheet'}
                    </h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(n.id);
                      }}
                      className="p-1 text-slate-605 hover:text-rose-400 rounded transition-all opacity-40 hover:opacity-100"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate mt-1">
                    {n.content ? n.content.substring(0, 30) : 'Empty sheet...'}
                  </p>
                  <div className="flex items-center justify-between mt-2.5 pt-1.5 border-t border-slate-900/60">
                    <span className="text-[8px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-400 font-bold uppercase tracking-wide">
                      {n.category}
                    </span>
                    <span className="text-[8px] text-slate-600 font-mono">
                      {n.updatedAt.split(', ')[0]}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Notes Editor content pane */}
        <div className="lg:col-span-3 bg-slate-900/30 border border-slate-800/80 rounded-2xl p-5 flex flex-col h-[480px]">
          {selectedNote ? (
            <div className="flex-1 flex flex-col space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/60">
                <div className="space-y-1 flex-1">
                  <input
                    type="text"
                    value={selectedNote.title}
                    onChange={(e) => updateSelectedTitle(e.target.value)}
                    className="bg-transparent border-none text-base font-bold text-white focus:outline-none w-full placeholder-slate-400"
                    placeholder="Note Header"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-550 font-mono">
                      Updated: {selectedNote.updatedAt}
                    </span>
                    <span className="text-slate-750 font-mono text-[10px]">|</span>
                    <select
                      value={selectedNote.category}
                      onChange={(e) => updateSelectedCategory(e.target.value)}
                      className="bg-slate-900/60 text-[10px] text-sky-400 font-bold uppercase tracking-wider py-0.5 px-2 rounded-md outline-none cursor-pointer"
                    >
                      <option value="College & PCM">College & PCM</option>
                      <option value="Coding Tasks">Coding Tasks</option>
                      <option value="Homework Logs">Homework Logs</option>
                      <option value="Scratchpad">Scratchpad</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <button
                    onClick={triggerPCMTemplate}
                    className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase transition-all flex items-center gap-1 hover:bg-amber-500/15 cursor-pointer"
                  >
                    <Hash className="w-3 h-3" /> PCM Grid
                  </button>
                  <button
                    onClick={triggerHomeworkTemplate}
                    className="px-2.5 py-1 rounded bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-bold uppercase transition-all flex items-center gap-1 hover:bg-violet-500/15 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" /> HW log
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className="p-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
                    title="Copy full notes sheet"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 relative">
                <textarea
                  value={selectedNote.content}
                  onChange={(e) => updateSelectedContent(e.target.value)}
                  placeholder="Compose equations, criteria, or concepts... Auto-saves instantly."
                  className="w-full h-full font-mono text-xs sm:text-sm leading-relaxed p-4 bg-slate-950/40 rounded-xl border border-slate-800/60 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500/80 resize-none overflow-y-auto"
                />
                <div className="absolute bottom-2.5 right-3 text-[10px] font-mono text-slate-600 bg-[#070b16] px-2 py-0.5 rounded border border-slate-900/60 select-none">
                  Chr: {selectedNote.content.length} | Wrd: {selectedNote.content.trim() ? selectedNote.content.trim().split(/\s+/).length : 0}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 py-12 select-none">
              <Plus className="w-12 h-12 text-slate-700 mb-3" />
              <h4 className="font-semibold text-slate-450">Scratchpad Core Inactive</h4>
              <p className="text-xs max-w-sm mt-1">
                Select an entry from the left column index or spawn a tab to record definitions and logs.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
