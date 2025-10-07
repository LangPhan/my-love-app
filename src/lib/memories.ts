import { ID, ImageGravity, Permission, Query, Role } from "appwrite";
import {
  BUCKETS,
  COLLECTIONS,
  DATABASE_ID,
  databases,
  storage,
} from "./appwrite";
import type { ApiResponse } from "./types";

export interface MediaFile {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  coupleId: string;
  uploadedBy: string;
  uploaderName: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  title?: string;
  description?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  tags: string[];
  isPrivate: boolean;
  storageFileId: string;
  thumbnailId?: string;
  width?: number;
  height?: number;
  previewUrl?: string;
  downloadUrl?: string;
}

export interface MediaMetadata {
  title?: string;
  description?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  tags?: string[];
  isPrivate?: boolean;
}

/**
 * Generate a placeholder image URL based on memory title
 */
function getPlaceholderImageUrl(title: string): string {
  // Use a variety of romantic/couple themed images from Unsplash based on memory type
  const imageMap: Record<string, string> = {
    coffee:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop",
    beach:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop",
    cooking:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
    mountain:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    movie:
      "https://images.unsplash.com/photo-1489599751382-b6b3a16d2e99?w=400&h=300&fit=crop",
    first:
      "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=300&fit=crop",
  };

  const lowerTitle = title.toLowerCase();
  for (const [key, url] of Object.entries(imageMap)) {
    if (lowerTitle.includes(key)) {
      return url;
    }
  }

  // Default romantic couple image
  return "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop";
}

// Simple in-memory cache for storage file info to avoid repeated API calls
const storageFileInfoCache = new Map<string, any>();

/**
 * Get file information from Appwrite storage with caching
 */
async function getStorageFileInfo(fileId: string) {
  // Check cache first
  if (storageFileInfoCache.has(fileId)) {
    return storageFileInfoCache.get(fileId);
  }

  try {
    const file = await storage.getFile(BUCKETS.MEMORIES, fileId);
    const fileInfo = {
      name: file.name,
      mimeType: file.mimeType || "application/octet-stream", // fallback if mimeType is empty
      size: file.sizeOriginal,
    };

    // Cache for future use (cache for 5 minutes)
    storageFileInfoCache.set(fileId, fileInfo);
    setTimeout(
      () => {
        storageFileInfoCache.delete(fileId);
      },
      5 * 60 * 1000,
    );

    return fileInfo;
  } catch (error) {
    console.warn("Failed to get storage file info for:", fileId, error);
    // Cache null result to avoid repeated failed requests
    storageFileInfoCache.set(fileId, null);
    setTimeout(
      () => {
        storageFileInfoCache.delete(fileId);
      },
      1 * 60 * 1000,
    ); // Cache failures for 1 minute only

    return null;
  }
}

/**
 * Get all media files for a couple
 */
