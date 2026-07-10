import React from 'react';
import { motion } from 'motion/react';
import { User, Settings, Moon, Bell, Cloud, Trophy, Shield, Info, HelpCircle } from 'lucide-react';

interface Props {
  onNavigate: (view: string) => void;
  isThemeLight: boolean;
  onToggleTheme: () => void;
}

const ProfileNav: React.FC<Props> = ({ onNavigate, isThemeLight, onToggleTheme }) => {
  const cards = [
    { id: 'profile', title: 'User Profile', icon: User, color: 'from-blue-500 to-indigo-500', action: () => onNavigate('profile') },
    { id: 'more', title: 'Settings', icon: Settings, color: 'from-gray-500 to-slate-500', action: () => onNavigate('more') },
    { id: 'theme', title: isThemeLight ? 'Dark Mode' : 'Light Mode', icon: Moon, color: 'from-indigo-500 to-purple-500', action: onToggleTheme },
    { id: 'more', title: 'Notifications', icon: Bell, color: 'from-rose-500 to-pink-500', action: () => onNavigate('more') },
    { id: 'more', title: 'Cloud Sync', icon: Cloud, color: 'from-sky-400 to-blue-500', action: () => onNavigate('more') },
    { id: 'profile', title: 'Achievements', icon: Trophy, color: 'from-amber-400 to-orange-500', action: () => onNavigate('profile') },
    { id: 'admin', title: 'Admin Panel', icon: Shield, color: 'from-red-500 to-rose-600', action: () => onNavigate('admin') },
    { id: 'more', title: 'About & Help', icon: Info, color: 'from-teal-500 to-emerald-500', action: () => onNavigate('more') },
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
          Account
        </h2>
        <p className="text-black/50 dark:text-white/50">Manage your profile and settings</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <button
              key={idx}
              onClick={card.action}
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

export default ProfileNav;
