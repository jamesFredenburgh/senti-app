// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyANuTck1uNiBB0NvqjYV5vya6FvFn75Lv0",
  authDomain: "senti-6d097.firebaseapp.com",
  projectId: "senti-6d097",
  storageBucket: "senti-6d097.firebasestorage.app",
  messagingSenderId: "702394157640",
  appId: "1:702394157640:web:8db4518fa6a1b2ee3c267d",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
