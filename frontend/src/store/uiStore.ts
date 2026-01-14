import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MediaType } from '@/lib/mediaUtils';

// Define the types for our UI state
export type ViewMode = 'grid' | 'list';
export type SortField = 'filename' | 'dateModified' | 'fileSize' | 'mediaType';
export type SortDirection = 'asc' | 'desc';

// Define the shape of our UI store
interface UIState {
  // View preferences
  viewMode: ViewMode;

  // Search functionality
  searchQuery: string;

  // Sorting state
  sortBy: SortField;
  sortDirection: SortDirection;
  secondarySortBy: SortField | null;
  secondarySortDirection: SortDirection;

  // Filtering state
  selectedMediaTypes: MediaType[];
  selectedTags: string[];

  // Pagination state
  currentPage: number;
  pageSize: number;
  isLoading: boolean;
  hasMore: boolean;
  totalCount: number;

  // Actions to update state
  setViewMode: (mode: ViewMode) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (field: SortField, direction: SortDirection) => void;
  setSecondarySort: (field: SortField | null, direction: SortDirection) => void;
  clearSorting: () => void;
  setMediaTypeFilter: (types: MediaType[]) => void;
  setTagFilter: (tags: string[]) => void;
  clearFilters: () => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setIsLoading: (loading: boolean) => void;
  setHasMore: (hasMore: boolean) => void;
  setTotalCount: (count: number) => void;
  resetPagination: () => void;
}

// Create the Zustand store with persistence
export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Initial state
      viewMode: 'grid', // Default to grid view
      searchQuery: '', // Default to empty search
      sortBy: 'filename', // Default sort by filename
      sortDirection: 'asc', // Default ascending
      secondarySortBy: null, // No secondary sort by default
      secondarySortDirection: 'asc',
      selectedMediaTypes: [], // No media type filter by default
      selectedTags: [], // No tag filter by default
      currentPage: 1, // Start at page 1
      pageSize: 50, // 50 items per page
      isLoading: false,
      hasMore: false,
      totalCount: 0,

      // Actions
      setViewMode: (mode: ViewMode) => set({ viewMode: mode }),
      setSearchQuery: (query: string) => set({ searchQuery: query }),
      setSortBy: (field: SortField, direction: SortDirection) => 
        set({ sortBy: field, sortDirection: direction }),
      setSecondarySort: (field: SortField | null, direction: SortDirection) => 
        set({ secondarySortBy: field, secondarySortDirection: direction }),
      clearSorting: () => set({ 
        sortBy: 'filename', 
        sortDirection: 'asc', 
        secondarySortBy: null,
        secondarySortDirection: 'asc'
      }),
      setMediaTypeFilter: (types: MediaType[]) => set({ selectedMediaTypes: types }),
      setTagFilter: (tags: string[]) => set({ selectedTags: tags }),
      clearFilters: () => set({ selectedMediaTypes: [], selectedTags: [] }),
      setCurrentPage: (page: number) => set({ currentPage: page }),
      setPageSize: (size: number) => set({ pageSize: size }),
      setIsLoading: (loading: boolean) => set({ isLoading: loading }),
      setHasMore: (hasMore: boolean) => set({ hasMore }),
      setTotalCount: (count: number) => set({ totalCount: count }),
      resetPagination: () => set({ currentPage: 1, hasMore: false }),
    }),
    {
      name: 'ui-store', // Key for localStorage
      // Persist viewMode, searchQuery, sorting, and filtering preferences
      partialize: (state) => ({
        viewMode: state.viewMode,
        searchQuery: state.searchQuery,
        sortBy: state.sortBy,
        sortDirection: state.sortDirection,
        secondarySortBy: state.secondarySortBy,
        secondarySortDirection: state.secondarySortDirection,
        selectedMediaTypes: state.selectedMediaTypes,
        selectedTags: state.selectedTags,
      }),
    }
  )
);

// Export hooks for convenience
export const useViewMode = () => {
  const { viewMode, setViewMode } = useUIStore();
  return { viewMode, setViewMode };
};

export const useSearchQuery = () => {
  const { searchQuery, setSearchQuery } = useUIStore();
  return { searchQuery, setSearchQuery };
};