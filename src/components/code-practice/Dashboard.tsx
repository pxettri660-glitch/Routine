import React from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, Flame, CheckCircle, Star, Target, Code, 
  Terminal, Award, Activity, Calendar, BookOpen, ChevronRight, Play, LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardProps {
  onStartCoding: () => void;
  onViewProblems: () => void;
  onViewLearning: () => void;
}

export default function Dashboard({ onStartCoding, onViewProblems, onViewLearning }: DashboardProps) {
  const { user } = useAuth();
  const stats = {
    solved: 12, totalXP: 1450, level: 5, streak: 7, rank: 'Silver',
    weekly: 85, monthly: 60, favLang: 'TypeScript', studyTime: '24h', accuracy: '92%'
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-900 text-white shadow-2xl p-6 sm:p-8"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Code className="w-48 h-48 rotate-12" />
        </div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md mb-6 border border-white/20">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-bold">{stats.streak} Day Streak</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">
            Welcome back,
            <br />
            {user?.displayName?.split(' ')[0] || 'Developer'}
          </h2>
          <p className="text-white/80 font-medium mb-8 max-w-sm text-lg">
            Ready to conquer today's coding challenge?
          </p>
          
          <button 
            onClick={onStartCoding}
            className="flex items-center gap-3 px-6 py-4 bg-white text-indigo-600 rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-full sm:w-auto justify-center"
          >
            <Play className="w-5 h-5 fill-current" />
            Quick Run Workspace
          </button>
        </div>
      </motion.div>

      {/* Stats Scroll (Mobile-friendly horizontal scroll) */}
      <div className="flex gap-4 overflow-x-auto hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {[
          { label: 'Level', value: stats.level, icon: Trophy, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { label: 'Solved', value: stats.solved, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Total XP', value: stats.totalXP, icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
          { label: 'Accuracy', value: stats.accuracy, icon: Target, color: 'text-blue-500', bg: 'bg-blue-500/10' }
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="min-w-[140px] bg-white/80 dark:bg-[#1a1a1a]/80 p-5 rounded-3xl border border-black/5 dark:border-white/5 flex flex-col backdrop-blur-xl shadow-lg shrink-0"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div className="text-3xl font-black tracking-tight">{stat.value}</div>
            <div className="text-xs font-bold uppercase tracking-wider opacity-50 mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>
      
      {/* Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onViewProblems}
          className="group relative overflow-hidden rounded-[2rem] p-6 bg-white dark:bg-[#1a1a1a] border border-black/5 dark:border-white/5 shadow-xl text-left flex flex-col"
        >
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-colors"></div>
          <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6">
            <Code className="w-7 h-7 text-indigo-500" />
          </div>
          <h3 className="text-2xl font-black mb-2">Practice Problems</h3>
          <p className="text-black/60 dark:text-white/60 font-medium mb-6">Master algorithms and data structures.</p>
          <div className="mt-auto flex items-center text-indigo-600 dark:text-indigo-400 font-bold text-sm tracking-wide uppercase">
            Start Practicing <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.button>
        
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onViewLearning}
          className="group relative overflow-hidden rounded-[2rem] p-6 bg-white dark:bg-[#1a1a1a] border border-black/5 dark:border-white/5 shadow-xl text-left flex flex-col"
        >
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors"></div>
          <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6">
            <BookOpen className="w-7 h-7 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-black mb-2">Learning Mode</h3>
          <p className="text-black/60 dark:text-white/60 font-medium mb-6">Interactive theory, examples, and quizzes.</p>
          <div className="mt-auto flex items-center text-emerald-600 dark:text-emerald-400 font-bold text-sm tracking-wide uppercase">
            Start Learning <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.button>
      </div>
    </div>
  );
}
