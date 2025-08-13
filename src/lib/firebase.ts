// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  projectId: "manuk-backup",
  appId: "1:298223813297:web:1a68d109a674e49169d890",
  storageBucket: "manuk-backup.firebasestorage.app",
  apiKey: "AIzaSyA0bfpP-m7aXRH-BYfOfNXoe3QRuaG33Is",
  authDomain: "manuk-backup.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "298223813297"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
