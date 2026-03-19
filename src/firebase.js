import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';

// Load config via fetch for native compatibility
// Use import.meta.env?.BASE_URL to handle subfolder deployments like GitHub Pages safely
const baseUrl = import.meta.env?.BASE_URL || './';
const configPath = `${baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'}firebase-applet-config.json`;
const response = await fetch(configPath);
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
