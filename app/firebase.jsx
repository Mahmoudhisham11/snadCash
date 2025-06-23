// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBjztIN03ntU4-jP1yY9HI0E-cLAH4urko",
  authDomain: "snad-35bf1.firebaseapp.com",
  projectId: "snad-35bf1",
  storageBucket: "snad-35bf1.firebasestorage.app",
  messagingSenderId: "668568427065",
  appId: "1:668568427065:web:6c3e21b49d3edaa862cbe8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)