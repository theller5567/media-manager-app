---
name: Performance Optimization for Large Media Datasets
overview: Implement server-side pagination, virtualization, pagination controls for grid view, debounced search, and lazy image loading to handle 1000+ media files efficiently. Prepare architecture for Convex integration while maintaining mock data compatibility.
todos:
  - id: install-dependencies
    content: Install @tanstack/react-virtual package
    status: completed
  - id: create-debounce-hook
    content: Create useDebounce hook for search input debouncing
    status: in_progress
  - id: create-lazy-image
    content: Create LazyImage component with Intersection Observer
    status: pending
  - id: create-pagination-utils
    content: Create pagination utilities for mock data handling
    status: pending
  - id: update-ui-store
    content: Add pagination state (currentPage, pageSize, isLoading, hasMore) to uiStore
    status: completed
  - id: create-paginated-hook
    content: Create usePaginatedMedia hook for data fetching with pagination
    status: completed
  - id: virtualize-table
    content: Integrate @tanstack/react-virtual into MediaTable component (list view)
    status: in_progress
  - id: paginated-grid
    content: Implement pagination controls for grid view in MediaList
    status: pending
  - id: lazy-load-images
    content: Replace img tags with LazyImage component in grid view
    status: pending
  - id: create-loading-skeleton
    content: Create LoadingSkeleton component for loading states
    status: pending
---

# Performance Optimization for Large Media Datasets

## Goal

Optimize media library performance to handle 1000+ items without lag, implementing virtualization for table view, pagination for grid view, debounced search, and lazy loading. Remember to use pnpm not npm.

## Architecture Overview

```
┌─────────────────────────────────────────┐
│  Convex Backend (Future Integration)    │
│  - Paginated queries (50 items/page)   │
│  - Server-side filtering/search         │
│  - Indexed database queries             │
└──────────────┬──────────────────────────┘
               │ (Prepared for future)
┌──────────────▼──────────────────────────┐
│  Frontend Optimizations                 │
│  - Debounced search (300ms)             │
│  - Virtualized table (@tanstack/virtual)│
│  - Paginated grid view (page controls) │
│  - Lazy image loading                   │
│  - Paginated mock data (current)        │
└─────────────────────────────────────────┘
```

## View-Specific Strategy

**Grid View (Paginated):**

- Pagination controls (Previous/Next, page numbers)
- 50 items per page
- Simple to implement, still performant
- Better for browsing large collections

**List/Table View (Virtualized + Infinite Scroll):**

- @tanstack/react-virtual for row virtualization
- Infinite scroll - Load more data as user scrolls (50 items per page)
- Only renders visible rows (10-20 at a time)
- Accumulates loaded pages in memory as user scrolls
- Smooth scrolling for 10,000+ items
- Better for detailed data viewing
- Lower memory usage than loading all at once

## Implementation Phases

### Phase 1: Install Dependencies & Create Utilities

**Files to Create/Modify:**

- `frontend/package.json` - Add @tanstack/react-virtual
- `frontend/src/hooks/useDebounce.ts` - Debounce hook for search
- `frontend/src/components/ui/LazyImage.tsx` - Lazy loading image component
- `frontend/src/lib/paginationUtils.ts` - Pagination utilities for mock data

### Phase 2: Update Zustand Store

**File:** `frontend/src/store/uiStore.ts`

- Add pagination state (currentPage, pageSize)
- Add loading states (isLoading, hasMore)
- Add total count for result display
- Keep searchQuery (already exists)

### Phase 3: Create Paginated Data Hook

**File:** `frontend/src/hooks/usePaginatedMedia.ts`

- Simulate pagination with mock data
- Structure matches future Convex query pattern
- Returns: { data, isLoading, hasMore, totalCount, currentPage, setPage }
- Handles search filtering with debounced query
- Works for both grid (paginated) and table (virtualized) views

### Phase 4: Virtualize Table View with Infinite Scroll (List View)

**File:** `frontend/src/components/layout/MediaTable.tsx`

- Integrate @tanstack/react-virtual
- Virtualize table rows (only render visible items)
- Implement infinite scroll with Intersection Observer
- Load next page (50 items) when user scrolls near bottom
- Accumulate loaded pages in memory
- Show loading indicator while fetching next page
- Maintain existing column definitions
- Handle empty states properly
- Smooth scrolling performance

### Phase 5: Paginated Grid View

**File:** `frontend/src/components/layout/MediaList.tsx`

