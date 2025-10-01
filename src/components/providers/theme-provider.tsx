"use client";
import * as React from "react";

// Simple theme provider that just wraps children
// Theme logic is handled by the custom useTheme hook
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
