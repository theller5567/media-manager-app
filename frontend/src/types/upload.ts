import type { MediaType } from './mediaType';

export interface FilePreview {
  id: string;
  file: File;
  preview: string; // Object URL for thumbnail
  extension: string;
  size: number;
  type: 'image' | 'video' | 'document' | 'audio' | 'other';
  thumbnailFile?: File; // Thumbnail File object for video files (for upload)
}

export interface CommonFields {
  title: string;
  description: string;
  altText: string;
  tags: string[];
}

export interface AISuggestions {
  title?: string;
  description?: string;
  altText?: string;
  tags?: string[];
}

export interface UploadFileData {
  fileId: string;
  mediaTypeId?: string;
  commonFields: CommonFields;
  customFields: Record<string, any>;
  relatedFiles: string[];
}

export interface UploadState {
  step: number;
  files: FilePreview[];
  selectedMediaType: MediaType | null;
  useAI: boolean;
  aiProcessing: boolean;
  aiSuggestions: AISuggestions;
  commonFields: CommonFields;
  perFileFields: Record<string, Record<string, any>>;
  relatedFiles: string[];
  perFileRelatedFiles: Record<string, string[]>;
  errors: Record<string, string[]>;
  fieldValidationErrors: Record<string, Record<string, string[]>>; // Per-file, per-field validation errors
  uploading: boolean;
  uploadProgress: Record<string, number>;
}

export interface UploadResult {
  publicId: string;
  secureUrl: string;
  width?: number;
  height?: number;
  duration?: number;
  format: string;
  bytes: number;
}

export interface FileMetadata {
  width?: number;
  height?: number;
  duration?: number;
  format: string;
  size: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
