"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Models } from "appwrite";
import { createUser, getCurrentUser, login as loginUser, logout as logoutUser } from "@/lib/appwrite";
import type { CreateUserData, LoginData, ApiResponse } from "@/lib/types";

interface AuthContextValue {
  user: Models.User<Models.Preferences> | null;
  loading: boolean;
  error: string | null;
  login: (data: LoginData) => Promise<ApiResponse<Models.Session>>;
  register: (data: CreateUserData) => Promise<ApiResponse<Models.User<Models.Preferences>>>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    setLoading(true);
    const res = await getCurrentUser();
    if (res.success && res.data) {
      setUser(res.data);
      setError(null);
    } else {
      setUser(null);
      if (res.error) setError(res.error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  const login = useCallback(async (data: LoginData) => {
    const res = await loginUser(data);
    if (res.success) {
      await loadUser();
    }
    return res;
  }, [loadUser]);

  const register = useCallback(async (data: CreateUserData) => {
    const res = await createUser(data);
    if (res.success && data.email && data.password) {
      // Auto-login after registration
      await login({ email: data.email, password: data.password });
    }
    return res;
  }, [login]);

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    await loadUser();
  }, [loadUser]);

  const value: AuthContextValue = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    refresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
