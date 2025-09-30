# Shadcn UI Setup Instructions

This project uses **Shadcn UI** with our custom romantic pastel theme and Tailwind v4.

## Installation

1. **Install Shadcn CLI** (if not already installed):
```bash
npm install -g @shadcn/ui@latest
```

2. **Initialize Shadcn UI**:
```bash
npx shadcn@latest init
```

When prompted, use these settings:
- ✅ Would you like to use TypeScript? → **Yes**
- ✅ Which style would you like to use? → **New York**
- ✅ Which color would you like to use as base color? → **Rose**
- ✅ Where is your global CSS file? → **src/styles/globals.css**
- ✅ Would you like to use CSS variables for colors? → **Yes**
- ✅ Where is your tailwind.config.js located? → **tailwind.config.ts**
- ✅ Configure the import alias for components? → **Yes**
- ✅ What import alias would you like configured for components? → **@/components**
- ✅ What import alias would you like configured for utils? → **@/lib/utils**

3. **Install commonly used components**:
```bash
# Essential components for the love app
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add textarea
npx shadcn@latest add card
npx shadcn@latest add avatar
npx shadcn@latest add badge
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add sheet
npx shadcn@latest add toast
npx shadcn@latest add switch
npx shadcn@latest add tabs
npx shadcn@latest add progress
npx shadcn@latest add scroll-area
npx shadcn@latest add separator
```

4. **Install form components** (for auth and settings):
```bash
npx shadcn@latest add form
npx shadcn@latest add label
npx shadcn@latest add checkbox
npx shadcn@latest add radio-group
npx shadcn@latest add select
```

5. **Install date/time components** (for memories and todos):
```bash
npx shadcn@latest add calendar
npx shadcn@latest add date-picker
```

## Custom Components Structure

After installation, your components will be in:
```
src/
  components/
    ui/           # Shadcn base components
    romantic/     # Custom romantic-themed components
    layout/       # Layout components (headers, nav, etc.)
    forms/        # Form-specific components
    chat/         # Chat-specific components
    memories/     # Memory/photo components
    todos/        # Todo-specific components
```

## Theme Integration

The romantic pastel theme is already integrated with these colors:
- **Primary**: Pink (love theme)
- **Secondary**: Lavender (romantic accent)
- **Success/Positive**: Mint (fresh, positive actions)
- **Info**: Sky (neutral information)
- **Warning**: Cream (gentle warnings)
- **Muted**: Slate (text hierarchy)
- **Dark**: Custom dark palette

## Custom Romantic Components

Create these custom components to match your app theme:

### 1. Romantic Button Variants
```bash
# Add to components/ui/button.tsx variants
romantic: "bg-gradient-to-r from-pink-400 to-rose-400 text-white hover:from-pink-500 hover:to-rose-500 shadow-romantic",
lavender: "bg-lavender-500 text-white hover:bg-lavender-600 shadow-romantic",
mint: "bg-mint-500 text-white hover:bg-mint-600 shadow-romantic",
```

### 2. Glass Card Component
```typescript
// components/romantic/glass-card.tsx
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function GlassCard({ className, ...props }) {
  return (
    <Card 
      className={cn("glass-effect romantic-card", className)} 
      {...props} 
    />
  )
}
```

### 3. Romantic Input Component
```typescript
// components/romantic/romantic-input.tsx  
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function RomanticInput({ className, ...props }) {
  return (
    <Input 
      className={cn("romantic-input", className)} 
      {...props} 
    />
  )
}
```

## Dark Mode Setup

Dark mode is configured via the `class` strategy. Add this toggle component:

```typescript
// components/theme-toggle.tsx
"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="romantic-button"
    >
      <Sun className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
```

## Usage Examples

### Romantic Form
```typescript
import { GlassCard } from "@/components/romantic/glass-card"
import { RomanticInput } from "@/components/romantic/romantic-input"
import { Button } from "@/components/ui/button"

export function LoginForm() {
  return (
    <GlassCard className="p-6 max-w-md mx-auto">
      <div className="space-romantic">
        <h2 className="text-romantic text-2xl font-bold">Welcome Back</h2>
        <RomanticInput placeholder="Email" type="email" />
        <RomanticInput placeholder="Password" type="password" />
        <Button variant="romantic" className="w-full">
          Sign In
        </Button>
      </div>
    </GlassCard>
  )
}
```

### Chat Message
```typescript
<GlassCard className="max-w-sm ml-auto">
  <p className="text-sm text-muted-foreground">You</p>
  <p>I love you ❤️</p>
  <p className="text-xs text-muted-foreground mt-1">2:30 PM</p>
</GlassCard>
```

## Available CSS Classes

- **`.romantic-gradient`** - Romantic background gradient
- **`.romantic-card`** - Styled card with rounded corners and shadows
- **`.romantic-button`** - Custom button styling
- **`.romantic-input`** - Custom input styling  
- **`.glass-effect`** - Glassmorphism effect
- **`.text-romantic`** - Gradient text effect
- **`.animate-romantic-float`** - Floating animation
- **`.space-romantic`** - Consistent spacing between child elements

## Notes

- All components are mobile-first and responsive
- PWA-safe areas are handled with `.px-safe`, `.pb-safe`, `.pt-safe` utilities
- Custom scrollbar styling is included
- Focus states follow accessibility guidelines
- Dark mode automatically adjusts all romantic colors