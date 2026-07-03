import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Image as ImageIcon, MoreVertical, X, Check, CheckCircle2, Shield, Trash2, Pin, Smile } from 'lucide-react';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { storage } from '../lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderPhotoURL: string;
  createdAt: any;
  imageUrl?: string;
  isPinned?: boolean;
}

export default function CommunityChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    
    if (user) {
      // Check ban status
      getDoc(doc(db, 'banned_users', user.uid)).then(snap => {
        if (snap.exists()) setIsBanned(true);
      }).catch(() => {});

      const SUPER_ADMIN_UIDS = ['gwvcfcQqpKgFf8oR6OruOmYm1s82', 'QDkkZtRwlDcdALtsFWEg9HAcgAC2'];

      if (SUPER_ADMIN_UIDS.includes(user.uid)) {
        setIsAdmin(true);
        setIsSuperAdmin(true);
      } else {
        const roleRef = doc(db, 'roles', user.uid);
        getDoc(roleRef).then(snap => {
          if (snap.exists()) {
             if (snap.data().role === 'super_admin') {
               setIsAdmin(true);
               setIsSuperAdmin(true);
             } else if (snap.data().role === 'moderator') {
               setIsAdmin(true);
             }
          }
        }).catch(err => console.warn("Failed to get role:", err));
      }
    }
  }, [user]);

  useEffect(() => {
    const q = query(
      collection(db, 'community_messages'),
      orderBy('createdAt', 'asc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = [];
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(msgs);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    
  

  return () => unsubscribe();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const text = newMessage;
    setNewMessage('');

    try {
      await addDoc(collection(db, 'community_messages'), {
        text,
        senderId: user.uid,
        senderName: user.displayName || 'Student',
        senderPhotoURL: user.photoURL || '',
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'community_messages', id));
      setMenuOpen(null);
    } catch (e) {
      console.error(e);
    }
  };


  const handlePin = async (id: string, isPinned: boolean) => {
    if (!user || !isAdmin) return;
    try {
      await updateDoc(doc(db, 'community_messages', id), { isPinned: !isPinned });
      setMenuOpen(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMuteUser = async (targetUserId: string, targetUserName: string) => {
    if (!user || !isAdmin) return;
    if (confirm(`Are you sure you want to mute ${targetUserName}?`)) {
      try {
        const { setDoc } = require('firebase/firestore');
        await setDoc(doc(db, 'muted_users', targetUserId), {
          mutedAt: serverTimestamp(),
          mutedBy: user.uid
        });
        alert(`${targetUserName} has been muted.`);
        setMenuOpen(null);
      } catch (e) {
        console.error(e);
        alert('Failed to mute user. You may not have admin privileges.');
      }
    }
  };


const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    setIsUploading(true);
    try {
      const storageRef = ref(storage, `chat_images/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on('state_changed', 
        (snapshot) => {}, 
        (error) => {
          console.error("Upload failed", error);
          setIsUploading(false);
        }, 
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          await addDoc(collection(db, 'community_messages'), {
            text: '',
            imageUrl: downloadURL,
            senderId: user.uid,
            senderName: user.displayName || 'Student',
            senderPhotoURL: user.photoURL || '',
            createdAt: serverTimestamp(),
          });
          setIsUploading(false);
        }
      );
    } catch (err) {
      console.error(err);
      setIsUploading(false);
    }
  };


  
  if (isBanned) {
    return (
      <div className="flex flex-col h-[85vh] sm:h-[80vh] bg-[#fafafa] dark:bg-[#0a0a0a] rounded-3xl overflow-hidden shadow-2xl border border-black/5 dark:border-white/10 items-center justify-center p-6 text-center">
        <Shield className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-red-500 mb-2">Account Banned</h2>
        <p className="text-black/60 dark:text-white/60">You have been permanently banned from the community chat.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[85vh] sm:h-[80vh] bg-[#fafafa] dark:bg-[#0a0a0a] rounded-3xl overflow-hidden shadow-2xl border border-black/5 dark:border-white/10 relative">
      <div className="flex-shrink-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-black/5 dark:border-white/10 px-4 py-4 flex items-center justify-between z-10">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            Community Chat
            {isAdmin && <Shield className="w-4 h-4 text-blue-500" />}
          </h2>
          <p className="text-xs text-black/50 dark:text-white/50 font-medium">Global Student Network</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse"></div>
          <span className="text-xs font-bold text-green-500">Online</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {messages.map((msg, index) => {
          const isMe = msg.senderId === user?.uid;
          const showAvatar = !isMe && (index === 0 || messages[index - 1].senderId !== msg.senderId);

          return (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id} 
              className={`flex ${isMe ? 'justify-end' : 'justify-start'} group relative`}
            >
              {!isMe && (
                <div className="w-8 shrink-0 mr-2 flex items-end pb-1">
                  {showAvatar && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 overflow-hidden shadow-md flex items-center justify-center text-white text-xs font-bold">
                      {msg.senderPhotoURL ? (
                        <img src={msg.senderPhotoURL} alt={msg.senderName} className="w-full h-full object-cover" />
                      ) : (
                        msg.senderName.charAt(0).toUpperCase()
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                {!isMe && showAvatar && (
                  <span className="text-[10px] font-bold text-black/40 dark:text-white/40 ml-1 mb-1">
                    {msg.senderName}
                  </span>
                )}
                
                <div className="relative group/bubble">
                  {msg.isPinned && (
                    <div className="absolute -top-3 -right-2 bg-yellow-500 text-white p-1 rounded-full shadow-lg z-10">
                      <Pin className="w-3 h-3" />
                    </div>
                  )}
                  <div 
                    className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                      isMe 
                        ? 'bg-blue-600 text-white rounded-br-sm' 
                        : 'bg-white dark:bg-white/10 text-black dark:text-white rounded-bl-sm border border-black/5 dark:border-white/5'
                    }`}
                  >
                    {msg.imageUrl ? (
                      <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-xl overflow-hidden mb-1 border border-black/5 dark:border-white/10">
                        <img src={msg.imageUrl} alt="Attachment" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                      </div>
                    ) : null}
                    {msg.text && <div>{msg.text}</div>}
                  </div>
                  
                  {/* Context Menu Trigger */}
                  {(isMe || isAdmin) && (
                    <button 
                      onClick={() => setMenuOpen(menuOpen === msg.id ? null : msg.id)}
                      className={`absolute top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/5 dark:bg-white/10 opacity-0 group-hover/bubble:opacity-100 transition-opacity ${isMe ? '-left-8' : '-right-8'}`}
                    >
                      <MoreVertical className="w-4 h-4 text-black/50 dark:text-white/50" />
                    </button>
                  )}

                  {/* Context Menu */}
                  <AnimatePresence>
                    {menuOpen === msg.id && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={`absolute top-0 ${isMe ? 'right-full mr-2' : 'left-full ml-2'} bg-white dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10 shadow-xl rounded-xl p-1 z-20 flex flex-col min-w-[120px]`}
                      >
                        {(isMe || isAdmin) && (
                          <button onClick={() => handleDelete(msg.id)} className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-lg text-left">
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        )}
                        {isAdmin && (
                          <>
                            <button onClick={() => handlePin(msg.id, !!msg.isPinned)} className="flex items-center gap-2 px-3 py-2 text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-left">
                              <Pin className="w-3.5 h-3.5" /> {msg.isPinned ? 'Unpin' : 'Pin'}
                            </button>
                            {msg.senderId !== user?.uid && (
                              <button onClick={() => handleMuteUser(msg.senderId, msg.senderName)} className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-orange-500 hover:bg-orange-500/10 rounded-lg text-left">
                                <Shield className="w-3.5 h-3.5" /> Mute User
                              </button>
                            )}
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {isMe && index === messages.length - 1 && (
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-black/40 dark:text-white/40">
                    <CheckCircle2 className="w-3 h-3" /> Delivered
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>


      <div className="flex-shrink-0 bg-white dark:bg-[#0a0a0a] border-t border-black/5 dark:border-white/10 p-4 relative">
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-full left-4 mb-4 z-50 shadow-2xl rounded-2xl overflow-hidden border border-black/10 dark:border-white/10"
            >
              <EmojiPicker 
                theme={Theme.AUTO} 
                onEmojiClick={(emojiData) => setNewMessage(prev => prev + emojiData.emoji)} 
              />
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
          <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-3 text-black/40 dark:text-white/40 hover:text-blue-500 hover:bg-blue-500/10 rounded-full transition-colors shrink-0">
            <Smile className="w-6 h-6" />
          </button>

          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload}
            accept="image/*" 
            className="hidden" 
          />
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            className={`p-3 text-black/40 dark:text-white/40 hover:text-blue-500 hover:bg-blue-500/10 rounded-full transition-colors shrink-0 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isUploading}
          >
            <ImageIcon className="w-6 h-6" />
          </button>
  
          <div className="flex-1 bg-black/5 dark:bg-white/5 rounded-3xl flex items-center border border-transparent focus-within:border-blue-500/50 transition-colors">
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Message..." 
              className="flex-1 bg-transparent px-4 py-3 text-sm focus:outline-none"
            />
          </div>
          <button 
            type="submit"
            disabled={!newMessage.trim()} 
            className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
