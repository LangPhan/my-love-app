"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { type MediaFile } from "@/lib/memories";
import { Download, FileText, Play, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";

interface GalleryGridProps {
  memories: MediaFile[];
}

interface LightboxProps {
  memory: MediaFile;
  isOpen: boolean;
  onClose: () => void;
}

function Lightbox({ memory, isOpen, onClose }: LightboxProps) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl bg-black/95 p-0">
        <DialogTitle className="sr-only">
          {memory.title || memory.fileName || "Memory"}
        </DialogTitle>
        <div className="relative flex h-full w-full items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>

          {memory.mimeType?.startsWith("image/") ? (
            <div className="relative flex h-full w-full items-center justify-center">
              <Image
                src={
                  memory.previewUrl || memory.downloadUrl || "/placeholder.png"
                }
                alt={memory.title || memory.fileName}
                width={memory.width || 800}
                height={memory.height || 600}
                className="max-h-full max-w-full object-contain"
                priority
              />
            </div>
          ) : memory.mimeType?.startsWith("video/") ? (
            <video
              controls
              className="max-h-full max-w-full"
              src={memory.downloadUrl}
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="p-8 text-center text-white">
              <FileText className="mx-auto mb-4 h-16 w-16" />
              <h3 className="mb-2 text-xl font-semibold">{memory.title}</h3>
              <p className="mb-4 text-gray-300">{memory.fileName}</p>
              <a
                href={memory.downloadUrl}
                download={memory.fileName}
                className="inline-flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 transition-colors hover:bg-white/30"
              >
                <Download className="h-4 w-4" />
                Download
              </a>
            </div>
          )}

          {memory.title && (
            <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <h3 className="text-lg font-semibold text-white">
                {memory.title}
              </h3>
              {memory.description && (
                <p className="mt-1 text-sm text-gray-300">
                  {memory.description}
                </p>
              )}
              <p className="mt-2 text-xs text-gray-400">
                {new Date(memory.$createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function GalleryGrid({ memories }: GalleryGridProps) {
  const [selectedMemory, setSelectedMemory] = useState<MediaFile | null>(null);

  const handleImageClick = useCallback((memory: MediaFile) => {
    setSelectedMemory(memory);
  }, []);

  const closeLightbox = useCallback(() => {
    setSelectedMemory(null);
  }, []);

  if (memories.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-600">No memories to display</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {memories.map((memory) => (
          <Card
            key={memory.$id}
            className="cursor-pointer overflow-hidden border-pink-100 transition-shadow hover:shadow-lg"
            onClick={() => handleImageClick(memory)}
          >
            <div className="relative aspect-square bg-gray-100">
              {memory.mimeType?.startsWith("image/") ? (
                <Image
                  src={
                    memory.previewUrl ||
                    memory.downloadUrl ||
                    "/placeholder.png"
                  }
                  alt={memory.title || memory.fileName}
                  fill
                  className="object-cover transition-transform duration-200 hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 33vw"
                  loading="lazy"
                />
              ) : memory.mimeType?.startsWith("video/") ? (
                <div className="flex h-full w-full items-center justify-center bg-slate-900">
                  <Play className="h-12 w-12 text-white" />
                  <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-1 text-xs text-white">
                    VIDEO
                  </div>
                </div>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-50">
                  <FileText className="h-12 w-12 text-slate-400" />
                  <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-1 text-xs text-white">
                    FILE
                  </div>
                </div>
              )}

              {memory.title && (
                <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="truncate text-xs font-medium text-white">
                    {memory.title}
                  </p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Lightbox */}
      {selectedMemory && (
        <Lightbox
          memory={selectedMemory}
          isOpen={!!selectedMemory}
          onClose={closeLightbox}
        />
      )}
    </>
  );
}
