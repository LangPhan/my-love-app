# PWA Service Worker & Push Notifications - Complete Setup

This document provides a complete overview of the PWA service worker registration and push notification system for the Love App.

## 📁 File Structure

```
love-app/
├── public/
│   ├── manifest.json              # PWA manifest (already configured)
│   ├── sw.js                      # Custom service worker for push notifications
│   └── icons/                     # App icons (all sizes provided)
├── src/
│   ├── app/
│   │   ├── layout.tsx            # ✅ Updated with ServiceWorkerProvider
│   │   └── actions/
│   │       └── push.ts           # 🆕 Server actions for push notifications
│   ├── components/
│   │   ├── providers/
│   │   │   └── service-worker-provider.tsx  # 🆕 SW registration
│   │   └── settings/
│   │       └── push-notification-settings.tsx  # 🆕 UI component
│   ├── hooks/
│   │   └── usePushNotifications.ts  # 🆕 Push notification hook
│   └── examples/
│       └── push-notifications-usage.tsx  # 📖 Usage examples
└── docs/
    ├── PUSH_NOTIFICATIONS_SETUP.md    # 📖 Detailed setup guide
    └── MANIFEST_ICONS_GUIDE.md        # 📖 Icon requirements
```

## 🚀 Quick Start

### 1. Generate VAPID Keys

```powershell
npx web-push generate-vapid-keys
```

Copy the output and add to `.env.local`:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BEl62iUYgUivxIkv69yViEuiBIa...
VAPID_PRIVATE_KEY=UUxI4O8-FbRouAevSmBQ6o18hgE4nSG3qwvJTfKc-ls
VAPID_SUBJECT=mailto:admin@loveapp.com

NEXT_PUBLIC_APPWRITE_DATABASE_ID=love-app-db
NEXT_PUBLIC_APPWRITE_PUSH_COLLECTION_ID=push_subscriptions
```

### 2. Create Appwrite Collection

Create a collection `push_subscriptions` with these attributes:

| Attribute | Type | Size | Required |
|-----------|------|------|----------|
| userId | String | 255 | Yes |
| subscription | String | 10000 | Yes |
| endpoint | String | 1000 | Yes |
| userAgent | String | 500 | No |
| createdAt | String | 50 | Yes |
| updatedAt | String | 50 | Yes |

**Indexes:**
- `userId` (ascending)
- `endpoint` (ascending, unique)

### 3. Install Dependencies

```powershell
npm install web-push
```

### 4. Add to Your Settings Page

```tsx
// src/app/(main)/settings/page.tsx
import { PushNotificationSettings } from "@/components/settings/push-notification-settings";

export default function SettingsPage() {
  return (
    <div className="container py-8">
      <h1>Settings</h1>
      <PushNotificationSettings />
    </div>
  );
}
```

### 5. Send Push Notifications

```tsx
// In any server action
import { sendPushToPartner } from "@/app/actions/push";

await sendPushToPartner(
  "💬 New Message",
  "Your partner sent you a message!",
  { url: "/chat", messageId: "123" }
);
```

## 📋 What's Included

### ✅ Client-Side Components

1. **ServiceWorkerProvider** (`src/components/providers/service-worker-provider.tsx`)
   - Registers service worker on app load
   - Handles service worker updates
   - Auto-checks for updates every 60 seconds
   - Already integrated in root layout

2. **usePushNotifications Hook** (`src/hooks/usePushNotifications.ts`)
   - Request notification permissions
   - Subscribe/unsubscribe to push
   - Check subscription status
   - Error handling

3. **PushNotificationSettings Component** (`src/components/settings/push-notification-settings.tsx`)
   - Beautiful UI for managing notifications
   - Shows permission status
   - Toggle button for enable/disable
   - Error messages and guidance

### ✅ Server-Side Actions

**Push Actions** (`src/app/actions/push.ts`):
- `subscribeToPush()` - Save subscription to Appwrite
- `unsubscribeFromPush()` - Remove subscription
- `sendPushNotification()` - Send push to specific user
- `sendPushToPartner()` - Send push to partner

### ✅ Service Worker

**Custom Service Worker** (`public/sw.js`):
- Handles push notifications
- Handles notification clicks
- Background sync support
- Auto-update mechanism

### ✅ PWA Manifest

**Manifest** (`public/manifest.json`):
- ✅ Complete icon set (all sizes)
- ✅ App shortcuts (Chat, Memories, Todos)
- ✅ Share target configuration
- ✅ Screenshots for app stores
- ✅ Proper display mode and theme colors

## 🎯 Usage Examples

### Example 1: Enable Notifications in Settings

```tsx
import { PushNotificationSettings } from "@/components/settings/push-notification-settings";

