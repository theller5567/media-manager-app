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
 * Validate file before upload
 */
export function validateFile(file: File): ValidationResult {
  const errors: string[] = [];
  const maxSize = 100 * 1024 * 1024; // 100MB

  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size exceeds 100MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
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
 * Upload file to Cloudinary with progress tracking
 */
export async function uploadFile(
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  if (!cloudinaryConfig) {
    configureCloudinary();
  }

  if (!cloudinaryConfig) {
    throw new Error('Cloudinary not configured. Please set environment variables.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', cloudinaryConfig.uploadPreset);
  formData.append('api_key', cloudinaryConfig.apiKey);

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
          reject(new Error(errorMessage));
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

    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/auto/upload`);
    xhr.send(formData);
  });
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
 * Generate thumbnail URL
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

// Initialize on module load
configureCloudinary();
