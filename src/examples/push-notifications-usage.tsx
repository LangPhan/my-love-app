/**
 * Example Usage of Push Notifications in Love App
 *
 * This file demonstrates how to integrate push notifications
 * throughout your application.
 */

// ============================================================================
// EXAMPLE 1: Settings Page with Push Notification Toggle
// ============================================================================

// File: src/app/(main)/settings/page.tsx
/*
import { PushNotificationSettings } from "@/components/settings/push-notification-settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="container max-w-2xl py-8 space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      {/* Profile Settings *}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Profile form *}
        </CardContent>
      </Card>

      {/* Push Notification Settings *}
      <PushNotificationSettings />

      {/* Other settings *}
    </div>
  );
}
*/

// ============================================================================
// EXAMPLE 2: Send Push When New Message Arrives
// ============================================================================

// File: src/app/actions/messages.ts
/*
"use server";

import { databases, account } from "@/lib/appwrite";
import { sendPushToPartner } from "./push";
import { ID } from "appwrite";

export async function sendMessage(content: string, coupleId: string) {
  try {
    // Get current user
    const user = await account.get();
    
    // Save message to database
    const message = await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      "messages",
      ID.unique(),
      {
        content,
        senderId: user.$id,
        coupleId,
        createdAt: new Date().toISOString(),
        isRead: false,
      }
    );

    // Send push notification to partner
    const truncatedContent = content.length > 50 
      ? content.substring(0, 50) + "..." 
      : content;
      
    await sendPushToPartner(
      "💬 New Message",
      truncatedContent,
      { 
        url: "/chat",
        messageId: message.$id,
        type: "message"
      }
    );

    return { success: true, message };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, error };
  }
}
*/

// ============================================================================
// EXAMPLE 3: Send Push When New Memory Added
// ============================================================================

// File: src/app/actions/memories.ts
/*
"use server";

import { databases, account, storage } from "@/lib/appwrite";
import { sendPushToPartner } from "./push";
import { ID } from "appwrite";

export async function createMemory(
  title: string,
  description: string,
  fileId: string,
  coupleId: string
) {
  try {
    const user = await account.get();
    
    // Save memory to database
    const memory = await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      "memories",
      ID.unique(),
      {
        title,
        description,
        fileId,
        userId: user.$id,
        coupleId,
        createdAt: new Date().toISOString(),
      }
    );

    // Send push notification
    await sendPushToPartner(
      "📸 New Memory",
      `${user.name} shared: ${title}`,
      {
        url: `/memories/${memory.$id}`,
        memoryId: memory.$id,
        type: "memory"
      }
    );

    return { success: true, memory };
  } catch (error) {
    console.error("Error creating memory:", error);
    return { success: false, error };
  }
}
*/

// ============================================================================
// EXAMPLE 4: Send Push When Todo Completed
// ============================================================================

// File: src/app/actions/todos.ts
/*
"use server";

import { databases, account } from "@/lib/appwrite";
import { sendPushToPartner } from "./push";

export async function completeTodo(todoId: string) {
  try {
    const user = await account.get();
    
    // Get todo details
    const todo = await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      "todos",
      todoId
    );
    
    // Update todo
    await databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      "todos",
      todoId,
      {
        isCompleted: true,
        completedBy: user.$id,
        completedAt: new Date().toISOString(),
      }
    );

    // Send push notification
    await sendPushToPartner(
      "✅ Todo Completed",
      `${user.name} completed: ${todo.title}`,
      {
        url: "/todos",
        todoId,
        type: "todo"
      }
    );

    return { success: true };
  } catch (error) {
    console.error("Error completing todo:", error);
    return { success: false, error };
  }
}
*/

// ============================================================================
// EXAMPLE 5: Custom Hook for Push Notifications in Components
// ============================================================================

// Usage in any component:
/*
"use client";

import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Button } from "@/components/ui/button";

export function NotificationButton() {
  const { isSupported, isSubscribed, subscribe, unsubscribe } = usePushNotifications();

  if (!isSupported) return null;

  return (
    <Button
      onClick={() => isSubscribed ? unsubscribe() : subscribe()}
      variant={isSubscribed ? "outline" : "default"}
    >
      {isSubscribed ? "Disable" : "Enable"} Notifications
    </Button>
  );
}
*/

// ============================================================================
// EXAMPLE 6: Handle Notification Click in Service Worker
// ============================================================================

// The service worker (public/sw.js) already handles notification clicks
// When user clicks a notification, it opens the URL specified in data.url
/*
await sendPushToPartner(
  "New Message",
  "Click to view",
  { 
    url: "/chat",  // User will be navigated here on click
    messageId: "123"
  }
);
*/

// ============================================================================
// EXAMPLE 7: Schedule Daily Reminder (Example)
// ============================================================================

// File: src/app/actions/reminders.ts
/*
"use server";

import { sendPushNotification } from "./push";

export async function sendDailyReminder(userId: string) {
  // This would be called by a cron job or scheduled task
  
  await sendPushNotification(
    userId,
    "💕 Daily Reminder",
    "Don't forget to message your partner today!",
    {
      url: "/chat",
      type: "reminder"
    }
  );
}
*/

// ============================================================================
// EXAMPLE 8: Notification Permission Prompt Component
// ============================================================================

/*
"use client";

import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";

export function NotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const { permission, requestPermission } = usePushNotifications();

  useEffect(() => {
    // Show prompt after 5 seconds if permission not set
    if (permission === "default") {
      const timer = setTimeout(() => setShowPrompt(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [permission]);

  if (!showPrompt || permission !== "default") return null;

  const handleEnable = async () => {
    await requestPermission();
    setShowPrompt(false);
  };

  return (
    <div className="fixed bottom-4 right-4 max-w-sm rounded-xl border bg-card p-4 shadow-lg z-50">
      <div className="flex gap-3">
        <Bell className="h-5 w-5 text-pink-600 mt-0.5" />
        <div className="space-y-2">
          <p className="text-sm font-medium">Enable Notifications?</p>
          <p className="text-xs text-muted-foreground">
            Stay connected with your partner even when the app is closed
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleEnable}>
              Enable
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowPrompt(false)}
            >
              Not now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
*/

// ============================================================================
// EXAMPLE 9: Testing Push Notifications Locally
// ============================================================================

/*
// Add this button to your settings page for testing:

"use client";

import { Button } from "@/components/ui/button";

export function TestPushButton() {
  const testPush = async () => {
    // Get service worker
    const registration = await navigator.serviceWorker.ready;
    
    // Show test notification
    await registration.showNotification("Test Notification", {
      body: "This is a test notification from Love App",
      icon: "/icons/android/android-launchericon-192-192.png",
      badge: "/icons/android/android-launchericon-96-96.png",
      vibrate: [200, 100, 200],
      data: { url: "/", test: true },
    });
  };

  return (
    <Button onClick={testPush} variant="outline">
      Test Notification
    </Button>
  );
}
*/

// ============================================================================
// EXAMPLE 10: Notification Statistics Component
// ============================================================================

/*
"use client";

import { useEffect, useState } from "react";
import { databases } from "@/lib/appwrite";
import { Query } from "appwrite";

export function NotificationStats() {
  const [stats, setStats] = useState({ total: 0, devices: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const user = await account.get();
        const subscriptions = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          "push_subscriptions",
          [Query.equal("userId", user.$id)]
        );
        
        setStats({
          total: subscriptions.total,
          devices: subscriptions.documents.length
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <div className="text-sm text-muted-foreground">
      Notifications enabled on {stats.devices} device{stats.devices !== 1 ? "s" : ""}
    </div>
  );
}
*/

export {};
