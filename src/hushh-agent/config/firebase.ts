/**
 * Firebase Configuration for Hushh Agent Phone Authentication
 * Uses GCP Identity Platform for Phone OTP verification
 * 
 * IMPORTANT: This is SEPARATE from the main Supabase auth system.
 * The Firebase UID is stored in Supabase for user identification.
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  Auth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase only if not already initialized
let app: FirebaseApp;
let auth: Auth;

const initializeFirebase = (): { app: FirebaseApp; auth: Auth } => {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig, 'hushh-agent');
  } else {
    // Check if our named app exists
    const existingApp = getApps().find(a => a.name === 'hushh-agent');
    app = existingApp || initializeApp(firebaseConfig, 'hushh-agent');
  }
  
  auth = getAuth(app);
  
  // Set language to browser default for OTP SMS
  auth.languageCode = navigator.language || 'en';
  
  return { app, auth };
};

// Initialize on module load
const { auth: firebaseAuth } = initializeFirebase();

// Export the auth instance
export { firebaseAuth };

// Export types and functions
export {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  firebaseSignOut as signOut,
  onAuthStateChanged,
};

export type { ConfirmationResult, User };

// Check if Firebase is configured
export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID
  );
};
