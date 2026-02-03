import type { Id, TableNames } from "../_generated/dataModel";

/**
 * Generate a fake Convex ID for demo mode
 * These IDs will be returned by mutations for DemoUser to make the UI think operations succeeded
 * Format: Convex IDs are typically like "j1234567890abcdef"
 * We'll use a pattern that's clearly fake but matches the expected format
 */
export function generateFakeId<T extends TableNames>(
  _tableName: T
): Id<T> {
  // Generate a fake ID that matches Convex's ID format
  // Convex IDs start with a letter (like 'j') followed by alphanumeric characters
  // We'll use 'demo' prefix followed by random characters to ensure uniqueness
  const randomPart = Math.random().toString(36).substring(2, 15);
  const timestamp = Date.now().toString(36);
  // Combine to create a unique fake ID
  const fakeId = `demo${timestamp}${randomPart}` as Id<T>;
  return fakeId;
}

/**
 * Generate a fake media object for demo mode
 */
export function generateFakeMedia(args: {
  cloudinaryPublicId: string;
  cloudinarySecureUrl: string;
  filename: string;
  thumbnail: string;
  mediaType: "image" | "video" | "audio" | "document" | "other";
  customMediaTypeId?: string;
  title: string;
  description?: string;
  altText?: string;
  fileSize: number;
  format: string;
  width?: number;
  height?: number;
  duration?: number;
  tags: string[];
  relatedFiles?: string[];
  customMetadata?: any;
  aiGenerated?: boolean;
  dateModified: number;
  isMockData?: boolean;
  mockSourceId?: string;
  uploadedBy: string;
}) {
  const fakeId = generateFakeId("media");
  const now = Date.now();
  
  return {
    _id: fakeId,
    _creationTime: now,
    cloudinaryPublicId: args.cloudinaryPublicId,
    cloudinarySecureUrl: args.cloudinarySecureUrl,
    filename: args.filename,
    thumbnail: args.thumbnail,
    mediaType: args.mediaType,
    customMediaTypeId: args.customMediaTypeId,
    title: args.title,
    description: args.description,
    altText: args.altText,
    fileSize: args.fileSize,
    format: args.format,
    width: args.width,
    height: args.height,
    duration: args.duration,
    tags: args.tags,
    relatedFiles: args.relatedFiles,
    customMetadata: args.customMetadata,
    aiGenerated: args.aiGenerated,
    dateModified: args.dateModified,
    isMockData: args.isMockData ?? false,
    mockSourceId: args.mockSourceId,
    uploadedBy: args.uploadedBy,
  };
}

/**
 * Generate a fake MediaType object for demo mode
 */
export function generateFakeMediaType(args: {
  name: string;
  description?: string;
  color: string;
  allowedFormats: string[];
  fields: Array<{
    id: string;
    name: string;
    label: string;
    type: "text" | "number" | "date" | "select" | "boolean" | "url";
    required: boolean;
    options?: string[];
    validationRegex?: string;
    placeholder?: string;
  }>;
  defaultTags: string[];
  dimensionConstraints?: {
    enabled: boolean;
    aspectRatio: {
      label: string;
      value: number | null;
    };
    minWidth?: number;
    minHeight?: number;
  };
}) {
  const fakeId = generateFakeId("mediaTypes");
  const now = Date.now();
  
  return {
    _id: fakeId,
    _creationTime: now,
    name: args.name,
    description: args.description,
    color: args.color,
    allowedFormats: args.allowedFormats,
    fields: args.fields,
    defaultTags: args.defaultTags,
    dimensionConstraints: args.dimensionConstraints,
  };
}

/**
 * Generate a fake MediaTag object for demo mode
 */
export function generateFakeMediaTag(args: { name: string }) {
  const fakeId = generateFakeId("mediaTags");
  const now = Date.now();
  
  return {
    _id: fakeId,
    _creationTime: now,
    name: args.name.trim(),
  };
}
