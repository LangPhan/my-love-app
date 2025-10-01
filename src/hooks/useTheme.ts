"use client";

import { useAuthStore, useThemeStore } from "@/stores";
import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

export function useTheme() {
  const { theme, resolvedTheme, setTheme, setResolvedTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  // Ensure hydration compatibility
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update resolved theme based on current theme and system preference
  useEffect(() => {
    if (!mounted) return;

    const updateResolvedTheme = () => {
      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light";
        setResolvedTheme(systemTheme);
      } else {
        setResolvedTheme(theme);
      }
    };

    updateResolvedTheme();

    // Listen for system theme changes if using system theme
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addEventListener("change", updateResolvedTheme);
      return () =>
        mediaQuery.removeEventListener("change", updateResolvedTheme);
    }
  }, [theme, setResolvedTheme, mounted]);

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;

    // Remove existing theme classes
    root.classList.remove("light", "dark");

    // Add new theme class
    root.classList.add(resolvedTheme);

    // Update color-scheme for native form controls
    root.style.colorScheme = resolvedTheme;
  }, [resolvedTheme, mounted]);

  // Save theme preference and update user profile
  const setThemeWithPersistence = async (newTheme: Theme) => {
    const { isAuthenticated, user } = useAuthStore.getState();

    // Always update local theme immediately
    setTheme(newTheme);

    // Only try to save to Appwrite if user is authenticated
    if (isAuthenticated && user) {
      try {
        // Save theme preference to user profile in Appwrite
        const { updateThemePreference } = await import("@/app/actions/profile");
        const result = await updateThemePreference(newTheme);

        if (!result.success) {
          // Only log as info since this is expected when not authenticated
          console.info("Theme saved locally only:", result.error);
        }
      } catch (error) {
        console.info("Theme saved locally only:", error);
      }
    } else {
      console.info(
        `Theme changed to ${newTheme} - saved locally only (user not authenticated)`,
      );
    }
  };

  const toggleTheme = () => {
    const newTheme = resolvedTheme === "light" ? "dark" : "light";
    setThemeWithPersistence(newTheme);
  };

  return {
    theme,
    resolvedTheme,
    setTheme: setThemeWithPersistence,
    toggleTheme,
  };
}
