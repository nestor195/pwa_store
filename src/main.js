import { initUI } from './ui.js';
import { seedData } from './seed.js';
import { ErrorBoundary } from './components/ErrorBoundary.js';

// Initialize Error Boundary
ErrorBoundary.init();

// Seed demo data
seedData();

// Initialize UI
initUI();

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('Service Worker registered with scope:', registration.scope);
    }).catch(err => {
      console.error('Service Worker registration failed:', err);
    });
  });
}
