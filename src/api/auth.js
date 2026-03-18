import { signInWithPopup, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { auth, googleProvider } from '../firebase.js';

export const login = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);

export const observeAuth = (callback) => {
  onAuthStateChanged(auth, callback);
};

export const isAdmin = (user) => {
  return user && user.email === 'nestor195.nt@gmail.com';
};
