"use client";

import { Button } from "@/components/ui/button";
import { useThemeStore } from "@/stores";
import { Monitor, Moon, Sun } from "lucide-react";

export function ThemeSelector() {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="flex items-center gap-1 rounded-lg border p-1">
      <Button
        variant={theme === "light" ? "default" : "ghost"}
        size="sm"
        onClick={() => setTheme("light")}
        className="gap-1 px-3"
      >
        <Sun className="h-4 w-4" />
        Light
      </Button>
      <Button
        variant={theme === "dark" ? "default" : "ghost"}
        size="sm"
        onClick={() => setTheme("dark")}
        className="gap-1 px-3"
      >
        <Moon className="h-4 w-4" />
        Dark
      </Button>
      <Button
        variant={theme === "system" ? "default" : "ghost"}
        size="sm"
        onClick={() => setTheme("system")}
        className="gap-1 px-3"
      >
        <Monitor className="h-4 w-4" />
        Auto
      </Button>
    </div>
  );
}
