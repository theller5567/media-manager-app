import { useState, useRef, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import type { MediaItem } from "@/lib/mediaUtils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Loader2, Upload, Video} from "lucide-react";
import { uploadThumbnail } from "@/lib/cloudinary";
import { createVideoThumbnailFromUrl, revokePreviewUrl } from "@/lib/fileUtils";
import LazyImage from "@/components/ui/LazyImage";
import { cn } from "@/lib/utils";

interface ThumbnailChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  media: MediaItem & { duration?: number; cloudinarySecureUrl: string };
}

type TabType = "upload" | "extract";

const ThumbnailChangeDialog = ({
  open,
  onOpenChange,
  media,
}: ThumbnailChangeDialogProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [timestamp, setTimestamp] = useState<number>(0);
  const [videoDuration, setVideoDuration] = useState<number>(media.duration || 0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const updateMedia = useMutation(api.mutations.media.update);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setActiveTab("upload");
      setSelectedFile(null);
      setPreviewUrl("");
      setTimestamp(media.duration ? Math.min(0.1, media.duration * 0.1) : 0);
      setVideoDuration(media.duration || 0);
      setError(null);
      setIsProcessing(false);
      setVideoLoaded(false);
    } else {
      // Cleanup preview URLs
      if (previewUrl && previewUrl.startsWith("blob:")) {
        revokePreviewUrl(previewUrl);
      }
    }
  }, [open, media.duration]);

  // Handle file selection for upload tab
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPG, PNG, WebP, etc.)");
      return;
    }

    // Validate file size (max 5MB for thumbnails)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError("Image file is too large. Maximum size is 5MB.");
      return;
    }

    setError(null);
    setSelectedFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    if (previewUrl && previewUrl.startsWith("blob:")) {
      revokePreviewUrl(previewUrl);
    }
    setPreviewUrl(url);
  };

  // Handle video load for extract tab
  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      const duration = videoRef.current.duration;
      setVideoDuration(duration);
      const initialTimestamp = Math.min(0.1, duration * 0.1);
      setTimestamp(initialTimestamp);
      if (videoRef.current) {
        videoRef.current.currentTime = initialTimestamp;
      }
      setVideoLoaded(true);
    }
  };

  // Handle timestamp change for extract tab
  const handleTimestampChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTimestamp = parseFloat(e.target.value);
    setTimestamp(newTimestamp);
    if (videoRef.current) {
      videoRef.current.currentTime = newTimestamp;
    }
  };

  // Extract frame from video
  const handleExtractFrame = async () => {
    if (!media.cloudinarySecureUrl) {
      setError("Video URL is not available");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const result = await createVideoThumbnailFromUrl(
        media.cloudinarySecureUrl,
        timestamp
      );
      
      // Cleanup old preview URL
      if (previewUrl && previewUrl.startsWith("blob:")) {
        revokePreviewUrl(previewUrl);
      }
      
      setPreviewUrl(result.previewUrl);
      setSelectedFile(result.thumbnailFile);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to extract frame from video"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Save thumbnail
  const handleSave = async () => {
    if (!selectedFile) {
      setError("Please select or extract a thumbnail first");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Upload thumbnail to Cloudinary
      const uploadResult = await uploadThumbnail(selectedFile);
      
      // Update media record with new thumbnail URL
      await updateMedia({
        id: media.id as Id<"media">,
        updates: {
          thumbnail: uploadResult.secureUrl,
          dateModified: Date.now(),
        },
      });

      // Cleanup preview URL
      if (previewUrl && previewUrl.startsWith("blob:")) {
        revokePreviewUrl(previewUrl);
      }

      // Close dialog on success
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update thumbnail"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Format timestamp for display
  const formatTimestamp = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Change Thumbnail</DialogTitle>
          <DialogDescription>
            Upload a new image or extract a frame from the video
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Thumbnail Preview */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              Current Thumbnail
            </label>
            <div className="w-full aspect-video rounded-lg bg-slate-800 border border-slate-700 overflow-hidden">
              <LazyImage
                src={media.thumbnail || ""}
                alt={media.title}
                mediaType="image"
                showOverlay={false}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex gap-2 border-b border-slate-700">
            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors border-b-2",
                activeTab === "upload"
                  ? "text-cyan-400 border-cyan-400"
                  : "text-slate-400 border-transparent hover:text-slate-300"
              )}
            >
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload Image
              </div>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("extract")}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors border-b-2",
                activeTab === "extract"
                  ? "text-cyan-400 border-cyan-400"
                  : "text-slate-400 border-transparent hover:text-slate-300"
              )}
            >
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                Extract from Video
              </div>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500 rounded-md">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Upload Tab Content */}
          {activeTab === "upload" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white">
                  Select Image File
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-3 border-2 border-dashed border-slate-700 rounded-lg hover:border-cyan-500 transition-colors text-slate-400 hover:text-white"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-6 w-6" />
                    <span>Click to select image file</span>
                    <span className="text-xs">JPG, PNG, WebP (max 5MB)</span>
                  </div>
                </button>
              </div>

              {selectedFile && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white">
                    Selected File: {selectedFile.name}
                  </label>
                  <div className="w-full aspect-video rounded-lg bg-slate-800 border border-slate-700 overflow-hidden">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Extract Tab Content */}
          {activeTab === "extract" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white">
                  Video Preview
                </label>
                <div className="w-full aspect-video rounded-lg bg-slate-900 border border-slate-700 overflow-hidden">
                  <video
                    ref={videoRef}
                    src={media.cloudinarySecureUrl}
                    className="w-full h-full"
                    muted
                    playsInline
                    crossOrigin="anonymous"
                    onLoadedMetadata={handleVideoLoadedMetadata}
                  />
                </div>
              </div>

              {videoLoaded && videoDuration > 0 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">
                      Timestamp: {formatTimestamp(timestamp)} / {formatTimestamp(videoDuration)}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max={videoDuration}
                      step="0.1"
                      value={timestamp}
                      onChange={handleTimestampChange}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>0:00</span>
                      <span>{formatTimestamp(videoDuration)}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleExtractFrame}
                    disabled={isProcessing}
                    className="w-full px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Extracting...</span>
                      </>
                    ) : (
                      <>
                        <Video className="h-4 w-4" />
                        <span>Extract Frame</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {previewUrl && selectedFile && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white">
                    Extracted Thumbnail Preview
                  </label>
                  <div className="w-full aspect-video rounded-lg bg-slate-800 border border-slate-700 overflow-hidden">
                    <img
                      src={previewUrl}
                      alt="Extracted thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* New Thumbnail Preview (shown when both tabs have a preview) */}
          {previewUrl && selectedFile && (
            <div className="space-y-2 p-4 bg-slate-800 rounded-lg border border-slate-700">
              <label className="block text-sm font-medium text-white">
                New Thumbnail Preview
              </label>
              <div className="w-full aspect-video rounded-lg bg-slate-900 border border-slate-600 overflow-hidden">
                <img
                  src={previewUrl}
                  alt="New thumbnail preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
              className="px-4 py-2 text-sm font-medium text-slate-200 bg-slate-700 border border-slate-600 rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isProcessing || !selectedFile}
              className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 border border-cyan-500 rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Thumbnail</span>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ThumbnailChangeDialog;
