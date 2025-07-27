// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAQAiuEU0tqgzwFcQ1H662BPOswboFtCCM",
  authDomain: "smedbox-92607.firebaseapp.com",
  projectId: "smedbox-92607",
  storageBucket: "smedbox-92607.firebasestorage.app",
  messagingSenderId: "11870539627",
  appId: "1:11870539627:web:7ab120b5ad6f8f2935c62e",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
