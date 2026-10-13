// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC2iexQvY1xjFMjy9qZSRjZsLYkfqGU0uk",
  authDomain: "onlytoon-82f3f.firebaseapp.com",
  projectId: "onlytoon-82f3f",
  storageBucket: "onlytoon-82f3f.firebasestorage.app",
  messagingSenderId: "1049602208943",
  appId: "1:1049602208943:web:a8b9f17768e8dce4e6905a",
  measurementId: "G-XG19QHBTYK"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Firebase Authentication
export const auth = getAuth(app);

// Proveedor de Google
export const googleProvider = new GoogleAuthProvider();

// Hace que Google permita seleccionar la cuenta
googleProvider.setCustomParameters({
  prompt: "select_account"
});

// Firestore
export const db = getFirestore(app);

// Storage
export const storage = getStorage(app);

// Métodos de autenticación
export {
  signInWithPopup,
  signOut
};