import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/Dialog";
import type { MediaItem } from "@/lib/mediaUtils";
import { 
  buildImageTransformationUrl, 
  buildVideoTransformationUrl,
  type ImageTransformationOptions,
  type VideoTransformationOptions
} from "@/lib/cloudinary";
import { downloadFile } from "@/lib/downloadUtils";
import ReactPlayer from "react-player";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  media: MediaItem & {
    cloudinaryPublicId: string;
    cloudinarySecureUrl: string;
    width?: number;
    height?: number;
    format?: string;
  };
}

const DownloadDialog = ({ open, onOpenChange, media }: DownloadDialogProps) => {
  const [activeTab, setActiveTab] = useState<'size' | 'quality' | 'advanced'>('size');

  // Normalize format - convert 'jpeg' to 'jpg' for consistency
  const normalizedFormat = useMemo(() => {
    if (!media.format) return undefined;
    const format = media.format.toLowerCase();
    // Normalize jpeg to jpg for our type system
    if (format === 'jpeg') return 'jpg' as const;
    if (['jpg', 'png', 'webp', 'avif', 'gif'].includes(format)) {
      return format as 'jpg' | 'png' | 'webp' | 'avif' | 'gif';
    }
    return undefined;
  }, [media.format]);

  // Image transformation state
  const [imageOptions, setImageOptions] = useState<ImageTransformationOptions>({
    width: media.width,
    height: media.height,
    crop: 'fit',
    format: normalizedFormat,
    quality: 'auto',
    removeBackground: false,
    gravity: 'auto',
    radius: undefined,
    effect: undefined,
  });

  // Video transformation state
  const [videoOptions, setVideoOptions] = useState<VideoTransformationOptions>({
    width: media.width,
    height: media.height,
    format: media.format as 'mp4' | 'webm' | 'mov' | undefined,
    quality: 'auto',
    bitRate: undefined,
    fps: undefined,
    startOffset: undefined,
    duration: undefined,
  });

  const [isDownloading, setIsDownloading] = useState(false);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);

  // Calculate aspect ratio
  const aspectRatio = useMemo(() => {
    if (media.width && media.height) {
      return media.width / media.height;
    }
    return null;
  }, [media.width, media.height]);

  // Update height when width changes (if maintaining aspect ratio)
  useEffect(() => {
    if (maintainAspectRatio && aspectRatio && imageOptions.width && media.mediaType === 'image') {
      setImageOptions(prev => ({
        ...prev,
        height: Math.round(imageOptions.width! / aspectRatio),
      }));
    }
  }, [imageOptions.width, maintainAspectRatio, aspectRatio, media.mediaType]);

  useEffect(() => {
    if (maintainAspectRatio && aspectRatio && videoOptions.width && media.mediaType === 'video') {
      setVideoOptions(prev => ({
        ...prev,
        height: Math.round(videoOptions.width! / aspectRatio),
      }));
    }
  }, [videoOptions.width, maintainAspectRatio, aspectRatio, media.mediaType]);

  // Build preview URL - use JSON.stringify for deep comparison of options
  const previewUrl = useMemo(() => {
    try {
      if (!media.cloudinaryPublicId) {
        console.warn('No cloudinaryPublicId found, using secure URL');
        return media.cloudinarySecureUrl;
      }

      let url: string;
      if (media.mediaType === 'image') {
        url = buildImageTransformationUrl(media.cloudinaryPublicId, imageOptions);
      } else if (media.mediaType === 'video') {
        url = buildVideoTransformationUrl(media.cloudinaryPublicId, videoOptions);
      } else {
        return media.cloudinarySecureUrl;
      }
      
      return url;
    } catch (error) {
      console.error('Failed to build preview URL:', error);
      return media.cloudinarySecureUrl;
    }
  }, [
    media.cloudinaryPublicId, 
    media.mediaType, 
    JSON.stringify(imageOptions), 
    JSON.stringify(videoOptions), 
    media.cloudinarySecureUrl
  ]);

  // Get file extension for download
  const getFileExtension = (format?: string, mediaType?: string): string => {
    if (format) {
      return format.toLowerCase();
    }
    if (mediaType === 'image') {
      return 'jpg';
    }
    if (mediaType === 'video') {
      return 'mp4';
    }
    return media.format || 'bin';
  };

  // Handle download original
  const handleDownloadOriginal = async () => {
    setIsDownloading(true);
    try {
      const extension = getFileExtension(media.format, media.mediaType);
      const filename = `${media.filename.replace(/\.[^/.]+$/, '')}.${extension}`;
      await downloadFile(media.cloudinarySecureUrl, filename);
      onOpenChange(false);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download file. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle download transformed
  const handleDownloadTransformed = async () => {
    setIsDownloading(true);
    try {
      const extension = getFileExtension(
        media.mediaType === 'image' ? imageOptions.format : videoOptions.format,
        media.mediaType
      );
      const filename = `${media.filename.replace(/\.[^/.]+$/, '')}.${extension}`;
      await downloadFile(previewUrl, filename);
      onOpenChange(false);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download file. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const isImage = media.mediaType === 'image';
  const isVideo = media.mediaType === 'video';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Download {media.title || media.filename}</DialogTitle>
          <DialogDescription>
            Choose transformation options or download the original file
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Preview Section */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-white">Preview</label>
            <div className="bg-slate-800 rounded-lg p-4 flex items-center justify-center min-h-[300px]">
              {isImage ? (
                <img
                  key={previewUrl}
                  src={previewUrl}
                  alt={media.altText || media.title}
                  className="max-w-full max-h-[400px] rounded object-contain"
                  onError={(e) => {
                    console.error('Preview image failed to load:', {
                      url: previewUrl,
                      error: e,
                      publicId: media.cloudinaryPublicId,
                    });
                    const target = e.target as HTMLImageElement;
                    // Fallback to original secure URL if transformation fails
                    if (target.src !== media.cloudinarySecureUrl) {
                      target.src = media.cloudinarySecureUrl;
                    } else {
                      target.style.display = 'none';
                    }
                  }}
                />
              ) : isVideo ? (
                <div className="w-full">
                  <ReactPlayer
                    src={previewUrl}
                    width="100%"
                    height="auto"
                    controls={true}
                    className="rounded"
                  />
                </div>
              ) : (
                <div className="text-slate-400">
                  Preview not available for this media type
                </div>
              )}
            </div>
          </div>

          {/* Transformation Options */}
          <div className="space-y-4">
            {isImage ? (
              <>
                {/* Tabs */}
                <div className="flex border-b border-slate-700">
                  <button
                    onClick={() => setActiveTab('size')}
                    className={cn(
                      "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                      activeTab === 'size'
                        ? "border-cyan-500 text-cyan-400"
                        : "border-transparent text-slate-400 hover:text-slate-300"
                    )}
                  >
                    Size & Format
                  </button>
                  <button
                    onClick={() => setActiveTab('quality')}
                    className={cn(
                      "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                      activeTab === 'quality'
                        ? "border-cyan-500 text-cyan-400"
                        : "border-transparent text-slate-400 hover:text-slate-300"
                    )}
                  >
                    Quality
                  </button>
                  <button
                    onClick={() => setActiveTab('advanced')}
                    className={cn(
                      "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                      activeTab === 'advanced'
                        ? "border-cyan-500 text-cyan-400"
                        : "border-transparent text-slate-400 hover:text-slate-300"
                    )}
                  >
                    Advanced
                  </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'size' && (
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="maintain-aspect"
                        checked={maintainAspectRatio}
                        onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-2 focus:ring-cyan-500"
                      />
                      <label htmlFor="maintain-aspect" className="text-sm font-medium text-white cursor-pointer">
                        Maintain aspect ratio
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="width" className="block text-sm font-medium text-white">Width</label>
                        <input
                          id="width"
                          type="number"
                          value={imageOptions.width || ''}
                          onChange={(e) => setImageOptions(prev => ({
                            ...prev,
                            width: e.target.value ? parseInt(e.target.value) : undefined,
                          }))}
                          placeholder={media.width?.toString()}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="height" className="block text-sm font-medium text-white">Height</label>
                        <input
                          id="height"
                          type="number"
                          value={imageOptions.height || ''}
                          onChange={(e) => setImageOptions(prev => ({
                            ...prev,
                            height: e.target.value ? parseInt(e.target.value) : undefined,
                          }))}
                          placeholder={media.height?.toString()}
                          disabled={maintainAspectRatio}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="crop" className="block text-sm font-medium text-white">Crop Mode</label>
                      <select
                        id="crop"
                        value={imageOptions.crop || 'fit'}
                        onChange={(e) => setImageOptions(prev => ({
                          ...prev,
                          crop: e.target.value as ImageTransformationOptions['crop'],
                        }))}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="fit">Fit (maintain aspect)</option>
                        <option value="fill">Fill (crop to fit)</option>
                        <option value="scale">Scale</option>
                        <option value="thumb">Thumbnail</option>
                        <option value="limit">Limit</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="format" className="block text-sm font-medium text-white">Format</label>
                      <select
                        id="format"
                        value={imageOptions.format || 'auto'}
                        onChange={(e) => setImageOptions(prev => ({
                          ...prev,
                          format: e.target.value === 'auto' ? undefined : e.target.value as ImageTransformationOptions['format'],
                        }))}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="auto">Original ({media.format})</option>
                        <option value="jpg">JPG</option>
                        <option value="png">PNG</option>
                        <option value="webp">WebP</option>
                        <option value="avif">AVIF</option>
                        <option value="gif">GIF</option>
                      </select>
                    </div>
                  </div>
                )}

                {activeTab === 'quality' && (
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <label htmlFor="quality" className="block text-sm font-medium text-white">Quality</label>
                      <select
                        id="quality"
                        value={imageOptions.quality === 'auto' ? 'auto' : imageOptions.quality?.toString() || 'auto'}
                        onChange={(e) => setImageOptions(prev => ({
                          ...prev,
                          quality: e.target.value === 'auto' ? 'auto' : parseInt(e.target.value),
                        }))}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="auto">Auto</option>
                        <option value="100">100 (Best)</option>
                        <option value="90">90</option>
                        <option value="80">80</option>
                        <option value="70">70</option>
                        <option value="60">60</option>
                        <option value="50">50</option>
                      </select>
                    </div>
                  </div>
                )}

                {activeTab === 'advanced' && (
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="remove-bg"
                        checked={imageOptions.removeBackground || false}
                        onChange={(e) => setImageOptions(prev => ({
                          ...prev,
                          removeBackground: e.target.checked,
                        }))}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-2 focus:ring-cyan-500"
                      />
                      <label htmlFor="remove-bg" className="text-sm font-medium text-white cursor-pointer">
                        Remove background (requires Cloudinary AI addon)
                      </label>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="gravity" className="block text-sm font-medium text-white">Gravity</label>
                      <select
                        id="gravity"
                        value={imageOptions.gravity || 'auto'}
                        onChange={(e) => setImageOptions(prev => ({
                          ...prev,
                          gravity: e.target.value as ImageTransformationOptions['gravity'],
                        }))}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="auto">Auto</option>
                        <option value="face">Face</option>
                        <option value="center">Center</option>
                        <option value="north">North</option>
                        <option value="south">South</option>
                        <option value="east">East</option>
                        <option value="west">West</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="radius" className="block text-sm font-medium text-white">Border Radius</label>
                      <input
                        id="radius"
                        type="number"
                        value={imageOptions.radius || ''}
                        onChange={(e) => setImageOptions(prev => ({
                          ...prev,
                          radius: e.target.value ? parseInt(e.target.value) : undefined,
                        }))}
                        placeholder="0"
                        min="0"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>
                )}
              </>
            ) : isVideo ? (
              <>
                {/* Tabs */}
                <div className="flex border-b border-slate-700">
                  <button
                    onClick={() => setActiveTab('size')}
                    className={cn(
                      "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                      activeTab === 'size'
                        ? "border-cyan-500 text-cyan-400"
                        : "border-transparent text-slate-400 hover:text-slate-300"
                    )}
                  >
                    Size & Format
                  </button>
                  <button
                    onClick={() => setActiveTab('quality')}
                    className={cn(
                      "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                      activeTab === 'quality'
                        ? "border-cyan-500 text-cyan-400"
                        : "border-transparent text-slate-400 hover:text-slate-300"
                    )}
                  >
                    Quality
                  </button>
                </div>

                {activeTab === 'size' && (
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="maintain-aspect-video"
                        checked={maintainAspectRatio}
                        onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-2 focus:ring-cyan-500"
                      />
                      <label htmlFor="maintain-aspect-video" className="text-sm font-medium text-white cursor-pointer">
                        Maintain aspect ratio
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="video-width" className="block text-sm font-medium text-white">Width</label>
                        <input
                          id="video-width"
                          type="number"
                          value={videoOptions.width || ''}
                          onChange={(e) => setVideoOptions(prev => ({
                            ...prev,
                            width: e.target.value ? parseInt(e.target.value) : undefined,
                          }))}
                          placeholder={media.width?.toString()}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="video-height" className="block text-sm font-medium text-white">Height</label>
                        <input
                          id="video-height"
                          type="number"
                          value={videoOptions.height || ''}
                          onChange={(e) => setVideoOptions(prev => ({
                            ...prev,
                            height: e.target.value ? parseInt(e.target.value) : undefined,
                          }))}
                          placeholder={media.height?.toString()}
                          disabled={maintainAspectRatio}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="video-format" className="block text-sm font-medium text-white">Format</label>
                      <select
                        id="video-format"
                        value={videoOptions.format || 'auto'}
                        onChange={(e) => setVideoOptions(prev => ({
                          ...prev,
                          format: e.target.value === 'auto' ? undefined : e.target.value as VideoTransformationOptions['format'],
                        }))}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="auto">Original ({media.format})</option>
                        <option value="mp4">MP4</option>
                        <option value="webm">WebM</option>
                        <option value="mov">MOV</option>
                      </select>
                    </div>
                  </div>
                )}

                {activeTab === 'quality' && (
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <label htmlFor="video-quality" className="block text-sm font-medium text-white">Quality</label>
                      <select
                        id="video-quality"
                        value={videoOptions.quality === 'auto' ? 'auto' : videoOptions.quality?.toString() || 'auto'}
                        onChange={(e) => setVideoOptions(prev => ({
                          ...prev,
                          quality: e.target.value === 'auto' ? 'auto' : parseInt(e.target.value),
                        }))}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="auto">Auto</option>
                        <option value="100">100 (Best)</option>
                        <option value="90">90</option>
                        <option value="80">80</option>
                        <option value="70">70</option>
                        <option value="60">60</option>
                        <option value="50">50</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="bitrate" className="block text-sm font-medium text-white">Bitrate (kbps)</label>
                      <input
                        id="bitrate"
                        type="number"
                        value={videoOptions.bitRate || ''}
                        onChange={(e) => setVideoOptions(prev => ({
                          ...prev,
                          bitRate: e.target.value ? parseInt(e.target.value) : undefined,
                        }))}
                        placeholder="Auto"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="fps" className="block text-sm font-medium text-white">FPS</label>
                      <input
                        id="fps"
                        type="number"
                        value={videoOptions.fps || ''}
                        onChange={(e) => setVideoOptions(prev => ({
                          ...prev,
                          fps: e.target.value ? parseInt(e.target.value) : undefined,
                        }))}
                        placeholder="Original"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-slate-400">
                Transformation options are only available for images and videos.
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between gap-2 pt-4 border-t border-slate-700">
          <button
            onClick={handleDownloadOriginal}
            disabled={isDownloading}
            className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {isDownloading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Downloading...
              </>
            ) : (
              'Download Original'
            )}
          </button>
          {(isImage || isVideo) ? (
            <button
              onClick={handleDownloadTransformed}
              disabled={isDownloading}
              className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                'Download Transformed'
              )}
            </button>
          ) : (
            <button
              onClick={handleDownloadOriginal}
              disabled={isDownloading}
              className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                'Download'
              )}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadDialog;
