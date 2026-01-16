---
name: Add Sorting and Filtering to Media Library
overview: Add comprehensive sorting (filename, date, size, type with multi-criteria support) and filtering (media type + tags) functionality to the media library with dropdown controls in MediaList component.
todos:
  - id: update-ui-store
    content: Add sorting and filtering state to uiStore (sortBy, sortDirection, secondarySort, selectedMediaTypes, selectedTags) with actions
    status: completed
  - id: create-sorting-utils
    content: Create sortingUtils.ts with sortMediaItems function supporting primary and secondary sorting
    status: completed
  - id: create-filtering-utils
    content: Create filteringUtils.ts with filterByMediaType, filterByTags, getAvailableTags, and combineFilters functions
    status: completed
  - id: update-paginated-hook
    content: Update usePaginatedMedia hook to apply filtering and sorting before pagination
    status: completed
  - id: create-media-filters
    content: Create MediaFilters.tsx component with dropdown UI for sort and filter controls
    status: completed
  - id: integrate-media-filters
    content: Integrate MediaFilters component into MediaList, extract available tags, and handle callbacks
    status: completed
---

# Add Sorting and Filtering to Media Library

## Overview

Implement sorting and filtering capabilities for the media library. Sorting will support multiple criteria (filename, date modified, file size, media type) with ascending/descending options. Filtering will support media type selection and tag-based filtering. Controls will be presented in a dropdown menu interface within MediaList.

## Architecture

```
MediaList Component
├── Search Input (existing)
├── Filter/Sort Dropdown Button
│   ├── Sort Options Panel
│   │   ├── Primary Sort (field + direction)
│   │   └── Secondary Sort (optional)
│   └── Filter Options Panel
│       ├── Media Type Filter (multi-select)
│       └── Tags Filter (multi-select)
└── Media Display (grid/table)
```

## Implementation Details

### 1. Update Zustand Store (`frontend/src/store/uiStore.ts`)

Add sorting and filtering state:

- **Sort State:**
  - `sortBy: 'filename' | 'dateModified' | 'fileSize' | 'mediaType'`
  - `sortDirection: 'asc' | 'desc'`
  - `secondarySortBy: string | null` (optional secondary sort)
  - `secondarySortDirection: 'asc' | 'desc'`

- **Filter State:**
  - `selectedMediaTypes: MediaType[]` (array of selected types)
  - `selectedTags: string[]` (array of selected tags)

- **Actions:**
  - `setSortBy(field, direction)`
  - `setSecondarySort(field, direction)`
  - `clearSorting()`
  - `setMediaTypeFilter(types[])`
  - `setTagFilter(tags[])`
  - `clearFilters()`

Persist sorting/filtering preferences in localStorage.

### 2. Create Sorting Utilities (`frontend/src/lib/sortingUtils.ts`)

New file with sorting functions:

- `sortMediaItems(items: MediaItem[], sortConfig): MediaItem[]`
  - Handles primary and secondary sorting
  - Supports all sort fields (filename, dateModified, fileSize, mediaType)
  - Handles ascending/descending directions
  - Returns sorted array

- `getSortOptions()` - Returns available sort field options with labels

### 3. Create Filtering Utilities (`frontend/src/lib/filteringUtils.ts`)

New file extending existing filtering:

- `filterByMediaType(items: MediaItem[], types: MediaType[]): MediaItem[]`
  - Filters items by selected media types
  - Returns all items if no types selected

- `filterByTags(items: MediaItem[], tags: string[]): MediaItem[]`
  - Filters items that have any of the selected tags
  - Returns all items if no tags selected

- `getAvailableTags(items: MediaItem[]): string[]`
  - Extracts unique tags from all items
  - Returns sorted array of unique tags

- `combineFilters(items: MediaItem[], searchQuery: string, mediaTypes: MediaType[], tags: string[]): MediaItem[]`
  - Combines search query, media type filter, and tag filter
  - Applies filters in sequence: search → media type → tags

### 4. Update `usePaginatedMedia` Hook (`frontend/src/hooks/usePaginatedMedia.ts`)

Modify to include sorting and filtering:

- Import sorting and filtering utilities
- Apply filters before sorting
- Apply sorting after filtering
- Update `filteredData` useMemo to include:

  1. Search filtering (existing)
  2. Media type filtering
  3. Tag filtering
  4. Sorting (primary + secondary)

Reset pagination when filters or sorting change.

### 5. Create Filter/Sort Dropdown Component (`frontend/src/components/ui/MediaFilters.tsx`)

New component with dropdown interface:

- **Props:**
  - `onSortChange(sortConfig)`
  - `onFilterChange(filterConfig)`
  - `availableTags: string[]`
  - `currentSort`
  - `currentFilters`

- **UI Structure:**
  - Dropdown button with icon (Filter/Sort icon from lucide-react)
  - Dropdown panel with two sections:
    - **Sort Section:**
      - Primary sort dropdown (field + direction toggle)
      - Secondary sort dropdown (optional, can be cleared)
      - Clear sorting button
    - **Filter Section:**
      - Media type checkboxes (image, video, audio, document, other)
      - Tags multi-select (searchable list or checkboxes)
      - Clear filters button

- **Styling:**
  - Matches existing slate-800/slate-900 theme
  - Responsive design
  - Accessible (keyboard navigation, ARIA labels)

### 6. Update MediaList Component (`frontend/src/components/layout/MediaList.tsx`)

Integrate MediaFilters component:

- Add MediaFilters dropdown next to ViewToggle
- Extract available tags from mockMediaData
- Pass current sort/filter state to MediaFilters
- Handle sort/filter change callbacks
- Display active filter count badge on dropdown button

### 7. Update MediaTable Component (`frontend/src/components/layout/MediaTable.tsx`)

Ensure table respects sorting (already handled via usePaginatedMedia hook).

## Files to Create

1. `frontend/src/lib/sortingUtils.ts` - Sorting logic
2. `frontend/src/lib/filteringUtils.ts` - Extended filtering logic
3. `frontend/src/components/ui/MediaFilters.tsx` - Filter/Sort dropdown UI

## Files to Modify

1. `frontend/src/store/uiStore.ts` - Add sort/filter state and actions
2. `frontend/src/hooks/usePaginatedMedia.ts` - Integrate sorting and filtering
3. `frontend/src/components/layout/MediaList.tsx` - Add MediaFilters component
4. `frontend/src/lib/mediaUtils.tsx` - May need to export additional utilities

## State Flow

```
User Interaction
  ↓
MediaFilters Component
  ↓
uiStore Actions (setSortBy, setMediaTypeFilter, etc.)
  ↓
usePaginatedMedia Hook
  ↓
Apply Filters → Apply Sorting → Paginate
  ↓
Display Results
```

## Testing Considerations

- Test sorting with all fields and directions
- Test secondary sorting
- Test media type filtering (single and multiple)
- Test tag filtering (single and multiple)
- Test combined filters (search + type + tags)
- Test sorting + filtering together
- Test pagination reset when filters/sorting change
- Test persistence of sort/filter preferences
- Verify performance with 54+ items

## Future Enhancements (Out of Scope)

- Date range filtering
- File size range filtering
- Saved filter presets
- URL query parameters for sharing filtered views