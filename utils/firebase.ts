// utils/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBaBPSLA_heObe1ArOB_wCZTestKFRm9uw",
  authDomain: "dashboard-kepling-medan.firebaseapp.com",
  projectId: "dashboard-kepling-medan",
  storageBucket: "dashboard-kepling-medan.firebasestorage.app",
  messagingSenderId: "533596330722",
  appId: "1:533596330722:web:564a1c0657349ef346dcbb",
  measurementId: "G-ZZZXWVZQL8"
};

// Mencegah inisialisasi ganda pada Next.js
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Inisialisasi Firestore
const db = getFirestore(app);

export { db };