import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// 🔥 Your Firebase Config (Replace with your actual Firebase credentials)
const firebaseConfig = {
    apiKey: "AIzaSyB1ux9kdRXViLIyEITSAsyscrMK1f6D6gc",
    authDomain: "events-cee3c.firebaseapp.com",
    projectId: "events-cee3c",
    storageBucket: "events-cee3c.firebasestorage.app",
    messagingSenderId: "441069303218",
    appId: "1:441069303218:web:e71bbe0a8de552bdebe0ab",
    measurementId: "G-8XQ1XLJ9LH"
  };

// Initialize Firebase
const firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

export { auth };
export default firebaseApp;
