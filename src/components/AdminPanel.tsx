import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, Users, AlertTriangle, MessageSquare, Ban, VolumeX, CheckCircle, Trash2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, getDocs, doc, setDoc, deleteDoc, getDoc, orderBy, limit, serverTimestamp } from 'firebase/firestore';

export default function AdminPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'reports' | 'announcements' | 'groups'>('users');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  
  const [usersList, setUsersList] = useState<any[]>([]);
  const [roles, setRoles] = useState<Record<string, string>>({});
  const [banned, setBanned] = useState<Record<string, boolean>>({});
  const [muted, setMuted] = useState<Record<string, boolean>>({});
  
  const SUPER_ADMIN_UIDS = ['gwvcfcQqpKgFf8oR6OruOmYm1s82', 'QDkkZtRwlDcdALtsFWEg9HAcgAC2'];

  useEffect(() => {
    if (user) {
      if (SUPER_ADMIN_UIDS.includes(user.uid)) {
        setIsSuperAdmin(true);
        setIsModerator(true);
        // Ensure super admin role is set in DB
        setDoc(doc(db, 'roles', user.uid), { role: 'super_admin' }, { merge: true }).catch(console.error);
      } else {
        getDoc(doc(db, 'roles', user.uid)).then(snap => {
          if (snap.exists() && (snap.data().role === 'moderator' || snap.data().role === 'super_admin')) {
            setIsModerator(true);
            if (snap.data().role === 'super_admin') setIsSuperAdmin(true);
          }
        });
      }
    }
  }, [user]);

  useEffect(() => {
    if (isModerator) {
      loadUsers();
    }
  }, [isModerator]);

  const loadUsers = async () => {
    try {
      const usersSnap = await getDocs(query(collection(db, 'roles')));
      const rolesData: Record<string, string> = {};
      usersSnap.forEach(d => { rolesData[d.id] = d.data().role; });
      setRoles(rolesData);

      const bannedSnap = await getDocs(query(collection(db, 'banned_users')));
      const bannedData: Record<string, boolean> = {};
      bannedSnap.forEach(d => { bannedData[d.id] = true; });
      setBanned(bannedData);

      const mutedSnap = await getDocs(query(collection(db, 'muted_users')));
      const mutedData: Record<string, boolean> = {};
      mutedSnap.forEach(d => { mutedData[d.id] = true; });
      setMuted(mutedData);

      // We might not be able to list all users directly without a collection group or specific structure if not super admin,
      // but assuming super admin can list them or we just list from a known 'users' collection (which we don't have a flat list for).
      // Wait, the 'users' collection has documents for each user, but they are empty if only subcollections exist, unless we wrote to them.
      // In AuthContext, we write to /users/{uid}/profile/data. So we might need to fetch that.
      // But we can't easily list all profiles without a collection group query.
      // Let's just create a basic list for demonstration using the roles/banned/muted keys.
      const allUids = Array.from(new Set([...Object.keys(rolesData), ...Object.keys(bannedData), ...Object.keys(mutedData)]));
      
      const loadedUsers = [];
      for (const uid of allUids) {
         loadedUsers.push({ uid, role: rolesData[uid] || 'user' });
      }
      setUsersList(loadedUsers);
    } catch (e) {
      console.error("Error loading users:", e);
    }
  };

  const handleSetRole = async (uid: string, role: string) => {
    if (!isSuperAdmin) return alert("Only Super Admin can change roles.");
    try {
      await setDoc(doc(db, 'roles', uid), { role });
      setRoles(prev => ({ ...prev, [uid]: role }));
      alert(`Role updated to ${role}`);
    } catch (e) {
      console.error(e);
      alert("Failed to update role");
    }
  };

  const handleBan = async (uid: string, isCurrentlyBanned: boolean) => {
    if (!isSuperAdmin) return alert("Only Super Admin can ban users.");
    try {
      if (isCurrentlyBanned) {
        await deleteDoc(doc(db, 'banned_users', uid));
        setBanned(prev => { const n = {...prev}; delete n[uid]; return n; });
      } else {
        await setDoc(doc(db, 'banned_users', uid), { bannedAt: serverTimestamp(), bannedBy: user?.uid });
        setBanned(prev => ({ ...prev, [uid]: true }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMute = async (uid: string, isCurrentlyMuted: boolean) => {
    if (!isModerator) return alert("Only Moderators/Admins can mute.");
    try {
      if (isCurrentlyMuted) {
        await deleteDoc(doc(db, 'muted_users', uid));
        setMuted(prev => { const n = {...prev}; delete n[uid]; return n; });
      } else {
        await setDoc(doc(db, 'muted_users', uid), { mutedAt: serverTimestamp(), mutedBy: user?.uid });
        setMuted(prev => ({ ...prev, [uid]: true }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!isModerator) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center space-y-4">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-black/50 dark:text-white/50">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fafafa] dark:bg-[#0a0a0a] rounded-3xl overflow-hidden shadow-2xl border border-black/5 dark:border-white/10 min-h-[80vh] flex flex-col">
      <div className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-black/5 dark:border-white/10 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-500" />
            Admin Dashboard
          </h2>
          <p className="text-sm text-black/50 dark:text-white/50">
            {isSuperAdmin ? 'Super Admin Access' : 'Moderator Access'}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'}`}>Users</button>
          <button onClick={() => setActiveTab('reports')} className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${activeTab === 'reports' ? 'bg-blue-600 text-white' : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'}`}>Reports</button>
          <button onClick={() => setActiveTab('groups')} className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${activeTab === 'groups' ? 'bg-blue-600 text-white' : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'}`}>Groups</button>
          {isSuperAdmin && <button onClick={() => setActiveTab('announcements')} className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${activeTab === 'announcements' ? 'bg-blue-600 text-white' : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'}`}>Announcements</button>}
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'users' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold mb-4">User Management</h3>
            <div className="bg-white dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-black/5 dark:bg-white/5 font-bold">
                  <tr>
                    <th className="px-4 py-3">UID</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/10">
                  {usersList.map(u => (
                    <tr key={u.uid} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs">{u.uid}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${roles[u.uid] === 'super_admin' ? 'bg-purple-500/20 text-purple-500' : roles[u.uid] === 'moderator' ? 'bg-blue-500/20 text-blue-500' : 'bg-gray-500/20 text-gray-500'}`}>
                          {roles[u.uid] || 'user'}
                        </span>
                      </td>
                      <td className="px-4 py-3 flex gap-2">
                        {banned[u.uid] && <span className="px-2 py-1 bg-red-500/20 text-red-500 rounded-md text-xs font-bold">Banned</span>}
                        {muted[u.uid] && <span className="px-2 py-1 bg-orange-500/20 text-orange-500 rounded-md text-xs font-bold">Muted</span>}
                        {!banned[u.uid] && !muted[u.uid] && <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded-md text-xs font-bold">Active</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleMute(u.uid, !!muted[u.uid])} className="p-2 bg-black/5 dark:bg-white/10 hover:bg-orange-500/20 hover:text-orange-500 rounded-lg transition-colors">
                            {muted[u.uid] ? <VolumeX className="w-4 h-4 text-orange-500" /> : <VolumeX className="w-4 h-4" />}
                          </button>
                          {isSuperAdmin && (
                            <>
                              <button onClick={() => handleBan(u.uid, !!banned[u.uid])} className="p-2 bg-black/5 dark:bg-white/10 hover:bg-red-500/20 hover:text-red-500 rounded-lg transition-colors">
                                {banned[u.uid] ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Ban className="w-4 h-4" />}
                              </button>
                              <select 
                                value={roles[u.uid] || 'user'}
                                onChange={(e) => handleSetRole(u.uid, e.target.value)}
                                className="bg-black/5 dark:bg-white/10 rounded-lg px-2 text-xs font-bold focus:outline-none"
                              >
                                <option value="user">User</option>
                                <option value="moderator">Mod</option>
                                <option value="super_admin">Admin</option>
                              </select>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {usersList.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-black/50 dark:text-white/50">
                        No users tracked yet. Users will appear here once they are assigned a role or status.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        

        {activeTab === 'reports' && (
          <div className="flex items-center justify-center h-full">
            <p className="text-black/50 dark:text-white/50">Reports module coming soon.</p>
          </div>
        )}
        
        {activeTab === 'groups' && (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <h3 className="text-lg font-bold">Group Management</h3>
            <p className="text-black/50 dark:text-white/50">Create, manage, and moderate community groups here.</p>
            {isSuperAdmin && (
              <button className="px-6 py-2 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-500 transition-colors">
                + Create New Group
              </button>
            )}
          </div>
        )}
        
        {activeTab === 'announcements' && (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <h3 className="text-lg font-bold">Announcements</h3>
            <p className="text-black/50 dark:text-white/50">Pin important messages to the global chat.</p>
            <button className="px-6 py-2 bg-yellow-500 text-white rounded-full font-bold hover:bg-yellow-400 transition-colors">
              New Announcement
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
