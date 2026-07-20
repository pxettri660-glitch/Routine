import React, { useState } from 'react';
import { MoreHorizontal, Edit2, Trash2, Smile } from 'lucide-react';
import { Message } from './types';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

interface ChatMessageBubbleProps {
  message: Message;
  onDelete: () => void;
  onEdit: (text: string) => void;
  onReact: (emoji: string) => void;
  onReply?: () => void;
}

export default function ChatMessageBubble({ message, onDelete, onEdit, onReact, onReply }: ChatMessageBubbleProps) {
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);

  const isMe = user ? message.senderId === user.uid : false;
  const isAdmin = user && [import.meta.env.VITE_ADMIN_UID, 'gwvcfcQqpKgFf8oR6OruOmYm1s82'].includes(user.uid);
  const isDeleted = message.isDeleted;

  const handleEditSubmit = () => {
    if (editText.trim() && editText !== message.text) {
      onEdit(editText.trim());
    }
    setIsEditing(false);
  };

  return (
    <div className={`flex gap-3 max-w-[85%] group ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
      {!isMe && (
        <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex-shrink-0 flex items-center justify-center mt-1">
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
            {message.senderId.slice(0,2).toUpperCase()}
          </span>
        </div>
      )}
      
      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-2 mb-1 px-1">
          {!isMe && <span className="text-[11px] font-bold text-black/40 dark:text-white/40">User</span>}
          <span className="text-[10px] font-medium text-black/30 dark:text-white/30">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {message.isEdited && !isDeleted && (
            <span className="text-[10px] text-black/30 dark:text-white/30">(edited)</span>
          )}
        </div>
        
        <div className="relative flex items-center gap-2">
          {/* Actions Menu Trigger - Desktop Hover */}
          {!isDeleted && (isMe || isAdmin) && (
            <div className={`
              absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1
              ${isMe ? 'right-full mr-2' : 'left-full ml-2'}
            `}>
              <div className="relative">
                <button 
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-full text-black/40 dark:text-white/40"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                
                <AnimatePresence>
                  {showMenu && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`absolute top-full mt-1 ${isMe ? 'right-0' : 'left-0'} z-20 w-32 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-xl border border-black/5 dark:border-white/5 overflow-hidden py-1`}
                    >
                      
                      <button onClick={() => { onReply?.(); setShowMenu(false); }} className="w-full text-left px-4 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2">
                        Reply
                      </button>
  
                      {isMe && (
                        <button 
                          onClick={() => { setIsEditing(true); setShowMenu(false); }}
                          className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/5"
                        >
                          <Edit2 className="w-4 h-4" /> Edit
                        </button>
                      )}
                      {(isMe || isAdmin) && (
                        <button 
                          onClick={() => { onDelete(); setShowMenu(false); }}
                          className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-red-500/10 text-red-500"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
          
          {/* Message Content */}
          <div className={`
            px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed
            ${isDeleted 
              ? 'bg-transparent border border-black/10 dark:border-white/10 text-black/40 dark:text-white/40 italic' 
              : isMe 
                ? 'bg-indigo-600 text-white' 
                : 'bg-black/5 dark:bg-white/5 text-black dark:text-white'}
            ${isMe ? 'rounded-tr-sm' : 'rounded-tl-sm'}
          `}>
            {isEditing ? (
              <div className="flex flex-col gap-2 min-w-[200px]">
                <input 
                  type="text" 
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleEditSubmit();
                    if (e.key === 'Escape') setIsEditing(false);
                  }}
                  className="w-full bg-white/20 dark:bg-black/20 rounded px-2 py-1 text-sm outline-none border border-white/30 dark:border-white/10"
                  autoFocus
                />
                <div className="flex justify-end gap-3">
                  <button onClick={() => setIsEditing(false)} className="text-xs font-medium opacity-80 hover:opacity-100">Cancel</button>
                  <button onClick={handleEditSubmit} className="text-xs font-bold bg-white text-indigo-600 px-2 py-1 rounded">Save</button>
                </div>
              </div>
            ) : (
              message.text
            )}
          </div>
        </div>

        {/* Reactions */}
        {!isDeleted && message.reactions && Object.keys(message.reactions).length > 0 && (
          <div className={`flex flex-wrap gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
            {Object.entries(message.reactions).map(([emoji, users]) => {
              const usersList = users as string[];
              const iReacted = user && usersList.includes(user.uid);
              return (
                <button
                  key={emoji}
                  onClick={() => onReact(emoji)}
                  className={`
                    px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 border transition-colors
                    ${iReacted 
                      ? 'bg-indigo-50 dark:bg-indigo-500/20 border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400' 
                      : 'bg-black/5 dark:bg-white/5 border-transparent text-black/60 dark:text-white/60 hover:bg-black/10 dark:hover:bg-white/10'}
                  `}
                >
                  <span>{emoji}</span>
                  <span className="opacity-80">{usersList.length}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