export async function listMedia(
  coupleId: string,
  limit: number = 50,
  offset: number = 0,
  orderBy: string = "$createdAt",
): Promise<ApiResponse<{ documents: MediaFile[]; total: number }>> {
  try {
    const queries = [
      Query.equal("coupleId", coupleId),
      Query.limit(limit),
      Query.offset(offset),
      Query.orderDesc(orderBy),
    ];

    const result = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.MEMORIES,
      queries,
    );

    // Get storage file info for all real files first
    const realFileIds: string[] = [];
    const fileIdToDocMap = new Map();

    result.documents.forEach((doc) => {
      const hasMediaFiles =
        doc.mediaFiles &&
        Array.isArray(doc.mediaFiles) &&
        doc.mediaFiles.length > 0;
      if (hasMediaFiles) {
        const fileId = doc.mediaFiles[0];
        const isRealFileId =
          fileId &&
          typeof fileId === "string" &&
          !fileId.includes(".") &&
          fileId.length > 10;
        if (isRealFileId) {
          realFileIds.push(fileId);
          fileIdToDocMap.set(fileId, doc);
        }
      }
    });

    // Batch get all storage file info (use allSettled to handle individual failures)
    const storageFileResults = await Promise.allSettled(
      realFileIds.map(async (fileId) => {
        const info = await getStorageFileInfo(fileId);
        return { fileId, info };
      }),
    );

    // Create a map for quick lookup
    const storageInfoMap = new Map();
    storageFileResults.forEach((result) => {
      if (result.status === "fulfilled" && result.value.info) {
        storageInfoMap.set(result.value.fileId, result.value.info);
      }
    });

    // Transform documents to match MediaFile interface
    const documentsWithUrls = result.documents.map((doc) => {
      // Handle the case where we have mediaFiles array (current schema)
      // vs storageFileId (expected schema)
      const hasMediaFiles =
        doc.mediaFiles &&
        Array.isArray(doc.mediaFiles) &&
        doc.mediaFiles.length > 0;

      let previewUrl: string;
      let downloadUrl: string;
      let fileName: string;
      let mimeType: string;
      let storageFileId: string;
      let fileSize: number = 0;

      if (hasMediaFiles) {
        const fileId = doc.mediaFiles[0];
        storageFileId = fileId;

        // Check if this looks like a real Appwrite file ID (not a fake filename)
        const isRealFileId =
          fileId &&
          typeof fileId === "string" &&
          !fileId.includes(".") &&
          fileId.length > 10;

        if (isRealFileId) {
          // This is a real uploaded file - get info from storage and generate URLs
          const storageFileInfo = storageInfoMap.get(fileId);

          try {
            previewUrl = storage
              .getFilePreview(
                BUCKETS.MEMORIES,
                fileId,
                800,
                600,
                ImageGravity.Center,
                85,
              )
              .toString();
            downloadUrl = storage
              .getFileDownload(BUCKETS.MEMORIES, fileId)
              .toString();
          } catch (error) {
            console.warn(
              "Failed to generate storage URLs for file:",
              fileId,
              error,
            );
            previewUrl = getPlaceholderImageUrl(doc.title || "Memory");
            downloadUrl = getPlaceholderImageUrl(doc.title || "Memory");
          }

          // Use storage file info if available, fallback to document title
          fileName = storageFileInfo?.name || doc.title || "uploaded-file";
          mimeType = storageFileInfo?.mimeType || "image/jpeg";
          fileSize = storageFileInfo?.size || 0;
        } else {
          // This is old placeholder data - use placeholder URLs
          previewUrl = getPlaceholderImageUrl(doc.title || "Memory");
          downloadUrl = getPlaceholderImageUrl(doc.title || "Memory");
          fileName = fileId;
          mimeType = fileId.endsWith(".mp4") ? "video/mp4" : "image/jpeg";
        }
      } else {
        // No media files - use placeholder
        previewUrl = getPlaceholderImageUrl(doc.title || "Memory");
        downloadUrl = getPlaceholderImageUrl(doc.title || "Memory");
        fileName = "placeholder.jpg";
        mimeType = "image/jpeg";
        storageFileId = "placeholder";
      }

      const mediaFile: MediaFile = {
        $id: doc.$id,
        $createdAt: doc.$createdAt,
        $updatedAt: doc.$updatedAt,
        coupleId: doc.coupleId,
        uploadedBy: "unknown", // This would come from actual upload data
        uploaderName: "User", // This would come from actual upload data
        fileName,
        fileSize,
        mimeType,
        title: doc.title,
        description: doc.description,
        tags: doc.tags || [],
        isPrivate: false,
        storageFileId,
        previewUrl,
        downloadUrl,
      };

      return mediaFile;
    });

    return {
      success: true,
      data: {
        documents: documentsWithUrls,
        total: result.total,
      },
    };
  } catch (error: any) {
    console.error("Error listing media:", error);
    return {
      success: false,
      error: error.message || "Failed to load media files",
    };
  }
}

/**
 * Upload a media file with metadata
 */
