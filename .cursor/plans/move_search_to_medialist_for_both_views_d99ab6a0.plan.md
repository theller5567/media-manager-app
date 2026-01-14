---
name: Move Search to MediaList for Both Views
overview: Refactor search and filtering functionality from MediaTable to MediaList component so that search works consistently for both grid and list views. This will involve extracting filtering logic, moving the search UI, and ensuring both views receive filtered data.
todos:
  - id: add-filter-utility
    content: Add filterMediaItems() function to mediaUtils.tsx for filtering MediaItem arrays
    status: pending
  - id: update-ui-store
    content: Add searchQuery state and setSearchQuery action to uiStore.ts
    status: pending
  - id: refactor-media-list
    content: Add search UI and filtering logic to MediaList.tsx component
    status: pending
  - id: simplify-media-table
    content: Remove search UI and filtering from MediaTable.tsx, make it receive pre-filtered data
    status: pending
  - id: clean-media-header
    content: Remove conditional ViewToggle rendering from MediaHeader.tsx
    status: pending
---

# Move Search/Filtering to MediaList Component

## Goal

Move search and filtering functionality from `MediaTable.tsx` to `MediaList.tsx` so that search works consistently for both grid and list views.

## Architecture Decision

- **MediaHeader**: Global actions only (Upload button, ViewToggle)
- **MediaList**: Search UI + filtering logic + view rendering (grid/table)
- **MediaTable**: Pure table component (receives pre-filtered data, no search UI)

## Implementation Steps

### 1. Create Filtering Utility Function

**File**: `frontend/src/lib/mediaUtils.tsx`

- Add `filterMediaItems()` function that filters MediaItem array based on search query
- Function should search across: filename, mediaType, tags, and optionally fileSize/dateModified
- Use case-insensitive string matching similar to TanStack Table's `includesString` behavior

### 2. Update Zustand Store

**File**: `frontend/src/store/uiStore.ts`

- Add `searchQuery` state to store
- Add `setSearchQuery` action
- Optionally persist search query (or reset on page load - user preference)

### 3. Refactor MediaList Component

**File**: `frontend/src/components/layout/MediaList.tsx`

- Import search functionality from store and mediaUtils
- Add search input UI above the view content
- Implement filtering logic using `filterMediaItems()` utility
- Pass filtered data to both grid view and MediaTable
- Show result count when filtering is active
- Handle empty states for both filtered and unfiltered scenarios

### 4. Simplify MediaTable Component

**File**: `frontend/src/components/layout/MediaTable.tsx`

- Remove search input UI and related state
- Remove `getFilteredRowModel` and `globalFilter` from TanStack Table config
- Remove ViewToggle import and usage (already in MediaHeader)
- Keep table rendering logic only
- Component should receive pre-filtered data as prop

### 5. Clean Up MediaHeader

**File**: `frontend/src/components/layout/MediaHeader.tsx`

- Remove conditional ViewToggle rendering
- Always show ViewToggle (it's already using global state)
- Keep Upload button and ViewToggle only

## Key Benefits

- **Consistent UX**: Search works identically in both views
- **DRY Principle**: Single filtering implementation
- **Separation of Concerns**: Each component has clear responsibility
- **Maintainability**: Filtering logic in one place
- **Performance**: Filter once, render both views from same filtered data

## Files to Modify

1. `frontend/src/lib/mediaUtils.tsx` - Add filtering utility
2. `frontend/src/store/uiStore.ts` - Add search query state
3. `frontend/src/components/layout/MediaList.tsx` - Add search UI and filtering
4. `frontend/src/components/layout/MediaTable.tsx` - Remove search UI, simplify
5. `frontend/src/components/layout/MediaHeader.tsx` - Clean up ViewToggle

## Testing Considerations

- Verify search works in grid view
- Verify search works in list view
- Verify search persists when switching views
- Verify empty states display correctly
- Verify result counts are accurate
- Test responsive behavior on mobile devices