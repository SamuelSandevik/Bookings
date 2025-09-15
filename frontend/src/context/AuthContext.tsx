"use client"

import IUser from "@/models/IUser";
import { getToken, setToken, clearToken } from "@/Utils/auth";
import { useRouter } from "next/navigation";
import { useState, useEffect, createContext, useContext } from "react";

interface userExpire {
  user_profile: IUser,
  exp: number;
}


interface AuthContextType {
  token: string | null;
  setAuthToken: (token: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = getToken();
    if (stored) {
      const split: string[] = stored.split(".")
      const user: userExpire = JSON.parse(atob(split[1]))
      if(Date.now() >= user.exp) {
        clearToken();
        router.push("/sign-in")
      }

      setTokenState(stored)

    } else router.push("/sign-in");
  }, []);

  const setAuthToken = (token: string | null) => {
    setTokenState(token);
    if (token) setToken(token); 
    else clearToken();
    router.push("/")
  };

  const logout = () => setAuthToken(null);

  return (
    <AuthContext.Provider value={{ token, setAuthToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
