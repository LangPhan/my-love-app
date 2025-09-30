import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Love App - Authentication",
  description: "Sign in or create your account to start your love journey",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50">
      {children}
    </div>
  );
}
