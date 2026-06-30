import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "skillful-broker-pkhb0",
  appId: "1:118387467717:web:96d9d56b136a3bf9c897ac",
  apiKey: "AIzaSyBnVZ8DByoQy8KvkUYij_8ETn66LMy8m5k",
  authDomain: "skillful-broker-pkhb0.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-princeengine-97cc70fc-2c6d-41c7-ab77-d82a8f70351d",
  storageBucket: "skillful-broker-pkhb0.firebasestorage.app",
  messagingSenderId: "118387467717",
  measurementId: ""
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); // Use specific databaseId

enableIndexedDbPersistence(db).catch((err) => {
  console.warn('Firebase offline persistence error:', err.code);
});

// Ensure auth state persists
setPersistence(auth, browserLocalPersistence).catch(console.error);

const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };
