import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// ✅ Load Firebase config from .env
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
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Ensure only VIT emails can sign in
const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    if (!user.email?.endsWith("@vitstudent.ac.in")) {
      alert("❌ Only @vitstudent.ac.in accounts are allowed!");
      await auth.signOut();
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error signing in:", error);
    return null;
  }
};
export { auth, provider, signInWithGoogle };