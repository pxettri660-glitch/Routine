import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { X, Users, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminCreateGroup({ onClose, onSuccess }: Props) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [bannerURL, setBannerURL] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);

  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreate = async () => {
    if (!name.trim() || !user) return;
    setLoading(true);
    try {
      const inviteCode = generateInviteCode();
      await addDoc(collection(db, 'threads'), {
        type: 'group',
        name: name.trim(),
        description: desc.trim(),
        photoURL: photoURL.trim(),
        bannerURL: bannerURL.trim(),
        isPrivate,
        inviteCode,
        members: [user.uid],
        admins: [user.uid],
        moderators: [],
        blockedMembers: [],
        mutedMembers: [],
        isLocked: false,
        createdBy: user.uid,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        unreadCount: {}
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to create group", error);
      alert("Failed to create group");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" /> Create Group
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-sm font-bold mb-1">Group Name *</label>
            <input 
              value={name} 
              onChange={e => setName(e.target.value)}
              className="w-full bg-black/5 dark:bg-white/5 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/50"
              placeholder="e.g. Computer Science 101"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Description</label>
            <textarea 
              value={desc} 
              onChange={e => setDesc(e.target.value)}
              className="w-full bg-black/5 dark:bg-white/5 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none h-20"
              placeholder="Optional description..."
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Profile Photo URL</label>
            <input 
              value={photoURL} 
              onChange={e => setPhotoURL(e.target.value)}
              className="w-full bg-black/5 dark:bg-white/5 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/50"
              placeholder="https://example.com/icon.png"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Banner Photo URL</label>
            <input 
              value={bannerURL} 
              onChange={e => setBannerURL(e.target.value)}
              className="w-full bg-black/5 dark:bg-white/5 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/50"
              placeholder="https://example.com/banner.png"
            />
          </div>
          <div className="flex items-center gap-3 py-2">
            <input 
              type="checkbox"
              id="isPrivate"
              checked={isPrivate}
              onChange={e => setIsPrivate(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="isPrivate" className="text-sm font-bold">Private Group</label>
          </div>
        </div>
        <div className="p-4 border-t border-black/5 dark:border-white/5 shrink-0">
          <button 
            onClick={handleCreate} 
            disabled={!name.trim() || loading}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </div>
    </div>
  );
}
