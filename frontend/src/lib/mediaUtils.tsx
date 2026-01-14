import React from "react";
import {
  FileImage,
  FileVideo,
  FileAudio,
  FileText,
  File,
} from "lucide-react";

export type MediaType = "image" | "video" | "audio" | "document" | "other";

export interface MediaItem {
  id: string;
  filename: string;
  thumbnail: string;
  mediaType: MediaType;
  fileSize: number;
  tags: string[];
  dateModified: Date;
}

/**
 * Returns the appropriate Lucide icon for a given media type
 * @param mediaType - The type of media file
 * @returns React component for the media type icon
 */
export const getMediaTypeIcon = (mediaType: MediaType): React.ReactElement => {
  switch (mediaType) {
    case "image":
      return <FileImage className="h-4 w-4 text-cyan-500" />;
    case "video":
      return <FileVideo className="h-4 w-4 text-pink-500" />;
    case "audio":
      return <FileAudio className="h-4 w-4 text-emerald-500" />;
    case "document":
      return <FileText className="h-4 w-4 text-violet-500" />;
    default:
      return <File className="h-4 w-4 text-gray-500" />;
  }
};

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