// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// import { getAuth } from "firebase/auth"; // We'll add this later for authentication

// Your web app's Firebase configuration using environment variables
// Make sure your environment variables are set up correctly (e.g., in a .env file)
// For Vite: VITE_FIREBASE_...
// For Create React App: REACT_APP_FIREBASE_...
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Initialize Firebase Authentication and get a reference to the service (add later)
// const auth = getAuth(app);

// Export the necessary Firebase services
export { db }; // Add 'auth' here later: export { db, auth };

// Optional: Log successful initialization (remove in production)
console.log("Firebase Initialized. Project ID:", firebaseConfig.projectId);
