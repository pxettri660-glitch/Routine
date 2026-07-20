import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { X, Users, Globe, Lock } from 'lucide-react';
import { Thread, UserProfile } from './types';

interface Props {
  group: Thread;
  onClose: () => void;
}

export default function GroupInfoModal({ group, onClose }: Props) {
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
      snap.forEach(d => {
        if (group.members?.includes(d.id)) {
          uList.push({ uid: d.id, ...d.data() } as UserProfile);
        }
      });
      setUsers(uList);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[80vh]">
        {group.bannerURL ? (
          <div className="h-32 w-full bg-cover bg-center" style={{ backgroundImage: `url(${group.bannerURL})` }}>
            <div className="p-4 flex justify-end">
              <button onClick={onClose} className="p-2 bg-black/50 text-white rounded-full backdrop-blur-md hover:bg-black/70">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="h-24 w-full bg-gradient-to-r from-indigo-500 to-cyan-500">
            <div className="p-4 flex justify-end">
              <button onClick={onClose} className="p-2 bg-black/20 text-white rounded-full backdrop-blur-md hover:bg-black/40">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
        
        <div className="px-6 pb-6 relative flex-1 overflow-y-auto">
          <div className="-mt-12 mb-4">
            {group.photoURL ? (
              <img src={group.photoURL} className="w-24 h-24 rounded-full border-4 border-white dark:border-[#1a1a1a] object-cover bg-white dark:bg-[#1a1a1a]" />
            ) : (
              <div className="w-24 h-24 rounded-full border-4 border-white dark:border-[#1a1a1a] bg-emerald-500 flex items-center justify-center text-4xl text-white font-bold shadow-lg">
                {group.name?.[0]?.toUpperCase() || '#'}
              </div>
            )}
          </div>
          
          <h2 className="text-2xl font-black mb-1">{group.name}</h2>
          
          <div className="flex items-center gap-2 text-sm text-black/50 dark:text-white/50 mb-4 font-bold">
            {group.isPrivate ? (
              <span className="flex items-center gap-1"><Lock className="w-4 h-4" /> Private Group</span>
            ) : (
              <span className="flex items-center gap-1"><Globe className="w-4 h-4" /> Public Group</span>
            )}
            <span>•</span>
            <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {group.members?.length || 0} Members</span>
          </div>
          
          {group.description && (
            <div className="bg-black/5 dark:bg-white/5 p-4 rounded-xl mb-6">
              <p className="text-sm font-medium">{group.description}</p>
            </div>
          )}
          
          <h3 className="font-bold text-sm text-black/50 dark:text-white/50 mb-3 uppercase tracking-wider">Members List</h3>
          
          <div className="space-y-3">
            {loading ? (
              <p className="text-sm text-center py-4 text-black/40">Loading members...</p>
            ) : (
              users.map(u => (
                <div key={u.uid} className="flex items-center gap-3">
                  <img src={u.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${u.displayName}`} className="w-10 h-10 rounded-full bg-slate-200" />
                  <div>
                    <p className="font-bold text-[15px] leading-tight">{u.displayName}</p>
                    {group.admins?.includes(u.uid) ? (
                      <p className="text-xs text-amber-600 font-bold">Admin</p>
                    ) : group.moderators?.includes(u.uid) ? (
                      <p className="text-xs text-indigo-600 font-bold">Moderator</p>
                    ) : (
                      <p className="text-xs text-black/40 dark:text-white/40">Member</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