export async function uploadMedia(
  file: File,
  coupleId: string,
  uploadedBy: string,
  uploaderName: string,
  metadata: MediaMetadata = {},
): Promise<ApiResponse<MediaFile>> {
  try {
    // First, upload the file to Appwrite Storage
    const fileId = ID.unique();
    const uploadResult = await storage.createFile(
      BUCKETS.MEMORIES,
      fileId,
      file,
      [
        Permission.read(Role.any()), // Allow reading for preview generation
        Permission.update(Role.user(uploadedBy)),
        Permission.delete(Role.user(uploadedBy)),
      ],
    );

    if (!uploadResult) {
      throw new Error("Failed to upload file to storage");
    }

    // Create thumbnail for images
    let thumbnailId: string | undefined;
    if (file.type.startsWith("image/")) {
      try {
        // For images, we can use the same file for thumbnail
        // Appwrite will generate different sizes via getFilePreview
        thumbnailId = fileId;
      } catch (error) {
        console.warn("Failed to create thumbnail:", error);
      }
    }

    // Get image dimensions if it's an image
    let width: number | undefined;
    let height: number | undefined;
    if (file.type.startsWith("image/")) {
      try {
        const dimensions = await getImageDimensions(file);
        width = dimensions.width;
        height = dimensions.height;
      } catch (error) {
        console.warn("Failed to get image dimensions:", error);
      }
    }

    // Create the media document in the database
    // Note: Using the actual database schema structure
    const mediaDoc = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.MEMORIES,
      ID.unique(),
      {
        coupleId,
        title: metadata.title || file.name,
        description: metadata.description || "",
        mediaFiles: [fileId], // Store the storage file ID in the mediaFiles array
        memoryDate: new Date().toISOString(), // Required field - current date/time
        location: metadata.location?.address || "", // Simple string location
        tags: metadata.tags || [],
      },
      [
        Permission.read(Role.user(uploadedBy)),
        Permission.update(Role.user(uploadedBy)),
        Permission.delete(Role.user(uploadedBy)),
      ],
    );

    // Generate URLs
    const previewUrl = storage.getFilePreview(
      BUCKETS.MEMORIES,
      fileId,
      800,
      600,
      ImageGravity.Center,
      85,
    );

    const downloadUrl = storage.getFileDownload(BUCKETS.MEMORIES, fileId);

    // Transform database document to MediaFile interface
    const result: MediaFile = {
      $id: mediaDoc.$id,
      $createdAt: mediaDoc.$createdAt,
      $updatedAt: mediaDoc.$updatedAt,
      coupleId: mediaDoc.coupleId as string,
      uploadedBy: uploadedBy,
      uploaderName: uploaderName,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      title: mediaDoc.title as string,
      description: mediaDoc.description as string,
      location: mediaDoc.location
        ? {
            latitude: 0,
            longitude: 0,
            address: mediaDoc.location as string,
          }
        : undefined,
      tags: mediaDoc.tags as string[],
      isPrivate: metadata.isPrivate || false,
      storageFileId: fileId,
      thumbnailId,
      width,
      height,
      previewUrl: previewUrl.toString(),
      downloadUrl: downloadUrl.toString(),
    };

    return {
      success: true,
      data: result,
      message: "Media uploaded successfully",
    };
  } catch (error: any) {
    console.error("Error uploading media:", error);
    return {
      success: false,
      error: error.message || "Failed to upload media",
    };
  }
}

/**
 * Delete a media file
 */
export async function deleteMedia(
  mediaId: string,
  storageFileId: string,
): Promise<ApiResponse<void>> {
  try {
    // Delete from storage first
    await storage.deleteFile(BUCKETS.MEMORIES, storageFileId);

    // Then delete the database document
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.MEMORIES, mediaId);

    return {
      success: true,
      message: "Media deleted successfully",
    };
  } catch (error: any) {
    console.error("Error deleting media:", error);
    return {
      success: false,
      error: error.message || "Failed to delete media",
    };
  }
}

/**
 * Update media metadata
 */
export async function updateMediaMetadata(
  mediaId: string,
  metadata: Partial<MediaMetadata>,
): Promise<ApiResponse<MediaFile>> {
  try {
    const updatedDoc = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.MEMORIES,
      mediaId,
      {
        title: metadata.title,
        description: metadata.description,
        location: metadata.location,
        tags: metadata.tags,
        isPrivate: metadata.isPrivate,
      },
    );

    return {
      success: true,
      data: updatedDoc as unknown as MediaFile,
      message: "Media updated successfully",
    };
  } catch (error: any) {
    console.error("Error updating media metadata:", error);
    return {
      success: false,
      error: error.message || "Failed to update media",
    };
  }
}

/**
 * Get media files by date range
 */
export async function getMediaByDateRange(
  coupleId: string,
  startDate: string,
  endDate: string,
): Promise<ApiResponse<MediaFile[]>> {
  try {
    const queries = [
      Query.equal("coupleId", coupleId),
      Query.greaterThanEqual("$createdAt", startDate),
      Query.lessThanEqual("$createdAt", endDate),
      Query.orderDesc("$createdAt"),
    ];

    const result = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.MEMORIES,
      queries,
    );

    // Generate signed URLs
    const documentsWithUrls = await Promise.all(
      result.documents.map(async (doc) => {
        const previewUrl = storage.getFilePreview(
          BUCKETS.MEMORIES,
          doc.storageFileId,
          800,
          600,
          ImageGravity.Center,
          85,
        );

        const downloadUrl = storage.getFileDownload(
          BUCKETS.MEMORIES,
          doc.storageFileId,
        );

        return {
          ...doc,
          previewUrl: previewUrl.toString(),
          downloadUrl: downloadUrl.toString(),
        } as unknown as MediaFile;
      }),
    );

    return {
      success: true,
      data: documentsWithUrls,
    };
  } catch (error: any) {
    console.error("Error getting media by date range:", error);
    return {
      success: false,
      error: error.message || "Failed to load media",
    };
  }
}

/**
 * Helper function to get image dimensions
 */
function getImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
