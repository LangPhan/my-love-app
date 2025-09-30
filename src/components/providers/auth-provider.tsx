"use client";

import { useAuth } from "@/hooks/useAuth";
import { Heart, Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
}

// Routes that don't require authentication
const publicRoutes = ["/", "/auth/login", "/auth/register"];

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If loading, don't do anything yet
    if (loading) return;

    // If user is authenticated and trying to access auth pages, redirect to home
    if (user && pathname.startsWith("/auth")) {
      router.push("/");
      return;
    }

    // Skip auth check for public routes
    if (publicRoutes.includes(pathname)) {
      return;
    }

    // Skip auth check for auth-related routes (for non-authenticated users)
    if (pathname.startsWith("/auth")) {
      return;
    }

    // If not loading and no user, redirect to login
    if (!user) {
      router.push("/auth/login");
    }
  }, [user, loading, pathname, router]);

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50">
        <div className="text-center">
          <Heart className="mx-auto mb-4 h-12 w-12 animate-pulse text-pink-500" />
          <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-pink-600" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // For protected routes, only render children if user is authenticated
  if (
    !publicRoutes.includes(pathname) &&
    !pathname.startsWith("/auth") &&
    !user
  ) {
    return null;
  }

  return <>{children}</>;
}
