import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  updateDoc,
  serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { db } from '../firebase.js';
import { handleFirestoreError, OperationType } from './error-handler.js';

export const getProducts = async (category = null) => {
  const path = 'products';
  try {
    let q = query(collection(db, path), where('active', '==', true), orderBy('createdAt', 'desc'));
    if (category) {
      q = query(collection(db, path), where('active', '==', true), where('category', '==', category), orderBy('createdAt', 'desc'));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

export const getProduct = async (id) => {
  const path = `products/${id}`;
  try {
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
};

export const getOrders = async (userId) => {
  const path = 'orders';
  try {
    const q = query(collection(db, path), where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

export const createOrder = async (orderData) => {
  const path = 'orders';
  try {
    return await addDoc(collection(db, path), {
      ...orderData,
      status: 'pending',
      createdAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const createProduct = async (productData) => {
  const path = 'products';
  try {
    return await addDoc(collection(db, path), {
      ...productData,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
};

export const updateProduct = async (id, productData) => {
  const path = `products/${id}`;
  try {
    const docRef = doc(db, 'products', id);
    await updateDoc(docRef, {
      ...productData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
};
