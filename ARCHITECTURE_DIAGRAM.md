# PWA Push Notifications - Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                        LOVE APP PWA ARCHITECTURE                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  CLIENT SIDE (Browser)                                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Root Layout (src/app/layout.tsx)                                    │   │
│  │  └─ ServiceWorkerProvider ────────────┐                             │   │
│  │      - Registers /sw.js                │                             │   │
│  │      - Checks for updates              │                             │   │
│  └────────────────────────────────────────┼─────────────────────────────┘   │
│                                           │                                 │
│  ┌────────────────────────────────────────▼─────────────────────────────┐   │
│  │ Service Worker (public/sw.js)                                        │   │
│  │  - Listens for push events                                           │   │
│  │  - Shows notifications                                               │   │
│  │  - Handles notification clicks                                       │   │
│  │  - Background sync                                                   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Settings Page (src/app/(main)/settings/page.tsx)                    │   │
│  │  └─ PushNotificationSettings                                         │   │
│  │      - Toggle button for enable/disable                              │   │
│  │      - Shows permission status                                       │   │
│  │      - Uses usePushNotifications hook                                │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ usePushNotifications Hook (src/hooks/usePushNotifications.ts)       │   │
│  │  - requestPermission()                                               │   │
│  │  - subscribe() ──────────────────────┐                               │   │
│  │  - unsubscribe() ────────────────────┤                               │   │
│  │  - Check subscription status         │                               │   │
│  └──────────────────────────────────────┼───────────────────────────────┘   │
│                                         │                                   │
└─────────────────────────────────────────┼───────────────────────────────────┘
                                          │
                                          │ Server Action Call
                                          │
┌─────────────────────────────────────────▼───────────────────────────────────┐
│  SERVER SIDE (Next.js)                                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Push Actions (src/app/actions/push.ts)                              │   │
│  │  ┌───────────────────────────────────────────────────────────────┐  │   │
│  │  │ subscribeToPush(subscription)                                 │  │   │
│  │  │  - Parse subscription                                         │  │   │
│  │  │  - Save to Appwrite database ─────────────────────────┐       │  │   │
│  │  └───────────────────────────────────────────────────────┼───────┘  │   │
│  │                                                           │          │   │
│  │  ┌───────────────────────────────────────────────────────▼───────┐  │   │
│  │  │ unsubscribeFromPush()                                         │  │   │
│  │  │  - Remove from Appwrite database ─────────────────────┐       │  │   │
│  │  └───────────────────────────────────────────────────────┼───────┘  │   │
│  │                                                           │          │   │
│  │  ┌───────────────────────────────────────────────────────▼───────┐  │   │
│  │  │ sendPushNotification(userId, title, body, data)               │  │   │
│  │  │  1. Get subscriptions from Appwrite ──────────────────┐       │  │   │
│  │  │  2. Configure web-push with VAPID keys                │       │  │   │
│  │  │  3. Send push to all devices ────────────────────┐    │       │  │   │
│  │  └──────────────────────────────────────────────────┼────┼───────┘  │   │
│  │                                                      │    │          │   │
│  │  ┌──────────────────────────────────────────────────▼────▼───────┐  │   │
│  │  │ sendPushToPartner(title, body, data)                          │  │   │
│  │  │  1. Get current user                                          │  │   │
│  │  │  2. Find partner ID                                           │  │   │
│  │  │  3. Call sendPushNotification() ──────────────────────┐       │  │   │
│  │  └───────────────────────────────────────────────────────┼───────┘  │   │
│  └────────────────────────────────────────────────────────┼─────────────┘   │
│                                                            │                 │
└────────────────────────────────────────────────────────────┼─────────────────┘
                                                             │
                                                             │
