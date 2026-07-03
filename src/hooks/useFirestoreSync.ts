import { useState, useEffect, useRef } from 'react';
import { collection, doc, onSnapshot, writeBatch, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export function useFirestoreCollection<T extends { id: string }>(
  collectionName: string,
  initialData: T[]
) {
  const { user } = useAuth();
  const [data, setData] = useState<T[]>(initialData);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, 'users', user.uid, collectionName), (snap) => {
      const items = snap.docs.map(d => d.data() as T);
      setData(items);
    });
    return () => unsub();
  }, [user, collectionName, initialData]);

  const updateData = async (newDataOrUpdater: T[] | ((prev: T[]) => T[])) => {
    const newData = typeof newDataOrUpdater === 'function' 
      ? (newDataOrUpdater as (prev: T[]) => T[])(data)
      : newDataOrUpdater;
      
    setData(newData);
    if (user) {
      const currentIds = new Set(data.map(d => d.id));
      const newIds = new Set(newData.map(d => d.id));
      const batch = writeBatch(db);

      currentIds.forEach(id => {
        if (!newIds.has(id)) {
          batch.delete(doc(db, 'users', user.uid, collectionName, id));
        }
      });

      newData.forEach(item => {
        batch.set(doc(db, 'users', user.uid, collectionName, item.id), item);
      });

      await batch.commit().catch(console.error);
    }
  };

  return [data, updateData] as const;
}

export function useFirestoreDocument<T>(
  documentPath: string,
  key: string,
  initialData: T
) {
  const { user } = useAuth();
  const [data, setData] = useState<T>(initialData);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, documentPath.replace('{uid}', user.uid)), (snap) => {
      if (snap.exists()) {
        const docData = snap.data();
        if (docData && docData[key] !== undefined) {
          setData(docData[key]);
        }
      }
    });
    return () => unsub();
  }, [user, documentPath, key]);

  const updateData = async (newDataOrUpdater: T | ((prev: T) => T)) => {
    const newData = typeof newDataOrUpdater === 'function'
      ? (newDataOrUpdater as (prev: T) => T)(data)
      : newDataOrUpdater;

    setData(newData);
    if (user) {
      await setDoc(doc(db, documentPath.replace('{uid}', user.uid)), {
        [key]: newData
      }, { merge: true }).catch(console.error);
    }
  };

  return [data, updateData] as const;
}
