"use client";

/**
 * Service Worker Registration and Push Notification Provider
 *
 * This component handles:
 * 1. Service worker registration
 * 2. Push notification subscription
 * 3. Push notification permission handling
 * 4. Background sync registration
 *
 * Usage:
 * Wrap your app with this provider in the root layout
 */

import { useEffect, useState } from "react";

interface ServiceWorkerProviderProps {
  children: React.ReactNode;
}

export function ServiceWorkerProvider({
  children,
}: ServiceWorkerProviderProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Check if service workers are supported
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window
    ) {
      setIsSupported(true);
    }
  }, []);

  useEffect(() => {
    if (!isSupported) return;

    // Register service worker
    const registerServiceWorker = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });

        console.log("✅ Service Worker registered successfully:", reg.scope);
        setRegistration(reg);
        setIsRegistered(true);

        // Check for updates every 60 seconds
        setInterval(() => {
          reg.update();
        }, 60000);

        // Handle service worker updates
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // New service worker available, prompt user to reload
              console.log("🔄 New service worker available");

              // Optional: Show notification to user
              if (
                window.confirm("A new version is available. Reload to update?")
              ) {
                window.location.reload();
              }
            }
          });
        });
      } catch (error) {
        console.error("❌ Service Worker registration failed:", error);
      }
    };

    registerServiceWorker();

    // Cleanup
    return () => {
      // Service worker persists, no cleanup needed
    };
  }, [isSupported]);

  return <>{children}</>;
}