┌────────────────────────────────────────────────────────────▼─────────────────┐
│  APPWRITE BACKEND                                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Database: love-app-db                                                │   │
│  │  ┌────────────────────────────────────────────────────────────────┐ │   │
│  │  │ Collection: push_subscriptions                                 │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐   │ │   │
│  │  │  │ Document {                                              │   │ │   │
│  │  │  │   userId: "user123"                                     │   │ │   │
│  │  │  │   subscription: "{endpoint, keys: {p256dh, auth}}"      │   │ │   │
│  │  │  │   endpoint: "https://fcm.googleapis.com/..."            │   │ │   │
│  │  │  │   userAgent: "Mozilla/5.0..."                           │   │ │   │
│  │  │  │   createdAt: "2024-01-01T00:00:00Z"                     │   │ │   │
│  │  │  │   updatedAt: "2024-01-01T00:00:00Z"                     │   │ │   │
│  │  │  │ }                                                        │   │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘   │ │   │
│  │  │                                                                 │ │   │
│  │  │ Indexes:                                                        │ │   │
│  │  │  - userId (ascending)                                           │ │   │
│  │  │  - endpoint (ascending, unique)                                 │ │   │
│  │  └─────────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  PUSH NOTIFICATION FLOW                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. USER SUBSCRIBES                                                         │
│     User → Settings → Enable Notifications                                  │
│      ↓                                                                      │
│     usePushNotifications.subscribe()                                        │
│      ↓                                                                      │
│     Request permission → Get PushSubscription                               │
│      ↓                                                                      │
│     subscribeToPush(subscription) [Server Action]                           │
│      ↓                                                                      │
│     Save to Appwrite Database                                               │
│                                                                             │
│  2. USER SENDS MESSAGE (Example)                                            │
│     User → Chat → Send Message                                              │
│      ↓                                                                      │
│     sendMessage("Hello!") [Server Action]                                   │
│      ↓                                                                      │
│     Save message to database                                                │
│      ↓                                                                      │
│     sendPushToPartner("New Message", "Hello!", {url: "/chat"})              │
│      ↓                                                                      │
│     Get partner's subscriptions from Appwrite                               │
│      ↓                                                                      │
│     web-push.sendNotification(subscription, payload)                        │
│      ↓                                                                      │
│     Push sent to browser via FCM/VAPID                                      │
│                                                                             │
│  3. BROWSER RECEIVES PUSH                                                   │
│     Service Worker receives 'push' event                                    │
│      ↓                                                                      │
│     self.registration.showNotification(title, options)                      │
│      ↓                                                                      │
│     Notification appears on device                                          │
│                                                                             │
│  4. USER CLICKS NOTIFICATION                                                │
│     User clicks notification                                                │
│      ↓                                                                      │
│     Service Worker receives 'notificationclick' event                       │
│      ↓                                                                      │
│     clients.openWindow(url) or client.focus()                               │
│      ↓                                                                      │
│     App opens at /chat (or specified URL)                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  ENVIRONMENT VARIABLES                                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CLIENT-SIDE (Safe to expose):                                              │
│    NEXT_PUBLIC_VAPID_PUBLIC_KEY=BEl62iUYgUivxIkv69yViEuiBIa...              │
│    NEXT_PUBLIC_APPWRITE_DATABASE_ID=love-app-db                             │
│    NEXT_PUBLIC_APPWRITE_PUSH_COLLECTION_ID=push_subscriptions               │
│                                                                             │
│  SERVER-SIDE (Keep secret!):                                                │
│    VAPID_PRIVATE_KEY=UUxI4O8-FbRouAevSmBQ6o18hgE4nSG3qwvJTfKc-ls             │
│    VAPID_SUBJECT=mailto:admin@loveapp.com                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  KEY COMPONENTS                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. ServiceWorkerProvider                                                   │
│     - Automatically registers service worker on app load                    │
│     - Checks for updates every 60 seconds                                   │
│     - Prompts user for reload when update available                         │
│                                                                             │
│  2. usePushNotifications                                                    │
│     - React hook for managing push notifications                            │
│     - Handles permissions, subscription, errors                             │
│     - Provides: isSubscribed, subscribe, unsubscribe, etc.                  │
│                                                                             │
│  3. PushNotificationSettings                                                │
│     - Beautiful UI component for settings page                              │
│     - Shows status, toggle button, error messages                           │
│     - Uses usePushNotifications hook internally                             │
│                                                                             │
│  4. Push Server Actions                                                     │
│     - subscribeToPush: Save subscription to database                        │
│     - unsubscribeFromPush: Remove subscription                              │
│     - sendPushNotification: Send to specific user                           │
│     - sendPushToPartner: Helper for couples app                             │
│                                                                             │
│  5. Service Worker (sw.js)                                                  │
│     - Handles push events from server                                       │
│     - Shows notifications                                                   │
│     - Handles notification clicks                                           │
│     - Background sync support                                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  INTEGRATION POINTS                                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Chat Messages:                                                             │
│    sendMessage() → sendPushToPartner("💬 New Message", ...)                 │
│                                                                             │
│  New Memories:                                                              │
│    createMemory() → sendPushToPartner("📸 New Memory", ...)                 │
│                                                                             │
│  Todo Completed:                                                            │
│    completeTodo() → sendPushToPartner("✅ Todo Completed", ...)             │
│                                                                             │
│  New Countdown:                                                             │
│    createCountdown() → sendPushToPartner("⏰ New Countdown", ...)           │
│                                                                             │
│  Daily Reminder (Cron):                                                     │
│    sendPushNotification(userId, "💕 Daily Reminder", ...)                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  SECURITY CONSIDERATIONS                                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ✅ VAPID public key: Safe to expose (used by client)                       │
│  ❌ VAPID private key: NEVER expose (server-only)                           │
│  ✅ Subscription endpoints: Unique per device, can be public                │
│  ✅ Appwrite permissions: Users can only access their own subscriptions     │
│  ✅ HTTPS required: PWA and Push API require secure context                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  BROWSER COMPATIBILITY                                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Service Workers:                                                           │
│    ✅ Chrome/Edge (40+)                                                     │
│    ✅ Firefox (44+)                                                         │
│    ✅ Safari (11.1+)                                                        │
│                                                                             │
│  Push API:                                                                  │
│    ✅ Chrome/Edge (50+)                                                     │
│    ✅ Firefox (44+)                                                         │
│    ✅ Safari (16.4+) - iOS only                                             │
│                                                                             │
│  Notifications:                                                             │
│    ✅ All modern browsers                                                   │
│    ⚠️  Requires user permission                                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```
