import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-romantic border-pink-100 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-slate-800">
            <Settings className="mr-2 h-5 w-5 text-slate-600" />
            Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <Heart className="mx-auto mb-4 h-12 w-12 text-pink-500" />
            <h3 className="mb-2 text-lg font-semibold text-slate-900">
              Coming Soon
            </h3>
            <p className="text-slate-600">
              Customize your Love App experience and manage your profile.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
