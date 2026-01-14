import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define the types for our UI state
export type ViewMode = 'grid' | 'list';

// Define the shape of our UI store
interface UIState {
  // View preferences
  viewMode: ViewMode;

  // Search functionality
  searchQuery: string;

  // Pagination state
  currentPage: number;
  pageSize: number;
  isLoading: boolean;
  hasMore: boolean;
  totalCount: number;

  // Actions to update state
  setViewMode: (mode: ViewMode) => void;
  setSearchQuery: (query: string) => void;
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
      currentPage: 1, // Start at page 1
      pageSize: 50, // 50 items per page
      isLoading: false,
      hasMore: false,
      totalCount: 0,

      // Actions
      setViewMode: (mode: ViewMode) => set({ viewMode: mode }),
      setSearchQuery: (query: string) => set({ searchQuery: query }),
      setCurrentPage: (page: number) => set({ currentPage: page }),
      setPageSize: (size: number) => set({ pageSize: size }),
      setIsLoading: (loading: boolean) => set({ isLoading: loading }),
      setHasMore: (hasMore: boolean) => set({ hasMore }),
      setTotalCount: (count: number) => set({ totalCount: count }),
      resetPagination: () => set({ currentPage: 1, hasMore: false }),
    }),
    {
      name: 'ui-store', // Key for localStorage
      // Persist viewMode and searchQuery, but not pagination state
      partialize: (state) => ({
        viewMode: state.viewMode,
        searchQuery: state.searchQuery,
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