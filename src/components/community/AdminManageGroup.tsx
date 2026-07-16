import React, { useState, useEffect } from 'react';
import { collection, updateDoc, doc, arrayUnion, arrayRemove, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { X, Users, Settings, UserMinus, UserPlus } from 'lucide-react';
import { Thread, UserProfile } from './types';

interface Props {
  group: Thread;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminManageGroup({ group, onClose, onSuccess }: Props) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      const uList: UserProfile[] = [];
      snap.forEach(d => uList.push({ uid: d.id, ...d.data() } as UserProfile));
      setUsers(uList);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const toggleMember = async (uid: string, isMember: boolean) => {
    try {
      await updateDoc(doc(db, 'threads', group.id), {
        members: isMember ? arrayRemove(uid) : arrayUnion(uid)
      });
      onSuccess();
    } catch (e) {
      console.error(e);
      alert("Failed to update members");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-500" /> Manage {group.name}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="font-bold text-sm text-black/50 dark:text-white/50 mb-3 uppercase tracking-wider">Members</h3>
          <div className="space-y-2">
            {loading ? (
              <p className="text-center py-4 text-black/40">Loading users...</p>
            ) : (
              users.map(u => {
                const isMember = group.members?.includes(u.uid);
                return (
                  <div key={u.uid} className="flex items-center justify-between p-3 bg-black/5 dark:bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <img src={u.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${u.displayName}`} className="w-8 h-8 rounded-full" />
                      <div>
                        <p className="font-bold text-sm">{u.displayName}</p>
                        <p className="text-xs text-black/50 dark:text-white/50">{u.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleMember(u.uid, isMember)}
                      className={`p-2 rounded-lg text-sm font-bold transition-colors ${
                        isMember 
                          ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' 
                          : 'bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20'
                      }`}
                    >
                      {isMember ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
