import { Models } from "appwrite";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

// Auth Store
interface AuthState {
  user: Models.User<Models.Preferences> | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: Models.User<Models.Preferences> | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,
        isLoading: true,
        setUser: (user) =>
          set({
            user,
            isAuthenticated: !!user,
            isLoading: false,
          }),
        setLoading: (loading) => set({ isLoading: loading }),
        logout: () =>
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          }),
      }),
      {
        name: "love-app-auth",
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      },
    ),
    {
      name: "auth-store",
    },
  ),
);

// Couple Store
interface CoupleInfo {
  couple: any;
  daysTogether: number;
  nextAnniversary?: {
    date: string;
    daysUntil: number;
  } | null;
  partnerName?: string;
}

interface CoupleState {
  coupleInfo: CoupleInfo | null;
  setCoupleInfo: (info: CoupleInfo | null) => void;
  clearCoupleInfo: () => void;
}

export const useCoupleStore = create<CoupleState>()(
  devtools(
    (set) => ({
      coupleInfo: null,
      setCoupleInfo: (info) => set({ coupleInfo: info }),
      clearCoupleInfo: () => set({ coupleInfo: null }),
    }),
    {
      name: "couple-store",
    },
  ),
);

// Theme Store
type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  setResolvedTheme: (theme: "light" | "dark") => void;
}

export const useThemeStore = create<ThemeState>()(
  devtools(
    persist(
      (set) => ({
        theme: "system",
        resolvedTheme: "light",
        setTheme: (theme) => set({ theme }),
        setResolvedTheme: (resolvedTheme) => set({ resolvedTheme }),
      }),
      {
        name: "love-app-theme",
        partialize: (state) => ({ theme: state.theme }),
      },
    ),
    {
      name: "theme-store",
    },
  ),
);

// App State Store
interface AppState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
    }),
    {
      name: "app-store",
    },
  ),
);
