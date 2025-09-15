"use client"

import { useAuth } from "@/context/AuthContext";

export default function LogoutButton() {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
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
