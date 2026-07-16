import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, orderBy, onSnapshot, getDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import { Thread } from '../types';

export function useChat() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [loadingThreads, setLoadingThreads] = useState(true);

  useEffect(() => {
    if (!user) {
      setThreads([]);
      setLoadingThreads(false);
      return;
    }

    const ensureGlobal = async () => {
      const globalRef = doc(db, 'threads', 'global_community');
      try {
        const snap = await getDoc(globalRef);
        if (!snap.exists()) {
           await setDoc(globalRef, {
             type: 'global',
             isGlobal: true,
             name: 'Student Engine Community',
             description: 'Default global community for all students.',
             members: [],
             admins: ['gwvcfcQqpKgFf8oR6OruOmYm1s82', 'QDkkZtRwlDcdALtsFWEg9HAcgAC2'],
             blockedMembers: [],
             mutedMembers: [],
             isLocked: false,
             createdAt: Date.now(),
             updatedAt: Date.now()
           });
        }
      } catch (e) {
        console.warn("Could not ensure global community:", e);
      }
    };

    ensureGlobal();

    const qGlobal = query(collection(db, 'threads'), where('isGlobal', '==', true));
    const qPrivate = query(collection(db, 'threads'), where('members', 'array-contains', user.uid));

    let globalThreads: Thread[] = [];
    let privateThreads: Thread[] = [];

    const updateMerged = () => {
       const merged = [...globalThreads, ...privateThreads];
       const unique = Array.from(new Map(merged.map(item => [item.id, item])).values());
       unique.sort((a, b) => b.updatedAt - a.updatedAt);
       setThreads(unique);
       if (!activeThreadId && unique.length > 0) {
         setActiveThreadId(unique[0].id);
       }
       setLoadingThreads(false);
    };

    const unsubGlobal = onSnapshot(qGlobal, (snap) => {
       globalThreads = snap.docs.map(d => ({ id: d.id, ...d.data() } as Thread));
       updateMerged();
    }, (e) => console.warn('Global snap error:', e));

    const unsubPrivate = onSnapshot(qPrivate, (snap) => {
       privateThreads = snap.docs.map(d => ({ id: d.id, ...d.data() } as Thread));
       updateMerged();
    }, (e) => console.warn('Private snap error:', e));

    return () => {
      unsubGlobal();
      unsubPrivate();
    };
  }, [user, activeThreadId]);

  const activeThread = useMemo(() => 
    threads.find(t => t.id === activeThreadId) || null,
  [threads, activeThreadId]);

  return {
    threads,
    activeThreadId,
    setActiveThreadId,
    activeThread,
    loadingThreads
  };
}
