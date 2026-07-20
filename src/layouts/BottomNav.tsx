import React from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, BookOpen, Bot, Users, User } from 'lucide-react';

interface BottomNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export function BottomNav({ currentView, onNavigate }: BottomNavProps) {
  const leftItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
    { id: 'study_nav', icon: BookOpen, label: 'Study' }
  ];

  const rightItems = [
    { id: 'community_nav', icon: Users, label: 'Community' },
    { id: 'profile_nav', icon: User, label: 'Profile' }
  ];

  return (
    <div className="fixed bottom-0 sm:bottom-8 left-0 right-0 z-50 flex justify-center w-full pointer-events-none transition-transform duration-500 translate-y-0 px-4 pb-6 sm:pb-0 pt-16 bg-gradient-to-t from-white/90 via-white/50 to-transparent dark:from-[#0a0a0a]/90 dark:via-[#0a0a0a]/50 backdrop-blur-[2px]">
      <div className="pointer-events-auto flex items-center justify-between sm:justify-center gap-2 sm:gap-8 px-4 py-3 rounded-[2rem] shadow-[0_8px_32px_-4px_rgba(0,0,0,0.1),_0_4px_16px_-4px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_-4px_rgba(0,0,0,0.5),_0_4px_16px_-4px_rgba(0,0,0,0.3)] backdrop-blur-3xl border bg-white/80 dark:bg-[#1a1a1a]/80 border-white/50 dark:border-white/10 w-full sm:w-auto max-w-lg transition-all duration-300">
        
        {leftItems.map((item) => {
          const isSelected = currentView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative flex-1 sm:flex-none flex flex-col items-center justify-center gap-1.5 transition-all duration-500 group outline-none ${
                isSelected
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-black/50 dark:text-white/50 hover:text-indigo-600/80 dark:hover:text-indigo-400/80'
              }`}
            >
              <div className="relative px-6 py-2 rounded-full flex items-center justify-center transition-colors">
                {isSelected && (
                  <motion.div 
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-indigo-50 dark:bg-indigo-500/15 shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_3px_rgba(255,255,255,0.05)]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="w-6 h-6 relative z-10 transition-transform duration-300 group-hover:scale-110 group-active:scale-95" strokeWidth={isSelected ? 2.5 : 2} />
              </div>
              <span className={`text-[11px] font-bold tracking-wide transition-all duration-300 ${isSelected ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2 h-0 overflow-hidden'}`}>
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Center FAB (AI) */}
        <div className="relative -top-8 sm:-top-10 flex justify-center shrink-0">
          <button
            onClick={() => onNavigate('ai_nav')}
            className={`group relative p-4 rounded-full flex items-center justify-center transition-all duration-500 outline-none
              ${currentView === 'ai_nav' ? 'shadow-[0_16px_32px_-8px_rgba(99,102,241,0.8)] scale-105' : 'shadow-[0_12px_24px_-8px_rgba(99,102,241,0.5)] dark:shadow-[0_12px_24px_-8px_rgba(99,102,241,0.4)]'}
              bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:via-indigo-400 hover:to-cyan-400 text-white
              hover:-translate-y-1.5 hover:scale-105 hover:shadow-[0_16px_32px_-8px_rgba(99,102,241,0.6)]
              active:scale-95 active:translate-y-0`}
          >
            <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity blur-md" />
            <Bot className="w-8 h-8 relative z-10 transition-transform duration-300 group-hover:scale-110" strokeWidth={2.5} />
            <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>

        {rightItems.map((item) => {
          const isSelected = currentView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative flex-1 sm:flex-none flex flex-col items-center justify-center gap-1.5 transition-all duration-500 group outline-none ${
                isSelected
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-black/50 dark:text-white/50 hover:text-indigo-600/80 dark:hover:text-indigo-400/80'
              }`}
            >
              <div className="relative px-6 py-2 rounded-full flex items-center justify-center transition-colors">
                {isSelected && (
                  <motion.div 
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-indigo-50 dark:bg-indigo-500/15 shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_3px_rgba(255,255,255,0.05)]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="w-6 h-6 relative z-10 transition-transform duration-300 group-hover:scale-110 group-active:scale-95" strokeWidth={isSelected ? 2.5 : 2} />
              </div>
              <span className={`text-[11px] font-bold tracking-wide transition-all duration-300 ${isSelected ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2 h-0 overflow-hidden'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