<PushNotificationSettings />
```

### Example 2: Send Push When Message Sent

```tsx
"use server";

import { sendPushToPartner } from "@/app/actions/push";

export async function sendMessage(content: string) {
  // Save message...
  
  // Send push notification
  await sendPushToPartner(
    "💬 New Message",
    content.substring(0, 50),
    { url: "/chat" }
  );
}
```

### Example 3: Send Push When Memory Shared

```tsx
"use server";

import { sendPushToPartner } from "@/app/actions/push";

export async function createMemory(title: string) {
  // Save memory...
  
  await sendPushToPartner(
    "📸 New Memory",
    `Your partner shared: ${title}`,
    { url: `/memories/${memoryId}` }
  );
}
```

### Example 4: Custom Hook Usage

```tsx
"use client";

import { usePushNotifications } from "@/hooks/usePushNotifications";

export function MyComponent() {
  const { isSubscribed, subscribe } = usePushNotifications();
  
  return (
    <button onClick={subscribe}>
      {isSubscribed ? "Enabled" : "Enable Notifications"}
    </button>
  );
}
```

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | ✅ Yes | Public VAPID key (client-safe) |
| `VAPID_PRIVATE_KEY` | ✅ Yes | Private VAPID key (server-only) |
| `VAPID_SUBJECT` | ✅ Yes | Contact email (mailto:...) |
| `NEXT_PUBLIC_APPWRITE_DATABASE_ID` | ✅ Yes | Database ID |
| `NEXT_PUBLIC_APPWRITE_PUSH_COLLECTION_ID` | ✅ Yes | Collection ID for subscriptions |

### Service Worker Configuration

The service worker is automatically generated by `@ducanh2912/next-pwa` and enhanced with custom push notification handling in `public/sw.js`.

**Next.js Config** (`next.config.ts`):
```typescript
import withPWA from "@ducanh2912/next-pwa";

const nextConfig = withPWA({
  dest: "public",
  register: false, // We handle registration manually
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
})({ /* your config */ });
```

## 🧪 Testing

### Test in Browser DevTools

1. Open Chrome DevTools → Application → Service Workers
2. Check if service worker is registered
3. Click "Push" to test push event

### Test Permission Request

1. Go to Settings page
2. Click "Enable Notifications"
3. Grant permission when prompted
4. Verify subscription is saved to Appwrite

### Test Notification Display

```javascript
// In browser console
navigator.serviceWorker.ready.then(registration => {
  registration.showNotification('Test', {
    body: 'This is a test notification',
    icon: '/icons/android/android-launchericon-192-192.png'
  });
});
```

### Test Server Push

```tsx
// Create a test endpoint or button
import { sendPushNotification } from "@/app/actions/push";

