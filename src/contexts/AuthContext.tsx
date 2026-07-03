import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signOut, updateProfile } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { DEFAULT_STATS, DEFAULT_ACHIEVEMENTS } from '../lib/defaults';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  updateUserProfile: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          // 1. Set the user state immediately so the app can render
          setUser(currentUser);
          
          // 2. Ensure the base profile document exists
          const profileRef = doc(db, 'users', currentUser.uid, 'profile', 'data');
          try {
            const profileSnap = await getDoc(profileRef);
            
            if (!profileSnap.exists()) {
              const batch = writeBatch(db);
              
              // Base profile
              batch.set(profileRef, {
                uid: currentUser.uid,
                name: currentUser.displayName || 'Student',
                email: currentUser.email,
                photoURL: currentUser.photoURL || '',
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
              });

              // Initialize Stats
              batch.set(doc(db, 'users', currentUser.uid, 'stats', 'data'), {
                currentXP: 0,
                currentLevel: 1,
                stats: DEFAULT_STATS,
                achievements: DEFAULT_ACHIEVEMENTS,
                xpHistory: []
              });

              // Initialize Settings
              batch.set(doc(db, 'users', currentUser.uid, 'settings', 'data'), {
                isThemeLight: false,
                jarvisTheme: 'cyan',
                alarmTime: '04:45',
                isAlarmEnabled: true
              });

              await batch.commit();
            } else {
              // Update last login
              await setDoc(profileRef, { lastLogin: serverTimestamp() }, { merge: true });
            }
          } catch (e: any) {
            if (e.code === 'unavailable') {
              console.warn("Client is offline, skipping profile sync.");
            } else {
              console.error("Profile sync error:", e);
            }
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth sync error:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const updateUserProfile = async (displayName: string, photoURL?: string) => {
    if (auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, { displayName, photoURL });
        setUser({ ...auth.currentUser } as User);
        
        const profileRef = doc(db, 'users', auth.currentUser.uid, 'profile', 'data');
        await setDoc(profileRef, { name: displayName, photoURL: photoURL || '' }, { merge: true });
      } catch (error) {
        console.error("Update profile error:", error);
        throw error;
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
