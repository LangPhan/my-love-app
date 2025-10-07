import {
  deleteMedia,
  listMedia,
  updateMediaMetadata,
  uploadMedia,
  type MediaFile,
  type MediaMetadata,
} from "@/lib/memories";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

// Query Keys
export const infiniteMemoriesKeys = {
  all: ["infinite-memories"] as const,
  lists: () => [...infiniteMemoriesKeys.all, "list"] as const,
  list: (coupleId: string, filters?: any) =>
    [...infiniteMemoriesKeys.lists(), coupleId, filters] as const,
};

// Infinite Memories Query
export function useInfiniteMemories(
  coupleId: string | null,
  options?: {
    limit?: number;
    orderBy?: string;
  },
) {
  const limit = options?.limit || 20; // Số lượng items mỗi lần tải

  return useInfiniteQuery({
    queryKey: infiniteMemoriesKeys.list(coupleId || "", options),
    queryFn: async ({ pageParam = 0 }) => {
      if (!coupleId) return { documents: [], total: 0, hasMore: false };

      const result = await listMedia(
        coupleId,
        limit,
        pageParam * limit, // offset = pageParam * limit
        options?.orderBy,
      );

      if (result.success && result.data) {
        const hasMore = result.data.documents.length === limit;
        return {
          documents: result.data.documents,
          total: result.data.total,
          hasMore,
          nextPage: hasMore ? pageParam + 1 : undefined,
        };
      }

      throw new Error(result.error || "Failed to load memories");
    },
    enabled: !!coupleId,
    staleTime: 60 * 1000, // 1 minute
    getNextPageParam: (lastPage) => lastPage?.nextPage,
    initialPageParam: 0,
  });
}

// Hook để lấy tất cả memories từ infinite query (flattened)
export function useAllInfiniteMemories(coupleId: string | null) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteMemories(coupleId, undefined); // Explicitly pass undefined for options

  // Flatten tất cả pages thành một array duy nhất
  const allMemories: MediaFile[] =
    data?.pages.flatMap((page) => page.documents) || [];

  return {
    memories: allMemories,
    total: data?.pages[0]?.total || 0,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  };
}

// Upload Memory Mutation cho Infinite Memories
export function useUploadInfiniteMemory() {
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
      console.log("useUploadInfiniteMemory: onSuccess", {
        newMemory,
        coupleId: variables.coupleId,
      });

      // Update the infinite memories cache
      queryClient.setQueryData(
        infiniteMemoriesKeys.list(variables.coupleId, undefined),
        (oldData: any) => {
          if (!oldData || !oldData.pages || oldData.pages.length === 0) {
            return {
              pages: [
                {
                  documents: [newMemory],
                  total: 1,
                  hasMore: false,
                  nextPage: undefined,
                },
              ],
              pageParams: [0],
            };
          }

          // Add new memory to the first page
          const updatedPages = [...oldData.pages];
          updatedPages[0] = {
            ...updatedPages[0],
            documents: [newMemory, ...updatedPages[0].documents],
            total: updatedPages[0].total + 1,
          };

          return {
            ...oldData,
            pages: updatedPages,
          };
        },
      );

      // Invalidate all infinite memories queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: infiniteMemoriesKeys.all });

      // Also refetch the specific query to ensure immediate update
      queryClient.refetchQueries({
        queryKey: infiniteMemoriesKeys.list(variables.coupleId, undefined),
        exact: true,
      });
    },
  });
}

// Delete Memory Mutation cho Infinite Memories
export function useDeleteInfiniteMemory() {
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
      console.log("useDeleteInfiniteMemory: onSuccess", {
        mediaId: variables.mediaId,
      });

      // Remove the memory from infinite cache
      queryClient.setQueryData(
        infiniteMemoriesKeys.list(variables.coupleId, undefined),
        (oldData: any) => {
          if (!oldData || !oldData.pages) return oldData;

          const updatedPages = oldData.pages.map((page: any) => ({
            ...page,
            documents: page.documents.filter(
              (memory: MediaFile) => memory.$id !== variables.mediaId,
            ),
            total: Math.max(0, page.total - 1),
          }));

          return {
            ...oldData,
            pages: updatedPages,
          };
        },
      );

      // Invalidate all infinite memories queries
      queryClient.invalidateQueries({ queryKey: infiniteMemoriesKeys.all });

      // Also refetch to ensure consistency
      queryClient.refetchQueries({
        queryKey: infiniteMemoriesKeys.list(variables.coupleId, undefined),
        exact: true,
      });
    },
  });
}

// Edit Memory Mutation cho Infinite Memories
export function useEditInfiniteMemory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      mediaId,
      data,
      coupleId,
    }: {
      mediaId: string;
      data: { title: string; description: string };
      coupleId: string;
    }) => {
      const result = await updateMediaMetadata(mediaId, {
        title: data.title,
        description: data.description,
      });
      if (!result.success) {
        throw new Error(result.error || "Failed to update memory");
      }
      return result.data;
    },
    onSuccess: (updatedMemory, variables) => {
      console.log("useEditInfiniteMemory: onSuccess", {
        mediaId: variables.mediaId,
      });

      // Update the memory in infinite cache
      queryClient.setQueryData(
        infiniteMemoriesKeys.list(variables.coupleId, undefined),
        (oldData: any) => {
          if (!oldData || !oldData.pages) return oldData;

          const updatedPages = oldData.pages.map((page: any) => ({
            ...page,
            documents: page.documents.map((memory: MediaFile) =>
              memory.$id === variables.mediaId
                ? {
                    ...memory,
                    title: variables.data.title,
                    description: variables.data.description,
                  }
                : memory,
            ),
          }));

          return {
            ...oldData,
            pages: updatedPages,
          };
        },
      );

      // Invalidate all infinite memories queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: infiniteMemoriesKeys.all });
    },
  });
}
