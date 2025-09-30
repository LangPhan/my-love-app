"use client";

import { CoupleManagement } from "@/components/settings/CoupleManagement";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { ThemeSelector } from "@/components/settings/ThemeSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCurrentUser } from "@/hooks/queries/useAuth";
import { useCoupleInfo } from "@/hooks/queries/useCouple";
import { Heart, Loader2, Settings, User, Users } from "lucide-react";
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

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (userError || (!userLoading && !user)) {
      router.push("/auth/login");
    }
  }, [user, userLoading, userError, router]);

  // Show loading state while fetching user data
  if (userLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
          <p className="text-sm text-slate-600">Loading settings...</p>
        </div>
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
