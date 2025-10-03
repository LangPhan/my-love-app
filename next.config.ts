import withPWA from "@ducanh2912/next-pwa";
import type { NextConfig } from "next";

/**
 * Next.js 15 Configuration with PWA Support
 *
 * PWA Configuration:
 * - Service Worker: Handles offline caching and background sync
 * - Workbox: Precaching and runtime caching strategies
 * - Push Notifications: Requires VAPID keys (see environment variables below)
 *
 * Environment Variables for Push Notifications:
 * Add these to your .env.local file:
 *
 * NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key_here
 * VAPID_PRIVATE_KEY=your_vapid_private_key_here
 * VAPID_SUBJECT=mailto:your-email@example.com
 *
 * Generate VAPID keys using:
 * npx web-push generate-vapid-keys
 *
 * Production deployment notes:
 * - Ensure HTTPS is enabled (required for PWA and push notifications)
 * - Configure proper cache headers for service worker
 * - Test PWA features with Lighthouse audit
 */

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  // Next.js 15 App Router Configuration
  experimental: {
    // Enable React 19 features
    reactCompiler: true,
    // Optimize CSS loading
    optimizeCss: true,
    // Enable partial pre-rendering (PPR)
    ppr: "incremental",
  },

  // Image optimization for memories/photos
  images: {
    formats: ["image/webp", "image/avif"],
    remotePatterns: [
      // External avatar / stock sources
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cloud.appwrite.io",
        pathname: "/v1/storage/buckets/*/files/*/view**",
      },
      {
        protocol: "https",
        hostname: "sys.cloud.appwrite.io",
        pathname: "/v1/storage/buckets/*/files/*/view**",
      },
      // Regional Appwrite endpoint (Sydney) – add preview, view, and download variants
      {
        protocol: "https",
        hostname: "syd.cloud.appwrite.io",
        pathname: "/v1/storage/buckets/*/files/*/preview**",
      },
      {
        protocol: "https",
        hostname: "syd.cloud.appwrite.io",
        pathname: "/v1/storage/buckets/*/files/*/view**",
      },
      {
        protocol: "https",
        hostname: "syd.cloud.appwrite.io",
        pathname: "/v1/storage/buckets/*/files/*/download**",
      },
      // Also allow preview & download for global endpoint
      {
        protocol: "https",
        hostname: "cloud.appwrite.io",
        pathname: "/v1/storage/buckets/*/files/*/preview**",
      },
      {
        protocol: "https",
        hostname: "cloud.appwrite.io",
        pathname: "/v1/storage/buckets/*/files/*/download**",
      },
      // Add your Appwrite endpoint if using self-hosted
      // {
      //   protocol: 'https',
      //   hostname: 'your-appwrite-endpoint.com',
      //   pathname: '/v1/storage/buckets/*/files/*/view**',
      // },
    ],
  },

  // Headers for PWA and security
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Security headers
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          // PWA headers
          {
            key: "X-UA-Compatible",
            value: "IE=edge",
          },
        ],
      },
      {
        // Cache static assets
        source: "/icons/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Service worker cache
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },

  // Webpack configuration for PWA assets
  webpack: (config) => {
    // Handle PWA manifest and service worker
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

// PWA Configuration
const pwaConfig = withPWA({
  dest: "public",
  disable: isDev, // Disable PWA in development
  register: true,
  reloadOnOnline: true,

  workboxOptions: {
    // Service Worker caching strategies
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "google-fonts",
          expiration: {
            maxEntries: 4,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 365 days
          },
        },
      },
      {
        urlPattern: /^https:\/\/cloud\.appwrite\.io\/.*/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "appwrite-api",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
        },
      },
      {
        urlPattern: /\/_next\/image\?.*$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "next-images",
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
          },
        },
      },
      {
        urlPattern: /\/api\/.*$/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-cache",
          networkTimeoutSeconds: 10,
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 5 * 60, // 5 minutes
          },
        },
      },
      {
        urlPattern: /.*\.(png|jpg|jpeg|svg|gif|webp|avif)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "static-images",
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
        },
      },
    ],
    // Skip waiting for new service worker
    skipWaiting: true,
    clientsClaim: true,
    // Clean up old caches
    cleanupOutdatedCaches: true,
  },
});

export default pwaConfig(nextConfig);