- Implement pagination controls component
- Show current page of items (50 items per page)
- Display page info (e.g., "Page 1 of 20")
- Previous/Next buttons + page number navigation
- Show loading skeleton while fetching new page
- Responsive pagination (simplified on mobile)

### Phase 6: Lazy Image Loading

**File:** `frontend/src/components/ui/LazyImage.tsx`

- Use Intersection Observer for viewport detection
- Show placeholder/skeleton while not in viewport
- Progressive image loading
- Error fallback to media type icon

## Detailed Implementation

### 1. Dependencies

```bash
pnpm add @tanstack/react-virtual
```

### 2. Debounce Hook (`useDebounce.ts`)

- Generic hook for debouncing any value
- 300ms delay for search
- Prevents excessive filtering/re-renders

### 3. Lazy Image Component (`LazyImage.tsx`)

- Intersection Observer API
- Placeholder while not in viewport
- Smooth fade-in on load
- Error fallback to media type icon

### 4. Pagination Utilities (`paginationUtils.ts`)

- `paginateArray()` - Slice array for current page
- `getTotalPages()` - Calculate total pages
- Works with mock data, ready for Convex replacement

### 5. Paginated Media Hook (`usePaginatedMedia.ts`)

- Uses debounced search query
- Simulates async loading (setTimeout for realistic feel)
- Returns paginated data + loading states
- Structure matches Convex usePaginatedQuery pattern
- Supports both paginated (grid) and virtualized (table) data access

### 6. Virtualized Table with Infinite Scroll (List View)

- Use `useVirtualizer` from @tanstack/react-virtual
- Calculate row heights dynamically
- Only render visible rows (10-20 at a time)
- Intersection Observer detects when user scrolls near bottom
- Automatically load next page (50 items) when scrolling down
- Accumulate all loaded pages in memory
- Show loading skeleton/indicator at bottom while fetching
- Smooth scrolling performance
- Works with filtered/search results
- Reset loaded pages when search query changes

### 7. Paginated Grid View

- Pagination controls component (Previous/Next buttons, page numbers)
- Display current page of items (50 items per page)
- Page number navigation (e.g., 1, 2, 3... or ellipsis for many pages)
- Loading skeleton while fetching new page
- Responsive pagination (simplified on mobile)
- Reset to page 1 when search query changes

## Key Performance Benefits

**Before:**

- Renders all 1000+ items → Slow initial load
- Filters all items on every keystroke → Laggy search
- All images load immediately → Bandwidth waste
- No pagination → Memory bloat

**After:**

- Renders 50 items initially (grid) or 10-20 visible rows from first page (table) → Fast load
- Table view loads more pages as user scrolls (infinite scroll)
- Debounced search (300ms) → Smooth typing
- Lazy image loading → Faster initial render
- Virtualization → Smooth scrolling for 10,000+ items (table)
- Pagination → Lower memory usage (grid)

## Files to Create

1. `frontend/src/hooks/useDebounce.ts`
2. `frontend/src/components/ui/LazyImage.tsx`
3. `frontend/src/lib/paginationUtils.ts`
4. `frontend/src/hooks/usePaginatedMedia.ts`
5. `frontend/src/components/ui/LoadingSkeleton.tsx` (for grid view)
6. `frontend/src/components/ui/Pagination.tsx` (pagination controls component)

## Files to Modify

1. `frontend/package.json` - Add @tanstack/react-virtual
2. `frontend/src/store/uiStore.ts` - Add pagination state
3. `frontend/src/components/layout/MediaList.tsx` - Pagination controls + lazy images
4. `frontend/src/components/layout/MediaTable.tsx` - Virtualization
5. `frontend/src/lib/mediaUtils.tsx` - Keep filterMediaItems (used by pagination hook)

## Future Convex Integration Points

- Replace `usePaginatedMedia` hook with Convex `usePaginatedQuery`
- Move filtering logic to Convex query functions
- Add database indexes for search fields
- Implement server-side sorting
- Grid view: Use Convex pagination API
- Table view: Use Convex pagination + client-side virtualization

## Testing Considerations

- Test with 1000+ mock items
- Verify smooth scrolling in table view
- Verify infinite scroll loads more pages as user scrolls
- Test pagination navigation in grid view
- Test search debouncing (type quickly)
- Verify lazy loading triggers correctly
- Test pagination on slow connections
- Verify memory usage stays reasonable
- Test switching between grid/list views maintains state