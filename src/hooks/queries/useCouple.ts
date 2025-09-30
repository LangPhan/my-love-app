import {
  leaveCouple,
  regenerateInviteCode,
  updateAnniversaryDate,
} from "@/app/actions/couple";
import { getCoupleInfo } from "@/lib/appwrite";
import { useCoupleStore } from "@/stores";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Query Keys
export const coupleKeys = {
  all: ["couple"] as const,
  info: (userId: string) => [...coupleKeys.all, "info", userId] as const,
};

// Get Couple Info Query
export function useCoupleInfo(userId: string | null) {
  const { setCoupleInfo } = useCoupleStore();

  return useQuery({
    queryKey: coupleKeys.info(userId || ""),
    queryFn: async () => {
      if (!userId) return null;

      const result = await getCoupleInfo(userId);
      if (result.success && result.data) {
        setCoupleInfo(result.data);
        return result.data;
      }
      setCoupleInfo(null);
      return null;
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Regenerate Invite Code Mutation
export function useRegenerateInviteCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (coupleId: string) => {
      const result = await regenerateInviteCode(coupleId);
      if (!result.success) {
        throw new Error(result.error || "Failed to regenerate invite code");
      }
      return result;
    },
    onSuccess: (data, coupleId) => {
      // Update the couple info in cache
      queryClient.invalidateQueries({
        queryKey: coupleKeys.all,
      });
    },
  });
}

// Update Anniversary Date Mutation
export function useUpdateAnniversaryDate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      coupleId,
      date,
    }: {
      coupleId: string;
      date: string;
    }) => {
      const result = await updateAnniversaryDate(coupleId, date);
      if (!result.success) {
        throw new Error(result.error || "Failed to update anniversary date");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coupleKeys.all });
    },
  });
}

// Leave Couple Mutation
export function useLeaveCouple() {
  const queryClient = useQueryClient();
  const { clearCoupleInfo } = useCoupleStore();

  return useMutation({
    mutationFn: async (coupleId: string) => {
      const result = await leaveCouple(coupleId);
      if (result && !result.success) {
        throw new Error(result.error || "Failed to leave couple");
      }
      return result;
    },
    onSuccess: () => {
      clearCoupleInfo();
      queryClient.clear(); // Clear all data since user left couple
    },
  });
}
