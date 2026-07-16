import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Play, Square, Settings, Terminal as TerminalIcon, X, Maximize2, Minimize2, Copy, Trash2, ChevronDown, FileCode, Bot, BookOpen, CornerDownLeft, Undo2, Redo2, ClipboardPaste, ArrowLeft as ArrowLeftIcon, ArrowRight, ArrowUp, ArrowDown, Indent, Outdent, Plus } from 'lucide-react';
import Editor, { useMonaco } from '@monaco-editor/react';
import { Problem } from './types';
import { useAuth } from '../../contexts/AuthContext';

interface MobileWorkspaceProps {
  problem?: Problem;
  onAwardXP: (amount: number) => void;
  onClose: () => void;
}

export default function MobileWorkspace({ problem, onAwardXP, onClose }: MobileWorkspaceProps) {
  const [files, setFiles] = useState([{ id: '1', name: problem ? 'solution.ts' : 'main.ts', content: problem?.starterCode || '// Write your code here\n', language: problem?.language || 'typescript' }]);
  const [activeFileId, setActiveFileId] = useState('1');
  const activeFile = files.find(f => f.id === activeFileId) || files[0];
  const [code, setCode] = useState(activeFile.content);
  
  useEffect(() => {
    setCode(activeFile.content);
  }, [activeFileId]);
  
  useEffect(() => {
    setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content: code } : f));
  }, [code]);
  
  const [showFiles, setShowFiles] = useState(false);
  
  const createNewFile = () => {
    const newId = Date.now().toString();
    setFiles([...files, { id: newId, name: `file${files.length + 1}.ts`, content: '', language: 'typescript' }]);
    setActiveFileId(newId);
    setShowFiles(false);
  };
  
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<{ type: 'success' | 'error' | 'info'; text: string; time?: string }[]>([]);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'problem' | 'ai'>('editor');
  const [terminalHeight, setTerminalHeight] = useState(300);
  const { user } = useAuth();
  
  const monaco = useMonaco();
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
  };

  const insertText = (text: string) => {
    if (editorRef.current && monaco) {
      const position = editorRef.current.getPosition();
      editorRef.current.executeEdits('toolbar', [{
        range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
        text: text,
        forceMoveMarkers: true
      }]);
      editorRef.current.focus();
    }
  };

  const triggerAction = (actionId: string) => {
    if (editorRef.current) {
      editorRef.current.trigger('toolbar', actionId, null);
      editorRef.current.focus();
    }
  };

  const runCode = async () => {
    setIsRunning(true);
    setIsTerminalOpen(true);
    
    setOutput(prev => [...prev, { type: 'info', text: 'Compiling...', time: new Date().toLocaleTimeString() }]);
    
    setTimeout(() => {
      setIsRunning(false);
      if (code.includes('error')) {
        setOutput(prev => [...prev, { type: 'error', text: 'SyntaxError: Unexpected token', time: new Date().toLocaleTimeString() }]);
      } else {
        setOutput(prev => [...prev, { type: 'success', text: 'Program executed successfully.\nOutput:\nHello World!', time: new Date().toLocaleTimeString() }]);
        if (problem) onAwardXP(25);
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-[#0a0a0a] flex flex-col font-sans overflow-hidden">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-black/10 dark:border-white/10 bg-slate-50 dark:bg-[#111111]">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 -ml-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex flex-col">
            <button onClick={() => setShowFiles(true)} className="text-sm font-bold truncate max-w-[150px] flex items-center gap-1 hover:text-indigo-500">
    {activeFile.name} <ChevronDown className="w-3 h-3" />
  </button>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Ready</span>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
          {activeTab === 'editor' && (
            <button 
              onClick={runCode}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-bold text-sm transition-all active:scale-95 whitespace-nowrap"
            >
              {isRunning ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isRunning ? 'Stop' : 'Run'}</span>
            </button>
          )}
          <button className="p-2 rounded-xl bg-black/5 dark:bg-white/5 text-black/70 dark:text-white/70">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative flex flex-col min-h-0 bg-[#1e1e1e]">
        {activeTab === 'editor' && (
          <div className="flex-1 relative min-h-0 flex flex-col">
            <div className="flex-1 relative">
              <Editor
                height="100%"
                language={activeFile.language || 'typescript'}
                theme="vs-dark"
                value={code}
                onChange={(val) => setCode(val || '')}
                onMount={handleEditorDidMount}
                options={{
                  minimap: { enabled: false },
                  fontSize: 16,
                  wordWrap: 'on',
                  wrappingIndent: 'indent',
                  padding: { top: 16, bottom: 16 },
                  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                  smoothScrolling: true,
                  cursorBlinking: 'smooth',
                  cursorSmoothCaretAnimation: 'on',
                  formatOnPaste: true,
                  lineNumbersMinChars: 3,
                  lineDecorationsWidth: 0,
                  renderLineHighlight: 'all',
                  scrollbar: {
                    verticalScrollbarSize: 4,
                    horizontalScrollbarSize: 4
                  }
                }}
              />
            </div>

            {/* Mobile Coding Toolbar - Above Keyboard */}
            <div className="bg-[#252526] border-t border-[#3c3c3c] py-2 px-2 overflow-x-auto hide-scrollbar flex gap-2 shadow-[0_-4px_20px_rgba(0,0,0,0.3)] touch-none">
              <button onClick={() => triggerAction('undo')} className="toolbar-btn"><Undo2 className="w-4 h-4" /></button>
              <button onClick={() => triggerAction('redo')} className="toolbar-btn"><Redo2 className="w-4 h-4" /></button>
              <button onClick={() => triggerAction('editor.action.clipboardCopyAction')} className="toolbar-btn"><Copy className="w-4 h-4" /></button>
              <button onClick={() => triggerAction('editor.action.clipboardPasteAction')} className="toolbar-btn"><ClipboardPaste className="w-4 h-4" /></button>
              <div className="w-px h-8 bg-[#3c3c3c] shrink-0 mx-1"></div>
              {['{', '}', '(', ')', '[', ']', '<', '>', ';', ':', '"', "'", '=', '+', '-', '*', '/', '&', '|', '!', '?', ',', '.'].map(char => (
                <button key={char} onClick={() => insertText(char)} className="toolbar-btn text-base font-mono">
                  {char}
                </button>
              ))}
              <div className="w-px h-8 bg-[#3c3c3c] shrink-0 mx-1"></div>
              <button onClick={() => insertText('  ')} className="toolbar-btn font-bold text-xs px-3">TAB</button>
            </div>
          </div>
        )}

        {activeTab === 'problem' && (
          <div className="flex-1 overflow-y-auto p-4 bg-white dark:bg-[#0a0a0a]">
            {problem ? (
              <div className="max-w-2xl mx-auto space-y-6 pb-20">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                      problem.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-500' :
                      problem.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-rose-500/10 text-rose-500'
                    }`}>{problem.difficulty}</span>
                    <span className="text-black/50 dark:text-white/50 text-sm font-semibold">{problem.category}</span>
                  </div>
                  <h2 className="text-3xl font-black">{problem.title}</h2>
                </div>
                
                <div className="prose dark:prose-invert max-w-none text-black/80 dark:text-white/80 leading-relaxed text-lg font-medium">
                  {problem.description.split('\n').map((p, i) => <p key={i}>{p}</p>)}
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Examples</h3>
                  {problem.examples?.map((ex, i) => (
                    <div key={i} className="bg-slate-50 dark:bg-[#111111] p-5 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm">
                      <div className="font-bold text-xs uppercase tracking-widest text-indigo-500 mb-2">Input</div>
                      <code className="block bg-white dark:bg-black p-4 rounded-2xl font-mono text-sm border border-black/5 dark:border-white/5 shadow-inner">{ex.input}</code>
                      <div className="font-bold text-xs uppercase tracking-widest text-indigo-500 mt-4 mb-2">Output</div>
                      <code className="block bg-white dark:bg-black p-4 rounded-2xl font-mono text-sm border border-black/5 dark:border-white/5 shadow-inner">{ex.output}</code>
                      {ex.explanation && (
                        <>
                          <div className="font-bold text-xs uppercase tracking-widest text-indigo-500 mt-4 mb-2">Explanation</div>
                          <p className="text-sm text-black/80 dark:text-white/80 font-medium">{ex.explanation}</p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-black/50 dark:text-white/50">
                No problem selected.
              </div>
            )}
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="flex-1 bg-white dark:bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center mb-6 relative shadow-xl shadow-indigo-500/20 rotate-3">
               <Bot className="w-12 h-12 text-white -rotate-3" />
               <motion.div 
                 animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                 transition={{ duration: 2, repeat: Infinity }}
                 className="absolute inset-0 rounded-3xl border-2 border-indigo-400"
               />
            </div>
            <h3 className="text-3xl font-black mb-3">AI Coding Assistant</h3>
            <p className="text-black/60 dark:text-white/60 mb-10 max-w-sm text-lg font-medium leading-relaxed">
              Jarvis can analyze your code, find bugs, optimize performance, or explain complex concepts.
            </p>
            <div className="grid grid-cols-2 gap-4 w-full max-w-md">
              {['Explain Code', 'Find Bugs', 'Optimize', 'Time Complexity'].map(action => (
                <button key={action} className="p-4 bg-slate-50 dark:bg-[#111111] hover:bg-indigo-500 hover:text-white hover:border-indigo-500 dark:hover:bg-indigo-500 rounded-2xl border border-black/5 dark:border-white/5 font-bold text-sm transition-all shadow-sm active:scale-95">
                  {action}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      
      {/* File Explorer Bottom Sheet */}
      <AnimatePresence>
        {showFiles && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFiles(false)}
              className="absolute inset-0 bg-black/50 z-[110]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 z-[120] bg-white dark:bg-[#1a1a1a] rounded-t-3xl overflow-hidden max-h-[80vh] flex flex-col shadow-2xl border-t border-black/10 dark:border-white/10"
            >
              <div className="flex items-center justify-between p-4 border-b border-black/10 dark:border-white/10">
                <h3 className="font-bold text-lg">Files</h3>
                <div className="flex items-center gap-2">
                  <button onClick={createNewFile} className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg"><Plus className="w-5 h-5" /></button>
                  <button onClick={() => setShowFiles(false)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg"><X className="w-5 h-5" /></button>
                </div>
              </div>
              <div className="overflow-y-auto p-2">
                {files.map(f => (
                  <div key={f.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5">
                    <button 
                      onClick={() => { setActiveFileId(f.id); setShowFiles(false); }}
                      className={`flex-1 flex items-center gap-3 p-2 text-left ${activeFileId === f.id ? 'text-indigo-600 dark:text-indigo-400 font-bold' : ''}`}
                    >
                      <FileCode className="w-5 h-5" /> {f.name}
                    </button>
                    {files.length > 1 && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setFiles(files.filter(file => file.id !== f.id)); if (activeFileId === f.id) setActiveFileId(files.find(file => file.id !== f.id)!.id); }}
                        className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Smart Terminal Bottom Sheet */}
      <AnimatePresence>
        {isTerminalOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 z-50 bg-[#1e1e1e] border-t border-[#3c3c3c] shadow-2xl flex flex-col rounded-t-3xl overflow-hidden"
            style={{ height: terminalHeight }}
          >
            {/* Drag Handle / Header */}
            <div 
              className="flex items-center justify-between px-6 py-3 bg-[#252526] touch-none cursor-ns-resize"
              onPointerDown={(e) => {
                e.preventDefault();
                const startY = e.clientY;
                const startHeight = terminalHeight;
                const onPointerMove = (moveEvent: PointerEvent) => {
                  const delta = startY - moveEvent.clientY;
                  const newHeight = Math.max(150, Math.min(window.innerHeight * 0.9, startHeight + delta));
                  setTerminalHeight(newHeight);
                };
                const onPointerUp = () => {
                  document.removeEventListener('pointermove', onPointerMove);
                  document.removeEventListener('pointerup', onPointerUp);
                };
                document.addEventListener('pointermove', onPointerMove);
                document.addEventListener('pointerup', onPointerUp);
              }}
            >
              <div className="flex items-center gap-3">
                <TerminalIcon className="w-5 h-5 text-indigo-400" />
                <span className="text-sm font-bold text-white/90 tracking-wider">TERMINAL</span>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => setOutput([])} className="text-white/50 hover:text-white transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
                <button onClick={() => setTerminalHeight(h => h > 300 ? 300 : window.innerHeight * 0.8)} className="text-white/50 hover:text-white transition-colors">
                  {terminalHeight > 300 ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>
                <button onClick={() => setIsTerminalOpen(false)} className="text-white/50 hover:text-white transition-colors">
                  <ChevronDown className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            {/* Terminal Output */}
            <div className="flex-1 overflow-y-auto p-5 font-mono text-[15px] space-y-3 bg-[#1e1e1e]">
              {output.length === 0 ? (
                <div className="text-white/30 text-center mt-10">Run your code to see output here.</div>
              ) : (
                output.map((out, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <span className="text-white/30 flex-shrink-0 mt-0.5">[{out.time}]</span>
                    <span className={`whitespace-pre-wrap flex-1 ${
                      out.type === 'error' ? 'text-rose-400' :
                      out.type === 'success' ? 'text-emerald-400 font-medium' :
                      'text-white/80'
                    }`}>
                      {out.text}
                    </span>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-around bg-slate-50 dark:bg-[#111111] border-t border-black/10 dark:border-white/10 pb-safe pt-2">
        <button 
          onClick={() => setActiveTab('editor')}
          className={`flex flex-col items-center justify-center p-2 w-[72px] transition-colors rounded-xl ${activeTab === 'editor' ? 'text-indigo-600 dark:text-indigo-400' : 'text-black/50 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/5'}`}
        >
          <div className={`p-1.5 rounded-full mb-1 transition-colors ${activeTab === 'editor' ? 'bg-indigo-100 dark:bg-indigo-500/20' : ''}`}>
             <FileCode className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold">Editor</span>
        </button>
        <button 
          onClick={() => setIsTerminalOpen(!isTerminalOpen)}
          className={`flex flex-col items-center justify-center p-2 w-[72px] transition-colors rounded-xl ${isTerminalOpen ? 'text-emerald-600 dark:text-emerald-400' : 'text-black/50 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/5'}`}
        >
          <div className={`p-1.5 rounded-full mb-1 transition-colors ${isTerminalOpen ? 'bg-emerald-100 dark:bg-emerald-500/20' : ''}`}>
             <TerminalIcon className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold">Terminal</span>
        </button>
        {problem && (
          <button 
            onClick={() => setActiveTab('problem')}
            className={`flex flex-col items-center justify-center p-2 w-[72px] transition-colors rounded-xl ${activeTab === 'problem' ? 'text-indigo-600 dark:text-indigo-400' : 'text-black/50 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/5'}`}
          >
            <div className={`p-1.5 rounded-full mb-1 transition-colors ${activeTab === 'problem' ? 'bg-indigo-100 dark:bg-indigo-500/20' : ''}`}>
               <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold">Problem</span>
          </button>
        )}
        <button 
          onClick={() => setActiveTab('ai')}
          className={`flex flex-col items-center justify-center p-2 w-[72px] transition-colors rounded-xl ${activeTab === 'ai' ? 'text-indigo-600 dark:text-indigo-400' : 'text-black/50 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/5'}`}
        >
          <div className={`p-1.5 rounded-full mb-1 transition-colors ${activeTab === 'ai' ? 'bg-indigo-100 dark:bg-indigo-500/20' : ''}`}>
             <Bot className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold">Jarvis</span>
        </button>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom, 16px);
        }
        .toolbar-btn {
          flex-shrink: 0;
          min-width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #3c3c3c;
          color: white;
          border-radius: 10px;
          font-weight: 500;
          transition: transform 0.1s;
          user-select: none;
          touch-action: manipulation;
        }
        .toolbar-btn:active {
          transform: scale(0.9);
          background-color: #4c4c4c;
        }
      `}} />
    </div>
  );
}
