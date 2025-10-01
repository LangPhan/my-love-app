"use client";

import { CoupleManagement } from "@/components/settings/CoupleManagement";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { ThemeSelector } from "@/components/settings/ThemeSelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser, useLogout } from "@/hooks/queries/useAuth";
import { useCoupleInfo } from "@/hooks/queries/useCouple";
import { Heart, LogOut, Settings, User, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SettingsPage() {
  const router = useRouter();
  const {
    data: user,
    isLoading: userLoading,
    isError: userError,
  } = useCurrentUser();
  const { data: coupleInfo, isLoading: coupleLoading } = useCoupleInfo(
    user?.$id ?? null,
  );
  const logoutMutation = useLogout();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails, redirect to login
      router.push("/auth/login");
    }
  };

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (userError || (!userLoading && !user)) {
      router.push("/auth/login");
    }
  }, [user, userLoading, userError, router]);

  // Show loading state while fetching user data
  if (userLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <Card className="shadow-romantic border-pink-100 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center">
              <Skeleton className="mr-2 h-5 w-5" />
              <Skeleton className="h-6 w-20" />
            </div>
          </CardHeader>
        </Card>

        {/* Profile settings skeleton */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center">
              <Skeleton className="mr-2 h-5 w-5" />
              <Skeleton className="h-6 w-16" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-8 w-32" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full max-w-md" />
            </div>
          </CardContent>
        </Card>

        {/* Preferences skeleton */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center">
              <Skeleton className="mr-2 h-5 w-5" />
              <Skeleton className="h-6 w-24" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Don't render anything if user is not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-romantic border-pink-100 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center">
            <Settings className="text-lavender-600 mr-2 h-5 w-5" />
            <CardTitle className="text-slate-800">Settings</CardTitle>
          </div>
        </CardHeader>
      </Card>

      {/* Profile Settings */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center">
            <User className="mr-2 h-5 w-5 text-slate-600" />
            <CardTitle className="text-slate-800">Profile</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ProfileForm user={user} />
        </CardContent>
      </Card>

      {/* Couple Management */}
      {coupleInfo && (
        <Card className="border-pink-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-pink-600" />
              <CardTitle className="text-slate-800">Couple Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CoupleManagement user={user} coupleInfo={coupleInfo} />
          </CardContent>
        </Card>
      )}

      {/* Theme & Preferences */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center">
            <Heart className="text-lavender-600 mr-2 h-5 w-5" />
            <CardTitle className="text-slate-800">Preferences</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-slate-900">Theme</h4>
                <p className="text-xs text-slate-600">
                  Choose between light and dark mode
                </p>
              </div>
              <ThemeSelector />
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-900">
                Notifications
              </h4>
              <p className="text-xs text-slate-600">
                Notification preferences coming soon
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card className="border-red-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center">
            <LogOut className="mr-2 h-5 w-5 text-red-600" />
            <CardTitle className="text-slate-800">Account</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-slate-900">Sign Out</h4>
                <p className="text-xs text-slate-600">
                  Sign out of your account on this device
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                {logoutMutation.isPending ? "Signing Out..." : "Sign Out"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* App Information */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="py-4">
          <div className="text-center text-xs text-slate-500">
            <p>Love App v1.0.0</p>
            <p className="mt-1">Made with 💕 for couples everywhere</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
