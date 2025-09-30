"use client";

import { useThemeStore } from "@/stores";
import { useEffect } from "react";

type Theme = "light" | "dark" | "system";

export function useTheme() {
  const { theme, resolvedTheme, setTheme, setResolvedTheme } = useThemeStore();

  // Update resolved theme based on current theme and system preference
  useEffect(() => {
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
  }, [theme, setResolvedTheme]);

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;

    // Remove existing theme classes
    root.classList.remove("light", "dark");

    // Add new theme class
    root.classList.add(resolvedTheme);

    // Update color-scheme for native form controls
    root.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  // Save theme preference and update user profile
  const setThemeWithPersistence = async (newTheme: Theme) => {
    setTheme(newTheme);

    try {
      // Save theme preference to user profile in Appwrite
      const { updateThemePreference } = await import("@/app/actions/profile");
      const result = await updateThemePreference(newTheme);

      if (!result.success) {
        console.error("Failed to save theme preference:", result.error);
      }
    } catch (error) {
      console.error("Failed to save theme preference:", error);
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
