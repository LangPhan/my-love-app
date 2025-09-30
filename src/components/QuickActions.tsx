"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Camera,
  CheckSquare,
  Gift,
  Heart,
  MapPin,
  MessageCircle,
  Plus,
} from "lucide-react";
import Link from "next/link";

const quickActions = [
  {
    name: "Send Message",
    href: "/chat",
    icon: MessageCircle,
    color:
      "bg-gradient-to-br from-rose-100 to-pink-100 hover:from-rose-200 hover:to-pink-200",
    iconColor: "text-rose-600",
    description: "Send a sweet message",
  },
  {
    name: "Add Memory",
    href: "/memories/new",
    icon: Camera,
    color:
      "bg-gradient-to-br from-lavender-100 to-purple-100 hover:from-lavender-200 hover:to-purple-200",
    iconColor: "text-lavender-600",
    description: "Capture this moment",
  },
  {
    name: "Add Todo",
    href: "/todos/new",
    icon: Plus,
    color:
      "bg-gradient-to-br from-mint-100 to-green-100 hover:from-mint-200 hover:to-green-200",
    iconColor: "text-mint-600",
    description: "Plan something together",
  },
  {
    name: "Send Love",
    href: "/love-notes",
    icon: Heart,
    color:
      "bg-gradient-to-br from-pink-100 to-rose-100 hover:from-pink-200 hover:to-rose-200",
    iconColor: "text-pink-600",
    description: "Share your feelings",
  },
];

const extraActions = [
  {
    name: "Gift Ideas",
    href: "/gifts",
    icon: Gift,
    iconColor: "text-yellow-600",
  },
  {
    name: "Date Places",
    href: "/places",
    icon: MapPin,
    iconColor: "text-blue-600",
  },
  {
    name: "View Todos",
    href: "/todos",
    icon: CheckSquare,
    iconColor: "text-mint-600",
  },
];

export function QuickActions() {
  return (
    <div className="space-y-6">
      {/* Main Quick Actions */}
      <Card className="shadow-romantic border-pink-100 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.name} href={action.href}>
                  <Button
                    variant="ghost"
                    className={`flex h-auto w-full flex-col items-center space-y-2 p-4 ${action.color} rounded-xl border-0 transition-all duration-200 hover:scale-105`}
                  >
                    <Icon className={`h-6 w-6 ${action.iconColor}`} />
                    <div className="text-center">
                      <div className="text-sm font-medium text-slate-800">
                        {action.name}
                      </div>
                      <div className="mt-1 text-xs text-slate-600">
                        {action.description}
                      </div>
                    </div>
                  </Button>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Additional Actions */}
      <Card className="border-slate-200 bg-white/60 shadow-sm backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex justify-around">
            {extraActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.name} href={action.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex h-auto flex-col items-center space-y-1 rounded-xl px-2 py-3 hover:bg-slate-100"
                  >
                    <Icon className={`h-5 w-5 ${action.iconColor}`} />
                    <span className="text-xs font-medium text-slate-600">
                      {action.name}
                    </span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
