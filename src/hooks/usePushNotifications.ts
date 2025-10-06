"use client";

/**
 * Push Notifications Hook
 *
 * Handles:
 * - Push notification permissions
 * - Push subscription management
 * - Saving subscriptions to Appwrite database
 * - Unsubscribing from push notifications
 *
 * Environment Variables Required:
 * - NEXT_PUBLIC_VAPID_PUBLIC_KEY (client-side)
 *
 * Generate VAPID keys with: npx web-push generate-vapid-keys
 */

import { subscribeToPush, unsubscribeFromPush } from "@/app/actions/push";
import { useEffect, useState } from "react";

interface UsePushNotificationsReturn {
  isSupported: boolean;
  permission: NotificationPermission | null;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
  requestPermission: () => Promise<boolean>;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
}

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

/**
 * Convert VAPID key from base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray as Uint8Array<ArrayBuffer>;
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | null>(
    null,
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check browser support on mount
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window
    ) {
      setIsSupported(true);
      setPermission(Notification.permission);
      checkSubscription();
    }
  }, []);

  /**
   * Check if user is already subscribed
   */
  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (err) {
      console.error("Error checking subscription:", err);
    }
  };

  /**
   * Request notification permission from user
   */
  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      setError("Push notifications are not supported in this browser");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted") {
        console.log("✅ Notification permission granted");
        return true;
      } else if (result === "denied") {
        setError("Notification permission denied");
        return false;
      } else {
        setError("Notification permission dismissed");
        return false;
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to request permission";
      setError(message);
      console.error("Error requesting permission:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Subscribe to push notifications
   */
  const subscribe = async (): Promise<boolean> => {
    if (!isSupported) {
      setError("Push notifications are not supported");
      return false;
    }

    if (!VAPID_PUBLIC_KEY) {
      setError("VAPID public key is not configured");
      console.error(
        "Missing NEXT_PUBLIC_VAPID_PUBLIC_KEY environment variable",
      );
      return false;
    }

    // Request permission if not granted
    if (permission !== "granted") {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Wait for service worker to be ready
      const registration = await navigator.serviceWorker.ready;

      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        // Subscribe to push notifications
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });

        console.log("✅ Push subscription created:", subscription.endpoint);
      }

      // Save subscription to server (Appwrite database)
      const result = await subscribeToPush(JSON.stringify(subscription));

      if (result.success) {
        setIsSubscribed(true);
        console.log("✅ Push subscription saved to server");
        return true;
      } else {
        throw new Error(result.error || "Failed to save subscription");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to subscribe";
      setError(message);
      console.error("Error subscribing to push:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Unsubscribe from push notifications
   */
  const unsubscribe = async (): Promise<boolean> => {
    if (!isSupported) return false;

    setIsLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Unsubscribe from push manager
        await subscription.unsubscribe();

        // Remove subscription from server
        await unsubscribeFromPush();

        setIsSubscribed(false);
        console.log("✅ Unsubscribed from push notifications");
        return true;
      }

      return false;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to unsubscribe";
      setError(message);
      console.error("Error unsubscribing:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    requestPermission,
    subscribe,
    unsubscribe,
  };
}
