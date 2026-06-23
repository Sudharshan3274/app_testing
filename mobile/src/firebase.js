import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Firebase client configuration
const firebaseConfig = {
  apiKey: "AIzaSyC2zagy6ujBKWPIRBSTQYcMqtUofLJugZM",
  authDomain: "interviu-6a0f9.firebaseapp.com",
  projectId: "interviu-6a0f9",
  storageBucket: "interviu-6a0f9.firebasestorage.app",
  messagingSenderId: "464843701487",
  appId: "1:464843701487:web:5424abad7689e24aceef1a"
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Authentication with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export { app, auth, db };
