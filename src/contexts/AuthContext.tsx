import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signOut, updateProfile } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isGuest: boolean;
  setGuestMode: (value: boolean) => void;
  logout: () => Promise<void>;
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isGuest: false,
  setGuestMode: () => {},
  logout: async () => {},
  updateUserProfile: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(() => {
    return localStorage.getItem('study_guest_mode') === 'true';
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch or create user doc
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            displayName: currentUser.displayName || 'Student',
            email: currentUser.email,
            photoURL: currentUser.photoURL || '',
            joinDate: new Date().toISOString(),
            currentLevel: 1,
            currentXP: 0,
            xpHistory: [],
            isThemeLight: false
          });
        }
        setGuestMode(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const setGuestMode = (value: boolean) => {
    setIsGuest(value);
    localStorage.setItem('study_guest_mode', value.toString());
  };

  const logout = async () => {
    await signOut(auth);
    setGuestMode(false);
    localStorage.removeItem('study_guest_mode');
  };

  const updateUserProfile = async (displayName: string, photoURL?: string) => {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName, photoURL });
      setUser({ ...auth.currentUser } as User);
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userRef, { displayName, photoURL }, { merge: true });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isGuest, setGuestMode, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
