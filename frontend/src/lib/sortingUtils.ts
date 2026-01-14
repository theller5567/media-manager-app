import type { MediaItem } from './mediaUtils';
import type { SortField, SortDirection } from '@/store/uiStore';

export interface SortConfig {
  sortBy: SortField;
  sortDirection: SortDirection;
  secondarySortBy: SortField | null;
  secondarySortDirection: SortDirection;
}

/**
 * Sort media items based on primary and optional secondary sort criteria
 * @param items - Array of MediaItem objects to sort
 * @param config - Sort configuration with primary and optional secondary sort
 * @returns Sorted array of MediaItem objects
 */
export function sortMediaItems(
  items: MediaItem[],
  config: SortConfig
): MediaItem[] {
  const { sortBy, sortDirection, secondarySortBy, secondarySortDirection } = config;

  // Create a copy to avoid mutating the original array
  const sorted = [...items];

  // Sort function for comparing two items
  const compare = (a: MediaItem, b: MediaItem, field: SortField, direction: SortDirection): number => {
    let comparison = 0;

    switch (field) {
      case 'filename':
        comparison = a.filename.localeCompare(b.filename);
        break;
      case 'dateModified':
        comparison = a.dateModified.getTime() - b.dateModified.getTime();
        break;
      case 'fileSize':
        comparison = a.fileSize - b.fileSize;
        break;
      case 'mediaType':
        comparison = a.mediaType.localeCompare(b.mediaType);
        break;
      default:
        comparison = 0;
    }

    // Apply direction (ascending or descending)
    return direction === 'asc' ? comparison : -comparison;
  };

  // Sort with primary criteria
  sorted.sort((a, b) => {
    const primaryComparison = compare(a, b, sortBy, sortDirection);
    
    // If primary comparison is equal and secondary sort is specified, use secondary sort
    if (primaryComparison === 0 && secondarySortBy) {
      return compare(a, b, secondarySortBy, secondarySortDirection);
    }
    
    return primaryComparison;
  });

  return sorted;
}

/**
 * Get available sort field options with labels
 * @returns Array of sort field options with labels
 */
export function getSortOptions(): Array<{ value: SortField; label: string }> {
  return [
    { value: 'filename', label: 'Filename' },
    { value: 'dateModified', label: 'Date Modified' },
    { value: 'fileSize', label: 'File Size' },
    { value: 'mediaType', label: 'Media Type' },
  ];
}
