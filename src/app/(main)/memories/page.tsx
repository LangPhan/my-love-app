"use client";

import { GalleryGrid } from "@/components/GalleryGrid";
import { TimelineView } from "@/components/TimelineView";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadDialog } from "@/components/UploadDialog";
import { useAuth } from "@/hooks/useAuth";
import { getCoupleInfo } from "@/lib/appwrite";
import { listMedia, type MediaFile } from "@/lib/memories";
import { Camera, Clock, Grid3X3, Heart, Plus, Upload } from "lucide-react";
import { useEffect, useState } from "react";

export default function MemoriesPage() {
  const { user, loading } = useAuth();
  const [memories, setMemories] = useState<MediaFile[]>([]);
  const [coupleId, setCoupleId] = useState<string | null>(null);
  const [memoriesLoading, setMemoriesLoading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("grid");

  // Get couple info and load memories
  useEffect(() => {
    async function loadMemories() {
      if (!user) return;

      try {
        // Get couple information
        const coupleResult = await getCoupleInfo(user.$id);
        if (!coupleResult.success || !coupleResult.data.couple) {
          return;
        }

        setCoupleId(coupleResult.data.couple.$id);
        setMemoriesLoading(true);

        // Load memories
        const memoriesResult = await listMedia(coupleResult.data.couple.$id);
        if (memoriesResult.success && memoriesResult.data) {
          setMemories(memoriesResult.data.documents);
        }
      } catch (error) {
        console.error("Error loading memories:", error);
      } finally {
        setMemoriesLoading(false);
      }
    }

    loadMemories();
  }, [user]);

  const handleUploadComplete = (newMemory: MediaFile) => {
    setMemories((prev) => [newMemory, ...prev]);
    setUploadDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-8 text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-pink-600"></div>
            <p className="text-slate-600">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-8 text-center">
            <Heart className="mx-auto mb-4 h-12 w-12 text-pink-500" />
            <h3 className="mb-2 text-lg font-semibold text-slate-900">
              Authentication Required
            </h3>
            <p className="text-slate-600">
              Please log in to view your memories.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!coupleId) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-8 text-center">
            <Camera className="mx-auto mb-4 h-12 w-12 text-pink-500" />
            <h3 className="mb-2 text-lg font-semibold text-slate-900">
              Connect with Your Partner
            </h3>
            <p className="text-slate-600">
              You need to be connected with your partner to share memories.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-romantic border-pink-100 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-slate-800">
              <Camera className="text-lavender-600 mr-2 h-5 w-5" />
              Memories
            </CardTitle>
            <Button
              variant="romantic"
              size="sm"
              onClick={() => setUploadDialogOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Memory
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Content */}
      {memoriesLoading ? (
        <Card>
          <CardContent className="py-8 text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-pink-600"></div>
            <p className="text-slate-600">Loading your memories...</p>
          </CardContent>
        </Card>
      ) : memories.length === 0 ? (
        <Card className="to-lavender-50 border-pink-200 bg-gradient-to-br from-pink-50">
          <CardContent className="py-12 text-center">
            <Camera className="mx-auto mb-4 h-16 w-16 text-pink-400" />
            <h3 className="mb-2 text-xl font-semibold text-slate-900">
              No Memories Yet
            </h3>
            <p className="mb-6 text-slate-600">
              Start capturing your precious moments together
            </p>
            <Button
              variant="romantic"
              onClick={() => setUploadDialogOpen(true)}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Your First Memory
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="grid" className="gap-2">
              <Grid3X3 className="h-4 w-4" />
              Grid
            </TabsTrigger>
            <TabsTrigger value="timeline" className="gap-2">
              <Clock className="h-4 w-4" />
              Timeline
            </TabsTrigger>
          </TabsList>

          <TabsContent value="grid" className="mt-6">
            <GalleryGrid memories={memories} />
          </TabsContent>

          <TabsContent value="timeline" className="mt-6">
            <TimelineView memories={memories} />
          </TabsContent>
        </Tabs>
      )}

      {/* Upload Dialog */}
      <UploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        coupleId={coupleId}
        user={user}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
}
