import { useEffect, useState, useMemo } from 'react';
import { useDebounce } from './useDebounce';
import type { MediaItem } from '@/lib/mediaUtils';
import { paginateArray, getTotalPages, hasMorePages } from '@/lib/paginationUtils';
import { useUIStore } from '@/store/uiStore';
import { combineFilters } from '@/lib/filteringUtils';
import { sortMediaItems } from '@/lib/sortingUtils';

interface UsePaginatedMediaOptions {
  allData: MediaItem[];
  mode: 'grid' | 'table'; // Grid uses single page, table accumulates pages
}

interface UsePaginatedMediaReturn {
  data: MediaItem[];
  isLoading: boolean;
  hasMore: boolean;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  setPage: (page: number) => void;
  loadMore: () => void; // For infinite scroll
}

/**
 * Hook for paginated media data with search filtering
 * Simulates async loading and prepares for Convex integration
 * 
 * Grid mode: Returns single page of data
 * Table mode: Returns accumulated pages for infinite scroll
 */
export function usePaginatedMedia({
  allData,
  mode,
}: UsePaginatedMediaOptions): UsePaginatedMediaReturn {
  const {
    searchQuery,
    sortBy,
    sortDirection,
    secondarySortBy,
    secondarySortDirection,
    selectedMediaTypes,
    selectedTags,
    currentPage,
    pageSize,
    isLoading,
    hasMore,
    totalCount,
    setCurrentPage,
    setIsLoading,
    setHasMore,
    setTotalCount,
    resetPagination,
  } = useUIStore();

  // Debounce search query
  const debouncedQuery = useDebounce(searchQuery, 300);

  // Apply filters: search → media type → tags
  const filteredData = useMemo(() => {
    return combineFilters(
      allData,
      debouncedQuery,
      selectedMediaTypes,
      selectedTags
    );
  }, [allData, debouncedQuery, selectedMediaTypes, selectedTags]);

  // Apply sorting after filtering
  const sortedData = useMemo(() => {
    return sortMediaItems(filteredData, {
      sortBy,
      sortDirection,
      secondarySortBy,
      secondarySortDirection,
    });
  }, [filteredData, sortBy, sortDirection, secondarySortBy, secondarySortDirection]);

  // Calculate total pages based on sorted data
  const totalPages = useMemo(() => {
    return getTotalPages(sortedData.length, pageSize);
  }, [sortedData.length, pageSize]);

  // State for accumulated pages (table/infinite scroll mode)
  const [loadedPages, setLoadedPages] = useState<number[]>([1]);

  // Reset pagination when filters or sorting change
  useEffect(() => {
    resetPagination();
    setLoadedPages([1]);
  }, [debouncedQuery, selectedMediaTypes, selectedTags, sortBy, sortDirection, secondarySortBy, resetPagination]);

  // Update total count based on sorted data
  useEffect(() => {
    setTotalCount(sortedData.length);
  }, [sortedData.length, setTotalCount]);

  // Update hasMore based on current page and total pages
  useEffect(() => {
    if (mode === 'grid') {
      setHasMore(hasMorePages(currentPage, totalPages));
    } else {
      // For table mode, check if there are more pages to load
      const maxLoadedPage = Math.max(...loadedPages);
      setHasMore(hasMorePages(maxLoadedPage, totalPages));
    }
  }, [currentPage, totalPages, loadedPages, mode, setHasMore]);

  // Simulate async loading for table mode
  useEffect(() => {
    if (mode === 'table' && loadedPages.length > 0) {
      setIsLoading(true);
      // Simulate network delay
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [loadedPages, mode, setIsLoading]);

  // Get data based on mode (using sorted data)
  const data = useMemo(() => {
    // Ensure we have data to work with
    if (!sortedData || sortedData.length === 0) {
      return [];
    }
    
    if (mode === 'grid') {
      // Grid mode: return single page
      const pageData = paginateArray(sortedData, currentPage, pageSize);
      return pageData;
    } else {
      // Table mode: return all loaded pages accumulated
      const allLoadedItems: MediaItem[] = [];
      loadedPages.forEach((page) => {
        const pageData = paginateArray(sortedData, page, pageSize);
        allLoadedItems.push(...pageData);
      });
      return allLoadedItems;
    }
  }, [sortedData, currentPage, pageSize, mode, loadedPages]);

  const setPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      if (mode === 'table' && !loadedPages.includes(page)) {
        setLoadedPages((prev) => [...prev, page].sort((a, b) => a - b));
      }
    }
  };

  const loadMore = () => {
    if (mode === 'table' && !isLoading && hasMore) {
      const maxLoadedPage = Math.max(...loadedPages);
      const nextPage = maxLoadedPage + 1;
      if (nextPage <= totalPages) {
        setIsLoading(true);
        // Simulate network delay
        setTimeout(() => {
          setLoadedPages((prev) => [...prev, nextPage].sort((a, b) => a - b));
          setIsLoading(false);
        }, 300);
      }
    }
  };

  return {
    data,
    isLoading,
    hasMore,
    totalCount,
    currentPage,
    totalPages,
    setPage,
    loadMore,
  };
}
