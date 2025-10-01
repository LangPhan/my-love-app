"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { Heart } from "lucide-react";
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
        <div className="space-y-4 text-center">
          <Heart className="mx-auto h-12 w-12 animate-pulse text-pink-500" />
          <div className="space-y-2">
            <Skeleton className="mx-auto h-6 w-48" />
            <Skeleton className="mx-auto h-4 w-32" />
          </div>
          <div className="mt-8 space-y-2">
            <Skeleton className="mx-auto h-4 w-full max-w-md" />
            <Skeleton className="mx-auto h-4 w-3/4 max-w-sm" />
            <Skeleton className="mx-auto h-4 w-2/3 max-w-xs" />
          </div>
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