await sendPushNotification(
  "current-user-id",
  "Test Notification",
  "This is a test from the server",
  { url: "/" }
);
```

## 🐛 Troubleshooting

### Service Worker Not Registering

**Issue**: Service worker doesn't register on page load

**Solutions**:
- ✅ Check browser console for errors
- ✅ Ensure HTTPS is enabled (or localhost)
- ✅ Verify `public/sw.js` exists
- ✅ Check `ServiceWorkerProvider` is in layout

### Push Permission Denied

**Issue**: User has blocked notifications

**Solutions**:
- ✅ User must manually enable in browser settings
- ✅ Show guidance: Chrome → Site Settings → Notifications → Allow
- ✅ Component already shows appropriate message

### Subscription Fails

**Issue**: `subscribeToPush()` returns error

**Solutions**:
- ✅ Verify `NEXT_PUBLIC_VAPID_PUBLIC_KEY` is set correctly
- ✅ Check Appwrite collection exists with correct schema
- ✅ Ensure user is authenticated
- ✅ Check browser console for detailed error

### Push Not Received

**Issue**: Server sends push but notification doesn't appear

**Solutions**:
- ✅ Verify `web-push` package is installed
- ✅ Uncomment code in `src/app/actions/push.ts`
- ✅ Check VAPID keys are correct (public & private match)
- ✅ Ensure subscription is valid (not expired)
- ✅ Check server logs for errors

## 📚 Documentation

- **[PUSH_NOTIFICATIONS_SETUP.md](./PUSH_NOTIFICATIONS_SETUP.md)** - Detailed setup guide
- **[MANIFEST_ICONS_GUIDE.md](./MANIFEST_ICONS_GUIDE.md)** - Icon requirements
- **[push-notifications-usage.tsx](../src/examples/push-notifications-usage.tsx)** - Code examples

## 🔒 Security Notes

### ⚠️ IMPORTANT: Keep Private Keys Secret

- ✅ `NEXT_PUBLIC_VAPID_PUBLIC_KEY` - Safe to expose (client-side)
- ❌ `VAPID_PRIVATE_KEY` - **NEVER** expose to client
- ❌ Never commit `.env.local` to git
- ✅ Use environment variables in production

### Appwrite Permissions

Ensure proper permissions on `push_subscriptions` collection:
- Users can only read/update/delete their own subscriptions
- Server actions use admin SDK for sending push

## 🎨 Customization

### Custom Notification Icons

Update in `public/sw.js`:
```javascript
icon: "/icons/android/android-launchericon-192-192.png",
badge: "/icons/android/android-launchericon-96-96.png",
```

### Custom Vibration Pattern

Update in `public/sw.js`:
```javascript
vibrate: [200, 100, 200], // [vibrate, pause, vibrate] in ms
```

### Custom Notification Actions

Add buttons to notifications in `public/sw.js`:
```javascript
actions: [
  { action: "open", title: "Open App" },
  { action: "reply", title: "Reply" },
  { action: "dismiss", title: "Dismiss" }
]
```

## 📱 Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Service Workers | ✅ | ✅ | ✅ 11.1+ | ✅ |
| Push API | ✅ | ✅ | ✅ 16.4+ | ✅ |
| Notifications | ✅ | ✅ | ✅ 16.4+ | ✅ |
| Background Sync | ✅ | ❌ | ❌ | ✅ |

## 🚀 Production Deployment

1. ✅ Generate production VAPID keys
2. ✅ Add environment variables to hosting platform
3. ✅ Enable HTTPS (required for PWA)
4. ✅ Create Appwrite collection in production database
5. ✅ Test push notifications on production URL
6. ✅ Run Lighthouse audit for PWA score

## ✅ Checklist

Before going to production:

- [ ] VAPID keys generated and configured
- [ ] Environment variables set in production
- [ ] Appwrite collection created with proper indexes
- [ ] `web-push` package installed
- [ ] Service worker registration tested
- [ ] Push notification sending tested
- [ ] Notification click handling tested
- [ ] Multiple device testing completed
- [ ] HTTPS enabled
- [ ] PWA Lighthouse audit passed (90+ score)

## 🔗 Resources

- [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [PWA Manifest](https://web.dev/add-manifest/)
- [Appwrite Documentation](https://appwrite.io/docs)
- [web-push npm](https://www.npmjs.com/package/web-push)

---

**Need Help?** See the detailed guides:
- [PUSH_NOTIFICATIONS_SETUP.md](./PUSH_NOTIFICATIONS_SETUP.md)
- [push-notifications-usage.tsx](../src/examples/push-notifications-usage.tsx)
