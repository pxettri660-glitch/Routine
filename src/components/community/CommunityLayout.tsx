import React, { useState } from 'react';
import ChatSidebar from './ChatSidebar';
import ChatRoom from './ChatRoom';
import { useChat } from './hooks/useChat';
import { MessageSquare } from 'lucide-react';

interface CommunityLayoutProps {
  onNavigate: (view: string) => void;
}

export default function CommunityLayout({ onNavigate }: CommunityLayoutProps) {
  const { threads, activeThread, setActiveThreadId, loadingThreads } = useChat();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
    </div>
  );
}
