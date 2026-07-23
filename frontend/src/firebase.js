import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Web App's Firebase Configuration with fallbacks for GitHub Pages deployments
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC2zagy6ujBKWPIRBSTQYcMqtUofLJugZM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "interviu-6a0f9.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "interviu-6a0f9",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "interviu-6a0f9.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "464843701487",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:464843701487:web:5424abad7689e24aceef1a",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-DZQ5B4CHTJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Cloud Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
