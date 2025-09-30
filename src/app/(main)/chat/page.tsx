import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, MessageCircle } from "lucide-react";

export default function ChatPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-romantic border-pink-100 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-slate-800">
            <MessageCircle className="mr-2 h-5 w-5 text-rose-600" />
            Chat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <Heart className="mx-auto mb-4 h-12 w-12 text-pink-500" />
            <h3 className="mb-2 text-lg font-semibold text-slate-900">
              Coming Soon
            </h3>
            <p className="text-slate-600">
              Chat feature will be available soon to help you stay connected
              with your partner.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
