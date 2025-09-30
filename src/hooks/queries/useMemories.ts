import {
  deleteMedia,
  listMedia,
  uploadMedia,
  type MediaFile,
  type MediaMetadata,
} from "@/lib/memories";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Query Keys
export const memoriesKeys = {
  all: ["memories"] as const,
  lists: () => [...memoriesKeys.all, "list"] as const,
  list: (coupleId: string, filters?: any) =>
    [...memoriesKeys.lists(), coupleId, filters] as const,
  details: () => [...memoriesKeys.all, "detail"] as const,
  detail: (id: string) => [...memoriesKeys.details(), id] as const,
};

// List Memories Query
export function useMemories(
  coupleId: string | null,
  options?: {
    limit?: number;
    offset?: number;
    orderBy?: string;
  },
) {
  return useQuery({
    queryKey: memoriesKeys.list(coupleId || "", options),
    queryFn: async () => {
      if (!coupleId) return { documents: [], total: 0 };

      const result = await listMedia(
        coupleId,
        options?.limit,
        options?.offset,
        options?.orderBy,
      );

      if (result.success && result.data) {
        return result.data;
      }

      throw new Error(result.error || "Failed to load memories");
    },
    enabled: !!coupleId,
    staleTime: 60 * 1000, // 1 minute
  });
}

// Upload Memory Mutation
export function useUploadMemory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      coupleId,
      uploadedBy,
      uploaderName,
      metadata,
    }: {
      file: File;
      coupleId: string;
      uploadedBy: string;
      uploaderName: string;
      metadata?: MediaMetadata;
    }) => {
      const result = await uploadMedia(
        file,
        coupleId,
        uploadedBy,
        uploaderName,
        metadata,
      );

      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to upload memory");
      }

      return result.data;
    },
    onSuccess: (newMemory, variables) => {
      // Update the memories list in cache
      queryClient.setQueryData(
        memoriesKeys.list(variables.coupleId),
        (oldData: any) => {
          if (!oldData) return { documents: [newMemory], total: 1 };
          return {
            ...oldData,
            documents: [newMemory, ...oldData.documents],
            total: oldData.total + 1,
          };
        },
      );

      // Invalidate all memories queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: memoriesKeys.all });
    },
  });
}

// Delete Memory Mutation
export function useDeleteMemory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      mediaId,
      storageFileId,
      coupleId,
    }: {
      mediaId: string;
      storageFileId: string;
      coupleId: string;
    }) => {
      const result = await deleteMedia(mediaId, storageFileId);
      if (!result.success) {
        throw new Error(result.error || "Failed to delete memory");
      }
      return result;
    },
    onSuccess: (_, variables) => {
      // Remove the memory from cache
      queryClient.setQueryData(
        memoriesKeys.list(variables.coupleId),
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            documents: oldData.documents.filter(
              (memory: MediaFile) => memory.$id !== variables.mediaId,
            ),
            total: Math.max(0, oldData.total - 1),
          };
        },
      );

      // Invalidate memories queries
      queryClient.invalidateQueries({ queryKey: memoriesKeys.all });
    },
  });
}
