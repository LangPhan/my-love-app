# Push Notifications Setup Guide

This guide explains how to set up Web Push Notifications for the Love App PWA.

## Prerequisites

1. HTTPS connection (required for push notifications)
2. Appwrite backend configured
3. Modern browser with Push API support

## Step 1: Generate VAPID Keys

VAPID (Voluntary Application Server Identification) keys are required for web push.

```bash
# Install web-push globally (if not already installed)
npm install -g web-push

# Generate VAPID keys
npx web-push generate-vapid-keys
```

This will output:
```
=======================================
Public Key:
BEl62iUYgUivxIkv69yViEuiBIa-Ib27SDbQjfTbSVRaqfy2Lp8Cv3nLxHMcEy5m4C_N8o4K8p5-kU5TqpKbSiU

Private Key:
UUxI4O8-FbRouAevSmBQ6o18hgE4nSG3qwvJTfKc-ls
=======================================
```

## Step 2: Configure Environment Variables

Add to `.env.local`:

```env
# Public key (exposed to client)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here

# Private key (server-only, keep secret!)
VAPID_PRIVATE_KEY=your_private_key_here

# Contact email (required by Web Push spec)
VAPID_SUBJECT=mailto:admin@loveapp.com

# Database IDs
NEXT_PUBLIC_APPWRITE_DATABASE_ID=love-app-db
NEXT_PUBLIC_APPWRITE_PUSH_COLLECTION_ID=push_subscriptions
```

## Step 3: Create Appwrite Database Collection

Create a collection named `push_subscriptions` with these attributes:

### Attributes:

| Attribute | Type | Size | Required | Array |
|-----------|------|------|----------|-------|
| userId | String | 255 | Yes | No |
| subscription | String | 10000 | Yes | No |
| endpoint | String | 1000 | Yes | No |
| userAgent | String | 500 | No | No |
| createdAt | String | 50 | Yes | No |
| updatedAt | String | 50 | Yes | No |

### Indexes:

1. **userId_index**
   - Type: Key
   - Attributes: `userId` (ASC)

2. **endpoint_index**
   - Type: Unique
   - Attributes: `endpoint` (ASC)

### Permissions:

- **Document Security**: Enabled
- **Permissions**:
  - Create: `users` (any authenticated user)
  - Read: `users` (only owner)
  - Update: `users` (only owner)
  - Delete: `users` (only owner)

## Step 4: Install web-push Package (for server-side sending)

```bash
npm install web-push
```

## Step 5: Register Service Worker Provider

Update `src/app/layout.tsx`:

```tsx
import { ServiceWorkerProvider } from "@/components/providers/service-worker-provider";

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <QueryProvider>
          <ThemeProvider>
            <ServiceWorkerProvider>
              <AuthGuard>
                {children}
              </AuthGuard>
            </ServiceWorkerProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
```

## Step 6: Add Push Notification Settings to UI

In your settings page (`src/app/(main)/settings/page.tsx`):

```tsx
import { PushNotificationSettings } from "@/components/settings/push-notification-settings";

export default function SettingsPage() {
  return (
    <div className="container py-8">
      <h1>Settings</h1>
      
      {/* Other settings */}
      
      <PushNotificationSettings />
    </div>
  );
}
```

## Step 7: Sending Push Notifications

### From Server Actions:

```tsx
import { sendPushNotification, sendPushToPartner } from "@/app/actions/push";

// Send to specific user
await sendPushNotification(
  "user-id-here",
  "New Message",
  "Your partner sent you a message!",
  { url: "/chat", messageId: "123" }
);

// Send to partner
await sendPushToPartner(
  "New Memory",
  "Your partner shared a new memory!",
  { url: "/memories" }
);
```

### Example: Send notification when new message arrives

```tsx
// In your chat message handler
"use server";

export async function sendMessage(content: string) {
  // Save message to database
  const message = await databases.createDocument(...);
  
  // Send push notification to partner
  await sendPushToPartner(
    "New Message",
    content.substring(0, 50) + "...",
    { 
      url: "/chat",
      messageId: message.$id 
    }
  );
  
  return message;
}
```

## Testing Push Notifications

### 1. Test Permission Request:

Open your app and go to Settings → Push Notifications → Enable Notifications

### 2. Test Push in Browser DevTools:

```javascript
// Open browser console
navigator.serviceWorker.ready.then(registration => {
  registration.showNotification('Test', {
    body: 'This is a test notification',
    icon: '/icons/android/android-launchericon-192-192.png'
  });
});
```

### 3. Test Server Push:

Use the Chrome DevTools Application tab:
1. Go to Application → Service Workers
2. Find your service worker
3. Click "Push" to simulate a push event

## Alternative: Appwrite Cloud Function

Instead of server actions, you can use an Appwrite Cloud Function:

### 1. Create function in Appwrite Console:
- Runtime: Node.js 18
- Name: `send-push-notification`

### 2. Install dependencies:
```bash
npm install node-appwrite web-push
```

### 3. Function code (see comments in `src/app/actions/push.ts`)

### 4. Set environment variables in Appwrite Console:
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`
- `DATABASE_ID`
- `PUSH_COLLECTION_ID`

### 5. Call from your app:
```tsx
import { functions } from "@/lib/appwrite";

await functions.createExecution(
  "send-push-notification",
  JSON.stringify({
    userId: "user-id",
    title: "Hello",
    body: "World"
  })
);
```

## Troubleshooting

### Notifications not showing:
1. Check browser permissions (should be "allowed")
2. Verify HTTPS is enabled
3. Check service worker is registered in DevTools
4. Verify VAPID keys are correct

### Subscription fails:
1. Check `NEXT_PUBLIC_VAPID_PUBLIC_KEY` is set
2. Verify service worker is active
3. Check browser console for errors

### Push not received:
1. Verify subscription is saved to database
2. Check VAPID keys match on server
3. Ensure `web-push` package is installed
4. Check server logs for errors

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome | ✅ Full |
| Firefox | ✅ Full |
| Safari | ✅ iOS 16.4+ |
| Edge | ✅ Full |
| Opera | ✅ Full |

## Production Checklist

- [ ] VAPID keys generated and secured
- [ ] Environment variables configured
- [ ] HTTPS enabled
- [ ] Appwrite collection created with proper indexes
- [ ] Service worker registered
- [ ] Push notifications tested on multiple devices
- [ ] Error handling implemented
- [ ] Analytics/logging configured
- [ ] User can unsubscribe easily

## References

- [Web Push API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [web-push npm package](https://www.npmjs.com/package/web-push)
- [Appwrite Push Notifications Guide](https://appwrite.io/docs)
