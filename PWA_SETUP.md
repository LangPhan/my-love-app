# PWA Setup Guide

Complete guide to set up your Love App as a Progressive Web App with push notifications.

## 🚀 Quick Setup

1. **Install dependencies** (already done):
   ```bash
   npm install @ducanh2912/next-pwa next-themes
   ```

2. **Environment setup**:
   ```bash
   cp .env.example .env.local
   # Fill in your Appwrite credentials and generate VAPID keys
   ```

3. **Generate VAPID keys** for push notifications:
   ```bash
   npx web-push generate-vapid-keys
   ```
   Add the output to your `.env.local` file.

## 🔧 Configuration Files

### ✅ Already Created:
- `next.config.ts` - Next.js 15 + PWA configuration
- `public/manifest.json` - PWA app manifest
- `.env.example` - Environment variables template

### 📁 Directory Structure:
```
public/
├── manifest.json          ✅ Created
├── icons/                 ✅ Created (needs icon files)
│   ├── icon-192x192.png   ⚠️  Need to create
│   ├── icon-512x512.png   ⚠️  Need to create
│   ├── apple-touch-icon.png ⚠️  Need to create
│   ├── favicon-32x32.png  ⚠️  Need to create
│   └── favicon-16x16.png  ⚠️  Need to create
└── screenshots/           ✅ Created (needs screenshot files)
    ├── desktop-chat.png   ⚠️  Need to create
    └── mobile-memories.png ⚠️  Need to create
```

## 📱 PWA Features Included

### Core PWA Features:
- **✅ App Manifest** - Install prompt, splash screen, app icons
- **✅ Service Worker** - Offline caching, background sync
- **✅ Responsive Design** - Mobile-first, safe areas
- **✅ HTTPS Ready** - Required for PWA and push notifications

### Caching Strategies:
- **Google Fonts** - CacheFirst (365 days)
- **Appwrite API** - StaleWhileRevalidate (24 hours)  
- **Next.js Images** - StaleWhileRevalidate (7 days)
- **API Routes** - NetworkFirst (5 minutes)
- **Static Images** - CacheFirst (30 days)

### App Features:
- **🔔 Push Notifications** - Real-time message alerts
- **📱 Install Prompts** - Add to home screen
- **🎨 Themed UI** - Romantic pastel colors  
- **🌙 Dark Mode** - System/manual toggle
- **📷 Share Target** - Share photos to memories
- **⚡ Shortcuts** - Quick access to chat, memories, todos

## 🔔 Push Notifications Setup

### 1. VAPID Keys (Required)
```bash
# Generate VAPID keys
npx web-push generate-vapid-keys

# Add to .env.local:
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BL7ELeSr...
VAPID_PRIVATE_KEY=k8IgfbmM...
VAPID_SUBJECT=mailto:your-email@example.com
```

### 2. Service Worker Registration
The PWA config automatically handles service worker registration. Push notification logic should be added to:

```typescript
// app/api/notifications/subscribe/route.ts - Subscribe to notifications
// app/api/notifications/send/route.ts - Send notifications
// hooks/useNotifications.ts - Client-side notification handling
```

### 3. Appwrite Integration
Use Appwrite's realtime subscriptions to trigger push notifications:

```typescript
// When a new message arrives, send push notification to partner
// When partner is offline, queue notification for delivery
// Handle notification permissions and user preferences
```

## 🎨 Icon Creation

### Required Sizes:
- **192x192px** - Standard PWA icon
- **512x512px** - High-res PWA icon  
- **180x180px** - Apple touch icon
- **32x32px** - Favicon
- **16x16px** - Small favicon

### Design Tips:
1. **Heart motif** - Primary visual element
2. **Romantic colors** - Pink (#ec4899), Lavender (#9c69ff)
3. **Rounded corners** - Soft, friendly appearance
4. **Maskable safe zone** - Keep important content in center 80%

### Quick Creation:
```bash
# If you have a master 512x512 icon:
convert master-icon.png -resize 192x192 public/icons/icon-192x192.png
convert master-icon.png -resize 180x180 public/icons/apple-touch-icon.png
convert master-icon.png -resize 32x32 public/icons/favicon-32x32.png
convert master-icon.png -resize 16x16 public/icons/favicon-16x16.png
```

## 🖼️ Screenshots

Create these for app store listings and installation prompts:

### Desktop (1280x720):
- Chat interface with romantic messages
- Memories timeline with photos
- Shared todos with couple goals

### Mobile (390x844):
- Mobile chat with touch interactions
- Photo gallery/memories view
- Mobile-optimized todo management

## 📦 Deployment

### Vercel (Recommended):
```bash
# Build and deploy
npm run build
vercel --prod

# Environment variables needed:
# - All NEXT_PUBLIC_* variables
# - VAPID keys for push notifications
# - Appwrite credentials
```

### Other Platforms:
- **Netlify** - Supports PWA out of the box
- **Railway** - Good for full-stack Next.js apps
- **DigitalOcean App Platform** - Scalable deployment

## 🧪 Testing Your PWA

### Chrome DevTools:
1. **Application tab** → Manifest (check manifest.json)
2. **Application tab** → Service Workers (verify registration)
3. **Lighthouse** → PWA audit (aim for 90+ score)

### Real Device Testing:
1. **Chrome mobile** → Add to Home Screen
2. **Safari iOS** → Share → Add to Home Screen  
3. **Test offline** - Disable network, verify app still works
4. **Test notifications** - Send test push notifications

### PWA Testing Tools:
- **PWA Builder** - https://www.pwabuilder.com/
- **Maskable.app** - Test maskable icons
- **Web App Manifest Validator** - Validate manifest.json

## 🔧 Troubleshooting

### Common Issues:

1. **Manifest not loading**:
   - Check `public/manifest.json` exists
   - Verify manifest link in layout.tsx
   - Check for JSON syntax errors

2. **Service Worker not registering**:
   - Ensure HTTPS in production
   - Check next.config.ts PWA settings
   - Verify no console errors

3. **Icons not showing**:
   - Verify icon files exist in `public/icons/`
   - Check file sizes match manifest
   - Test with different browsers

4. **Push notifications not working**:
   - Verify VAPID keys are correct
   - Check HTTPS requirement
   - Ensure user granted permission

## 🚀 Next Steps

1. **Create icons** following the design guidelines
2. **Set up Appwrite** database and collections
3. **Add push notification** API routes
4. **Create screenshots** of your app interfaces
5. **Test PWA features** on real devices
6. **Deploy** and test in production

Your PWA foundation is ready! Focus on building the core features (chat, memories, todos) and the PWA capabilities will enhance the user experience automatically.