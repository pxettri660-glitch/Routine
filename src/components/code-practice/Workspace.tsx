import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Editor, { useMonaco } from '@monaco-editor/react';
import { 
  Play, Square, Trash2, Save, Download, Copy, Share2, Settings, 
  Maximize2, Minimize2, ChevronRight, ChevronDown, FileCode, Folder, 
  FileText, Plus, MoreVertical, X, Bot, AlertCircle, CheckCircle, 
  Layout, Search, Type, Menu
} from 'lucide-react';
import { FileNode, Problem } from './types';

interface WorkspaceProps {
  problem?: Problem;
  onAwardXP: (amount: number) => void;
  onClose: () => void;
}

const DEFAULT_FILES: FileNode[] = [
  {
    id: 'root',
    name: 'src',
    type: 'folder',
    isOpen: true,
    children: [
      { id: 'f1', name: 'main.py', type: 'file', language: 'python', content: 'print("Hello World!")' },
      { id: 'f2', name: 'index.js', type: 'file', language: 'javascript', content: 'console.log("Hello World!");' },
      { id: 'f3', name: 'utils.cpp', type: 'file', language: 'cpp', content: '#include <iostream>\n\nint main() {\n    std::cout << "Hello World!";\n    return 0;\n}' }
    ]
  }
];

