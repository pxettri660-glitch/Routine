import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Code, ArrowLeft } from 'lucide-react';
import Dashboard from './code-practice/Dashboard';
import ProblemsList from './code-practice/ProblemsList';
import MobileWorkspace from './code-practice/MobileWorkspace';
import LearningMode from './code-practice/LearningMode';
import { Problem } from './code-practice/types';

interface CodePracticeProps {
  onAwardXP: (amount: number) => void;
}

export default function CodePractice({ onAwardXP }: CodePracticeProps) {
  const [view, setView] = useState<'dashboard' | 'problems' | 'workspace' | 'learning'>('dashboard');
  const [selectedProblem, setSelectedProblem] = useState<Problem | undefined>();

  const handleStartCoding = () => {
    setSelectedProblem(undefined);
    setView('workspace');
  };

  const handleViewProblems = () => {
    setView('problems');
  };

  const handleSelectProblem = (prob: Problem) => {
    setSelectedProblem(prob);
    setView('workspace');
  };

  if (view === 'workspace') {
    return (
      <MobileWorkspace 
        problem={selectedProblem} 
        onAwardXP={onAwardXP} 
        onClose={() => setView(selectedProblem ? 'problems' : 'dashboard')} 
      />
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`max-w-6xl mx-auto p-4 sm:p-6 ${view === 'workspace' ? 'pb-4' : 'pb-32'}`}
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {view !== 'dashboard' && (
            <button 
              onClick={() => setView(view === 'workspace' && selectedProblem ? 'problems' : 'dashboard')} 
              className="p-2 bg-white/50 dark:bg-[#1a1a1a]/50 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 border border-black/10 dark:border-white/10 backdrop-blur-md transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center gap-3">
              <Code className="w-8 h-8 text-indigo-500" /> Code Practice
            </h1>
            <p className="text-black/50 dark:text-white/50 mt-1 font-medium">Master programming with interactive challenges and AI.</p>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {view === 'dashboard' && (
            <Dashboard 
              onStartCoding={handleStartCoding} 
              onViewProblems={handleViewProblems} 
              onViewLearning={() => setView('learning')}
            />
          )}
          {view === 'problems' && (
            <ProblemsList 
              onSelectProblem={handleSelectProblem} 
              onClose={() => setView('dashboard')} 
            />
          )}
          {view === 'workspace' && (
            <Workspace 
              problem={selectedProblem} 
              onAwardXP={onAwardXP} 
              onClose={() => setView(selectedProblem ? 'problems' : 'dashboard')} 
            />
          )}
          {view === 'learning' && (
            <LearningMode 
              onClose={() => setView('dashboard')}
              onSelectProblem={handleSelectProblem}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
