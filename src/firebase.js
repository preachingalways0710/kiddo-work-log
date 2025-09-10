import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAtI75BUVFwSfVy76szHYrHEZ_WcO943w",
  authDomain: "time-tracker-2-b33a9.firebaseapp.com",
  projectId: "time-tracker-2-b33a9",
  storageBucket: "time-tracker-2-b33a9.appspot.com",
  messagingSenderId: "851882031812",
  appId: "1:851882031812:web:c5a48ca6db7cf60ecf6791"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;