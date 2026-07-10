import React from 'react';
import { motion } from 'motion/react';
import { Bot, FileText, HelpCircle, Scan, Mic, BookOpen } from 'lucide-react';

interface Props {
  onNavigate: (view: string) => void;
}

const AINav: React.FC<Props> = ({ onNavigate }) => {
  const cards = [
    { id: 'jarvis', title: 'Ask AI', icon: Bot, color: 'from-blue-500 to-indigo-500' },
    { id: 'jarvis', title: 'PDF Summarizer', icon: FileText, color: 'from-rose-500 to-red-500' },
    { id: 'jarvis', title: 'Quiz Generator', icon: HelpCircle, color: 'from-emerald-500 to-teal-500' },
    { id: 'jarvis', title: 'OCR Scanner', icon: Scan, color: 'from-purple-500 to-fuchsia-500' },
    { id: 'jarvis', title: 'Voice Assistant', icon: Mic, color: 'from-sky-500 to-cyan-500' },
    { id: 'jarvis', title: 'Homework Helper', icon: BookOpen, color: 'from-orange-500 to-amber-500' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 pb-32 max-w-4xl mx-auto space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
          Intelligence
        </h2>
        <p className="text-black/50 dark:text-white/50">Your personal AI-powered study companion</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <button
              key={idx}
              onClick={() => onNavigate(card.id)}
              className="relative group p-4 rounded-3xl overflow-hidden flex flex-col items-center text-center gap-3 transition-all duration-300 hover:scale-105 active:scale-95 bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] backdrop-blur-md"
            >
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br ${card.color}`} />
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${card.color} shadow-[0_0_20px_rgba(0,0,0,0.2)] text-white relative`}>
                <div className="absolute inset-0 rounded-2xl mix-blend-overlay opacity-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                <Icon className="w-6 h-6 relative z-10" />
              </div>
              <span className="font-semibold text-sm">{card.title}</span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default AINav;
