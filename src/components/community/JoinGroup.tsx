import React, { useState } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { X, LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  onClose: () => void;
  onSuccess: (threadId: string) => void;
}

export default function JoinGroup({ onClose, onSuccess }: Props) {
  const { user } = useAuth();
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async () => {
    if (!inviteCode.trim() || !user) return;
    setLoading(true);
    setError('');
    
    try {
      const q = query(collection(db, 'threads'), where('inviteCode', '==', inviteCode.trim().toUpperCase()));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        setError('Invalid invite code. Group not found.');
      } else {
        const threadDoc = snap.docs[0];
        const data = threadDoc.data();
        
        if (data.blockedMembers?.includes(user.uid)) {
          setError('You are blocked from joining this group.');
        } else if (data.members?.includes(user.uid)) {
          setError('You are already a member of this group.');
          onSuccess(threadDoc.id);
          onClose();
        } else {
          await updateDoc(doc(db, 'threads', threadDoc.id), {
            members: arrayUnion(user.uid)
          });
          onSuccess(threadDoc.id);
          onClose();
        }
      }
    } catch (e) {
      console.error(e);
      setError('An error occurred. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl w-full max-w-sm overflow-hidden">
        <div className="p-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <LogIn className="w-5 h-5 text-indigo-500" /> Join Group
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Invite Code</label>
            <input 
              value={inviteCode} 
              onChange={e => setInviteCode(e.target.value.toUpperCase())}
              className="w-full bg-black/5 dark:bg-white/5 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/50 uppercase tracking-widest font-mono font-bold"
              placeholder="e.g. A1B2C3"
              maxLength={8}
            />
          </div>
          
          {error && <p className="text-sm font-bold text-rose-500">{error}</p>}
          
          <button 
            onClick={handleJoin} 
            disabled={!inviteCode.trim() || loading}
            className="w-full py-2 bg-indigo-600 text-white rounded-xl font-bold disabled:opacity-50"
          >
            {loading ? 'Joining...' : 'Join Group'}
          </button>
        </div>
      </div>
    </div>
  );
}
