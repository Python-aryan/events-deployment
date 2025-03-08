"use client";
import { destroyCookie } from "nookies";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    destroyCookie(null, "authToken");
    router.push("/login");
  };

  return <button onClick={handleLogout} className="bg-red-500 text-white p-2 rounded">Logout</button>;
}
