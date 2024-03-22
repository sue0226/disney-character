import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBLvCtiBvP4Um2LjU7udQLl6nC1VZt1p4Y",
  authDomain: "friend-list-practice.firebaseapp.com",
  projectId: "friend-list-practice",
  storageBucket: "friend-list-practice.appspot.com",
  messagingSenderId: "786722831465",
  appId: "1:786722831465:web:d01bb11f1557f2ec52b6f8",
  measurementId: "G-1JGWHRLELC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const characterTable = "characters";
