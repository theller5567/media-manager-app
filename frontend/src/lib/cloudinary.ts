import type { UploadResult, FileMetadata, ValidationResult } from '@/types/upload';

let cloudinaryConfig: {
  cloudName: string;
  apiKey: string;
  uploadPreset: string;
} | null = null;

/**
 * Configure Cloudinary with environment variables
 */
export function configureCloudinary(): void {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !apiKey || !uploadPreset) {
    console.warn('Cloudinary configuration missing. Please set VITE_CLOUDINARY_CLOUD_NAME, VITE_CLOUDINARY_API_KEY, and VITE_CLOUDINARY_UPLOAD_PRESET');
    return;
  }

  cloudinaryConfig = {
    cloudName,
    apiKey,
    uploadPreset,
  };
}

/**
 * Get maximum file size based on file type
 */
function getMaxFileSize(fileType: string): number {
  if (fileType.startsWith('image/')) {
    return 20 * 1024 * 1024; // 20MB for images
  }
  if (fileType.startsWith('video/')) {
    return 500 * 1024 * 1024; // 500MB for videos
  }
  return 100 * 1024 * 1024; // 100MB default for documents/audio/other
}

/**
 * Get human-readable file size limit message
 */
export function getFileSizeLimitMessage(fileType: string): string {
  if (fileType.startsWith('image/')) {
    return '20MB';
  }
  if (fileType.startsWith('video/')) {
    return '500MB';
  }
  return '100MB';
}

/**
 * Validate file before upload
 */
export function validateFile(file: File): ValidationResult {
  const errors: string[] = [];
  const maxSize = getMaxFileSize(file.type);
  const limitMessage = getFileSizeLimitMessage(file.type);

  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size exceeds ${limitMessage} limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
  }

  // Check file type (basic validation)
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/avif',
    'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm',
    'application/pdf',
    'audio/mpeg', 'audio/wav', 'audio/ogg',
  ];

  if (!allowedTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|gif|webp|svg|avif|mp4|mov|avi|webm|pdf|mp3|wav|ogg)$/i)) {
    errors.push(`File type not supported: ${file.type || 'unknown'}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Determine resource type from file MIME type
 */
function getResourceType(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'video'; // Audio files use video resource type
  return 'auto'; // Let Cloudinary auto-detect
}

/**
 * Upload large file using Cloudinary's chunked upload API
 * Required for files >100MB
 */
async function uploadLargeFile(
  file: File,
  onProgress?: (progress: number) => void,
  chunkSize: number = 20 * 1024 * 1024 // 20MB default chunk size
): Promise<UploadResult> {
  if (!cloudinaryConfig) {
    configureCloudinary();
  }

  if (!cloudinaryConfig) {
    throw new Error('Cloudinary not configured. Please set environment variables.');
  }

  const config = cloudinaryConfig; // Store in local variable for TypeScript

  const resourceType = getResourceType(file.type);
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', config.uploadPreset);
  formData.append('api_key', config.apiKey);
  formData.append('resource_type', resourceType);
  
  // Set chunk size (minimum 5MB, default 20MB)
  const actualChunkSize = Math.max(chunkSize, 5 * 1024 * 1024);
  formData.append('chunk_size', actualChunkSize.toString());
  
  // For very large files (>20GB), enable async processing
  if (file.size > 20 * 1024 * 1024 * 1024) {
    formData.append('async', 'true');
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const progress = Math.round((e.loaded / e.total) * 100);
        onProgress(progress);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve({
            publicId: response.public_id,
            secureUrl: response.secure_url,
            width: response.width,
            height: response.height,
            duration: response.duration,
            format: response.format,
            bytes: response.bytes,
          });
        } catch (error) {
          reject(new Error('Failed to parse Cloudinary response'));
        }
      } else {
        try {
          const response = JSON.parse(xhr.responseText);
          const errorMessage = response.error?.message || response.message || 'Chunked upload failed';
          reject(new Error(`Chunked upload failed: ${errorMessage}`));
        } catch {
          reject(new Error(`Chunked upload failed with status ${xhr.status}`));
        }
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during chunked upload'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Chunked upload aborted'));
    });

    // Use upload_large endpoint for chunked uploads
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${config.cloudName}/${resourceType}/upload_large`);
    xhr.send(formData);
  });
}

/**
 * Upload regular file (non-chunked) to Cloudinary
 */
