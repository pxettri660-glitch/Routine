import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { collection, query, getDocs, addDoc, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { UserProfile } from './types';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChatCreated: (threadId: string) => void;
}

export default function NewChatModal({ isOpen, onClose, onChatCreated }: NewChatModalProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      searchUsers();
    }
  }, [isOpen, searchQuery]);

  const searchUsers = async () => {
    setLoading(true);
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const usersList: UserProfile[] = [];
      usersSnap.forEach(doc => {
        if (doc.id !== user?.uid) {
          const data = doc.data() as UserProfile;
          if (data.displayName?.toLowerCase().includes(searchQuery.toLowerCase())) {
            usersList.push({ uid: doc.id, ...data });
          }
        }
      });
      setUsers(usersList);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const startChat = async (targetUserId: string, targetUserName: string, targetAvatar: string) => {
    if (!user) return;
    try {
      // Check if DM already exists
      const q = query(
        collection(db, 'threads'),
        where('type', '==', 'dm'),
        where('members', 'array-contains', user.uid)
      );
      const querySnapshot = await getDocs(q);
      
      let existingThreadId = null;
      querySnapshot.forEach(doc => {
        const data = doc.data();
        if (data.members.includes(targetUserId)) {
          existingThreadId = doc.id;
        }
      });

      if (existingThreadId) {
        onChatCreated(existingThreadId);
        onClose();
        return;
      }

      // Create new DM
      const docRef = await addDoc(collection(db, 'threads'), {
        type: 'dm',
        name: targetUserName, // we store the target name initially for simplicity, robust app would resolve
        photoURL: targetAvatar,
        members: [user.uid, targetUserId],
        admins: [],
        moderators: [],
        blockedMembers: [],
        mutedMembers: [],
        isLocked: false,
        createdBy: user.uid,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        unreadCount: {}
      });
      
      onChatCreated(docRef.id);
      onClose();
    } catch (error) {
      console.error(error);
      alert('Failed to start chat');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-black/10 dark:border-white/10">
        <div className="px-4 py-3 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-bold">New Message</h2>
          <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 border-b border-black/5 dark:border-white/5">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40" />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/5 dark:bg-white/5 rounded-lg py-2 pl-9 pr-4 text-[15px] outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-black/40 dark:placeholder:text-white/40"
            />
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {loading ? (
            <div className="p-4 text-center text-black/40 dark:text-white/40">Searching...</div>
          ) : users.length === 0 ? (
            <div className="p-4 text-center text-black/40 dark:text-white/40">No users found</div>
          ) : (
            users.map(u => (
              <button 
                key={u.uid}
                onClick={() => startChat(u.uid, u.displayName, u.photoURL)}
                className="w-full flex items-center gap-3 p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors text-left"
              >
                <img src={u.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${u.displayName}`} alt={u.displayName} className="w-10 h-10 rounded-full bg-slate-200" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[15px] truncate text-black dark:text-white">{u.displayName}</h3>
                  <p className="text-sm text-black/50 dark:text-white/50 truncate">{u.email}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
