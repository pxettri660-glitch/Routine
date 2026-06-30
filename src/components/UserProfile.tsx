import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Mail, Save, Calendar, Shield, Trash2, Camera } from 'lucide-react';

import { UserStats, Achievement } from '../types';

interface UserProfileProps {
  currentLevel: number;
  currentXP: number;
  stats?: UserStats;
  achievements?: Achievement[];
}

export default function UserProfile({ currentLevel, currentXP, stats, achievements }: UserProfileProps) {
  const { user, isGuest, logout, updateUserProfile, setGuestMode } = useAuth();
  const [name, setName] = useState(user?.displayName || 'Guest Student');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    try {
      setLoading(true);
      await updateUserProfile(name, photoURL);
      setEditing(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (isGuest) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6">
        <div className="max-w-2xl mx-auto rounded-[2rem] p-8 backdrop-blur-2xl border bg-white/[0.03] border-black/5 dark:border-white/10 shadow-xl text-center">
          <Shield className="w-16 h-16 mx-auto mb-6 opacity-40" />
          <h2 className="text-2xl font-bold tracking-tight mb-2">Guest Mode</h2>
          <p className="opacity-60 text-sm mb-8">You are currently using the app as a guest. Your data is saved locally on this device.</p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5">
              <div className="text-2xl font-bold">{currentLevel}</div>
              <div className="text-xs uppercase tracking-widest opacity-50 font-bold mt-1">Level</div>
            </div>
            <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5">
              <div className="text-2xl font-bold">{currentXP}</div>
              <div className="text-xs uppercase tracking-widest opacity-50 font-bold mt-1">Total XP</div>
            </div>
          </div>
          
          {stats && (
            <div className="grid grid-cols-3 gap-2 mb-8 text-left">
              <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl">
                <div className="text-xs opacity-50 mb-1">Current Streak</div>
                <div className="font-bold">{stats.currentStreak} Days</div>
              </div>
              <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl">
                <div className="text-xs opacity-50 mb-1">Tasks Done</div>
                <div className="font-bold">{stats.tasksCompleted}</div>
              </div>
              <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl">
                <div className="text-xs opacity-50 mb-1">Focus Time</div>
                <div className="font-bold">{stats.focusHours}h</div>
              </div>
            </div>
          )}

          <button 
            onClick={() => {
              localStorage.setItem('study_guest_mode_migration_pending', 'true');
              setGuestMode(false);
            }} 
            className="w-full py-4 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
          >
            Log in to Sync Data
          </button>
        </div>
      </motion.div>
    );
  }

  if (!user) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-4 sm:p-6 pb-32">
      <div className="max-w-2xl mx-auto space-y-6">
        
        <div className="rounded-[2rem] p-6 sm:p-8 backdrop-blur-2xl border bg-white/[0.03] border-black/5 dark:border-white/10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <User className="w-48 h-48" />
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-1 shadow-lg shrink-0">
              <div className="w-full h-full rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center border border-white/20 overflow-hidden">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">👑</span>
                )}
              </div>
            </div>
            
            <div className="text-center sm:text-left flex-1">
              {editing ? (
                <div className="space-y-3 w-full max-w-sm">
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/20 outline-none" placeholder="Display Name" />
                  <input type="text" value={photoURL} onChange={e => setPhotoURL(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/20 outline-none text-sm" placeholder="Photo URL (Optional)" />
                  <div className="flex gap-2">
                    <button onClick={handleSave} disabled={loading} className="px-4 py-2 bg-indigo-500 text-white rounded-lg font-medium text-sm flex items-center gap-2">
                      <Save className="w-4 h-4" /> Save
                    </button>
                    <button onClick={() => setEditing(false)} className="px-4 py-2 bg-black/10 dark:bg-white/10 rounded-lg font-medium text-sm">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">{user.displayName || 'Student'}</h2>
                  <div className="flex items-center gap-2 justify-center sm:justify-start text-sm opacity-60 mb-3">
                    <Mail className="w-4 h-4" /> {user.email}
                  </div>
                  <button onClick={() => setEditing(true)} className="px-4 py-1.5 rounded-full bg-black/5 dark:bg-white/10 text-xs font-bold uppercase tracking-widest hover:bg-black/10 dark:hover:bg-white/20 transition-colors">
                    Edit Profile
                  </button>
                </div>
              )}
            </div>
          </div>

          {!user.emailVerified && (
            <div className="mb-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
              <h3 className="font-bold flex items-center gap-2 mb-1"><Shield className="w-4 h-4" /> Verify Your Email</h3>
              <p className="text-sm opacity-80 mb-3">Cloud synchronization is paused until you verify your email address.</p>
              <button 
                onClick={async () => {
                  try {
                    const { sendEmailVerification } = await import('firebase/auth');
                    await sendEmailVerification(user);
                    alert('Verification email sent! Check your inbox.');
                  } catch (err) {
                    alert('Failed to send verification email. Try again later.');
                  }
                }}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-semibold"
              >
                Resend Verification Email
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
              <div className="text-3xl font-bold mb-1">{currentLevel}</div>
              <div className="text-xs uppercase tracking-widest opacity-50 font-bold">Current Level</div>
            </div>
            <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
              <div className="text-3xl font-bold mb-1">{currentXP}</div>
              <div className="text-xs uppercase tracking-widest opacity-50 font-bold">Total XP Earned</div>
            </div>
            {stats && (
              <>
                <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400">
                  <div className="text-3xl font-bold mb-1 flex items-center gap-2">🔥 {stats.currentStreak}</div>
                  <div className="text-xs uppercase tracking-widest opacity-70 font-bold">Day Streak</div>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <div className="text-3xl font-bold mb-1 flex items-center gap-2">🎯 {stats.tasksCompleted}</div>
                  <div className="text-xs uppercase tracking-widest opacity-70 font-bold">Tasks Done</div>
                </div>
              </>
            )}
            <div className="col-span-2 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center gap-3">
              <Calendar className="w-5 h-5 opacity-50" />
              <div>
                <div className="text-sm font-semibold">Joined</div>
                <div className="text-xs opacity-60">{new Date(user.metadata.creationTime || '').toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements Section */}
        {achievements && achievements.length > 0 && (
          <div className="rounded-[2rem] p-6 sm:p-8 backdrop-blur-2xl border bg-white/[0.03] border-black/5 dark:border-white/10 shadow-xl">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">🏆 Achievements</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {achievements.map((ach) => (
                <div key={ach.id} className={`p-4 rounded-2xl border transition-all ${ach.isUnlocked ? 'bg-indigo-500/10 border-indigo-500/20 shadow-md' : 'bg-black/5 dark:bg-white/5 border-transparent opacity-60 grayscale'}`}>
                  <div className="flex gap-4 items-center">
                    <div className="text-4xl">{ach.icon}</div>
                    <div>
                      <div className="font-bold text-sm sm:text-base">{ach.name}</div>
                      <div className="text-xs opacity-70">{ach.description}</div>
                      {ach.isUnlocked && (
                        <div className="text-[10px] font-bold text-indigo-500 mt-1 uppercase tracking-widest">Unlocked</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button 
          onClick={logout}
          className="w-full py-4 rounded-xl bg-red-500/10 text-red-500 dark:text-red-400 font-semibold border border-red-500/20 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Secure Logout
        </button>

      </div>
    </motion.div>
  );
}
