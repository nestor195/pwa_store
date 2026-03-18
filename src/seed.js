import { collection, getDocs, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { db } from './firebase.js';
import { handleFirestoreError, OperationType } from './api/error-handler.js';

const products = [
  {
    name: "Dragón Articulado",
    description: "Un dragón impreso en 3D con múltiples puntos de articulación. Perfecto como juguete o decoración.",
    price: 25,
    category: "Decoración",
    images: ["https://picsum.photos/seed/dragon/400/300"],
    stock: 10,
    active: true
  },
  {
    name: "Maceta Geométrica",
    description: "Maceta con diseño minimalista y geométrico. Ideal para suculentas.",
    price: 15,
    category: "Hogar",
    images: ["https://picsum.photos/seed/pot/400/300"],
    stock: 20,
    active: true
  },
  {
    name: "Soporte para Auriculares",
    description: "Soporte robusto y elegante para tus cascos de gaming o música.",
    price: 12,
    category: "Accesorios",
    images: ["https://picsum.photos/seed/headset/400/300"],
    stock: 15,
    active: true
  }
];

export const seedData = async () => {
  const path = 'products';
  try {
    const snapshot = await getDocs(collection(db, path));
    if (snapshot.empty) {
      console.log('Seeding products...');
      for (const p of products) {
        await addDoc(collection(db, path), {
          ...p,
          createdAt: serverTimestamp()
        });
      }
      console.log('Seeding complete.');
    }
  } catch (error) {
    // If it's a permission error, we just log it and continue
    // This happens if the user is not logged in as admin
    if (error.message.includes('insufficient permissions')) {
      console.warn('Seeding skipped: Missing permissions. Log in as admin to seed data.');
    } else {
      console.error('Error during seeding:', error);
    }
  }
};
