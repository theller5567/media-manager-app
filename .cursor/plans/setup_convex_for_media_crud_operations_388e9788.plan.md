---
name: Setup Convex for Media CRUD Operations
overview: Set up Convex backend with schema, queries, and mutations for media items. Migrate all mock data to Convex with identifiers for later removal. Update MediaDetail, MediaUpload, and MediaLibrary to use Convex instead of mock data.
todos:
  - id: setup-convex-schema
    content: Create convex/schema.ts with media table definition matching MediaItem interface, including indexes and search index
    status: completed
  - id: create-media-queries
    content: Create convex/queries/media.ts with list, getById, and search query functions
    status: completed
  - id: create-media-mutations
    content: Create convex/mutations/media.ts with create, update, and delete mutation functions
    status: completed
  - id: setup-convex-provider
    content: Add ConvexProvider to main.tsx with ConvexReactClient configured from environment variables
    status: completed
  - id: migrate-mock-data
    content: Create migration script to import all mockMediaData items into Convex with _isMockData flag and _mockSourceId field
    status: completed
  - id: update-media-detail
    content: Update MediaDetail.tsx to use useQuery(api.media.getById) instead of mock data
    status: completed
  - id: update-media-upload
    content: Update useMediaUpload.ts submitUpload to call Convex create mutation after Cloudinary upload
    status: completed
  - id: update-media-library
    content: Update MediaLibrary.tsx to use useQuery(api.media.list) instead of mockMediaData
    status: completed
  - id: update-media-list
    content: Update MediaList.tsx to use Convex query results instead of mockMediaData
    status: completed
  - id: update-related-components
    content: Update RelatedFilesSelector and other components that reference mockMediaData to use Convex queries
    status: completed
---

# Setup Convex for Media CRUD Operations

## Overview

Set up Convex backend infrastructure for media management, migrate existing mock data, and update all components to use Convex queries/mutations instead of in-memory mock data.

## Architecture

```
Frontend (React)
├── ConvexProvider (main.tsx)
│   ├── useQuery(api.media.list) → MediaLibrary
│   ├── useQuery(api.media.getById) → MediaDetail
│   └── useMutation(api.media.create) → MediaUpload
│
Convex Backend
├── schema.ts (media table definition)
├── queries/media.ts (list, getById, search)
└── mutations/media.ts (create, update, delete)
```

## Implementation Steps

### 1. Set Up Convex Schema (`frontend/convex/schema.ts`)

Create schema matching `MediaItem` interface with Convex types:

- **Table**: `media`
- **Fields**:
  - `cloudinaryPublicId`: string (from Cloudinary upload)
  - `cloudinarySecureUrl`: string (full URL to file)
  - `filename`: string
  - `thumbnail`: string (URL)
  - `mediaType`: union("image", "video", "audio", "document", "other")
  - `customMediaTypeId`: optional string (matches MediaType.id)
  - `title`: string
  - `description`:  string
  - `altText`:  string
  - `fileSize`: number
  - `format`: string (from Cloudinary)
  - `width`: optional number
  - `height`: optional number
  - `duration`: optional number
  - `tags`: array of strings
  - `relatedFiles`: array of strings (media IDs)
  - `customMetadata`: optional object
  - `aiGenerated`: optional boolean
  - `dateModified`: number (timestamp)
  - `_isMockData`: boolean (flag for later cleanup)
  - `_mockSourceId`: optional string (original mock ID for reference)

- **Indexes**:
  - `by_mediaType`: ["mediaType"]
  - `by_customMediaTypeId`: ["customMediaTypeId"]
  - `by_dateModified`: ["dateModified"]
  - `search_title`: search index on "title"

### 2. Create Media Queries (`frontend/convex/queries/media.ts`)

**Functions:**

- `list`: Get all media items (with optional filters)
- `getById`: Get single media item by ID
- `search`: Search media by title/description (using search index)

**Query signatures:**

