// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB-038tjdN6GyN8cejoHc-B2Ja5INZOlFA",
  authDomain: "safari-de33a.firebaseapp.com",
  projectId: "safari-de33a",
  storageBucket: "safari-de33a.firebasestorage.app",
  messagingSenderId: "774108562054",
  appId: "1:774108562054:web:9008b4f1fe194f5ac4c707"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)