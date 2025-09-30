# Copilot Project Instructions

## General

- This project is a **Progressive Web App (PWA)** built with **Next.js 15 (App Router)**.
- Use **TypeScript** for all code.
- Use **ESM imports** (no `require`).
- Follow **functional programming** style and keep components stateless when possible.

## UI

- Use **ShadcnUI** for UI components.
- Use **TailwindCSS v4** with the custom romantic pastel color palette (rose, pink, lavender, mint, sky, cream, slate, dark).
- Prefer **rounded-xl / rounded-2xl** corners, **shadow-sm**, and soft color contrasts.
- Use **lucide-react** for icons.
- Always write mobile-first, responsive UI.

## Structure

- Place all routes in `/app` using Next.js App Router.
- Keep shared UI in `/components`.
- Use `/hooks` for reusable logic (e.g. `useAuth`, `useRealtime`).
- Use `/lib` for utilities (e.g. Appwrite client).

## State & Data

- Use **Appwrite** as backend for:
  - Authentication
  - Database (messages, todos, memories)
  - File storage (images, videos)
  - Realtime subscriptions
- Encapsulate Appwrite API calls in `/lib/appwrite.ts`.
- For async data, prefer **Server Components** + `server actions` when possible, fallback to **React Query** (client).

## Code Style

- Use **async/await**, never `.then()`.
- Use **named exports** unless component is default page.
- All components should be typed with `React.FC<Props>` or inline props types.
- Use **strict typing** (no `any`).
- Keep files small and focused (max ~200 lines per component).

## Pages / Features

- `/auth` → login/register, couple invite.
- `/chat` → realtime messages.
- `/memories` → timeline & album (gallery).
- `/todos` → shared todo list.
- `/settings` → profile, theme switch, notifications.

## PWA

- Configure with `@ducanh2912/next-pwa` for offline cache & service worker.
- Enable push notifications (Web Push with Appwrite + VAPID).
- Provide `manifest.json` and app icons.

---
