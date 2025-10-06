"use server";

/**
 * Server Actions for Push Notifications
 *
 * These actions handle:
 * 1. Saving push subscriptions to Appwrite database
 * 2. Sending push notifications via Web Push API
 * 3. Managing push notification subscriptions
 *
 * Environment Variables Required (Server-side only):
 * - VAPID_PRIVATE_KEY: Private key for VAPID authentication
 * - VAPID_PUBLIC_KEY: Public key (same as NEXT_PUBLIC_VAPID_PUBLIC_KEY)
 * - VAPID_SUBJECT: Contact email (e.g., mailto:your-email@example.com)
 * - NEXT_PUBLIC_APPWRITE_DATABASE_ID: Database ID for storing subscriptions
 * - NEXT_PUBLIC_APPWRITE_PUSH_COLLECTION_ID: Collection ID for push subscriptions
 *
 * Generate VAPID keys: npx web-push generate-vapid-keys
 *
 * Database Schema for push_subscriptions collection:
 * - userId (string, required) - User ID from Appwrite Auth
 * - subscription (string, required) - JSON stringified PushSubscription object
 * - endpoint (string, required) - Push endpoint URL (for indexing)
 * - userAgent (string, optional) - Device/browser info
 * - createdAt (string, required) - ISO timestamp
 * - updatedAt (string, required) - ISO timestamp
 *
 * Indexes required:
 * - userId (ascending)
 * - endpoint (ascending, unique)
 */

import { account, databases } from "@/lib/appwrite";
import { ID, Query } from "appwrite";

// TODO: Add these environment variables to your .env.local file
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT; // e.g., mailto:admin@loveapp.com
const DATABASE_ID =
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "love-app-db";
const PUSH_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_PUSH_COLLECTION_ID || "push_subscriptions";

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Subscribe user to push notifications
 * Saves the subscription to Appwrite database
 */
export async function subscribeToPush(subscriptionJson: string) {
  try {
    // Get current user
    const user = await account.get();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Parse subscription
    const subscription: PushSubscriptionData = JSON.parse(subscriptionJson);

    // Check if subscription already exists (by endpoint)
    const existing = await databases.listDocuments(
      DATABASE_ID,
      PUSH_COLLECTION_ID,
      [Query.equal("endpoint", subscription.endpoint)],
    );

    let documentId: string;

    if (existing.documents.length > 0) {
      // Update existing subscription
      documentId = existing.documents[0].$id;
      await databases.updateDocument(
        DATABASE_ID,
        PUSH_COLLECTION_ID,
        documentId,
        {
          userId: user.$id,
          subscription: subscriptionJson,
          endpoint: subscription.endpoint,
          userAgent:
            typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
          updatedAt: new Date().toISOString(),
        },
      );
    } else {
      // Create new subscription
      const doc = await databases.createDocument(
        DATABASE_ID,
        PUSH_COLLECTION_ID,
        ID.unique(),
        {
          userId: user.$id,
          subscription: subscriptionJson,
          endpoint: subscription.endpoint,
          userAgent:
            typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      );
      documentId = doc.$id;
    }

    console.log("✅ Push subscription saved:", documentId);

    return {
      success: true,
      subscriptionId: documentId,
    };
  } catch (error) {
    console.error("❌ Error subscribing to push:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to subscribe",
    };
  }
}

/**
 * Unsubscribe user from push notifications
 * Removes the subscription from Appwrite database
 */
export async function unsubscribeFromPush() {
  try {
    // Get current user
    const user = await account.get();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Find and delete all subscriptions for this user
    const subscriptions = await databases.listDocuments(
      DATABASE_ID,
      PUSH_COLLECTION_ID,
      [Query.equal("userId", user.$id)],
    );

    // Delete all subscriptions
    await Promise.all(
      subscriptions.documents.map((doc) =>
        databases.deleteDocument(DATABASE_ID, PUSH_COLLECTION_ID, doc.$id),
      ),
    );

    console.log("✅ Unsubscribed from push notifications");

    return { success: true };
  } catch (error) {
    console.error("❌ Error unsubscribing:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to unsubscribe",
    };
  }
}

/**
 * Send a push notification to a specific user
 *
 * Note: This function requires the 'web-push' npm package
 * Install it with: npm install web-push
 *
 * @param userId - Target user ID
 * @param title - Notification title
 * @param body - Notification body
 * @param data - Additional data to send with notification
 */
export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, unknown>,
) {
  try {
    // TODO: Install web-push package: npm install web-push
    // Uncomment the following line after installing:
    // const webpush = require("web-push");

    // Validate VAPID keys
    if (!VAPID_PRIVATE_KEY || !VAPID_PUBLIC_KEY || !VAPID_SUBJECT) {
      console.error("❌ VAPID keys not configured. Add them to .env.local:");
      console.error("VAPID_PRIVATE_KEY=your_private_key");
      console.error("VAPID_PUBLIC_KEY=your_public_key");
      console.error("VAPID_SUBJECT=mailto:your-email@example.com");

      return {
        success: false,
        error: "Push notifications not configured. Missing VAPID keys.",
      };
    }

    // TODO: Uncomment after installing web-push
    /*
    // Configure web-push with VAPID keys
    webpush.setVapidDetails(
      VAPID_SUBJECT,
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    );

    // Get user's push subscriptions
    const subscriptions = await databases.listDocuments(
      DATABASE_ID,
      PUSH_COLLECTION_ID,
      [Query.equal("userId", userId)]
    );

    if (subscriptions.documents.length === 0) {
      return { 
        success: false, 
        error: "User has no push subscriptions" 
      };
    }

    // Prepare notification payload
    const payload = JSON.stringify({
      title,
      body,
      icon: "/icons/android/android-launchericon-192-192.png",
      badge: "/icons/android/android-launchericon-96-96.png",
      data: {
        url: "/",
        timestamp: Date.now(),
        ...data,
      },
    });

    // Send push to all user's devices
    const results = await Promise.allSettled(
      subscriptions.documents.map(async (doc) => {
        const subscription = JSON.parse(doc.subscription);
        return webpush.sendNotification(subscription, payload);
      })
    );

    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    console.log(`✅ Push sent: ${successful} successful, ${failed} failed`);

    return { 
      success: true, 
      sent: successful,
      failed 
    };
    */

    // Temporary return while web-push is not installed
    console.log("📌 TODO: Install web-push package and uncomment code above");
    console.log(`Would send push to user ${userId}: ${title} - ${body}`);

    return {
      success: false,
      error: "web-push package not installed yet. See comments in code.",
    };
  } catch (error) {
    console.error("❌ Error sending push notification:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send push",
    };
  }
}

