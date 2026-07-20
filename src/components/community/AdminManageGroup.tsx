import React, { useState, useEffect } from 'react';
import { collection, updateDoc, doc, arrayUnion, arrayRemove, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { X, Users, Settings, UserMinus, UserPlus, Shield, ShieldAlert, Copy, RefreshCw, Trash2 } from 'lucide-react';
import { Thread, UserProfile } from './types';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  group: Thread;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminManageGroup({ group, onClose, onSuccess }: Props) {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'members'>('settings');

  const [name, setName] = useState(group.name || '');
  const [desc, setDesc] = useState(group.description || '');
  const [photoURL, setPhotoURL] = useState(group.photoURL || '');
  const [bannerURL, setBannerURL] = useState(group.bannerURL || '');
  const [isPrivate, setIsPrivate] = useState(group.isPrivate || false);
  const [inviteCode, setInviteCode] = useState(group.inviteCode || '');

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

  const handleUpdateSettings = async () => {
    try {
      await updateDoc(doc(db, 'threads', group.id), {
        name: name.trim(),
        description: desc.trim(),
        photoURL: photoURL.trim(),
        bannerURL: bannerURL.trim(),
        isPrivate,
        inviteCode
      });
      onSuccess();
    } catch (e) {
      console.error(e);
      alert("Failed to update settings");
    }
  };

  const generateNewInviteCode = () => {
    setInviteCode(Math.random().toString(36).substring(2, 8).toUpperCase());
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    alert('Copied to clipboard!');
  };

  const toggleMember = async (uid: string, isMember: boolean) => {
    try {
      if (isMember && group.admins?.includes(uid)) {
        alert("Cannot remove an admin.");
        return;
      }
      await updateDoc(doc(db, 'threads', group.id), {
        members: isMember ? arrayRemove(uid) : arrayUnion(uid),
        moderators: isMember ? arrayRemove(uid) : group.moderators
      });
      onSuccess();
    } catch (e) {
      console.error(e);
      alert("Failed to update members");
    }
  };

  const toggleModerator = async (uid: string, isMod: boolean) => {
    try {
      await updateDoc(doc(db, 'threads', group.id), {
        moderators: isMod ? arrayRemove(uid) : arrayUnion(uid)
      });
      onSuccess();
    } catch (e) {
      console.error(e);
      alert("Failed to update moderators");
    }
  };
  
  const handleDeleteGroup = async () => {
    if (confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'threads', group.id));
        onSuccess();
        onClose();
      } catch (e) {
        console.error(e);
        alert('Failed to delete group');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-500" /> Manage {group.name}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex bg-black/5 dark:bg-white/5 p-1 mx-4 mt-4 rounded-xl shrink-0">
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'settings' ? 'bg-white dark:bg-[#222] shadow-sm' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'}`}
          >
            Settings
          </button>
          <button 
            onClick={() => setActiveTab('members')}
            className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'members' ? 'bg-white dark:bg-[#222] shadow-sm' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'}`}
          >
            Members
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Group Name</label>
                <input 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-black/5 dark:bg-white/5 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Description</label>
                <textarea 
                  value={desc} 
                  onChange={e => setDesc(e.target.value)}
                  className="w-full bg-black/5 dark:bg-white/5 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none h-20"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Profile Photo URL</label>
                <input 
                  value={photoURL} 
                  onChange={e => setPhotoURL(e.target.value)}
                  className="w-full bg-black/5 dark:bg-white/5 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Banner Photo URL</label>
                <input 
                  value={bannerURL} 
                  onChange={e => setBannerURL(e.target.value)}
                  className="w-full bg-black/5 dark:bg-white/5 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/50"
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
              
              <div className="bg-indigo-50/50 dark:bg-indigo-500/5 p-4 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
                <label className="block text-sm font-bold mb-2 text-indigo-900 dark:text-indigo-100">Invite Code</label>
                <div className="flex items-center gap-2">
                  <input 
                    value={inviteCode} 
                    readOnly
                    className="flex-1 bg-white dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 outline-none font-mono font-bold uppercase tracking-widest text-center"
                  />
                  <button onClick={copyInviteCode} className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-colors" title="Copy">
                    <Copy className="w-5 h-5" />
                  </button>
                  <button onClick={generateNewInviteCode} className="p-2.5 bg-black/5 dark:bg-white/5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors" title="Generate New">
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <button 
                onClick={handleUpdateSettings}
                className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-bold transition-colors hover:bg-indigo-500"
              >
                Save Changes
              </button>
              
              <div className="pt-4 mt-4 border-t border-black/5 dark:border-white/5">
                <button 
                  onClick={handleDeleteGroup}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl font-bold hover:bg-rose-500/20 transition-colors"
                >
                  <Trash2 className="w-5 h-5" /> Delete Group
                </button>
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-2">
              {loading ? (
                <p className="text-center py-4 text-black/40">Loading users...</p>
              ) : (
                users.map(u => {
                  const isMember = group.members?.includes(u.uid);
                  const isMod = group.moderators?.includes(u.uid);
                  const isGrpAdmin = group.admins?.includes(u.uid);
                  
                  return (
                    <div key={u.uid} className="flex items-center justify-between p-3 bg-black/5 dark:bg-white/5 rounded-xl">
                      <div className="flex items-center gap-3">
                        <img src={u.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${u.displayName}`} className="w-8 h-8 rounded-full" />
                        <div>
                          <p className="font-bold text-sm">{u.displayName}</p>
                          <div className="flex gap-2 items-center">
                            <p className="text-xs text-black/50 dark:text-white/50">{u.email}</p>
                            {isGrpAdmin && <span className="text-[10px] bg-amber-500/20 text-amber-600 px-1.5 py-0.5 rounded font-bold">Admin</span>}
                            {isMod && !isGrpAdmin && <span className="text-[10px] bg-indigo-500/20 text-indigo-600 px-1.5 py-0.5 rounded font-bold">Mod</span>}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isMember && !isGrpAdmin && (
                          <button
                            onClick={() => toggleModerator(u.uid, isMod)}
                            className={`p-2 rounded-lg text-sm font-bold transition-colors ${
                              isMod 
                                ? 'bg-amber-500/20 text-amber-600 hover:bg-amber-500/30' 
                                : 'bg-black/5 dark:bg-white/5 text-black/50 dark:text-white/50 hover:bg-black/10 dark:hover:bg-white/10'
                            }`}
                            title={isMod ? "Remove Moderator" : "Promote to Moderator"}
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                        )}
                        {!isGrpAdmin && (
                          <button
                            onClick={() => toggleMember(u.uid, isMember)}
                            className={`p-2 rounded-lg text-sm font-bold transition-colors ${
                              isMember 
                                ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20' 
                                : 'bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20'
                            }`}
                            title={isMember ? "Remove Member" : "Add Member"}
                          >
                            {isMember ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
