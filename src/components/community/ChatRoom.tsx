import React, { useState, useRef, useEffect } from 'react';
import { Send, Menu, Image as ImageIcon, FileText, Smile, MoreVertical, X, Globe, MessageSquare, Search } from 'lucide-react';
import { Thread, Message } from './types';
import { useAuth } from '../../contexts/AuthContext';
import { useMessages } from './hooks/useMessages';
import ChatMessageBubble from './ChatMessageBubble';
import AdminManageGroup from './AdminManageGroup';
import GroupInfoModal from './GroupInfoModal';

interface ChatRoomProps {
  thread: Thread;
  onOpenMobileSidebar: () => void;
}

export default function ChatRoom({ thread, onOpenMobileSidebar }: ChatRoomProps) {
  const { user } = useAuth();
  const { messages, loading, sendMessage, editMessage, deleteMessage, reactToMessage, setTypingStatus } = useMessages(thread);
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const isMuted = user && thread.mutedMembers?.includes(user.uid);
  const isBlocked = user && thread.blockedMembers?.includes(user.uid);
  const isAdmin = user && ['gwvcfcQqpKgFf8oR6OruOmYm1s82', 'QDkkZtRwlDcdALtsFWEg9HAcgAC2', import.meta.env.VITE_ADMIN_UID].includes(user.uid);
  const isAdminInGroup = user && thread.admins?.includes(user.uid);
  const [showMenu, setShowMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showAdminManage, setShowAdminManage] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const isLocked = thread.isLocked && user && !thread.admins?.includes(user.uid) && !isAdmin;
  
  const canSend = !isMuted && !isBlocked && !isLocked;

  const filteredMessages = messages.filter(m => m.text.toLowerCase().includes(searchQuery.toLowerCase()));
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || !canSend) return;
    const text = inputText.trim();
    const replyId = replyingTo?.id;
    setInputText('');
    setReplyingTo(null);
    await sendMessage(text, undefined, undefined, replyId);
    setTypingStatus(false);
  };

  if (isBlocked) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-white dark:bg-[#0a0a0a]">
        <h2 className="text-xl font-bold text-red-500 mb-2">Access Denied</h2>
        <p className="text-black/50 dark:text-white/50">You have been blocked from this conversation.</p>
        <button onClick={onOpenMobileSidebar} className="mt-4 md:hidden px-4 py-2 bg-black/10 dark:bg-white/10 rounded-full font-bold">View Chats</button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#0a0a0a]">
      {showAdminManage && <AdminManageGroup group={thread} onClose={() => setShowAdminManage(false)} onSuccess={() => setShowAdminManage(false)} />}
      {showGroupInfo && <GroupInfoModal group={thread} onClose={() => setShowGroupInfo(false)} />}

      <div className="h-[72px] shrink-0 border-b border-black/5 dark:border-white/5 flex items-center justify-between px-4 bg-white/50 dark:bg-[#0a0a0a]/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={onOpenMobileSidebar}
            className="md:hidden p-2 -ml-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="relative">
            {thread.photoURL ? (
              <img src={thread.photoURL} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold
                ${thread.isGlobal ? 'bg-blue-500' : thread.type === 'dm' ? 'bg-indigo-500' : 'bg-emerald-500'}`}>
                {thread.isGlobal ? <Globe className="w-5 h-5" /> : thread.name?.[0]?.toUpperCase() || '#'}
              </div>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-[#0a0a0a]" />
          </div>
          
          <div>
            <h2 className="font-bold text-[15px] text-black dark:text-white leading-tight flex items-center gap-2">
              {thread.name || 'Chat'}
              {thread.isLocked && <span className="text-[10px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded font-bold">LOCKED</span>}
            </h2>
            <p className="text-xs text-black/50 dark:text-white/50">
              {thread.isGlobal ? 'Global Community' : thread.type === 'dm' ? 'Private Message' : `${thread.members.length} members`}
            </p>
          </div>
        </div>
        
        {showSearch && (
          <div className="absolute top-[72px] left-0 right-0 p-2 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-black/5 dark:border-white/5 z-10 flex gap-2 items-center">
            <Search className="w-4 h-4 text-black/50 dark:text-white/50 ml-2" />
            <input 
              autoFocus
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search messages..."
              className="flex-1 bg-transparent outline-none text-sm px-2 py-1"
            />
            <button onClick={() => { setShowSearch(false); setSearchQuery(''); }} className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        <div className="flex items-center gap-1 relative">
          <button onClick={() => setShowSearch(!showSearch)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-black/60 dark:text-white/60">
            <Search className="w-5 h-5" />
          </button>
          <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-black/60 dark:text-white/60">
            <MoreVertical className="w-5 h-5" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-xl border border-black/10 dark:border-white/10 z-50 overflow-hidden">
              {thread.type === 'group' && !thread.isGlobal && (
                <button onClick={() => { setShowGroupInfo(true); setShowMenu(false); }} className="w-full text-left px-4 py-3 text-sm font-bold hover:bg-black/5 dark:hover:bg-white/5">Group Info</button>
              )}
              {thread.type === 'group' && !thread.isGlobal && isAdminInGroup && (
                <button onClick={() => { setShowAdminManage(true); setShowMenu(false); }} className="w-full text-left px-4 py-3 text-sm font-bold hover:bg-black/5 dark:hover:bg-white/5 text-indigo-600 dark:text-indigo-400">Manage Group</button>
              )}
              <button onClick={() => setShowMenu(false)} className="w-full text-left px-4 py-3 text-sm font-bold hover:bg-black/5 dark:hover:bg-white/5">Close Menu</button>
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6 flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-black/50 dark:text-white/50">
            Loading messages...
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-black/40 dark:text-white/40">
            <div className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 opacity-50" />
            </div>
            <p className="font-medium">No messages yet</p>
            <p className="text-sm">Be the first to say hello!</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const prevMsg = idx > 0 ? messages[idx - 1] : null;
            const showDate = !prevMsg || new Date(msg.timestamp).toDateString() !== new Date(prevMsg.timestamp).toDateString();
            
            return (
              <React.Fragment key={msg.id}>
                {showDate && (
                  <div className="flex items-center justify-center my-4">
                    <div className="bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full text-xs font-bold text-black/40 dark:text-white/40">
                      {new Date(msg.timestamp).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                )}
                <ChatMessageBubble 
                  message={msg} 
                  onDelete={() => deleteMessage(msg.id)}
                  onEdit={(text) => editMessage(msg.id, text)}
                  onReact={(emoji) => reactToMessage(msg.id, emoji)}
                />
              </React.Fragment>
            );
          })
        )}
        <div ref={messagesEndRef} className="h-4 shrink-0" />
      </div>

      <div className="shrink-0 p-4 bg-white dark:bg-[#0a0a0a] border-t border-black/5 dark:border-white/5">
        <div className="max-w-4xl mx-auto relative flex items-end gap-2">
          <div className="flex-1 bg-[#f8f9fa] dark:bg-[#111111] border border-black/5 dark:border-white/5 rounded-3xl p-1 flex items-end transition-colors focus-within:bg-white dark:focus-within:bg-[#1a1a1a] focus-within:border-indigo-500/30 focus-within:shadow-sm">
            <div className="flex gap-1 p-1 shrink-0">
              <button 
                disabled={!canSend}
                className="p-2 text-black/40 dark:text-white/40 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-full transition-colors disabled:opacity-50"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <button 
                disabled={!canSend}
                className="p-2 text-black/40 dark:text-white/40 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-full transition-colors disabled:opacity-50"
              >
                <FileText className="w-5 h-5" />
              </button>
            </div>
            
            <textarea 
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                if (e.target.value.trim().length === 1 && inputText.length === 0) setTypingStatus(true);
                if (e.target.value.trim().length === 0 && inputText.length > 0) setTypingStatus(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={isLocked ? "Chat is locked" : isMuted ? "You are muted" : "Type a message..."}
              disabled={!canSend}
              className="flex-1 max-h-32 min-h-[40px] bg-transparent resize-none outline-none py-2.5 px-2 text-[15px] text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 disabled:opacity-50"
              rows={1}
            />
            
            <div className="p-1 shrink-0">
              <button 
                disabled={!canSend}
                className="p-2 text-black/40 dark:text-white/40 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-full transition-colors disabled:opacity-50"
              >
                <Smile className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <button 
            onClick={handleSend}
            disabled={!inputText.trim() || !canSend}
            className={`
              shrink-0 w-12 h-12 flex items-center justify-center rounded-full transition-all
              ${inputText.trim() && canSend
                ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-500 hover:scale-105 active:scale-95' 
                : 'bg-[#f8f9fa] dark:bg-[#111111] text-black/20 dark:text-white/20'}
            `}
          >
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