/**
 * Send push notification to partner (for couples app)
 * Finds the partner's user ID and sends them a notification
 */
export async function sendPushToPartner(
  title: string,
  body: string,
  data?: Record<string, unknown>,
) {
  try {
    // Get current user
    const user = await account.get();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // TODO: Replace with your actual couple/partner finding logic
    // This is a placeholder - adjust based on your data model

    /*
    // Example: Get couple document
    const couples = await databases.listDocuments(
      DATABASE_ID,
      "couples", // Your couples collection ID
      [Query.equal("userId", user.$id)]
    );

    if (couples.documents.length === 0) {
      return { success: false, error: "No partner found" };
    }

    const couple = couples.documents[0];
    const partnerId = couple.user1Id === user.$id 
      ? couple.user2Id 
      : couple.user1Id;

    // Send push to partner
    return await sendPushNotification(partnerId, title, body, data);
    */

    console.log("📌 TODO: Implement partner finding logic");
    return {
      success: false,
      error: "Partner finding logic not implemented yet",
    };
  } catch (error) {
    console.error("❌ Error sending push to partner:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send push",
    };
  }
}

/**
 * Alternative: Send push via Appwrite Cloud Function
 *
 * If you prefer using Appwrite Cloud Functions instead of server actions,
 * you can create a cloud function that handles push notifications.
 *
 * Steps:
 * 1. Create an Appwrite Cloud Function (Node.js runtime)
 * 2. Install web-push in the function: npm install web-push
 * 3. Set VAPID keys as function environment variables
 * 4. Deploy the function
 * 5. Call the function from your app
 *
 * Example function code:
 *
 * import { Client, Databases, Query } from 'node-appwrite';
 * import webpush from 'web-push';
 *
 * export default async ({ req, res, log, error }) => {
 *   const { userId, title, body, data } = JSON.parse(req.body);
 *
 *   // Configure VAPID
 *   webpush.setVapidDetails(
 *     req.env.VAPID_SUBJECT,
 *     req.env.VAPID_PUBLIC_KEY,
 *     req.env.VAPID_PRIVATE_KEY
 *   );
 *
 *   // Get subscriptions from Appwrite
 *   const client = new Client()
 *     .setEndpoint(req.env.APPWRITE_ENDPOINT)
 *     .setProject(req.env.APPWRITE_PROJECT_ID)
 *     .setKey(req.env.APPWRITE_API_KEY);
 *
 *   const databases = new Databases(client);
 *   const subscriptions = await databases.listDocuments(
 *     req.env.DATABASE_ID,
 *     req.env.PUSH_COLLECTION_ID,
 *     [Query.equal('userId', userId)]
 *   );
 *
 *   // Send push notifications
 *   const results = await Promise.allSettled(
 *     subscriptions.documents.map(doc => {
 *       const sub = JSON.parse(doc.subscription);
 *       return webpush.sendNotification(sub, JSON.stringify({ title, body, data }));
 *     })
 *   );
 *
 *   return res.json({ success: true, results });
 * };
 */
