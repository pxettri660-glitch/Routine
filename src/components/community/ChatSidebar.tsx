import React, { useState } from 'react';
import { Search, Plus, Hash, Users, MessageSquare, Globe } from 'lucide-react';
import { Thread } from './types';
import { useAuth } from '../../contexts/AuthContext';
import NewChatModal from './NewChatModal';

interface ChatSidebarProps {
  threads: Thread[];
  activeThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  loading?: boolean;
}

export default function ChatSidebar({ threads, activeThreadId, onSelectThread, isMobileOpen, onCloseMobile, loading }: ChatSidebarProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'dms' | 'groups'>('all');
  const [showNewChat, setShowNewChat] = useState(false);

  const filteredThreads = threads.filter(thread => {
    const searchMatch = thread.name?.toLowerCase().includes(searchQuery.toLowerCase()) || true;
    if (!searchMatch) return false;
    if (activeTab === 'dms' && thread.type !== 'dm') return false;
    if (activeTab === 'groups' && thread.type !== 'group' && thread.type !== 'global') return false;
    return true;
  });

  const sortedThreads = [...filteredThreads].sort((a, b) => {
    if (a.isGlobal) return -1;
    if (b.isGlobal) return 1;
    if (a.type === 'group' && b.type !== 'group') return -1;
    if (a.type !== 'group' && b.type === 'group') return 1;
    return b.updatedAt - a.updatedAt;
  });

  return (
    <div className={`
      ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      fixed md:relative z-40 w-[280px] lg:w-[320px] h-full bg-[#f8f9fa] dark:bg-[#111111] border-r border-black/5 dark:border-white/5 flex flex-col transition-transform duration-300 ease-out
    `}>
      <div className="p-4 flex flex-col gap-4 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">Messages</h2>
          <button 
            onClick={() => setShowNewChat(true)}
            className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40" />
          <input 
            type="text" 
            placeholder="Search chats..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/5 dark:bg-white/5 rounded-xl py-2 pl-9 pr-4 text-[15px] outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-black/40 dark:placeholder:text-white/40"
          />
        </div>

        <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'all' ? 'bg-white dark:bg-[#222] shadow-sm' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'}`}
          >
            All
          </button>
          <button 
            onClick={() => setActiveTab('dms')}
            className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'dms' ? 'bg-white dark:bg-[#222] shadow-sm' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'}`}
          >
            DMs
          </button>
          <button 
            onClick={() => setActiveTab('groups')}
            className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'groups' ? 'bg-white dark:bg-[#222] shadow-sm' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'}`}
          >
            Groups
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="p-4 space-y-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 w-1/3 bg-black/5 dark:bg-white/5 rounded" />
                  <div className="h-3 w-2/3 bg-black/5 dark:bg-white/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredThreads.length === 0 ? (
          <div className="p-8 text-center text-black/40 dark:text-white/40 text-sm font-medium">
            No conversations found
          </div>
        ) : (
          <div className="space-y-1">
            {sortedThreads.map(thread => {
              const isActive = thread.id === activeThreadId;
              const name = thread.name || "User"; 
              const unread = (thread.unreadCount && user) ? (thread.unreadCount[user.uid] || 0) : 0;
              
              return (
                <button
                  key={thread.id}
                  onClick={() => {
                    onSelectThread(thread.id);
                    onCloseMobile();
                  }}
                  className={`
                    w-full flex items-start gap-3 p-3 rounded-2xl transition-all text-left
                    ${isActive 
                      ? 'bg-indigo-50 dark:bg-indigo-500/10' 
                      : 'hover:bg-black/5 dark:hover:bg-white/5'}
                  `}
                >
                  <div className="relative shrink-0">
                    {thread.photoURL ? (
                      <img src={thread.photoURL} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white
                        ${thread.isGlobal ? 'bg-blue-500' : thread.type === 'dm' ? 'bg-indigo-500' : 'bg-emerald-500'}`}>
                        {thread.isGlobal ? <Globe className="w-6 h-6" /> : name[0]?.toUpperCase() || '#'}
                      </div>
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#f8f9fa] dark:border-[#111111]" />
                    {thread.type === 'group' && !thread.isGlobal && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-[#f8f9fa] dark:border-[#111111] flex items-center justify-center">
                        <Users className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 py-0.5">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className={`font-bold text-[15px] truncate ${isActive ? 'text-indigo-900 dark:text-indigo-100' : 'text-black dark:text-white'}`}>
                        {name}
                      </h3>
                      {thread.lastMessage && (
                        <span className={`text-[11px] shrink-0 font-medium ${unread > 0 ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-black/40 dark:text-white/40'}`}>
                          {new Date(thread.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-[13px] truncate ${unread > 0 ? 'text-black dark:text-white font-semibold' : 'text-black/50 dark:text-white/50'}`}>
                        {thread.lastMessage ? thread.lastMessage.text : 'No messages yet'}
                      </p>
                      {unread > 0 && (
                        <span className="shrink-0 bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                          {unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
      
      <NewChatModal 
        isOpen={showNewChat} 
        onClose={() => setShowNewChat(false)} 
        onChatCreated={(id) => {
          onSelectThread(id);
          onCloseMobile();
        }} 
      />
    </div>
  );
}
