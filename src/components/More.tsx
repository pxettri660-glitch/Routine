import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { Sliders, Target, FileText, MessageCircle, Music, Settings, User, Shield, Info, HelpCircle, Save, Download, Archive, Hash, Bell } from 'lucide-react';

interface MoreProps {
  onNavigate: (view: string) => void;
}

const More = React.memo(function More({ onNavigate }: MoreProps) {
  const { user } = useAuth();
  const isAdmin = user && [import.meta.env.VITE_ADMIN_UID, 'gwvcfcQqpKgFf8oR6OruOmYm1s82'].includes(user.uid);
  const menuGroups = [
    {
      title: 'Routine & Focus',
      items: [
        { id: 'routine', icon: Sliders, label: 'Routine List', color: 'text-indigo-500' },
        { id: 'focus', icon: Target, label: 'Focus Mode', color: 'text-rose-500' },
        { id: 'goals', icon: Target, label: 'Goals & Categories', color: 'text-emerald-500' },
        { id: 'tasks', icon: FileText, label: 'Tasks', color: 'text-blue-500' },
        { id: 'tools', icon: Bell, label: 'Reminders', color: 'text-amber-500' },
      ]
    },
    {
      title: 'Community & Media',
      items: [
        { id: 'chat', icon: MessageCircle, label: 'Community', color: 'text-cyan-500' },
        { id: 'music', icon: Music, label: 'Music', color: 'text-fuchsia-500' },
      ]
    },
    {
      title: 'Data & Settings',
      items: [
        { id: 'tools', icon: Archive, label: 'History & Logs', color: 'text-zinc-500' },
        { id: 'tools', icon: Save, label: 'Backup & Restore', color: 'text-violet-500' },
        { id: 'tools', icon: Download, label: 'Import & Export', color: 'text-teal-500' },
        { id: 'tools', icon: Settings, label: 'Settings', color: 'text-gray-500' },
      ]
    },
    {
      title: 'System',
      items: [
        { id: 'profile', icon: User, label: 'Profile', color: 'text-blue-600' },
            ...(isAdmin ? [{ id: 'admin', icon: Shield, label: 'Admin Panel', color: 'text-red-500' }] : []),
        { id: 'tools', icon: Info, label: 'About', color: 'text-indigo-400' },
        { id: 'tools', icon: HelpCircle, label: 'Help & Support', color: 'text-emerald-400' },
      ]
    }
  ];

  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="px-2">
        <h2 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-3">
          <Sliders className="w-8 h-8 text-indigo-500" />
          More
        </h2>
        <p className="text-sm font-medium opacity-60 tracking-wide uppercase">All Features & Settings</p>
      </div>

      <div className="space-y-6">
        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest opacity-50 px-4">{group.title}</h3>
            <div className="bg-white/5 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-3xl overflow-hidden backdrop-blur-xl shadow-xl shadow-black/5">
              {group.items.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${idx !== group.items.length - 1 ? 'border-b border-black/5 dark:border-white/5' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-xl bg-black/5 dark:bg-white/5 ${item.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-semibold text-sm">{item.label}</span>
                    </div>
                    <div className="text-black/20 dark:text-white/20">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
});

export default More;
