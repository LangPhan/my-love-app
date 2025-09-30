"use client";

import { CountdownCard } from "@/components/CountdownCard";
import { QuickActions } from "@/components/QuickActions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { getCoupleInfo } from "@/lib/appwrite";
import { Heart, Loader2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface CoupleInfo {
  daysTogether: number;
  nextAnniversary?: {
    date: string;
    daysUntil: number;
  } | null;
  partnerName?: string;
}

export default function HomePage() {
  const { user, loading } = useAuth();
  const [coupleInfo, setCoupleInfo] = useState<CoupleInfo | null>(null);
  const [coupleLoading, setCoupleLoading] = useState(false);
  const [coupleError, setCoupleError] = useState<string | null>(null);

  // Fetch couple info when user is available
  useEffect(() => {
    async function fetchCoupleInfo() {
      if (!user) return;

      setCoupleLoading(true);
      setCoupleError(null);

      try {
        const result = await getCoupleInfo(user.$id);
        if (result.success) {
          setCoupleInfo(result.data);
        } else {
          setCoupleError(result.error || "Failed to load couple info");
        }
      } catch (error) {
        console.error("Error fetching couple info:", error);
        setCoupleError("An unexpected error occurred");
      } finally {
        setCoupleLoading(false);
      }
    }

    fetchCoupleInfo();
  }, [user]);

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="shadow-romantic border-pink-100 bg-white/80 backdrop-blur-sm">
          <CardContent className="py-8 text-center">
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-pink-600" />
            <p className="text-slate-600">Loading your love journey...</p>
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
          <CardContent className="py-8 text-center">
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-pink-600" />
            <p className="text-slate-600">Loading couple information...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user doesn't have a couple, show invite/create options
  if (coupleError || !coupleInfo) {
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
