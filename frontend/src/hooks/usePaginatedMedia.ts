import { useEffect, useState, useMemo } from 'react';
import { useDebounce } from './useDebounce';
import { filterMediaItems, type MediaItem } from '@/lib/mediaUtils';
import { paginateArray, getTotalPages, hasMorePages } from '@/lib/paginationUtils';
import { useUIStore } from '@/store/uiStore';

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

  // Filter data based on search query
  const filteredData = useMemo(() => {
    return filterMediaItems(allData, debouncedQuery);
  }, [allData, debouncedQuery]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return getTotalPages(filteredData.length, pageSize);
  }, [filteredData.length, pageSize]);

  // State for accumulated pages (table/infinite scroll mode)
  const [loadedPages, setLoadedPages] = useState<number[]>([1]);

  // Reset pagination when search query changes
  useEffect(() => {
    resetPagination();
    setLoadedPages([1]);
  }, [debouncedQuery, resetPagination]);

  // Update total count
  useEffect(() => {
    setTotalCount(filteredData.length);
  }, [filteredData.length, setTotalCount]);

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

  // Get data based on mode
  const data = useMemo(() => {
    // Ensure we have data to work with
    if (!filteredData || filteredData.length === 0) {
      return [];
    }
    
    if (mode === 'grid') {
      // Grid mode: return single page
      const pageData = paginateArray(filteredData, currentPage, pageSize);
      return pageData;
    } else {
      // Table mode: return all loaded pages accumulated
      const allLoadedItems: MediaItem[] = [];
      loadedPages.forEach((page) => {
        const pageData = paginateArray(filteredData, page, pageSize);
        allLoadedItems.push(...pageData);
      });
      return allLoadedItems;
    }
  }, [filteredData, currentPage, pageSize, mode, loadedPages]);

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
