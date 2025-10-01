"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Models } from "appwrite";
import {
  Calendar,
  Copy,
  Heart,
  RefreshCw,
  UserMinus,
  Users,
} from "lucide-react";
import { useState } from "react";

interface CoupleInfo {
  couple: any;
  daysTogether: number;
  nextAnniversary?: {
    date: string;
    daysUntil: number;
  } | null;
  partnerName?: string;
}

interface CoupleManagementProps {
  user: Models.User<Models.Preferences>;
  coupleInfo: CoupleInfo;
}

export function CoupleManagement({ user, coupleInfo }: CoupleManagementProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [newInviteCode, setNewInviteCode] = useState<string | null>(null);

  const { couple, partnerName } = coupleInfo;

  const handleCopyInviteCode = async () => {
    const code = newInviteCode || couple.inviteCode;
    if (code) {
      try {
        await navigator.clipboard.writeText(code);
        alert("Invite code copied to clipboard!");
      } catch (error) {
        console.error("Failed to copy:", error);
        alert("Failed to copy invite code");
      }
    }
  };

  const handleRegenerateInviteCode = async () => {
    setIsRegenerating(true);
    try {
      const { regenerateInviteCode } = await import("@/app/actions/couple");
      const result = await regenerateInviteCode(couple.$id);

      if (result.success) {
        setNewInviteCode(result.inviteCode || null);
        alert(result.message);
      } else {
        alert(result.error || "Failed to regenerate invite code");
      }
    } catch (error) {
      console.error("Error regenerating invite code:", error);
      alert("Failed to regenerate invite code. Please try again.");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleLeaveCouple = async () => {
    const confirmed = confirm(
      "Are you sure you want to leave this couple? This action cannot be undone and will delete all shared memories.",
    );

    if (!confirmed) return;

    setIsLeaving(true);
    try {
      const { leaveCouple } = await import("@/app/actions/couple");
      const result = await leaveCouple(couple.$id);

      if (result && !result.success) {
        alert(result.error || "Failed to leave couple");
      }
      // If successful, the server action will redirect automatically
    } catch (error) {
      console.error("Error leaving couple:", error);
      alert("Failed to leave couple. Please try again.");
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Couple Status */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Heart className="h-5 w-5 text-pink-500" />
          <div>
            <h3 className="font-medium text-slate-900">Relationship Status</h3>
            <p className="text-sm text-slate-600">
              Connected with {partnerName || "your partner"}
            </p>
          </div>
        </div>

        <Card className="border-pink-200 bg-pink-50">
          <CardContent className="py-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-pink-600">
                  {coupleInfo.daysTogether}
                </div>
                <div className="text-xs text-pink-600">Days Together</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-pink-600">
                  {couple.status === "active" ? "💕" : "💔"}
                </div>
                <div className="text-xs text-pink-600 capitalize">
                  {couple.status || "active"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Anniversary Date */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="text-lavender-600 h-4 w-4" />
          <Label className="text-sm font-medium">Anniversary Date</Label>
        </div>

        {couple.anniversaryDate ? (
          <div className="text-sm text-slate-600">
            {new Date(couple.anniversaryDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            {coupleInfo.nextAnniversary && (
              <span className="text-lavender-600 ml-2">
                ({coupleInfo.nextAnniversary.daysUntil} days until next
                anniversary)
              </span>
            )}
          </div>
        ) : (
          <div className="text-sm text-slate-500">No anniversary date set</div>
        )}

        <Button variant="outline" size="sm" className="gap-2">
          <Calendar className="h-4 w-4" />
          {couple.anniversaryDate ? "Update" : "Set"} Anniversary Date
        </Button>
      </div>

      <Separator />

      {/* Invite Code Management */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-sky-600" />
          <Label className="text-sm font-medium">Invite Code</Label>
        </div>

        <div className="flex items-center gap-2">
          <code className="flex-1 rounded bg-slate-100 px-3 py-2 font-mono text-sm">
            {newInviteCode || couple.inviteCode || (
              <Skeleton className="inline-block h-4 w-20" />
            )}
          </code>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyInviteCode}
            className="gap-1"
          >
            <Copy className="h-3 w-3" />
            Copy
          </Button>
        </div>

        <p className="text-xs text-slate-600">
          Share this code with your partner to connect your accounts
        </p>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRegenerateInviteCode}
          disabled={isRegenerating}
          className="gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRegenerating ? "animate-spin" : ""}`}
          />
          {isRegenerating ? "Regenerating..." : "Regenerate Code"}
        </Button>
      </div>

      <Separator />

      {/* Danger Zone */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <UserMinus className="h-4 w-4 text-red-500" />
          <Label className="text-sm font-medium text-red-600">
            Danger Zone
          </Label>
        </div>

        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h4 className="text-sm font-medium text-red-800">Leave Couple</h4>
          <p className="mt-1 text-xs text-red-600">
            This will permanently disconnect you from your partner and delete
            all shared data. This action cannot be undone.
          </p>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleLeaveCouple}
            disabled={isLeaving}
            className="mt-3 gap-2"
          >
            <UserMinus className="h-4 w-4" />
            {isLeaving ? "Leaving..." : "Leave Couple"}
          </Button>
        </div>
      </div>
    </div>
  );
}
