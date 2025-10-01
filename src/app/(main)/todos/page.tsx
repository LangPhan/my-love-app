/**
 * Todos Page - Client Component
 *
 * This page handles authentication and provides
 * real-time todo management functionality for couples.
 */

"use client";

import { TodoList } from "@/components/todos/TodoList";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCoupleInfo } from "@/hooks/queries/useCouple";
import { useAuth } from "@/hooks/useAuth";

export default function TodosPage() {
  const { user, loading: authLoading } = useAuth();

  const {
    data: coupleData,
    isLoading: coupleLoading,
    error: coupleError,
  } = useCoupleInfo(user?.$id || null);

  if (authLoading || coupleLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <Skeleton className="mb-2 h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 text-center">
                  <Skeleton className="mx-auto mb-2 h-8 w-12" />
                  <Skeleton className="mx-auto h-4 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>

          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-5 w-5 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (coupleError) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <h2 className="mb-2 text-lg font-semibold text-red-800">Error</h2>
            <p className="text-red-600">
              {coupleError instanceof Error
                ? coupleError.message
                : "Failed to load couple information"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!coupleData) {
    return null; // This shouldn't happen, but just in case
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">Todo List</h1>
        <p className="text-gray-600">
          Stay organized together! Manage your shared tasks and goals.
        </p>
        {coupleData.partnerName && (
          <p className="mt-1 text-sm text-gray-500">
            Shared with {coupleData.partnerName} • {coupleData.daysTogether}{" "}
            days together
          </p>
        )}
      </div>

      <TodoList coupleId={coupleData.couple.$id} className="w-full" />
    </div>
  );
}
