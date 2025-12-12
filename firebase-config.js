// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
  getFirestore,
  collection,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  addDoc,
  serverTimestamp,
  onSnapshot,
  writeBatch
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { 
  getAnalytics 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyCRtn3buWEHvk9VDVz_eoDmyaTqr8wI3Lg",
  authDomain: "epi-tracker-2025.firebaseapp.com",
  databaseURL: "https://epi-tracker-2025-default-rtdb.firebaseio.com",
  projectId: "epi-tracker-2025",
  storageBucket: "epi-tracker-2025.firebasestorage.app",
  messagingSenderId: "991776109162",
  appId: "1:991776109162:web:f24b9f2bffe08527dc9013",
  measurementId: "G-P5R44DJ1RV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// Admin email (only one admin)
const ADMIN_EMAIL = "nasaresuraj994@gmail.com";

export { 
  auth, db, analytics,
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  collection, getDocs, getDoc, setDoc, updateDoc, deleteDoc, doc,
  query, where, orderBy, limit, startAfter, addDoc,
  serverTimestamp, onSnapshot, writeBatch,
  ADMIN_EMAIL
};