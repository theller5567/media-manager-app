import type { MediaItem, MediaType } from './mediaUtils';
import { filterMediaItems } from './mediaUtils';

/**
 * Filter media items by selected media types
 * @param items - Array of MediaItem objects to filter
 * @param types - Array of selected media types
 * @returns Filtered array of MediaItem objects (all items if no types selected)
 */
export function filterByMediaType(
  items: MediaItem[],
  types: MediaType[]
): MediaItem[] {
  if (!types || types.length === 0) {
    return items;
  }

  return items.filter((item) => types.includes(item.mediaType));
}

/**
 * Filter media items by selected tags
 * Items must have at least one of the selected tags
 * @param items - Array of MediaItem objects to filter
 * @param tags - Array of selected tags
 * @returns Filtered array of MediaItem objects (all items if no tags selected)
 */
export function filterByTags(
  items: MediaItem[],
  tags: string[]
): MediaItem[] {
  if (!tags || tags.length === 0) {
    return items;
  }

  return items.filter((item) => {
    // Item must have at least one of the selected tags
    return item.tags.some((tag) => tags.includes(tag));
  });
}

/**
 * Extract unique tags from all media items
 * @param items - Array of MediaItem objects
 * @returns Sorted array of unique tag strings
 */
export function getAvailableTags(items: MediaItem[]): string[] {
  const tagSet = new Set<string>();

  items.forEach((item) => {
    item.tags.forEach((tag) => {
      tagSet.add(tag);
    });
  });

  return Array.from(tagSet).sort();
}

/**
 * Combine multiple filters (search query, media type, tags) in sequence
 * Applies filters in order: search → media type → tags
 * @param items - Array of MediaItem objects to filter
 * @param searchQuery - Search query string
 * @param mediaTypes - Array of selected media types
 * @param tags - Array of selected tags
 * @returns Filtered array of MediaItem objects
 */
export function combineFilters(
  items: MediaItem[],
  searchQuery: string,
  mediaTypes: MediaType[],
  tags: string[]
): MediaItem[] {
  let filtered = items;

  // Apply search filter first
  if (searchQuery && searchQuery.trim() !== '') {
    filtered = filterMediaItems(filtered, searchQuery);
  }

  // Apply media type filter
  filtered = filterByMediaType(filtered, mediaTypes);

  // Apply tag filter
  filtered = filterByTags(filtered, tags);

  return filtered;
}
