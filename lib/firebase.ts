import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBwp_Z1SCt2kzXWQyOT0xW2TB34X4gV6Y0",
  authDomain: "portal-cidadao-estancia-12f5f.firebaseapp.com",
  projectId: "portal-cidadao-estancia-12f5f",
  storageBucket: "portal-cidadao-estancia-12f5f.firebasestorage.app",
  messagingSenderId: "410122436177",
  appId: "1:410122436177:web:344909cce45daa965b4270",
  measurementId: "G-MDQW1D5HCT",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
