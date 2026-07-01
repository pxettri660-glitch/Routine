import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBRSOCKVUXnPaq7QA72B2WXXCHD38Yx-Os",
  authDomain: "com-student-engine.firebaseapp.com",
  projectId: "com-student-engine",
  storageBucket: "com-student-engine.firebasestorage.app",
  messagingSenderId: "492106716732",
  appId: "1:492106716732:android:73436a5a26ca78ec8c5539",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Note: removed specific databaseId to use default database for standard projects

enableIndexedDbPersistence(db).catch((err) => {
  console.warn('Firebase offline persistence error:', err.code);
});

// Ensure auth state persists
setPersistence(auth, browserLocalPersistence).catch(console.error);

const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };
