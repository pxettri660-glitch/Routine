import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, BookOpen, ChevronRight, CheckCircle, HelpCircle, AlertTriangle, MessageCircle, PlayCircle, Lightbulb } from 'lucide-react';

interface LearningModeProps {
  onClose: () => void;
  onSelectProblem: (prob: any) => void;
}

const TOPICS = [
  { id: '1', name: 'Variables & Data Types', progress: 100, isLocked: false },
  { id: '2', name: 'Control Flow (If/Else, Loops)', progress: 60, isLocked: false },
  { id: '3', name: 'Functions & Scope', progress: 0, isLocked: false },
  { id: '4', name: 'Arrays & Strings', progress: 0, isLocked: true },
  { id: '5', name: 'Object-Oriented Programming', progress: 0, isLocked: true },
];

export default function LearningMode({ onClose, onSelectProblem }: LearningModeProps) {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'theory' | 'quiz' | 'mistakes' | 'interview'>('theory');

  if (!selectedTopic) {
    return (
      <div className="space-y-6 pb-20">
        <div className="flex items-center gap-4 sticky top-0 z-10 bg-[#f8fafc]/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl py-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          <button onClick={onClose} className="p-2 bg-white dark:bg-[#1a1a1a] rounded-xl hover:bg-black/5 dark:hover:bg-white/5 border border-black/5 dark:border-white/5 shadow-sm transition-transform active:scale-95">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-2xl font-black tracking-tight">Learning Path</h2>
            <p className="text-sm font-semibold text-black/50 dark:text-white/50">Master the fundamentals step-by-step.</p>
          </div>
        </div>
        
        <div className="grid gap-4">
          {TOPICS.map((topic, i) => (
            <motion.button 
              key={topic.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => !topic.isLocked && setSelectedTopic(topic.id)}
              className={`flex items-center justify-between p-5 rounded-[2rem] border transition-all duration-300 shadow-sm ${topic.isLocked ? 'bg-black/5 dark:bg-white/5 border-transparent opacity-70 cursor-not-allowed' : 'bg-white dark:bg-[#1a1a1a] border-black/5 dark:border-white/5 hover:shadow-xl cursor-pointer active:scale-[0.98]'}`}
            >
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${topic.progress === 100 ? 'bg-emerald-500/10 text-emerald-500' : topic.isLocked ? 'bg-black/10 dark:bg-white/10 text-black/50 dark:text-white/50' : 'bg-indigo-500/10 text-indigo-500 shadow-inner'}`}>
                  {topic.progress === 100 ? <CheckCircle className="w-7 h-7" /> : <BookOpen className="w-7 h-7" />}
                </div>
                <div className="text-left">
                  <div className="font-black text-xl mb-1">{topic.name}</div>
                  {!topic.isLocked && (
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${topic.progress}%` }}></div>
                      </div>
                      <span className="text-xs font-bold opacity-50">{topic.progress}%</span>
                    </div>
                  )}
                </div>
              </div>
              {!topic.isLocked && (
                <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-black/50 dark:text-white/50">
                   <ChevronRight className="w-5 h-5" />
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4 sticky top-0 z-10 bg-[#f8fafc]/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl py-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        <button onClick={() => setSelectedTopic(null)} className="p-2 bg-white dark:bg-[#1a1a1a] rounded-xl hover:bg-black/5 dark:hover:bg-white/5 border border-black/5 dark:border-white/5 shadow-sm transition-transform active:scale-95">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-xl sm:text-2xl font-black truncate">{TOPICS.find(t => t.id === selectedTopic)?.name}</h2>
      </div>

      <div className="flex overflow-x-auto gap-2 pb-2 hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {[
          { id: 'theory', icon: BookOpen, label: 'Theory' },
          { id: 'quiz', icon: HelpCircle, label: 'Quiz' },
          { id: 'mistakes', icon: AlertTriangle, label: 'Mistakes' },
          { id: 'interview', icon: MessageCircle, label: 'Interview' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm ${activeTab === tab.id ? 'bg-indigo-600 text-white scale-105' : 'bg-white dark:bg-[#1a1a1a] text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5 border border-black/5 dark:border-white/5'}`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-[#1a1a1a] p-6 sm:p-8 rounded-[2rem] border border-black/5 dark:border-white/5 shadow-xl min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {activeTab === 'theory' && (
              <div className="space-y-6 text-black/80 dark:text-white/80">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full font-bold text-xs uppercase tracking-wider mb-2">
                  <Lightbulb className="w-4 h-4" /> Concept
                </div>
                <h3 className="text-3xl font-black">Understanding Variables</h3>
                <p className="text-lg font-medium leading-relaxed">A variable is a container for storing data values. In programming, a variable acts as a memory location where we can store, retrieve, and manipulate data during program execution.</p>
                <div className="bg-slate-50 dark:bg-[#111111] p-5 rounded-2xl border border-black/5 dark:border-white/5 shadow-inner">
                  <h4 className="font-bold text-xs mb-3 text-indigo-500 uppercase tracking-widest">Example (Python)</h4>
                  <pre className="font-mono text-[15px] bg-white dark:bg-black p-4 rounded-xl border border-black/5 dark:border-white/5"><code>{`# Integer variable\nage = 25\n\n# String variable\nname = "Alice"\n\n# Float variable\nprice = 19.99`}</code></pre>
                </div>
                <div className="mt-8 flex justify-center">
                  <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full shadow-[0_8px_20px_rgba(99,102,241,0.3)] transition-transform active:scale-95">
                    <PlayCircle className="w-5 h-5" /> Watch Animation
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'quiz' && (
              <div className="flex flex-col items-center justify-center text-center py-16 space-y-6">
                <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center">
                   <HelpCircle className="w-12 h-12 text-indigo-500" />
                </div>
                <h3 className="text-3xl font-black">Test Your Knowledge</h3>
                <p className="text-black/50 dark:text-white/50 max-w-sm text-lg font-medium">Answer 5 quick questions to test your understanding of {TOPICS.find(t => t.id === selectedTopic)?.name}.</p>
                <button className="px-8 py-4 bg-indigo-600 text-white font-bold text-lg rounded-full hover:bg-indigo-500 transition-all shadow-[0_8px_30px_rgba(99,102,241,0.4)] active:scale-95">Start Interactive Quiz</button>
              </div>
            )}

            {activeTab === 'mistakes' && (
              <div className="space-y-6">
                <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-[2rem] text-rose-700 dark:text-rose-400">
                  <h4 className="font-black text-xl mb-2 flex items-center gap-2"><AlertTriangle className="w-6 h-6" /> Uninitialized Variables</h4>
                  <p className="font-medium text-lg leading-relaxed">Using a variable before assigning it a value can lead to unpredictable behavior or compilation errors depending on the language.</p>
                </div>
                <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-[2rem] text-amber-700 dark:text-amber-400">
                  <h4 className="font-black text-xl mb-2 flex items-center gap-2"><AlertTriangle className="w-6 h-6" /> Type Mismatch</h4>
                  <p className="font-medium text-lg leading-relaxed">Trying to assign a string to an integer variable in statically typed languages like C++ or Java will cause a compile-time error.</p>
                </div>
              </div>
            )}

            {activeTab === 'interview' && (
              <div className="space-y-6">
                <div className="p-6 bg-slate-50 dark:bg-[#111111] rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm">
                  <h4 className="font-black text-xl mb-3 text-indigo-600 dark:text-indigo-400">Q: What is the difference between let, const, and var in JavaScript?</h4>
                  <p className="text-lg font-medium text-black/70 dark:text-white/70 leading-relaxed">`var` is function-scoped and hoisted. `let` and `const` are block-scoped. `const` cannot be reassigned after declaration, while `let` can be.</p>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-[#111111] rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm">
                  <h4 className="font-black text-xl mb-3 text-indigo-600 dark:text-indigo-400">Q: Explain strong typing vs weak typing.</h4>
                  <p className="text-lg font-medium text-black/70 dark:text-white/70 leading-relaxed">Strongly typed languages (like Python, Java) strictly enforce rules on variable types and do not implicitly convert between incompatible types. Weakly typed languages (like JavaScript) may perform implicit type conversions.</p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
