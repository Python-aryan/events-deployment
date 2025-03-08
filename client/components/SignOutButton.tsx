import { signOut } from "firebase/auth";
import { auth } from "../src/lib/firebase";

const SignOutButton = () => {
  const handleSignOut = async () => {
    await signOut(auth);
    alert("✅ Signed out successfully!");
  };

  return (
    <button onClick={handleSignOut} className="px-4 py-2 bg-red-500 text-white rounded">
      Sign Out
    </button>
  );
};

export default SignOutButton;
