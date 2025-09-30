"use client";

import { createUser, getCurrentUser, login, logout } from "@/lib/appwrite";
import type { ApiResponse, CreateUserData, LoginData } from "@/lib/types";
import { Models } from "appwrite";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export interface UseAuthReturn {
  user: Models.User<Models.Preferences> | null;
  loading: boolean;
  signup: (
    userData: CreateUserData,
  ) => Promise<ApiResponse<Models.User<Models.Preferences>>>;
  signin: (loginData: LoginData) => Promise<ApiResponse<Models.Session>>;
  signout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Get current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await getCurrentUser();
        if (result.success && result.data) {
          setUser(result.data);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const result = await getCurrentUser();
      if (result.success && result.data) {
        setUser(result.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
      setUser(null);
    }
  }, []);

  // Sign up function
  const signup = useCallback(
    async (
      userData: CreateUserData,
    ): Promise<ApiResponse<Models.User<Models.Preferences>>> => {
      try {
        setLoading(true);
        const result = await createUser(userData);

        if (result.success && result.data) {
          setUser(result.data);
          router.push("/");
        }

        return result;
      } catch (error) {
        console.error("Signup error:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Signup failed",
        };
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  // Sign in function
  const signin = useCallback(
    async (loginData: LoginData): Promise<ApiResponse<Models.Session>> => {
      try {
        setLoading(true);
        const result = await login(loginData);

        if (result.success) {
          // Refresh user data after successful login
          await refreshUser();
          router.push("/");
        }

        return result;
      } catch (error) {
        console.error("Signin error:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Login failed",
        };
      } finally {
        setLoading(false);
      }
    },
    [router, refreshUser],
  );

  // Sign out function
  const signout = useCallback(async () => {
    try {
      setLoading(true);
      await logout();
      setUser(null);
      router.push("/auth/login");
    } catch (error) {
      console.error("Signout error:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  return {
    user,
    loading,
    signup,
    signin,
    signout,
    refreshUser,
  };
};