async function uploadRegularFile(
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  if (!cloudinaryConfig) {
    configureCloudinary();
  }

  if (!cloudinaryConfig) {
    throw new Error('Cloudinary not configured. Please set environment variables.');
  }

  const config = cloudinaryConfig; // Store in local variable for TypeScript

  const resourceType = getResourceType(file.type);
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', config.uploadPreset);
  formData.append('api_key', config.apiKey);
  formData.append('resource_type', resourceType);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const progress = Math.round((e.loaded / e.total) * 100);
        onProgress(progress);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve({
            publicId: response.public_id,
            secureUrl: response.secure_url,
            width: response.width,
            height: response.height,
            duration: response.duration,
            format: response.format,
            bytes: response.bytes,
          });
        } catch (error) {
          reject(new Error('Failed to parse Cloudinary response'));
        }
      } else {
        try {
          const response = JSON.parse(xhr.responseText);
          // Cloudinary error format can be either error.message or error.error.message
          const errorMessage = response.error?.message || response.message || 'Upload failed';
          
          // Check if error suggests file is too large for regular upload
          if (errorMessage.includes('too large') || errorMessage.includes('413') || xhr.status === 413) {
            reject(new Error(`File is too large for regular upload. Files over 100MB require chunked upload. Please try again or contact support if the issue persists.`));
          } else {
            reject(new Error(errorMessage));
          }
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload aborted'));
    });

    xhr.open('POST', `https://api.cloudinary.com/v1_1/${config.cloudName}/${resourceType}/upload`);
    xhr.send(formData);
  });
}

/**
 * Upload thumbnail image to Cloudinary
 * Forces resource_type to 'image' and optimizes for thumbnail size
 */
export async function uploadThumbnail(
  thumbnailFile: File,
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  if (!cloudinaryConfig) {
    configureCloudinary();
  }

  if (!cloudinaryConfig) {
    throw new Error('Cloudinary not configured. Please set environment variables.');
  }

  const config = cloudinaryConfig;

  // Force resource_type to 'image' for thumbnails
  const formData = new FormData();
  formData.append('file', thumbnailFile);
  formData.append('upload_preset', config.uploadPreset);
  formData.append('api_key', config.apiKey);
  formData.append('resource_type', 'image');
  
  // Add folder prefix to organize thumbnails
  formData.append('folder', 'thumbnails');
  
  // Add tag to identify as thumbnail
  formData.append('tags', 'thumbnail');

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const progress = Math.round((e.loaded / e.total) * 100);
        onProgress(progress);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve({
            publicId: response.public_id,
            secureUrl: response.secure_url,
            width: response.width,
            height: response.height,
            duration: response.duration,
            format: response.format,
            bytes: response.bytes,
          });
        } catch (error) {
          reject(new Error('Failed to parse Cloudinary response'));
        }
      } else {
        try {
          const response = JSON.parse(xhr.responseText);
          const errorMessage = response.error?.message || response.message || 'Thumbnail upload failed';
          reject(new Error(errorMessage));
        } catch {
          reject(new Error(`Thumbnail upload failed with status ${xhr.status}`));
        }
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during thumbnail upload'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Thumbnail upload aborted'));
    });

    xhr.open('POST', `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`);
    xhr.send(formData);
  });
}

/**
 * Upload file to Cloudinary with progress tracking
 * Automatically uses chunked upload for files >100MB
 */
export async function uploadFile(
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  const chunkThreshold = 100 * 1024 * 1024; // 100MB threshold for chunked upload

  // Use chunked upload for large files
  if (file.size > chunkThreshold) {
    return uploadLargeFile(file, onProgress);
  }

  // Use regular upload for smaller files
  return uploadRegularFile(file, onProgress);
}

/**
 * Extract metadata from uploaded file
 */
