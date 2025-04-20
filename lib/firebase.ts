// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; // ✅ Add this

const firebaseConfig = {
    apiKey: "AIzaSyD1QzFhhIQJ5KdyFAENmD4kFQQXlxzLzEU",
    authDomain: "https://gather-5bceb.firebaseapp.com",
    projectId: "gather-5bceb",
    storageBucket: "gather-5bceb.firebasestorage.app",
    messagingSenderId: "835355328648",
    appId: "1:835355328648:web:f5877dd62062bee5aa5f3d",
    measurementId: "G-HXW55YV5SH"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // ✅ Initialize Storage

export { db, auth, storage }; // ✅ Export it
