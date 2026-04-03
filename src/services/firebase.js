import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, push, onValue, off } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDKmjVj4dEOBT8BVjXy-SxVgpJLmPgOAco",
  authDomain: "hikes-7d71f.firebaseapp.com",
  projectId: "hikes-7d71f",
  storageBucket: "hikes-7d71f.firebasestorage.app",
  messagingSenderId: "814476599639",
  appId: "1:814476599639:web:97c6e1f3327c99d98a1e12",
  measurementId: "G-DZLCSJGTL2",
  databaseURL: "https://hikes-7d71f-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

export { app, db, auth, ref, set, push, onValue, off };
