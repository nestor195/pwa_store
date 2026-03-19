import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';

// Load config via fetch for native compatibility
const response = await fetch('./firebase-applet-config.json');
const firebaseConfig = await response.json();

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Firestore with offline persistence using the modern API
export const db = initializeFirestore(app, {
  databaseId: firebaseConfig.firestoreDatabaseId,
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});

export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
