"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateUserName, useUpdateUserPrefs } from "@/hooks/queries/useAuth";
import { BUCKETS, storage } from "@/lib/appwrite";
import { ID, Models } from "appwrite";
import { Camera, Loader2, User } from "lucide-react";
import { useRef, useState } from "react";

interface ProfileFormProps {
  user: Models.User<Models.Preferences>;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(user.name || "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFileId, setAvatarFileId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateNameMutation = useUpdateUserName();
  const updatePrefsMutation = useUpdateUserPrefs();

  // Get current avatar URL from storage if available
  const currentAvatarUrl = (user.prefs as any)?.avatarFileId
    ? storage
        .getFilePreview(
          BUCKETS.AVATARS,
          (user.prefs as any).avatarFileId,
          200,
          200,
        )
        .toString()
    : null;

  const handleAvatarUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    setIsUploading(true);
    try {
      // Upload to Appwrite Storage
      const fileId = ID.unique();
      const uploadResult = await storage.createFile(
        BUCKETS.AVATARS,
        fileId,
        file,
      );

      if (uploadResult) {
        // Generate preview URL
        const previewUrl = storage
          .getFilePreview(BUCKETS.AVATARS, fileId, 200, 200)
          .toString();

        setAvatarUrl(previewUrl);
        setAvatarFileId(fileId);
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert("Failed to upload avatar. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleAvatarUpload(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Update display name if changed
      if (displayName.trim() !== user.name) {
        await updateNameMutation.mutateAsync(displayName.trim());
      }

      // Update avatar if a new one was uploaded
      if (avatarFileId) {
        const currentPrefs = user.prefs || {};
        await updatePrefsMutation.mutateAsync({
          ...currentPrefs,
          avatarFileId,
        });
      }

      alert("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      alert(error.message || "Failed to update profile. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={avatarUrl || currentAvatarUrl || undefined}
              alt={displayName || "User"}
            />
            <AvatarFallback className="bg-pink-100 text-pink-600">
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>

          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div>
            <h3 className="text-sm font-medium text-slate-900">
              Profile Photo
            </h3>
            <p className="text-xs text-slate-600">
              Upload a photo to personalize your profile
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="gap-2"
          >
            <Camera className="h-4 w-4" />
            {isUploading ? "Uploading..." : "Change Photo"}
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>

      {/* Name Section */}
      <div className="space-y-2">
        <Label htmlFor="displayName">Display Name</Label>
        <Input
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Enter your display name"
          className="max-w-md"
        />
        <p className="text-xs text-slate-600">
          This is the name your partner will see
        </p>
      </div>

      {/* Email (Read-only) */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          value={user.email}
          disabled
          className="max-w-md bg-slate-50"
        />
        <p className="text-xs text-slate-600">
          Your email address cannot be changed
        </p>
      </div>

      {/* Save Button */}
      <div className="pt-4">
        <Button
          onClick={handleSaveProfile}
          disabled={
            updateNameMutation.isPending ||
            updatePrefsMutation.isPending ||
            displayName.trim() === ""
          }
          className="gap-2"
        >
          {(updateNameMutation.isPending || updatePrefsMutation.isPending) && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
          {updateNameMutation.isPending || updatePrefsMutation.isPending
            ? "Saving..."
            : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
