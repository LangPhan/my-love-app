"use client";

import { useTheme } from "@/hooks/useTheme";
import { useEffect } from "react";

/**
 * Component that initializes theme on app startup
 * This ensures the theme is applied as early as possible
 */
export function ThemeInitializer() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    // Apply theme class immediately when component mounts
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
    root.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  return null; // This component doesn't render anything
}
