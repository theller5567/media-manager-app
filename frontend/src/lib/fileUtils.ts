import type { FilePreview } from '@/types/upload';
import { getFileExtensionCategory } from './mediaTypeUtils';

/**
 * Generate unique file ID
 */
export function generateFileId(): string {
  return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get file extension from File object
 */
export function getFileExtension(file: File): string {
  const name = file.name;
  const lastDot = name.lastIndexOf('.');
  return lastDot !== -1 ? name.substring(lastDot).toLowerCase() : '';
}

/**
 * Get file type from extension
 */
export function getFileType(extension: string): 'image' | 'video' | 'document' | 'audio' | 'other' {
  return getFileExtensionCategory(extension);
}

/**
 * Create file preview with thumbnail
 */
export async function createFilePreview(file: File): Promise<FilePreview> {
  const id = generateFileId();
  const extension = getFileExtension(file);
  const type = getFileType(extension);
  
  let preview = '';
  let thumbnailFile: File | undefined;
  
  if (type === 'image') {
    preview = URL.createObjectURL(file);
  } else if (type === 'video') {
    // Create thumbnail from video - get both preview URL and File object
    console.log(`[File Preview] Extracting thumbnail for video: ${file.name}`);
    try {
      const thumbnailResult = await createVideoThumbnailFile(file);
      preview = thumbnailResult.previewUrl;
      thumbnailFile = thumbnailResult.thumbnailFile;
      console.log(`[File Preview] Thumbnail extracted successfully:`, {
        previewUrl: preview.substring(0, 50) + '...',
        thumbnailFile: thumbnailFile.name,
        thumbnailSize: thumbnailFile.size,
      });
    } catch (error) {
      // Fallback to simple preview if thumbnail extraction fails
      console.warn('[File Preview] Failed to create video thumbnail:', error);
      try {
        preview = await createVideoThumbnail(file);
        console.log('[File Preview] Using fallback thumbnail preview');
      } catch (fallbackError) {
        console.error('[File Preview] Fallback thumbnail also failed:', fallbackError);
        preview = '';
      }
    }
  } else {
    // For documents/audio/other, use a placeholder or icon
    preview = '';
  }
  
  return {
    id,
    file,
    preview,
    extension,
    size: file.size,
    type,
    thumbnailFile,
  };
}

/**
 * Create thumbnail from video file
 * Returns blob URL for preview purposes
 */
async function createVideoThumbnail(file: File, timestamp?: number): Promise<string> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set video properties for thumbnail extraction
    video.preload = 'metadata';
    video.muted = true; // Required for programmatic seeking in some browsers
    video.playsInline = true; // Required for iOS
    
    video.onloadedmetadata = () => {
      // Use provided timestamp or default to 0.1 seconds (or 10% of duration)
      const seekTime = timestamp !== undefined 
        ? timestamp 
        : Math.min(0.1, video.duration * 0.1);
      video.currentTime = seekTime;
    };
    
    video.onseeked = () => {
      if (ctx) {
        // Limit canvas size to avoid memory issues (max 1920x1080)
        const maxWidth = 1920;
        const maxHeight = 1080;
        let width = video.videoWidth;
        let height = video.videoHeight;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(URL.createObjectURL(blob));
          } else {
            resolve('');
          }
          // Cleanup video URL
          URL.revokeObjectURL(video.src);
        }, 'image/jpeg', 0.8);
      } else {
        URL.revokeObjectURL(video.src);
        resolve('');
      }
    };
    
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      resolve('');
    };
    
    video.src = URL.createObjectURL(file);
  });
}

/**
 * Create thumbnail from video file and return both preview URL and File object
 * @param file - Video file to extract thumbnail from
 * @param timestamp - Optional timestamp in seconds (defaults to 0.1s or 10% of duration)
 * @returns Object containing previewUrl (blob URL) and thumbnailFile (File object)
 */
export async function createVideoThumbnailFile(
  file: File,
  timestamp?: number
): Promise<{ previewUrl: string; thumbnailFile: File }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let resolved = false;
    
    // Set video properties for thumbnail extraction
    video.preload = 'metadata';
    video.muted = true; // Required for programmatic seeking in some browsers
    video.playsInline = true; // Required for iOS
    
    // Timeout handler in case seek fails
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        URL.revokeObjectURL(video.src);
        reject(new Error('Video thumbnail extraction timed out'));
      }
    }, 10000); // 10 second timeout
    
    video.onloadedmetadata = () => {
      // Use provided timestamp or default to 0.1 seconds (or 10% of duration)
      const seekTime = timestamp !== undefined 
        ? timestamp 
        : Math.min(0.1, video.duration * 0.1);
      video.currentTime = seekTime;
    };
    
    video.onseeked = () => {
      if (ctx) {
        // Limit canvas size to avoid memory issues (max 1920x1080)
        const maxWidth = 1920;
        const maxHeight = 1080;
        let width = video.videoWidth;
        let height = video.videoHeight;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            // Generate filename for thumbnail
            const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            const thumbnailFilename = `${originalName}_thumbnail.jpg`;
            
            // Convert blob to File object
            const thumbnailFile = new File([blob], thumbnailFilename, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            
            const previewUrl = URL.createObjectURL(blob);
            
            // Cleanup video URL
            URL.revokeObjectURL(video.src);
            clearTimeout(timeout);
            resolved = true;
            
            resolve({ previewUrl, thumbnailFile });
          } else {
            URL.revokeObjectURL(video.src);
            clearTimeout(timeout);
            resolved = true;
            reject(new Error('Failed to create thumbnail blob'));
          }
        }, 'image/jpeg', 0.8);
      } else {
        URL.revokeObjectURL(video.src);
        clearTimeout(timeout);
        resolved = true;
        reject(new Error('Failed to get canvas context'));
      }
    };
    
    video.onerror = () => {
      if (resolved) return;
      URL.revokeObjectURL(video.src);
      clearTimeout(timeout);
      resolved = true;
      reject(new Error('Failed to load video for thumbnail extraction'));
    };
    
    video.src = URL.createObjectURL(file);
  });
}