export default function Workspace({ problem, onAwardXP, onClose }: WorkspaceProps) {
  const [files, setFiles] = useState<FileNode[]>(DEFAULT_FILES);
  const [activeFileId, setActiveFileId] = useState<string | null>('f1');
  const [openFiles, setOpenFiles] = useState<FileNode[]>([]);
  const [terminalOutput, setTerminalOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [theme, setTheme] = useState<'vs-dark' | 'light'>('vs-dark');
  const [customInput, setCustomInput] = useState('');
  const [activeTab, setActiveTab] = useState<'console' | 'problem' | 'ai'>('console');
  
  const monaco = useMonaco();

  useEffect(() => {
    if (problem) {
      const probFile: FileNode = {
        id: 'prob-1',
        name: `solution.${problem.language === 'python' ? 'py' : problem.language === 'javascript' ? 'js' : 'cpp'}`,
        type: 'file',
        language: problem.language,
        content: problem.starterCode
      };
      setFiles([{
        id: 'root',
        name: 'src',
        type: 'folder',
        isOpen: true,
        children: [probFile]
      }]);
      setActiveFileId(probFile.id);
      setOpenFiles([probFile]);
      setActiveTab('problem');
    } else {
      setOpenFiles([DEFAULT_FILES[0].children![0]]);
    }
  }, [problem]);

  const activeFile = openFiles.find(f => f.id === activeFileId) || openFiles[0];

  const handleEditorChange = (value: string | undefined) => {
    if (!activeFile || value === undefined) return;
    setOpenFiles(prev => prev.map(f => f.id === activeFile.id ? { ...f, content: value } : f));
  };

  const handleRun = () => {
    setIsRunning(true);
    setActiveTab('console');
    setTerminalOutput('Compiling...\n');
    setTimeout(() => {
      setIsRunning(false);
      setTerminalOutput(prev => prev + 'Execution completed in 0.04s.\nOutput:\nHello World!\n');
      if (problem) onAwardXP(problem.xp);
    }, 1500);
  };

  const toggleSidebarFolder = (id: string) => {
    const toggleNode = (nodes: FileNode[]): FileNode[] => {
      return nodes.map(node => {
        if (node.id === id) return { ...node, isOpen: !node.isOpen };
        if (node.children) return { ...node, children: toggleNode(node.children) };
        return node;
      });
    };
    setFiles(toggleNode(files));
  };

  const openFile = (file: FileNode) => {
    if (!openFiles.find(f => f.id === file.id)) {
      setOpenFiles([...openFiles, file]);
    }
    setActiveFileId(file.id);
  };

  const closeFile = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newOpenFiles = openFiles.filter(f => f.id !== id);
    setOpenFiles(newOpenFiles);
    if (activeFileId === id && newOpenFiles.length > 0) {
      setActiveFileId(newOpenFiles[newOpenFiles.length - 1].id);
    } else if (newOpenFiles.length === 0) {
      setActiveFileId(null);
    }
  };

  const renderFileTree = (nodes: FileNode[], depth = 0) => {
    return nodes.map(node => (
      <div key={node.id}>
        <div 
          className={`flex items-center py-1 px-2 cursor-pointer hover:bg-white/10 dark:hover:bg-white/5 text-sm ${activeFileId === node.id ? 'bg-indigo-500/20 text-indigo-400' : 'text-black/70 dark:text-white/70'}`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => node.type === 'folder' ? toggleSidebarFolder(node.id) : openFile(node)}
        >
          {node.type === 'folder' ? (
            node.isOpen ? <ChevronDown className="w-4 h-4 mr-1 opacity-70" /> : <ChevronRight className="w-4 h-4 mr-1 opacity-70" />
          ) : (
            <FileCode className="w-4 h-4 mr-1 opacity-70 text-indigo-400" />
          )}
          {node.type === 'folder' && <Folder className="w-4 h-4 mr-2 text-yellow-500" />}
          <span className="truncate">{node.name}</span>
        </div>
        {node.type === 'folder' && node.isOpen && node.children && renderFileTree(node.children, depth + 1)}
      </div>
    ));
  };

  return (
    <div className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-[100] bg-white dark:bg-[#0a0a0a]' : 'h-[80vh] min-h-[600px] rounded-3xl overflow-hidden border border-black/10 dark:border-white/10 shadow-2xl'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-100 dark:bg-[#1a1a1a] border-b border-black/10 dark:border-white/10">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg"><X className="w-5 h-5" /></button>
          <div className="font-semibold">{problem ? problem.title : 'Workspace'}</div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleRun} disabled={isRunning} className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-sm transition-colors">
            {isRunning ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            {isRunning ? 'Stop' : 'Run'}
          </button>
          <div className="w-px h-6 bg-black/20 dark:bg-white/20 mx-1"></div>
          <button onClick={() => setTheme(t => t === 'vs-dark' ? 'light' : 'vs-dark')} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg"><Layout className="w-5 h-5" /></button>
          <button className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg"><Settings className="w-5 h-5" /></button>
          <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg">
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden bg-white dark:bg-[#0a0a0a]">
        {/* Sidebar */}
        <div className="flex-shrink-0 flex flex-col border-r border-black/10 dark:border-white/10 bg-slate-50 dark:bg-[#111111]" style={{ width: sidebarWidth }}>
          <div className="flex items-center justify-between p-3 text-xs font-bold tracking-wider text-black/50 dark:text-white/50 uppercase">
            <span>Explorer</span>
            <div className="flex gap-1">
              <Plus className="w-4 h-4 cursor-pointer hover:text-black dark:hover:text-white" />
              <MoreVertical className="w-4 h-4 cursor-pointer hover:text-black dark:hover:text-white" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {renderFileTree(files)}
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Editor Tabs */}
          <div className="flex overflow-x-auto bg-slate-100 dark:bg-[#1a1a1a] border-b border-black/10 dark:border-white/10">
            {openFiles.map(file => (
              <div 
                key={file.id}
                onClick={() => setActiveFileId(file.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm min-w-[120px] max-w-[200px] border-r border-black/10 dark:border-white/10 cursor-pointer group ${activeFileId === file.id ? 'bg-white dark:bg-[#0a0a0a] text-indigo-600 dark:text-indigo-400 border-t-2 border-t-indigo-500' : 'text-black/60 dark:text-white/60 hover:bg-white/50 dark:hover:bg-white/5'}`}
              >
                <FileCode className="w-4 h-4 flex-shrink-0" />
                <span className="truncate flex-1">{file.name}</span>
                <button onClick={(e) => closeFile(e, file.id)} className={`p-0.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 ${activeFileId === file.id ? 'opacity-100' : ''}`}>
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 relative">
            {activeFile ? (
              <Editor
                height="100%"
                language={activeFile.language}
                theme={theme}
                value={activeFile.content}
                onChange={handleEditorChange}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: 'on',
                  padding: { top: 16 },
                  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                  smoothScrolling: true,
                  cursorBlinking: 'smooth',
                  cursorSmoothCaretAnimation: 'on',
                  formatOnPaste: true,
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-black/30 dark:text-white/30">
                <div className="text-center">
                  <Layout className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Select a file to start coding</p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Panel */}
          <div className="h-64 border-t border-black/10 dark:border-white/10 flex flex-col bg-slate-50 dark:bg-[#111111]">
            <div className="flex gap-6 px-4 pt-2 border-b border-black/10 dark:border-white/10">
              <button onClick={() => setActiveTab('console')} className={`pb-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'console' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'}`}>Terminal</button>
              {problem && <button onClick={() => setActiveTab('problem')} className={`pb-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'problem' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'}`}>Problem Info</button>}
              <button onClick={() => setActiveTab('ai')} className={`pb-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'ai' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'}`}>Jarvis AI</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
              {activeTab === 'console' && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-black/50 dark:text-white/50 text-xs">Custom Input (Optional)</span>
                    <input type="text" value={customInput} onChange={e => setCustomInput(e.target.value)} className="bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500" placeholder="Enter custom input..." />
                  </div>
                  <div className="bg-black/5 dark:bg-white/5 p-3 rounded-lg min-h-[100px] whitespace-pre-wrap">
                    {terminalOutput || <span className="opacity-30">Run code to see output...</span>}
                  </div>
                </div>
              )}
              {activeTab === 'problem' && problem && (
                <div className="font-sans space-y-4 text-black/80 dark:text-white/80">
                  <h3 className="text-lg font-bold">{problem.title}</h3>
                  <p>{problem.description}</p>
                  <div className="bg-black/5 dark:bg-white/5 p-3 rounded-lg">
                    <div className="font-bold mb-1 text-xs uppercase opacity-70">Sample Input</div>
                    <code className="text-sm">{problem.examples?.[0]?.input || problem.inputFormat}</code>
                    <div className="font-bold mt-3 mb-1 text-xs uppercase opacity-70">Sample Output</div>
                    <code className="text-sm">{problem.examples?.[0]?.output || problem.outputFormat}</code>
                  </div>
                </div>
              )}
              {activeTab === 'ai' && (
                <div className="font-sans h-full flex flex-col items-center justify-center text-center space-y-3">
                  <Bot className="w-10 h-10 text-indigo-500" />
                  <p className="text-black/70 dark:text-white/70 max-w-md">Need help? Jarvis can explain the code, fix errors, or optimize your solution.</p>
                  <button className="px-4 py-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-500/20 font-medium">Ask Jarvis</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
