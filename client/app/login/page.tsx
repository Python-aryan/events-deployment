"use client";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { setCookie } from "nookies";
import { auth } from "@/lib/firebaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();

      setCookie(null, "authToken", token, { path: "/" }); // Store token in cookies
      localStorage.setItem("user", email);
      router.push("/add"); // Redirect to the event submission page
    } catch (err) {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-5 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Club Member Login</h2>
      {error && <p className="text-red-500 dark:text-red-400">{error}</p>}
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border p-2 bg-gray-100 dark:bg-gray-700 dark:text-white dark:border-gray-600 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border p-2 bg-gray-100 dark:bg-gray-700 dark:text-white dark:border-gray-600 rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 dark:bg-blue-600 text-white p-2 rounded hover:bg-blue-600 dark:hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </div>
  );
}
