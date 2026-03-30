import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

const hasConfig = Object.values(firebaseConfig).some((value) => value);

const apps = getApps();

const firebaseApp = hasConfig
  ? apps.length > 0
    ? apps[0]
    : initializeApp(firebaseConfig)
  : undefined;

const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : undefined;

const googleProvider = firebaseApp ? new GoogleAuthProvider() : undefined;

if (googleProvider) {
  // Ensure we request an ID token so Supabase can verify it
  googleProvider.addScope("openid");
  googleProvider.addScope("email");
  googleProvider.addScope("profile");
  googleProvider.setCustomParameters({
    prompt: "select_account",
  });
} else {
  console.warn(
    "[Firebase] Missing configuration. Google sign-in will be unavailable until VITE_FIREBASE_* values are provided."
  );
}

export { firebaseApp, firebaseAuth, googleProvider };
