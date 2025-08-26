"use client"

import { getToken, setToken, clearToken } from "@/Utils/auth";
import { useState, useEffect, createContext, useContext } from "react";


interface AuthContextType {
  token: string | null;
  setAuthToken: (token: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(null);

  useEffect(() => {
    const stored = getToken();
    if (stored) setTokenState(stored);
  }, []);

  const setAuthToken = (token: string | null) => {
    setTokenState(token);
    if (token) setToken(token); 
    else clearToken();
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
