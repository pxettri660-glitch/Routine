import React from 'react';
import { motion } from 'motion/react';
import { Users, Trophy, MessageSquare, BookOpen, Calendar, Medal, Archive, Building } from 'lucide-react';

interface Props {
  onNavigate: (view: string) => void;
}

const CommunityNav: React.FC<Props> = ({ onNavigate }) => {
  const cards = [
    { id: 'chat', title: 'Friends', icon: Users, color: 'from-pink-500 to-rose-500' },
    { id: 'chat', title: 'Leaderboard', icon: Trophy, color: 'from-amber-400 to-orange-500' },
    { id: 'chat', title: 'Discussions', icon: MessageSquare, color: 'from-blue-500 to-cyan-500' },
    { id: 'chat', title: 'Study Groups', icon: BookOpen, color: 'from-indigo-500 to-purple-500' },
    { id: 'chat', title: 'Events', icon: Calendar, color: 'from-emerald-500 to-teal-500' },
    { id: 'chat', title: 'Challenges', icon: Medal, color: 'from-red-500 to-rose-600' },
    { id: 'chat', title: 'Resources', icon: Archive, color: 'from-gray-500 to-slate-500' },
    { id: 'chat', title: 'Clubs', icon: Building, color: 'from-violet-500 to-fuchsia-500' },
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
          Community
        </h2>
        <p className="text-black/50 dark:text-white/50">Connect, share, and grow together</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <button
              key={idx}
              onClick={() => onNavigate(card.id)}
              className="relative group p-4 rounded-3xl overflow-hidden flex flex-col items-center text-center gap-3 transition-all duration-300 hover:scale-105 active:scale-95 bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] backdrop-blur-md"
            >
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br ${card.color}`} />
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${card.color} shadow-lg text-white`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="font-semibold text-sm">{card.title}</span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default CommunityNav;
