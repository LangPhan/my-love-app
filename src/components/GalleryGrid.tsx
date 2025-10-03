"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Deck, DeckCards, DeckItem } from "@/components/ui/kibo-ui/deck";
import { Textarea } from "@/components/ui/textarea";
import {
  type MediaFile,
  deleteMedia,
  updateMediaMetadata,
} from "@/lib/memories";
import {
  Download,
  FileText,
  Loader2,
  MoreVertical,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";

interface GalleryGridProps {
  memories: MediaFile[];
}

// Full-screen swipe deck overlay
interface MemoryDeckProps {
  memories: MediaFile[];
  startIndex: number;
  onClose: () => void;
  onDelete: (media: MediaFile) => Promise<void>;
  onEdit: (
    media: MediaFile,
    data: { title: string; description: string },
  ) => Promise<void>;
}

const MemoryDeck: React.FC<MemoryDeckProps> = ({
  memories,
  startIndex,
  onClose,
  onDelete,
  onEdit,
}) => {
  const [index, setIndex] = useState(startIndex);
  // Edit / form state (must be before any conditional return to keep hook order stable)
  const [editing, setEditing] = useState<MediaFile | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // If index drifts beyond bounds (e.g., from swipe), trigger close after frame
  useEffect(() => {
    if (index >= memories.length) {
      // Prevent further renders with out-of-range index by clamping
      setIndex((i) => Math.min(i, Math.max(0, memories.length - 1)));
      onClose();
    }
  }, [index, memories.length, onClose]);

  const current = memories[index];
  if (!current) {
    // Nothing to show (closing) but hooks already declared above, so safe
    return null;
  }

  const beginEdit = (m: MediaFile) => {
    setEditing(m);
    setFormTitle(m.title || "");
    setFormDescription(m.description || "");
  };

  const submitEdit = async () => {
    if (!editing) return;
    setSubmitting(true);
    try {
      await onEdit(editing, { title: formTitle, description: formDescription });
      setEditing(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (m: MediaFile) => {
    if (deletingId) return;
    setDeletingId(m.$id);
    try {
      await onDelete(m);
      // Adjust index if we deleted last item
      setIndex((i) => (i >= memories.length - 1 ? Math.max(0, i - 1) : i));
    } finally {
      setDeletingId(null);
    }
  };
  return (
    <div
      className="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center"
      role="dialog"
      aria-label="Memory viewer"
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
        if (e.key === "ArrowRight")
          setIndex((i) => Math.min(i + 1, memories.length - 1));
        if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
      }}
    >
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-4 right-4 z-[60] text-white hover:bg-white/20"
      >
        <X className="h-6 w-6" />
      </Button>
      <div className="pointer-events-none absolute top-0 right-0 left-0 z-[55] flex items-center justify-center p-4">
        <p className="rounded bg-black/40 px-2 py-1 text-xs font-medium text-white/80">
          {index + 1} / {memories.length}
        </p>
      </div>
      <Deck className="relative z-[50] h-[80vh] w-full max-w-xl select-none">
        <DeckCards
          currentIndex={index}
          defaultCurrentIndex={startIndex}
          onCurrentIndexChange={setIndex}
          stackSize={3}
          threshold={120}
          className="h-full w-full"
        >
          {memories.map((m) => (
            <DeckItem key={m.$id} className="relative overflow-hidden bg-black">
              {m.$id === current.$id && (
                <div className="absolute top-2 right-2 z-[70]">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        aria-label="More actions"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white ring-1 ring-white/10 backdrop-blur-md transition hover:bg-black/70 focus:ring-2 focus:ring-pink-400 focus:outline-none"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-back w-24 text-white"
                    >
                      <DropdownMenuItem
                        onClick={() => beginEdit(m)}
                        disabled={!!deletingId}
                      >
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(m)}
                        disabled={!!deletingId}
                        className="text-red-500 focus:text-red-500"
                        data-variant="destructive"
                      >
                        {deletingId === m.$id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        Delete
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <a
                          href={m.downloadUrl}
                          download={m.fileName}
                          className="flex w-full items-center"
                        >
                          <Download className="mr-2 h-4 w-4" /> Download
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={onClose}>
                        <X className="mr-2 h-4 w-4" /> Close
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
              {m.mimeType?.startsWith("image/") ? (
                <Image
                  src={m.downloadUrl || m.previewUrl || "/placeholder.png"}
                  alt={m.title || m.fileName}
                  width={m.width || 1200}
                  height={m.height || 1200}
                  className="h-full w-full object-contain"
                  priority={m.$id === memories[startIndex].$id}
                />
              ) : m.mimeType?.startsWith("video/") ? (
                <video
                  className="h-full w-full object-contain"
                  src={m.downloadUrl}
                  controls
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-6 text-white">
                  <FileText className="h-16 w-16 opacity-70" />
                  <p className="text-sm opacity-80">{m.fileName}</p>
                  <a
                    href={m.downloadUrl}
                    download={m.fileName}
                    className="inline-flex items-center gap-2 rounded-md bg-white/20 px-3 py-1.5 text-xs hover:bg-white/30"
                  >
                    <Download className="h-3 w-3" /> Download
                  </a>
                </div>
              )}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-8">
                {m.title && (
                  <h3 className="text-sm font-semibold text-white">
                    {m.title}
                  </h3>
                )}
                {m.description && (
                  <p className="mt-1 line-clamp-3 text-[11px] text-white/70">
                    {m.description}
                  </p>
                )}
                <p className="mt-2 text-[10px] tracking-wide text-white/50 uppercase">
                  {new Date(m.$createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                  })}
                </p>
              </div>
            </DeckItem>
          ))}
        </DeckCards>
      </Deck>

      <Dialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Memory</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-muted-foreground text-xs font-medium">
                Title
              </label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Title"
              />
            </div>
            <div className="space-y-1">
              <label className="text-muted-foreground text-xs font-medium">
                Description
              </label>
              <Textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Description"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setEditing(null)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={submitEdit} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export function GalleryGrid({ memories }: GalleryGridProps) {
  const [deckStartIndex, setDeckStartIndex] = useState<number | null>(null);

  // derived sorted list first, then keep internal mutable copy for edits/deletes
  const initialSorted = useMemo(
    () =>
      [...memories].sort(
        (a, b) =>
          new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime(),
      ),
    [memories],
  );

  const [displayMemories, setDisplayMemories] =
    useState<MediaFile[]>(initialSorted);

  // Sync when incoming prop changes (e.g., refetch)
  useEffect(() => {
    setDisplayMemories(initialSorted);
  }, [initialSorted]);

  const openAt = useCallback(
    (memory: MediaFile) => {
      const idx = displayMemories.findIndex((m) => m.$id === memory.$id);
      setDeckStartIndex(idx === -1 ? 0 : idx);
    },
    [displayMemories],
  );

  const closeDeck = useCallback(() => setDeckStartIndex(null), []);

  if (displayMemories.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-600">No memories to display</p>
      </div>
    );
  }

  return (
    <>
      <div className="columns-2 gap-4 [column-fill:_balance] md:columns-3"></div>
      <div className="columns-2 gap-4 space-y-4 md:columns-3">
        {displayMemories.map((memory) => (
          <div
            key={memory.$id}
            className="break-inside-avoid" // prevent column breaks inside
            style={{ breakInside: "avoid" }}
            onClick={() => openAt(memory)}
          >
            <div className="relative w-full bg-gray-100">
              {memory.mimeType?.startsWith("image/") ? (
                <Image
                  src={
                    memory.previewUrl ||
                    memory.downloadUrl ||
                    "/placeholder.png"
                  }
                  alt={memory.title || memory.fileName}
                  width={memory.width || 800}
                  height={memory.height || 800}
                  className="h-auto w-full origin-center object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  sizes="(max-width: 768px) 50vw, 33vw"
                  loading="lazy"
                />
              ) : memory.mimeType?.startsWith("video/") ? (
                <div className="relative">
                  <video
                    className="h-auto max-h-[620px] w-full rounded-md object-cover"
                    src={memory.downloadUrl}
                    controls
                    preload="metadata"
                  />
                  <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-1 text-[10px] font-medium tracking-wide text-white">
                    VIDEO
                  </div>
                </div>
              ) : (
                <div className="relative flex w-full flex-col items-center justify-center gap-4 rounded-md bg-slate-50 py-10 text-slate-500">
                  <FileText className="h-10 w-10" />
                  <p className="text-xs font-medium opacity-70">
                    {memory.fileName}
                  </p>
                  <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-1 text-[10px] font-medium tracking-wide text-white">
                    FILE
                  </div>
                </div>
              )}

              {memory.title && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p className="truncate text-xs font-medium text-white drop-shadow">
                    {memory.title}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {deckStartIndex !== null && displayMemories[deckStartIndex] && (
        <MemoryDeck
          memories={displayMemories}
          startIndex={deckStartIndex}
          onClose={closeDeck}
          onDelete={async (media) => {
            const beforeLength = displayMemories.length;
            try {
              if (
                media.storageFileId &&
                media.storageFileId !== "placeholder"
              ) {
                await deleteMedia(media.$id, media.storageFileId);
              } else {
                // Fallback: only delete doc if storage file unknown
                await deleteMedia(
                  media.$id,
                  media.storageFileId || "placeholder",
                );
              }
              setDisplayMemories((prev) =>
                prev.filter((m) => m.$id !== media.$id),
              );
              // Adjust deck index if we removed an item before current index
              setDeckStartIndex((prev) => {
                if (prev == null) return prev;
                if (prev >= beforeLength - 1) {
                  // closed in effect inside deck; but ensure close if list empty
                  if (beforeLength - 1 <= 0) return null;
                  return prev - 1;
                }
                return prev;
              });
            } catch (e) {
              console.error("Failed to delete media", e);
            }
          }}
          onEdit={async (media, data) => {
            try {
              const res = await updateMediaMetadata(media.$id, {
                title: data.title,
                description: data.description,
              });
              if (res.success && res.data) {
                setDisplayMemories((prev) =>
                  prev.map((m) =>
                    m.$id === media.$id
                      ? {
                          ...m,
                          title: data.title,
                          description: data.description,
                        }
                      : m,
                  ),
                );
              }
            } catch (e) {
              console.error("Failed to edit media", e);
            }
          }}
        />
      )}
    </>
  );
}
