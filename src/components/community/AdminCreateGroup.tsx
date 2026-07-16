import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { X, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminCreateGroup({ onClose, onSuccess }: Props) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !user) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'threads'), {
        type: 'group',
        name: name.trim(),
        description: desc.trim(),
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
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" /> Create Group
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Group Name</label>
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
              className="w-full bg-black/5 dark:bg-white/5 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none h-24"
              placeholder="Optional description..."
            />
          </div>
          <button 
            onClick={handleCreate} 
            disabled={!name.trim() || loading}
            className="w-full py-2 bg-indigo-600 text-white rounded-xl font-bold disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </div>
    </div>
  );
}
