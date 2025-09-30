"use client";

import { Card, CardContent } from "@/components/ui/card";
import { type MediaFile } from "@/lib/memories";
import { Calendar, FileText, Play } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";

interface TimelineViewProps {
  memories: MediaFile[];
}

interface GroupedMemories {
  [date: string]: MediaFile[];
}

export function TimelineView({ memories }: TimelineViewProps) {
  // Group memories by date
  const groupedMemories = useMemo(() => {
    const groups: GroupedMemories = {};

    memories.forEach((memory) => {
      const date = new Date(memory.$createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(memory);
    });

    return groups;
  }, [memories]);

  const dates = Object.keys(groupedMemories).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );

  if (memories.length === 0) {
    return (
      <div className="py-12 text-center">
        <Calendar className="mx-auto mb-4 h-12 w-12 text-slate-400" />
        <p className="text-slate-600">No memories to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {dates.map((date) => {
        const dateMemories = groupedMemories[date];
        const formattedDate = new Date(date).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        return (
          <div key={date} className="relative">
            {/* Date Header */}
            <div className="sticky top-20 z-10 mb-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white/90 px-4 py-2 shadow-sm backdrop-blur-sm">
                <Calendar className="h-4 w-4 text-pink-600" />
                <span className="text-sm font-medium text-slate-800">
                  {formattedDate}
                </span>
                <span className="rounded-full bg-pink-100 px-2 py-1 text-xs text-slate-500">
                  {dateMemories.length}{" "}
                  {dateMemories.length === 1 ? "memory" : "memories"}
                </span>
              </div>
            </div>

            {/* Timeline Line */}
            <div className="absolute top-16 bottom-0 left-4 w-0.5 bg-gradient-to-b from-pink-200 to-transparent"></div>

            {/* Memories */}
            <div className="space-y-6 pl-10">
              {dateMemories.map((memory, index) => (
                <div key={memory.$id} className="relative">
                  {/* Timeline Dot */}
                  <div className="absolute top-3 -left-6 h-3 w-3 rounded-full border-2 border-white bg-pink-400 shadow-sm"></div>

                  <Card className="shadow-romantic border-pink-100 bg-white/80 backdrop-blur-sm transition-shadow hover:shadow-lg">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Media Preview */}
                        <div className="flex-shrink-0">
                          <div className="h-16 w-16 overflow-hidden rounded-lg bg-slate-100">
                            {memory.mimeType.startsWith("image/") ? (
                              <Image
                                src={
                                  memory.previewUrl ||
                                  memory.downloadUrl ||
                                  "/placeholder.png"
                                }
                                alt={memory.title || memory.fileName}
                                width={64}
                                height={64}
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            ) : memory.mimeType.startsWith("video/") ? (
                              <div className="flex h-full w-full items-center justify-center bg-slate-900">
                                <Play className="h-6 w-6 text-white" />
                              </div>
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-slate-50">
                                <FileText className="h-6 w-6 text-slate-400" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Memory Details */}
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex items-start justify-between">
                            <h3 className="truncate font-semibold text-slate-900">
                              {memory.title || memory.fileName}
                            </h3>
                            <span className="ml-2 flex-shrink-0 text-xs text-slate-500">
                              {new Date(memory.$createdAt).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </span>
                          </div>

                          {memory.description && (
                            <p className="mb-2 line-clamp-2 text-sm text-slate-600">
                              {memory.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span>By {memory.uploaderName}</span>
                              {memory.tags.length > 0 && (
                                <>
                                  <span>•</span>
                                  <div className="flex gap-1">
                                    {memory.tags.slice(0, 2).map((tag) => (
                                      <span
                                        key={tag}
                                        className="rounded-full bg-pink-100 px-2 py-0.5 text-xs text-pink-700"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                    {memory.tags.length > 2 && (
                                      <span className="text-slate-400">
                                        +{memory.tags.length - 2}
                                      </span>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>

                            {memory.location && (
                              <div className="text-xs text-slate-500">
                                📍{" "}
                                {memory.location.address ||
                                  `${memory.location.latitude}, ${memory.location.longitude}`}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
