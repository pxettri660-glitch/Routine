import React, { useState } from 'react';
import ChatSidebar from './ChatSidebar';
import ChatRoom from './ChatRoom';
import { useChat } from './hooks/useChat';
import { MessageSquare, Plus, Users, LogIn } from 'lucide-react';
import AdminCreateGroup from './AdminCreateGroup';
import JoinGroup from './JoinGroup';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

interface CommunityLayoutProps {
  onNavigate: (view: string) => void;
}

export default function CommunityLayout({ onNavigate }: CommunityLayoutProps) {
  const { user } = useAuth();
  const { threads, activeThread, setActiveThreadId, loadingThreads } = useChat();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showFABMenu, setShowFABMenu] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showJoinGroup, setShowJoinGroup] = useState(false);

  const isAdmin = user && ['gwvcfcQqpKgFf8oR6OruOmYm1s82', 'QDkkZtRwlDcdALtsFWEg9HAcgAC2', import.meta.env.VITE_ADMIN_UID].includes(user.uid);

  return (
    <div className="flex h-full w-full bg-white dark:bg-[#0a0a0a] relative overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <ChatSidebar 
        threads={threads}
        activeThreadId={activeThread?.id || null}
        onSelectThread={setActiveThreadId}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        loading={loadingThreads}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {activeThread ? (
          <ChatRoom 
            thread={activeThread} 
            onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)} 
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-black/50 dark:text-white/50">
            <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
            <h2 className="text-xl font-bold text-black dark:text-white mb-2">Welcome to Community</h2>
            <p className="max-w-md">
              Select a conversation from the sidebar to start messaging, or search for a user to send a private message.
            </p>
            <button 
              onClick={() => setIsMobileSidebarOpen(true)}
              className="mt-6 md:hidden px-6 py-2 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-500 transition-colors"
            >
              View Chats
            </button>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="absolute bottom-8 right-8 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {showFABMenu && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="flex flex-col gap-2 items-end mb-2"
            >
              {isAdmin && (
                <button 
                  onClick={() => { setShowCreateGroup(true); setShowFABMenu(false); }}
                  className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-[#1a1a1a] border border-black/5 dark:border-white/5 shadow-lg rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
                >
                  <span className="font-bold text-sm">Create Group</span>
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg group-hover:scale-110 transition-transform">
                    <Users className="w-4 h-4" />
                  </div>
                </button>
              )}
              <button 
                onClick={() => { setShowJoinGroup(true); setShowFABMenu(false); }}
                className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-[#1a1a1a] border border-black/5 dark:border-white/5 shadow-lg rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
              >
                <span className="font-bold text-sm">Join Group</span>
                <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg group-hover:scale-110 transition-transform">
                  <LogIn className="w-4 h-4" />
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button
          onClick={() => setShowFABMenu(!showFABMenu)}
          className={`p-4 rounded-full shadow-[0_8px_30px_rgba(99,102,241,0.4)] text-white transition-all duration-300 active:scale-95 ${showFABMenu ? 'bg-rose-500 rotate-45' : 'bg-indigo-600 hover:bg-indigo-500 hover:scale-105'}`}
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {showCreateGroup && (
        <AdminCreateGroup 
          onClose={() => setShowCreateGroup(false)}
          onSuccess={() => {}}
        />
      )}
      
      {showJoinGroup && (
        <JoinGroup 
          onClose={() => setShowJoinGroup(false)}
          onSuccess={(threadId) => setActiveThreadId(threadId)}
        />
      )}
    </div>
  );
}