/**
 * Extract thumbnail from video URL (for existing videos)
 * Similar to createVideoThumbnailFile but works with video URLs instead of File objects
 */
export async function createVideoThumbnailFromUrl(
  videoUrl: string,
  timestamp?: number
): Promise<{ previewUrl: string; thumbnailFile: File }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let resolved = false;
    
    // Set video properties for thumbnail extraction
    video.preload = 'metadata';
    video.muted = true; // Required for programmatic seeking in some browsers
    video.playsInline = true; // Required for iOS
    video.crossOrigin = 'anonymous'; // Required for CORS when loading from Cloudinary
    
    // Timeout handler in case seek fails
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        reject(new Error('Video thumbnail extraction timed out'));
      }
    }, 15000); // 15 second timeout for URL loading
    
    video.onloadedmetadata = () => {
      // Use provided timestamp or default to 0.1 seconds (or 10% of duration)
      const seekTime = timestamp !== undefined 
        ? timestamp 
        : Math.min(0.1, video.duration * 0.1);
      video.currentTime = seekTime;
    };
    
    video.onseeked = () => {
      if (resolved) return;
      if (ctx) {
        // Limit canvas size to avoid memory issues (max 1920x1080)
        const maxWidth = 1920;
        const maxHeight = 1080;
        let width = video.videoWidth;
        let height = video.videoHeight;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (resolved) return;
          if (blob) {
            // Generate filename for thumbnail
            const thumbnailFilename = `thumbnail_${Date.now()}.jpg`;
            
            // Convert blob to File object
            const thumbnailFile = new File([blob], thumbnailFilename, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            
            const previewUrl = URL.createObjectURL(blob);
            
            clearTimeout(timeout);
            resolved = true;
            
            resolve({ previewUrl, thumbnailFile });
          } else {
            clearTimeout(timeout);
            resolved = true;
            reject(new Error('Failed to create thumbnail blob'));
          }
        }, 'image/jpeg', 0.8);
      } else {
        clearTimeout(timeout);
        resolved = true;
        reject(new Error('Failed to get canvas context'));
      }
    };
    
    video.onerror = () => {
      if (resolved) return;
      clearTimeout(timeout);
      resolved = true;
      reject(new Error('Failed to load video for thumbnail extraction. Make sure the video URL is accessible.'));
    };
    
    video.src = videoUrl;
  });
}

/**
 * Revoke object URL to free memory
 */
export function revokePreviewUrl(url: string): void {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

/**
 * Get file metadata
 */
export async function getFileMetadata(file: File): Promise<{ width?: number; height?: number; duration?: number; format: string; size: number }> {
  const extension = getFileExtension(file);
  const type = getFileType(extension);
  const metadata: { width?: number; height?: number; duration?: number; format: string; size: number } = {
    format: extension.replace('.', ''),
    size: file.size,
  };
  
  if (type === 'image') {
    const dimensions = await getImageDimensions(file);
    metadata.width = dimensions.width;
    metadata.height = dimensions.height;
  } else if (type === 'video') {
    const videoMetadata = await getVideoMetadata(file);
    metadata.width = videoMetadata.width;
    metadata.height = videoMetadata.height;
    metadata.duration = videoMetadata.duration;
  }
  
  return metadata;
}

/**
 * Get image dimensions
 */
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Get video metadata
 */
function getVideoMetadata(file: File): Promise<{ width: number; height: number; duration: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      resolve({
        width: video.videoWidth,
        height: video.videoHeight,
        duration: video.duration,
      });
      URL.revokeObjectURL(video.src);
    };
    video.onerror = reject;
    video.src = URL.createObjectURL(file);
  });
}

/**
 * Convert File to base64 string for API transmission
 * Used for sending files to Convex actions (which can't receive File objects directly)
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64String = (reader.result as string).split(',')[1];
      if (!base64String) {
        reject(new Error('Failed to convert file to base64'));
        return;
      }
      resolve(base64String);
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
}
