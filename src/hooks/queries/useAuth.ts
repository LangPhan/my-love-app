import { createUser, getCurrentUser, login, logout } from "@/lib/appwrite";
import type { CreateUserData, LoginData } from "@/lib/types";
import { useAuthStore } from "@/stores";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Query Keys
export const authKeys = {
  all: ["auth"] as const,
  user: () => [...authKeys.all, "user"] as const,
};

// Get Current User Query
export function useCurrentUser() {
  const { setUser, setLoading } = useAuthStore();

  return useQuery({
    queryKey: authKeys.user(),
    queryFn: async () => {
      const result = await getCurrentUser();
      if (result.success && result.data) {
        setUser(result.data);
        return result.data;
      }
      setUser(null);
      return null;
    },
    retry: false,
    staleTime: Infinity, // User data doesn't change often
  });
}

// Login Mutation
export function useLogin() {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: async (data: LoginData) => {
      const loginResult = await login(data);
      if (!loginResult.success) {
        throw new Error(loginResult.error || "Login failed");
      }

      // After successful login, get the user data
      const userResult = await getCurrentUser();
      if (!userResult.success || !userResult.data) {
        throw new Error("Failed to get user data after login");
      }

      return userResult.data;
    },
    onSuccess: (user) => {
      setUser(user);
      queryClient.setQueryData(authKeys.user(), user);
      queryClient.invalidateQueries({ queryKey: ["couple"] });
      queryClient.invalidateQueries({ queryKey: ["memories"] });
    },
    onError: (error) => {
      console.error("Login error:", error);
    },
  });
}

// Register Mutation
export function useRegister() {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: async (data: CreateUserData) => {
      const result = await createUser(data);
      if (!result.success || !result.data) {
        throw new Error(result.error || "Registration failed");
      }
      return result.data;
    },
    onSuccess: (user) => {
      setUser(user);
      queryClient.setQueryData(authKeys.user(), user);
    },
    onError: (error) => {
      console.error("Registration error:", error);
    },
  });
}

// Logout Mutation
export function useLogout() {
  const queryClient = useQueryClient();
  const { logout: logoutStore } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      const result = await logout();
      if (!result.success) {
        throw new Error(result.error || "Logout failed");
      }
      return result;
    },
    onSuccess: () => {
      logoutStore();
      queryClient.clear(); // Clear all cached data
    },
    onError: (error) => {
      console.error("Logout error:", error);
      // Even if logout fails on server, clear local state
      logoutStore();
      queryClient.clear();
    },
  });
}
