import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBU4GCmGzVW4FhEMCK-_OhUcmDftVSYdcM",
  authDomain: "student-engine-8f6e0.firebaseapp.com",
  projectId: "student-engine-8f6e0",
  storageBucket: "student-engine-8f6e0.firebasestorage.app",
  messagingSenderId: "29474777550",
  appId: "1:29474777550:web:af9a4d7857e3c716b2e39f",
  measurementId: "G-6T5E39JK5V"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);

export let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Removed offline persistence for iframe compatibility

setPersistence(auth, browserLocalPersistence).catch(console.error);

export default app;

// export default app;
