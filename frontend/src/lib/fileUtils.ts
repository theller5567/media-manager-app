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
  
  if (type === 'image') {
    preview = URL.createObjectURL(file);
  } else if (type === 'video') {
    // Create thumbnail from video
    preview = await createVideoThumbnail(file);
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
  };
}

/**
 * Create thumbnail from video file
 */
async function createVideoThumbnail(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      video.currentTime = 0.1; // Seek to 0.1 seconds
    };
    
    video.onseeked = () => {
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(URL.createObjectURL(blob));
          } else {
            resolve('');
          }
        }, 'image/jpeg', 0.8);
      } else {
        resolve('');
      }
    };
    
    video.onerror = () => {
      resolve('');
    };
    
    video.src = URL.createObjectURL(file);
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
