"use client"

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <button
      onClick={handleLogout}
      className="text-red-500 rounded-lg hover:text-red-600"
    >
      Log out
    </button>
  );
}
