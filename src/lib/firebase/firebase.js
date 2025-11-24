// src/lib/firebase/firebase.js
import { initializeApp, getApps } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyD1n0JBEZg4FGy7FYecKdlQJ44CRAxlN1k",
  authDomain: "safai-ai-3489a.firebaseapp.com",
  projectId: "safai-ai-3489a",
  storageBucket: "safai-ai-3489a.firebasestorage.app",
  messagingSenderId: "937583258312",
  appId: "1:937583258312:web:c1adac80b8033608fb53fd",
  measurementId: "G-D67EE5P807"
};

// Initialize Firebase (prevent duplicate initialization)
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export default app;
