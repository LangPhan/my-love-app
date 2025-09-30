import { cn } from "@/lib/utils";
import {
  Camera,
  CheckSquare,
  Heart,
  MessageCircle,
  Settings,
} from "lucide-react";
import Link from "next/link";

interface MainLayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  {
    name: "Home",
    href: "/",
    icon: Heart,
    color: "text-pink-500",
    activeColor: "text-pink-600",
  },
  {
    name: "Chat",
    href: "/chat",
    icon: MessageCircle,
    color: "text-rose-500",
    activeColor: "text-rose-600",
  },
  {
    name: "Memories",
    href: "/memories",
    icon: Camera,
    color: "text-lavender-500",
    activeColor: "text-lavender-600",
  },
  {
    name: "Todos",
    href: "/todos",
    icon: CheckSquare,
    color: "text-mint-500",
    activeColor: "text-mint-600",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    color: "text-slate-500",
    activeColor: "text-slate-600",
  },
];

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-pink-50 to-rose-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-pink-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-md px-4 py-3">
          <div className="flex items-center justify-center">
            <Heart className="mr-2 h-6 w-6 text-pink-500" />
            <h1 className="text-xl font-bold text-slate-900">Love App</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="mx-auto max-w-md px-4 py-6">{children}</div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed right-0 bottom-0 left-0 z-50 border-t border-pink-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto max-w-md px-2 py-2">
          <div className="flex items-center justify-around">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex flex-col items-center rounded-xl px-3 py-2 transition-colors hover:bg-pink-50"
                >
                  <Icon
                    className={cn(
                      "mb-1 h-5 w-5 transition-colors",
                      item.color,
                      "group-hover:" + item.activeColor,
                    )}
                  />
                  <span className="text-xs font-medium text-slate-600 group-hover:text-slate-800">
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