export async function extractMetadata(publicId: string, resourceType: string): Promise<FileMetadata> {
  if (!cloudinaryConfig) {
    configureCloudinary();
  }

  if (!cloudinaryConfig) {
    throw new Error('Cloudinary not configured');
  }

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/resources/${resourceType}/${publicId}?api_key=${cloudinaryConfig.apiKey}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch metadata');
    }

    const data = await response.json();
    return {
      width: data.width,
      height: data.height,
      duration: data.duration,
      format: data.format,
      size: data.bytes,
    };
  } catch (error) {
    throw new Error(`Failed to extract metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate thumbnail URL for images
 */
export function generateThumbnailUrl(publicId: string, options?: { width?: number; height?: number; crop?: string }): string {
  if (!cloudinaryConfig) {
    configureCloudinary();
  }

  if (!cloudinaryConfig) {
    return '';
  }

  const width = options?.width || 300;
  const height = options?.height || 300;
  const crop = options?.crop || 'fill';

  return `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload/w_${width},h_${height},c_${crop}/${publicId}`;
}

/**
 * Generate thumbnail URL for videos
 * Cloudinary automatically generates a thumbnail frame from the video
 */
export function generateVideoThumbnailUrl(publicId: string, options?: { width?: number; height?: number; crop?: string }): string {
  if (!cloudinaryConfig) {
    configureCloudinary();
  }

  if (!cloudinaryConfig) {
    return '';
  }

  const width = options?.width || 300;
  const height = options?.height || 300;
  const crop = options?.crop || 'fill';

  // Cloudinary video thumbnail: use video transformation with jpg format
  return `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/video/upload/w_${width},h_${height},c_${crop}/${publicId}.jpg`;
}

/**
 * Image transformation options for Cloudinary
 */
export interface ImageTransformationOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'scale' | 'thumb' | 'limit';
  format?: 'jpg' | 'png' | 'webp' | 'avif' | 'gif';
  quality?: 'auto' | number; // 1-100 or 'auto'
  removeBackground?: boolean; // Requires Cloudinary AI addon
  gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west';
  radius?: number; // Border radius
  effect?: string; // e.g., 'blur:300', 'sharpen', 'vignette'
}

/**
 * Video transformation options for Cloudinary
 */
export interface VideoTransformationOptions {
  width?: number;
  height?: number;
  format?: 'mp4' | 'webm' | 'mov';
  quality?: 'auto' | number;
  bitRate?: number; // Video bitrate
  fps?: number; // Frames per second
  startOffset?: number; // Start time in seconds
  duration?: number; // Duration in seconds
}

/**
 * Extract public ID from Cloudinary URL
 */
export function extractPublicIdFromUrl(url: string): string | null {
  try {
    // Cloudinary URL format: https://res.cloudinary.com/{cloudName}/{resourceType}/upload/{publicId}.{format}
    // or: https://res.cloudinary.com/{cloudName}/{resourceType}/upload/{transformations}/{publicId}.{format}
    const match = url.match(/\/upload\/(?:[^\/]+\/)?([^\/]+?)(?:\.[^.]+)?$/);
    if (match && match[1]) {
      return match[1];
    }
    return null;
  } catch (error) {
    console.error('Failed to extract public ID from URL:', error);
    return null;
  }
}

/**
 * Build Cloudinary transformation URL for images
 */
export function buildImageTransformationUrl(
  publicId: string,
  options: ImageTransformationOptions
): string {
  if (!cloudinaryConfig) {
    configureCloudinary();
  }

  if (!cloudinaryConfig) {
    throw new Error('Cloudinary not configured. Please set environment variables.');
  }

  // If publicId is a full Cloudinary URL, extract just the public ID
  let cleanPublicId = publicId;
  if (publicId.startsWith('http://') || publicId.startsWith('https://')) {
    const extracted = extractPublicIdFromUrl(publicId);
    if (extracted) {
      cleanPublicId = extracted;
    }
  }

  // Strip file extension from public ID if present
  // Cloudinary public IDs should not include extensions in transformation URLs
  // Public IDs can include folder paths (e.g., "folder/subfolder/image")
  // Note: Do NOT URL-encode the public ID as Cloudinary handles path segments directly
  cleanPublicId = cleanPublicId.replace(/\.[^/.]+$/, '');

  const transformations: string[] = [];

  // Size transformations
  if (options.width) {
    transformations.push(`w_${options.width}`);
  }
  if (options.height) {
    transformations.push(`h_${options.height}`);
  }
  if (options.crop) {
    transformations.push(`c_${options.crop}`);
  }
  if (options.gravity) {
    transformations.push(`g_${options.gravity}`);
  }

  // Format - specify in transformation string
  // Cloudinary accepts both 'jpg' and 'jpeg', normalize 'jpg' to 'jpeg' for the f_ parameter
  if (options.format) {
    const cloudinaryFormat = options.format === 'jpg' ? 'jpeg' : options.format;
    transformations.push(`f_${cloudinaryFormat}`);
  }

  // Quality
  if (options.quality) {
    if (options.quality === 'auto') {
      transformations.push('q_auto');
    } else if (typeof options.quality === 'number') {
      transformations.push(`q_${Math.max(1, Math.min(100, options.quality))}`);
    }
  }

  // Effects
  if (options.effect) {
    transformations.push(`e_${options.effect}`);
  }

  // Background removal (requires Cloudinary AI addon)
  if (options.removeBackground) {
    transformations.push('e_background_removal');
  }

  // Border radius
  if (options.radius) {
    transformations.push(`r_${options.radius}`);
  }

  // Build transformation string according to Cloudinary URL format:
  // https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{public_id}.{extension}
  // Transformations are comma-separated and must end with a trailing slash if present
  const transformationString = transformations.length > 0
    ? `${transformations.join(',')}/`
    : '';

  // Format extension - optional when f_ format is specified, but adding it helps browser compatibility
  // Cloudinary docs: "The file extension of the requested delivery format for the asset"
  // Use .jpg extension for jpeg format (more standard browser extension)
  const formatExtension = options.format 
    ? `.${options.format === 'jpg' ? 'jpg' : options.format}` 
    : '';

  // Construct the final URL
  // Public ID should be used as-is (no URL encoding needed for path segments)
  return `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload/${transformationString}${cleanPublicId}${formatExtension}`;
}

/**
 * Build Cloudinary transformation URL for videos
 */
export function buildVideoTransformationUrl(
  publicId: string,
  options: VideoTransformationOptions
): string {
  if (!cloudinaryConfig) {
    configureCloudinary();
  }

  if (!cloudinaryConfig) {
    throw new Error('Cloudinary not configured. Please set environment variables.');
  }

  // If publicId is a full Cloudinary URL, extract just the public ID
  let cleanPublicId = publicId;
  if (publicId.startsWith('http://') || publicId.startsWith('https://')) {
    const extracted = extractPublicIdFromUrl(publicId);
    if (extracted) {
      cleanPublicId = extracted;
    }
  }

  // Strip file extension from public ID if present
  // Cloudinary public IDs should not include extensions in transformation URLs
  // Public IDs can include folder paths (e.g., "folder/subfolder/video")
  // Note: Do NOT URL-encode the public ID as Cloudinary handles path segments directly
  cleanPublicId = cleanPublicId.replace(/\.[^/.]+$/, '');

  const transformations: string[] = [];

  // Size transformations
  if (options.width) {
    transformations.push(`w_${options.width}`);
  }
  if (options.height) {
    transformations.push(`h_${options.height}`);
  }

  // Format - specify in transformation string
  if (options.format) {
    transformations.push(`f_${options.format}`);
  }

  // Quality
  if (options.quality) {
    if (options.quality === 'auto') {
      transformations.push('q_auto');
    } else if (typeof options.quality === 'number') {
      transformations.push(`q_${Math.max(1, Math.min(100, options.quality))}`);
    }
  }

  // Bitrate
  if (options.bitRate) {
    transformations.push(`br_${options.bitRate}`);
  }

  // FPS
  if (options.fps) {
    transformations.push(`fps_${options.fps}`);
  }

  // Start offset (for trimming)
  if (options.startOffset !== undefined) {
    transformations.push(`so_${options.startOffset}`);
  }

  // Duration
  if (options.duration) {
    transformations.push(`du_${options.duration}`);
  }

  // Build transformation string according to Cloudinary URL format:
  // https://res.cloudinary.com/{cloud_name}/video/upload/{transformations}/{public_id}.{extension}
  // Transformations are comma-separated and must end with a trailing slash if present
  const transformationString = transformations.length > 0
    ? `${transformations.join(',')}/`
    : '';

  // Format extension - optional when f_ format is specified, but adding it helps browser compatibility
  // Cloudinary docs: "The file extension of the requested delivery format for the asset"
  // Use .mp4 extension for mp4 format (standard video extension)
  const formatExtension = options.format ? `.${options.format}` : '';

  // Construct the final URL
  // Public ID should be used as-is (no URL encoding needed for path segments)
  return `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/video/upload/${transformationString}${cleanPublicId}${formatExtension}`;
}

// Initialize on module load
configureCloudinary();
