"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  role: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const saveToken = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem("rugarden_token", newToken);
  };

  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("rugarden_token");
  }, []);

  // Load user from token on mount
  useEffect(() => {
    const loadUser = async () => {
      const savedToken = localStorage.getItem("rugarden_token");
      if (!savedToken) {
        setIsLoading(false);
        return;
      }

      setToken(savedToken);
      try {
        const { data } = await api.get("/users/me", {
          headers: { Authorization: `Bearer ${savedToken}` },
        });
        setUser(data);
      } catch {
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [clearAuth]);

  const login = async (email: string, password: string) => {
    const { data } = await api.post("/users/login", { email, password });
    saveToken(data.token);
    setUser(data.user);
  };

  const register = async (registerData: RegisterData) => {
    const { data } = await api.post("/users/register", registerData);
    saveToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    clearAuth();
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
