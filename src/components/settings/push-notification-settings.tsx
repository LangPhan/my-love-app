"use client";

/**
 * Push Notification Settings Component
 *
 * Provides UI for managing push notification permissions and subscriptions
 * Use this in your settings page
 */

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { AlertCircle, Bell, BellOff, Check, Loader2 } from "lucide-react";

export function PushNotificationSettings() {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Push notifications are not supported in your browser
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  const getStatusColor = () => {
    if (permission === "granted" && isSubscribed) return "text-green-600";
    if (permission === "denied") return "text-red-600";
    return "text-slate-600";
  };

  const getStatusText = () => {
    if (permission === "granted" && isSubscribed) return "Active";
    if (permission === "granted" && !isSubscribed) return "Inactive";
    if (permission === "denied") return "Blocked";
    return "Not set";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Get notified when your partner sends messages, adds todos, or shares
          memories
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Notification Status</p>
            <p className={`text-sm ${getStatusColor()}`}>{getStatusText()}</p>
          </div>
          {isSubscribed && <Check className="h-5 w-5 text-green-600" />}
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Blocked Warning */}
        {permission === "denied" && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You have blocked notifications. Please enable them in your browser
              settings.
            </AlertDescription>
          </Alert>
        )}

        {/* Toggle Button */}
        <Button
          onClick={handleToggle}
          disabled={isLoading || permission === "denied"}
          className="w-full"
          variant={isSubscribed ? "outline" : "default"}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isSubscribed ? "Unsubscribing..." : "Subscribing..."}
            </>
          ) : (
            <>
              {isSubscribed ? (
                <>
                  <BellOff className="mr-2 h-4 w-4" />
                  Disable Notifications
                </>
              ) : (
                <>
                  <Bell className="mr-2 h-4 w-4" />
                  Enable Notifications
                </>
              )}
            </>
          )}
        </Button>

        {/* Info */}
        <p className="text-muted-foreground text-xs">
          {isSubscribed
            ? "You'll receive notifications even when the app is closed"
            : "Enable notifications to stay connected with your partner"}
        </p>
      </CardContent>
    </Card>
  );
}
