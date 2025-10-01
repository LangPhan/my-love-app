"use client";

import { CountdownCard } from "@/components/CountdownCard";
import { QuickActions } from "@/components/QuickActions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/queries/useAuth";
import { useCoupleInfo } from "@/hooks/queries/useCouple";
import { Heart, UserPlus } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const {
    data: coupleInfo,
    isLoading: coupleLoading,
    error: coupleError,
  } = useCoupleInfo(user?.$id || null);

  // Show loading state
  if (userLoading) {
    return (
      <div className="space-y-6">
        <Card className="shadow-romantic border-pink-100 bg-white/80 backdrop-blur-sm">
          <CardContent className="space-y-4 py-8">
            <Skeleton className="mx-auto h-8 w-8 rounded-full" />
            <Skeleton className="mx-auto h-4 w-48" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="mx-auto h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show auth required message if no user
  if (!user) {
    return (
      <div className="space-y-6">
        <Card className="shadow-romantic border-pink-100 bg-white/80 backdrop-blur-sm">
          <CardContent className="py-8 text-center">
            <Heart className="mx-auto mb-4 h-12 w-12 text-pink-500" />
            <h2 className="mb-2 text-xl font-bold text-slate-900">
              Welcome to Love App
            </h2>
            <p className="text-slate-600">
              Please log in to start your love journey
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state while fetching couple info
  if (coupleLoading) {
    return (
      <div className="space-y-6">
        <Card className="shadow-romantic border-pink-100 bg-white/80 backdrop-blur-sm">
          <CardContent className="space-y-4 py-8">
            <Skeleton className="mx-auto h-12 w-12 rounded-full" />
            <Skeleton className="mx-auto h-6 w-56" />
            <div className="mt-6 grid grid-cols-2 gap-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user doesn't have a couple, show invite/create options
  if (coupleError || (!coupleLoading && !coupleInfo)) {
    return (
      <div className="space-y-6">
        <Card className="shadow-romantic border-pink-200 bg-gradient-to-br from-pink-100 to-rose-100">
          <CardContent className="py-8 text-center">
            <UserPlus className="mx-auto mb-4 h-12 w-12 text-pink-600" />
            <h2 className="mb-2 text-xl font-bold text-pink-800">
              Find Your Partner
            </h2>
            <p className="mb-6 text-pink-600">
              Connect with your partner to start using Love App together
            </p>
            <div className="space-y-3">
              <Button variant="romantic" className="w-full" asChild>
                <Link href="/couple/invite">Share Invite Code</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/couple/join">Join with Code</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Still show quick actions even without couple */}
        <QuickActions />
      </div>
    );
  }

  const { daysTogether, nextAnniversary, partnerName } = coupleInfo;

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <Card className="shadow-romantic border-pink-100 bg-white/80 backdrop-blur-sm">
        <CardContent className="py-6">
          <div className="text-center">
            <h2 className="mb-2 text-xl font-bold text-slate-900">
              Welcome back! 💕
            </h2>
            <p className="text-slate-600">
              {partnerName
                ? `Hope you and ${partnerName} are having a wonderful day`
                : "Hope you're having a wonderful day"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Countdown Cards */}
      <CountdownCard
        daysTogether={daysTogether}
        nextAnniversary={nextAnniversary}
        partnerName={partnerName}
      />

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
}
