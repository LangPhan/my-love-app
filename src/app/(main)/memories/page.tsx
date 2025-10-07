"use client";

import { InfiniteGalleryGrid } from "@/components/InfiniteGalleryGrid";
import { TimelineView } from "@/components/TimelineView";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadDialog } from "@/components/UploadDialog";
import { useCurrentUser } from "@/hooks/queries/useAuth";
import { useCoupleInfo } from "@/hooks/queries/useCouple";
import {
  useAllInfiniteMemories,
  useUploadInfiniteMemory,
} from "@/hooks/queries/useInfiniteMemories";
import { type MediaFile } from "@/lib/memories";
import { Camera, Clock, Grid3X3, Heart, Plus, Upload } from "lucide-react";
import { useState } from "react";

export default function MemoriesPage() {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { data: coupleInfo } = useCoupleInfo(user?.$id || null);
  const coupleId = coupleInfo?.couple?.$id || null;

  const {
    memories,
    total,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: memoriesLoading,
    error: memoriesError,
  } = useAllInfiniteMemories(coupleId);

  const uploadMemoryMutation = useUploadInfiniteMemory();
  console.log({ memories, total });

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("grid");

  const handleUploadComplete = (newMemory: MediaFile) => {
    console.log("handleUploadComplete called with:", newMemory);
    setUploadDialogOpen(false);
    // The mutation automatically updates the cache via onSuccess
  };

  if (userLoading || memoriesLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <Card className="shadow-romantic border-pink-100 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <Skeleton className="mx-auto mb-2 h-8 w-8 rounded-full" />
            <Skeleton className="mx-auto mb-2 h-6 w-32" />
            <Skeleton className="mx-auto h-4 w-48" />
          </CardHeader>
        </Card>

        {/* Tabs skeleton */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-6 flex gap-2">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-24" />
            </div>

            {/* Gallery grid skeleton */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
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
            {memoriesError && (
              <div className="mt-4 rounded-lg bg-red-50 p-3">
                <p className="text-sm text-red-600">
                  Error: {memoriesError.message}
                </p>
              </div>
            )}
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
              variant="default"
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
            <InfiniteGalleryGrid
              memories={memories}
              onLoadMore={() => fetchNextPage()}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
            />
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
        uploadMutation={uploadMemoryMutation}
      />
    </div>
  );
}
