"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/hooks/queries/useAuth";
import { useCoupleInfo } from "@/hooks/queries/useCouple";
import { useUploadMemory } from "@/hooks/queries/useMemories";
import { Camera, Check, Loader2, RotateCcw, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function NewMemoryPage() {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const { data: coupleInfo } = useCoupleInfo(user?.$id || null);
  const coupleId = coupleInfo?.couple?.$id || null;

  const uploadMemoryMutation = useUploadMemory();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Start camera on mount
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  // Auto-focus title input when image is captured
  useEffect(() => {
    if (capturedImage && titleInputRef.current) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  }, [capturedImage]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Use rear camera by default
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setCameraError(
        "Unable to access camera. Please grant camera permissions or use file upload.",
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          const imageUrl = URL.createObjectURL(blob);
          setCapturedImage(imageUrl);
          stopCamera(); // Stop camera after capturing
        }
      }, "image/jpeg");
    }
  };

  const retakePhoto = () => {
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
      setCapturedImage(null);
    }
    setTitle("");
    startCamera();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const imageUrl = URL.createObjectURL(file);
      setCapturedImage(imageUrl);
      stopCamera();
    }
  };

  const handleSave = async () => {
    if (!capturedImage || !coupleId || !user) {
      return;
    }

    setIsUploading(true);

    try {
      // Convert the captured image to a File object
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            setIsUploading(false);
            return;
          }

          const fileName = `memory-${Date.now()}.jpg`;
          const file = new File([blob], fileName, { type: "image/jpeg" });

          const metadata = {
            title: title || "Untitled Memory",
            description: "",
            tags: [],
            isPrivate: false,
          };

          try {
            await uploadMemoryMutation.mutateAsync({
              file,
              coupleId,
              uploadedBy: user.$id,
              uploaderName: user.name,
              metadata,
            });

            // Redirect to memories page on success
            router.push("/memories");
          } catch (error) {
            console.error("Error saving memory:", error);
            alert("Failed to save memory. Please try again.");
            setIsUploading(false);
          }
        },
        "image/jpeg",
        0.9,
      );
    } catch (error) {
      console.error("Error processing image:", error);
      alert("Failed to process image. Please try again.");
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    stopCamera();
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
    }
    router.back();
  };

  if (!user || !coupleId) {
    return (
      <div className="bg-gradient-romantic flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-8 text-center">
            <Camera className="mx-auto mb-4 h-12 w-12 text-pink-500" />
            <h3 className="mb-2 text-lg font-semibold text-slate-900">
              Authentication Required
            </h3>
            <p className="text-slate-600">
              Please log in and connect with your partner to add memories.
            </p>
            <Button
              className="mt-4"
              variant="romantic"
              onClick={() => router.push("/auth")}
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black">
      {/* Hidden canvas for capturing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <div className="absolute top-0 right-0 left-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent p-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 text-white hover:bg-white/20"
          onClick={handleCancel}
          disabled={isUploading}
        >
          <X className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-semibold text-white">Capture Memory</h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Camera View or Preview */}
      <div className="relative flex flex-1 items-center justify-center">
        {!capturedImage ? (
          <>
            {/* Live Camera View */}
            {!cameraError ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center px-8 text-center text-white">
                <Camera className="mb-4 h-16 w-16 opacity-50" />
                <p className="mb-6 text-lg">{cameraError}</p>
                <Button
                  variant="outline"
                  className="bg-white text-slate-900"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose from Gallery
                </Button>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Captured Image Preview */}
            <div className="relative h-full w-full">
              <img
                src={capturedImage}
                alt="Captured memory"
                className="h-full w-full object-contain"
              />

              {/* Title Input Overlay (Bottom Center) */}
              <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-6 pb-24">
                <Input
                  ref={titleInputRef}
                  type="text"
                  placeholder="Add a title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border-white/30 bg-white/10 text-center text-lg text-white backdrop-blur-sm placeholder:text-white/60 focus:border-white/50 focus:bg-white/20"
                  disabled={isUploading}
                  maxLength={100}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Hidden file input for gallery selection */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Bottom Controls */}
      <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent p-6">
        {!capturedImage ? (
          <div className="flex items-center justify-center gap-8">
            {/* Gallery Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full border-2 border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </Button>

            {/* Capture Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-20 w-20 rounded-full border-4 border-white bg-white/20 backdrop-blur-sm hover:bg-white/30 disabled:opacity-50"
              onClick={capturePhoto}
              disabled={!!cameraError || isUploading}
            >
              <div className="h-16 w-16 rounded-full bg-white" />
            </Button>

            {/* Spacer for symmetry */}
            <div className="h-12 w-12" />
          </div>
        ) : (
          <div className="flex items-center justify-center gap-6">
            {/* Retake Button */}
            <Button
              variant="ghost"
              size="lg"
              className="gap-2 rounded-full border-2 border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
              onClick={retakePhoto}
              disabled={isUploading}
            >
              <RotateCcw className="h-5 w-5" />
              Retake
            </Button>

            {/* Save Button */}
            <Button
              size="lg"
              className="gap-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600"
              onClick={handleSave}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-5 w-5" />
                  Save Memory
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
