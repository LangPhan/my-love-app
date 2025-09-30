"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Heart, Sparkles } from "lucide-react";

interface CountdownCardProps {
  daysTogether: number;
  nextAnniversary?: {
    date: string;
    daysUntil: number;
  } | null;
  partnerName?: string;
}

export function CountdownCard({
  daysTogether,
  nextAnniversary,
  partnerName,
}: CountdownCardProps) {
  return (
    <div className="space-y-4">
      {/* Days Together Card */}
      <Card className="shadow-romantic border-pink-200 bg-gradient-to-br from-pink-100 to-rose-100">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-pink-800">
            <Heart className="mr-2 h-5 w-5 text-pink-600" />
            Days Together
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="mb-2 text-4xl font-bold text-pink-700">
              {daysTogether.toLocaleString()}
            </div>
            <p className="text-sm text-pink-600">
              {partnerName
                ? `Amazing days with ${partnerName}`
                : "Amazing days together"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Anniversary Countdown Card */}
      {nextAnniversary && (
        <Card className="from-lavender-100 border-lavender-200 shadow-romantic bg-gradient-to-br to-purple-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-lavender-800 flex items-center">
              <Calendar className="text-lavender-600 mr-2 h-5 w-5" />
              Next Anniversary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-lavender-700 mb-2 text-3xl font-bold">
                {nextAnniversary.daysUntil === 0
                  ? "Today! 🎉"
                  : `${nextAnniversary.daysUntil} days`}
              </div>
              <p className="text-lavender-600 text-sm">
                {nextAnniversary.daysUntil === 0
                  ? "Happy Anniversary!"
                  : `Until your special day`}
              </p>
              <div className="text-lavender-500 mt-3 flex items-center justify-center text-xs">
                <Sparkles className="mr-1 h-3 w-3" />
                {new Date(nextAnniversary.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Anniversary Set Card */}
      {!nextAnniversary && (
        <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 shadow-sm">
          <CardContent className="py-6">
            <div className="text-center">
              <Calendar className="mx-auto mb-3 h-8 w-8 text-slate-400" />
              <p className="mb-2 text-sm text-slate-600">
                Set your anniversary date to see countdown
              </p>
              <p className="text-xs text-slate-500">
                Go to Settings to add your special date
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
