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

// Initialize on module load
configureCloudinary();
