// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBdkAWbnh_sEhRNcSZPu0OloXPn92TPAoI",
  authDomain: "crumbella.firebaseapp.com",
  projectId: "crumbella",
  storageBucket: "crumbella.firebasestorage.app",
  messagingSenderId: "339388261018",
  appId: "1:339388261018:web:d67d9a6f43af4906f4b523"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