```typescript
list: query({ args: {}, handler: ... })
getById: query({ args: { id: v.id("media") }, handler: ... })
search: query({ args: { query: v.string() }, handler: ... })
```

### 3. Create Media Mutations (`frontend/convex/mutations/media.ts`)

**Functions:**

- `create`: Insert new media item
- `update`: Update existing media item
- `delete`: Delete media item

**Mutation signatures:**

```typescript
create: mutation({ args: { ...MediaItem fields }, handler: ... })
update: mutation({ args: { id: v.id("media"), updates: v.object({...}) }, handler: ... })
delete: mutation({ args: { id: v.id("media") }, handler: ... })
```

### 4. Set Up ConvexProvider (`frontend/src/main.tsx`)

Wrap app with `ConvexProvider`:

- Import `ConvexProvider` and `ConvexReactClient` from `convex/react`
- Read `VITE_CONVEX_URL` from environment
- Create client instance
- Wrap `<App />` with provider

### 5. Migrate Mock Data (`frontend/convex/migrations/migrateMockData.ts`)

Create one-time migration script:

- Read all items from `mockMediaData.ts`
- Add `_isMockData: true` and `_mockSourceId: originalId` to each
- Convert `Date` objects to timestamps (numbers)
- Insert all items into Convex `media` table
- Handle Cloudinary URLs (mock data uses picsum.photos - keep as-is for now)

**Note**: This will be a manual script run once, not an automatic migration.

### 6. Update MediaDetail Page (`frontend/src/pages/MediaDetail.tsx`)

- Use `useQuery(api.media.getById, { id: mediaId })` to fetch media
- Handle loading and error states
- Display media metadata, thumbnail, and details
- Add navigation back to library

### 7. Update MediaUpload Hook (`frontend/src/hooks/useMediaUpload.ts`)

- After successful Cloudinary upload, call `useMutation(api.media.create)`
- Pass all MediaItem fields including Cloudinary `publicId` and `secureUrl`
- Remove `addMediaItems` call to mock data
- Update `onUploadComplete` to use Convex mutation result

### 8. Update MediaLibrary Page (`frontend/src/pages/MediaLibrary.tsx`)

- Replace `mockMediaData` import with `useQuery(api.media.list)`
- Remove `addMediaItems` call
- Update `handleUploadComplete` to trigger refetch (Convex auto-updates)

### 9. Update MediaList Component (`frontend/src/components/layout/MediaList.tsx`)

- Replace `mockMediaData` with Convex query result
- Update `getAvailableTags` to use query data
- Remove direct mock data references

### 10. Update Related Components

**Files to update:**

- `frontend/src/components/media/RelatedFilesSelector.tsx`: Use Convex query for available files
- `frontend/src/data/mockMediaData.ts`: Add comment noting migration, keep for reference
- `frontend/src/data/mockMediaTypes.ts`: Keep as-is (MediaTypes not migrated yet)

## Data Migration Strategy

1. **Mock Data Identification**:

   - Add `_isMockData: true` to all migrated items
   - Store original mock ID in `_mockSourceId` field
   - This allows filtering/removal before production

2. **Date Handling**:

   - Convert `Date` objects to `number` (timestamp) for Convex
   - Use `dateModified.getTime()` or `Date.now()`

3. **Cloudinary URLs**:

   - Mock data uses `picsum.photos` - keep these as-is
   - New uploads will have real Cloudinary URLs
   - Can identify mock data by checking if URL contains "picsum"

## Testing Checklist

- [ ] MediaDetail page loads media by ID
- [ ] MediaLibrary displays all media from Convex
- [ ] Upload creates new media item in Convex
- [ ] Search/filter works with Convex data
- [ ] Related files selector shows Convex data
- [ ] Mock data is identifiable via `_isMockData` flag

## Future Cleanup

Before production, create a cleanup script to:

- Query all items where `_isMockData === true`
- Delete them from Convex database
- Or mark them for archival instead of deletion