/**
 * Pagination utilities for handling paginated data
 */

/**
 * Paginates an array into chunks
 * @param array - Array to paginate
 * @param page - Current page (1-indexed)
 * @param pageSize - Number of items per page
 * @returns Paginated array slice
 */
export function paginateArray<T>(array: T[], page: number, pageSize: number): T[] {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return array.slice(startIndex, endIndex);
}

/**
 * Calculates total number of pages
 * @param totalItems - Total number of items
 * @param pageSize - Number of items per page
 * @returns Total number of pages
 */
export function getTotalPages(totalItems: number, pageSize: number): number {
  return Math.ceil(totalItems / pageSize);
}

/**
 * Checks if there are more pages available
 * @param currentPage - Current page number (1-indexed)
 * @param totalPages - Total number of pages
 * @returns True if there are more pages
 */
export function hasMorePages(currentPage: number, totalPages: number): boolean {
  return currentPage < totalPages;
}
