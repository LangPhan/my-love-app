"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUploadMemory } from "@/hooks/queries/useMemories";
import { type MediaFile } from "@/lib/memories";
import { Models } from "appwrite";
import { FileText, Loader2, Upload, Video, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupleId: string;
  user: Models.User<Models.Preferences>;
  onUploadComplete: (memory: MediaFile) => void;
}

interface FilePreview {
  file: File;
  preview: string;
  type: "image" | "video" | "other";
}

export function UploadDialog({
  open,
  onOpenChange,
  coupleId,
  user,
  onUploadComplete,
}: UploadDialogProps) {
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMemoryMutation = useUploadMemory();

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: FilePreview[] = [];

    Array.from(selectedFiles).forEach((file) => {
      const preview = URL.createObjectURL(file);
      let type: "image" | "video" | "other" = "other";

      if (file.type.startsWith("image/")) {
        type = "image";
      } else if (file.type.startsWith("video/")) {
        type = "video";
      }

      newFiles.push({ file, preview, type });
    });

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    try {
      // Upload each file using the mutation
      const uploadPromises = files.map(async (filePreview) => {
        const metadata = {
          title: title || filePreview.file.name,
          description,
          tags: tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
          isPrivate: false,
        };

        return uploadMemoryMutation.mutateAsync({
          file: filePreview.file,
          coupleId,
          uploadedBy: user.$id,
          uploaderName: user.name,
          metadata,
        });
      });

      const uploadedMemories = await Promise.all(uploadPromises);

      // Call the completion callback for the first uploaded memory
      // (The mutation will handle cache updates automatically)
      if (uploadedMemories.length > 0) {
        onUploadComplete(uploadedMemories[0]);
      }

      // Reset form
      setFiles([]);
      setTitle("");
      setDescription("");
      setTags("");

      // Close dialog
      onOpenChange(false);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload memories. Please try again.");
    }
  };

  const resetForm = () => {
    files.forEach((file) => URL.revokeObjectURL(file.preview));
    setFiles([]);
    setTitle("");
    setDescription("");
    setTags("");
  };

  const handleClose = () => {
    if (!uploadMemoryMutation.isPending) {
      resetForm();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-pink-600" />
            Add New Memory
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload Area */}
          <div className="space-y-4">
            <Label>Select Files</Label>

            {files.length === 0 ? (
              <Card className="border-2 border-dashed border-pink-200 transition-colors hover:border-pink-300">
                <CardContent className="py-8">
                  <div
                    className="cursor-pointer text-center"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mx-auto mb-4 h-12 w-12 text-pink-400" />
                    <h3 className="mb-2 text-lg font-semibold text-slate-900">
                      Upload Your Memories
                    </h3>
                    <p className="mb-4 text-slate-600">
                      Select photos, videos, or other files to share
                    </p>
                    <Button variant="romantic" className="gap-2">
                      <Upload className="h-4 w-4" />
                      Choose Files
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {files.map((filePreview, index) => (
                    <Card key={index} className="relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 z-10 h-6 w-6 bg-black/50 text-white hover:bg-black/70"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>

                      <CardContent className="p-2">
                        <div className="aspect-square overflow-hidden rounded-lg bg-slate-100">
                          {filePreview.type === "image" ? (
                            <Image
                              src={filePreview.preview}
                              alt={filePreview.file.name}
                              width={200}
                              height={200}
                              className="h-full w-full object-cover"
                            />
                          ) : filePreview.type === "video" ? (
                            <div className="flex h-full w-full items-center justify-center bg-slate-900">
                              <Video className="h-8 w-8 text-white" />
                            </div>
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-slate-50">
                              <FileText className="h-8 w-8 text-slate-400" />
                            </div>
                          )}
                        </div>
                        <p className="mt-2 truncate text-xs text-slate-600">
                          {filePreview.file.name}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Add More Files
                </Button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </div>

          {/* Metadata Fields */}
          {files.length > 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title (Optional)</Label>
                <Input
                  id="title"
                  placeholder="Give your memory a title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Tell the story behind this memory..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (Optional)</Label>
                <Input
                  id="tags"
                  placeholder="vacation, anniversary, surprise (comma separated)"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
                <p className="text-xs text-slate-500">
                  Separate tags with commas to organize your memories
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={uploadMemoryMutation.isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="romantic"
              onClick={handleUpload}
              disabled={files.length === 0 || uploadMemoryMutation.isPending}
              className="flex-1 gap-2"
            >
              {uploadMemoryMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload {files.length}{" "}
                  {files.length === 1 ? "Memory" : "Memories"}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
