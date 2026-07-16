import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, MessageSquare, AlertTriangle, 
  Settings, UserX, UserCheck, Trash2, Edit2, Info, Search, MessageCircle, Lock, Unlock, Speaker
} from 'lucide-react';
import { collection, query, getDocs, updateDoc, doc, deleteDoc, where, addDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { UserProfile, Thread, Report, Message } from './community/types';
import AdminCreateGroup from './community/AdminCreateGroup';
import AdminManageGroup from './community/AdminManageGroup';

export default function AdminPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'messages' | 'groups' | 'reports' | 'announcements'>('dashboard');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [groups, setGroups] = useState<Thread[]>([]);
  const [recentMessages, setRecentMessages] = useState<(Message & { threadName: string })[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  
  const [stats, setStats] = useState({ totalUsers: 0, onlineUsers: 0, totalGroups: 0, totalDMs: 0, totalMessages: 0 });
  const [loading, setLoading] = useState(true);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [managingGroup, setManagingGroup] = useState<Thread | null>(null);

  const [searchQuery, setSearchQuery] = useState('');

  const isAdmin = user && [import.meta.env.VITE_ADMIN_UID, 'gwvcfcQqpKgFf8oR6OruOmYm1s82', 'QDkkZtRwlDcdALtsFWEg9HAcgAC2'].includes(user.uid);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const loadData = async () => {
    setLoading(true);
    try {
      const uSnap = await getDocs(collection(db, 'users'));
      const uList: UserProfile[] = [];
      let online = 0;
      uSnap.forEach(d => {
        const u = { uid: d.id, ...d.data() } as UserProfile;
        uList.push(u);
        if (u.isOnline) online++;
      });
      setUsers(uList);

      const tSnap = await getDocs(collection(db, 'threads'));
      const tList: Thread[] = [];
      let dms = 0;
      let grps = 0;
      tSnap.forEach(d => {
        const t = { id: d.id, ...d.data() } as Thread;
        if (t.type === 'dm') dms++;
        else grps++;
        tList.push(t);
      });
      setGroups(tList.filter(t => t.type !== 'dm'));

      // Let's just approximate total messages by scanning some threads (since it's a subcollection, a collectionGroup query is better)
      const mSnap = await getDocs(query(collection(db, 'messages'), orderBy('timestamp', 'desc'), limit(50))); 
      // Wait, we used subcollections 'threads/{id}/messages'. A collectionGroup query requires an index.
      // We will skip total messages count or do a fast query if possible. We can just omit total messages if we don't have collectionGroup.
      
      const rSnap = await getDocs(collection(db, 'reports'));
      const rList: Report[] = [];
      rSnap.forEach(d => {
        rList.push({ id: d.id, ...d.data() } as Report);
      });
      setReports(rList);

      setStats({
        totalUsers: uList.length,
        onlineUsers: online,
        totalGroups: grps,
        totalDMs: dms,
        totalMessages: 0
      });
    } catch (error) {
      console.error("Admin load error:", error);
    }
    setLoading(false);
  };

  const toggleUserField = async (uid: string, field: 'isBanned' | 'isDisabled', currentVal: boolean) => {
    try {
      await updateDoc(doc(db, 'users', uid), { [field]: !currentVal });
      setUsers(users.map(u => u.uid === uid ? { ...u, [field]: !currentVal } : u));
    } catch (e) {
      console.error(e);
      alert("Failed to update user");
    }
  };
  
  const toggleGroupLock = async (threadId: string, currentVal: boolean) => {
    try {
      await updateDoc(doc(db, 'threads', threadId), { isLocked: !currentVal });
      setGroups(groups.map(g => g.id === threadId ? { ...g, isLocked: !currentVal } : g));
    } catch (e) {
      console.error(e);
    }
  };

  const deleteGroup = async (threadId: string) => {
    if (!confirm("Delete this group permanently?")) return;
    try {
      await deleteDoc(doc(db, 'threads', threadId));
      setGroups(groups.filter(g => g.id !== threadId));
    } catch (e) {
      console.error(e);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-[#0a0a0a]">
        <Shield className="w-16 h-16 text-red-500 mb-4 opacity-50" />
        <h2 className="text-2xl font-bold text-black dark:text-white mb-2">Access Restricted</h2>
        <p className="text-black/50 dark:text-white/50 max-w-md">You do not have permission to view the Admin Panel.</p>
      </div>
    );
  }

  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-[#f8f9fa] dark:bg-[#0a0a0a] overflow-hidden">
      <div className="p-6 border-b border-black/5 dark:border-white/5 shrink-0 bg-white dark:bg-[#111111]">
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-4">
          <Shield className="w-6 h-6 text-red-500" />
          System Administrator
        </h1>
        
        <div className="flex overflow-x-auto no-scrollbar gap-2">
          {['dashboard', 'users', 'groups', 'reports', 'announcements'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`
                px-4 py-2 rounded-xl text-sm font-bold capitalize whitespace-nowrap transition-all
                ${activeTab === tab 
                  ? 'bg-red-500 text-white shadow-md' 
                  : 'bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 hover:bg-black/10 dark:hover:bg-white/10'}
              `}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full text-black/50 dark:text-white/50 font-bold">
            Loading system data...
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-6">
            
            {activeTab === 'dashboard' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="text-blue-500" bg="bg-blue-500/10" />
                <StatCard title="Online Now" value={stats.onlineUsers} icon={UserCheck} color="text-emerald-500" bg="bg-emerald-500/10" />
                <StatCard title="Total Groups" value={stats.totalGroups} icon={MessageSquare} color="text-purple-500" bg="bg-purple-500/10" />
                <StatCard title="Private DMs" value={stats.totalDMs} icon={MessageCircle} color="text-indigo-500" bg="bg-indigo-500/10" />
              </div>
            )}

            {activeTab === 'users' && (
              <div className="bg-white dark:bg-[#111111] rounded-2xl border border-black/5 dark:border-white/5 overflow-hidden shadow-sm flex flex-col">
                <div className="p-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
                  <div className="relative w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40" />
                    <input 
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-black/5 dark:bg-white/5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-black/5 dark:bg-white/5 font-bold text-black/60 dark:text-white/60">
                      <tr>
                        <th className="px-4 py-3">User</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Chat Perms</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 dark:divide-white/5">
                      {filteredUsers.map(u => (
                        <tr key={u.uid} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 font-bold flex items-center gap-3">
                            <img src={u.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${u.displayName}`} className="w-8 h-8 rounded-full bg-black/10" />
                            {u.displayName}
                          </td>
                          <td className="px-4 py-3 opacity-70">{u.email}</td>
                          <td className="px-4 py-3">
                            {u.isBanned ? (
                              <span className="px-2 py-1 bg-red-500/10 text-red-500 rounded-md text-xs font-bold">Banned</span>
                            ) : u.isOnline ? (
                              <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-md text-xs font-bold">Online</span>
                            ) : (
                              <span className="px-2 py-1 bg-black/10 dark:bg-white/10 text-black/60 dark:text-white/60 rounded-md text-xs font-bold">Offline</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {u.isDisabled ? (
                              <span className="px-2 py-1 bg-amber-500/10 text-amber-500 rounded-md text-xs font-bold">Muted</span>
                            ) : (
                              <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-md text-xs font-bold">Active</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right space-x-2">
                            <button 
                              onClick={() => toggleUserField(u.uid, 'isDisabled', u.isDisabled)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${u.isDisabled ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20' : 'bg-black/5 dark:bg-white/5 hover:bg-amber-500/10 hover:text-amber-500'}`}
                            >
                              {u.isDisabled ? 'Unmute' : 'Mute'}
                            </button>
                            <button 
                              onClick={() => toggleUserField(u.uid, 'isBanned', u.isBanned)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${u.isBanned ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-black/5 dark:bg-white/5 hover:bg-red-500/10 hover:text-red-500'}`}
                            >
                              {u.isBanned ? 'Unban' : 'Ban'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'groups' && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button onClick={() => setShowCreateGroup(true)} className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-colors">
                    + Create Group
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groups.map(g => (
                    <div key={g.id} className="bg-white dark:bg-[#111111] p-4 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm flex flex-col gap-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {g.photoURL ? (
                            <img src={g.photoURL} className="w-10 h-10 rounded-full" />
                          ) : (
                            <div className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-lg ${g.isGlobal ? 'bg-blue-500' : 'bg-emerald-500'}`}>
                              {g.isGlobal ? 'G' : g.name?.[0]?.toUpperCase()}
                            </div>
                          )}
                          <div>
                            <h3 className="font-bold flex items-center gap-2">
                              {g.name}
                              {g.isLocked && <Lock className="w-3 h-3 text-red-500" />}
                            </h3>
                            <p className="text-xs text-black/50 dark:text-white/50 capitalize">{g.isGlobal ? 'Global Community' : `${g.type} • ${g.members?.length || 0} members`}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => toggleGroupLock(g.id, g.isLocked)} className="p-2 text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white bg-black/5 dark:bg-white/5 rounded-lg">
                            {g.isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                          </button>
                          <button onClick={() => setManagingGroup(g)} className="p-2 text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white bg-black/5 dark:bg-white/5 rounded-lg">
                            <Settings className="w-4 h-4" />
                          </button>
                          {!g.isGlobal && (
                            <button onClick={() => deleteGroup(g.id)} className="p-2 text-red-400 hover:text-red-500 bg-red-500/10 rounded-lg">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
            {showCreateGroup && (
              <AdminCreateGroup 
                onClose={() => setShowCreateGroup(false)} 
                onSuccess={loadData} 
              />
            )}
            {managingGroup && (
              <AdminManageGroup
                group={managingGroup}
                onClose={() => setManagingGroup(null)}
                onSuccess={loadData}
              />
            )}
              </div>
            )}

            {activeTab === 'announcements' && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Speaker className="w-16 h-16 text-blue-500 mb-4 opacity-50" />
                <h3 className="text-xl font-bold mb-2">Broadcast System</h3>
                <p className="text-black/50 dark:text-white/50 mb-6">Send important alerts to all users or specific groups.</p>
                <button className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-500 hover:scale-105 transition-all">
                  Create Announcement
                </button>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <div className="bg-white dark:bg-[#111111] p-5 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-black/50 dark:text-white/50 mb-1">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
      <div className={`p-4 rounded-xl ${bg} ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}
