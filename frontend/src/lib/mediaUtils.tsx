import React from "react";
import {
  FileImage,
  FileVideo,
  FileAudio,
  FileText,
  File,
} from "lucide-react";
import { getMediaTypeById } from "@/data/mockMediaTypes";

export type MediaType = "image" | "video" | "audio" | "document" | "other";

export interface MediaItem {
  id: string;
  filename: string;
  thumbnail: string;
  mediaType: MediaType;
  customMediaTypeId?: string; // Link to MediaType if selected
  title: string; // Required - Generated from filename if not provided
  description?: string;
  altText?: string;
  fileSize: number;
  tags: string[];
  dateModified: Date;
  relatedFiles?: string[]; // IDs of related media items
  customMetadata?: Record<string, any>; // Custom field values
  aiGenerated?: boolean;
}

/**
 * Returns the appropriate Lucide icon component for a given media type
 * @param mediaType - The type of media file
 * @returns React component type for the media type icon
 */
export const getMediaTypeIcon = (mediaType: MediaType): React.ComponentType<{ className?: string }> => {
  switch (mediaType) {
    case "image":
      return FileImage;
    case "video":
      return FileVideo;
    case "audio":
      return FileAudio;
    case "document":
      return FileText;
    default:
      return File;
  }
};

/**
 * Get media type by customMediaTypeId
 * @param customMediaTypeId - The ID of the custom MediaType (e.g., "1", "2")
 * @returns The MediaType object or undefined if not found
 */
export function getCustomMediaTypeById(customMediaTypeId?: string): string | undefined {
  if(!customMediaTypeId) {
    return undefined;
  }
  const mediaType = getMediaTypeById(customMediaTypeId);
  return mediaType?.name || "Standard";
}

/**
 * Get media type color from customMediaTypeId
 * @param customMediaTypeId - The ID of the custom MediaType (e.g., "1", "2")
 * @returns Hex color string (e.g., "#ff9900") or default cyan-500 if not found
 */
export function getMediaTypeColor(customMediaTypeId?: string): string {
  if (!customMediaTypeId) {
    return '#06b6d4'; // cyan-500 default
  }
  
  const mediaType = getMediaTypeById(customMediaTypeId);
  return mediaType?.color || '#06b6d4'; // Fallback to cyan-500 if not found
}

/**
 * Formats file size in human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Filters media items based on a search query
 * Searches across filename, mediaType, and tags using case-insensitive matching
 * @param items - Array of MediaItem objects to filter
 * @param query - Search query string
 * @returns Filtered array of MediaItem objects
 */
export const filterMediaItems = (items: MediaItem[], query: string): MediaItem[] => {
  if (!query || query.trim() === "") {
    return items;
  }

  const searchTerm = query.toLowerCase().trim();

  return items.filter((item) => {
    // Search in filename
    if (item.filename.toLowerCase().includes(searchTerm)) {
      return true;
    }

    // Search in mediaType
    if (item.mediaType.toLowerCase().includes(searchTerm)) {
      return true;
    }

    // Search in tags
    if (item.tags.some(tag => tag.toLowerCase().includes(searchTerm))) {
      return true;
    }

    return false;
  });
};