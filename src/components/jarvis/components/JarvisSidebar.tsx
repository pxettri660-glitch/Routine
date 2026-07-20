import React from 'react';
import { Sparkles, X, Plus, Globe, Code, Download, History } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface JarvisSidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (val: boolean) => void;
  isDark: boolean;
  activeGradient: string;
  aiMode: 'general' | 'study' | 'coding';
  setAiMode: (mode: 'general' | 'study' | 'coding') => void;
  clearHistory: () => void;
  exportChat: () => void;
}

export function JarvisSidebar({
  isSidebarOpen, setIsSidebarOpen, isDark, activeGradient,
  aiMode, setAiMode, clearHistory, exportChat
}: JarvisSidebarProps) {
  return (
    <>
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-black/60 z-30 backdrop-blur-md"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
      <div className={`
        fixed md:static inset-y-0 left-0 z-40 transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
        w-[280px] flex flex-col shrink-0 shadow-2xl md:shadow-none backdrop-blur-xl border-r
        ${isDark ? 'bg-white/[0.02] border-white/[0.05]' : 'bg-white/60 border-black/[0.05]'}
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className={`p-5 flex items-center justify-between border-b ${isDark ? 'border-white/[0.05]' : 'border-black/[0.05]'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${activeGradient} flex items-center justify-center text-white shadow-lg`}>
              <Sparkles className="w-4 h-4" />
            </div>
            <h1 className="font-semibold tracking-wide text-sm">STUDY ASSISTANT</h1>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className={`md:hidden p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4">
          <button 
            onClick={() => { clearHistory(); setIsSidebarOpen(false); }}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all font-medium text-sm border shadow-sm group
              ${isDark 
                ? 'bg-white/10 hover:bg-white/20 border-white/10 text-white' 
                : 'bg-black text-white hover:bg-gray-800 border-transparent'}
            `}
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" />
            New Session
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 space-y-1">
           <button onClick={() => setAiMode('general')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm ${aiMode === 'general' ? (isDark ? 'bg-white/10 text-white font-medium' : 'bg-black/5 text-black font-medium') : (isDark ? 'text-white/70 hover:bg-white/5' : 'text-black/70 hover:bg-black/5')}`}>
             <Globe className="w-4 h-4" /> General AI
           </button>
           <button onClick={() => setAiMode('study')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm ${aiMode === 'study' ? (isDark ? 'bg-white/10 text-white font-medium' : 'bg-black/5 text-black font-medium') : (isDark ? 'text-white/70 hover:bg-white/5' : 'text-black/70 hover:bg-black/5')}`}>
             <Sparkles className="w-4 h-4" /> Study Tutor
           </button>
           <button onClick={() => setAiMode('coding')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm ${aiMode === 'coding' ? (isDark ? 'bg-white/10 text-white font-medium' : 'bg-black/5 text-black font-medium') : (isDark ? 'text-white/70 hover:bg-white/5' : 'text-black/70 hover:bg-black/5')}`}>
             <Code className="w-4 h-4" /> Code Copilot
           </button>
        </div>
        <div className={`p-4 border-t space-y-2 ${isDark ? 'border-white/[0.05]' : 'border-black/[0.05]'}`}>
          <button onClick={exportChat} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm ${isDark ? 'text-white/70 hover:bg-white/5 hover:text-white' : 'text-black/70 hover:bg-black/5 hover:text-black'}`}>
             <Download className="w-4 h-4" /> Export Log
          </button>
          <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm ${isDark ? 'text-white/70 hover:bg-white/5 hover:text-white' : 'text-black/70 hover:bg-black/5 hover:text-black'}`}>
             <History className="w-4 h-4" /> History
          </button>
        </div>
      </div>
    </>
  );
}
