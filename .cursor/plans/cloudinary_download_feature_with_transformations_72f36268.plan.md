---
name: Cloudinary Download Feature with Transformations
overview: Create a reusable download system with Cloudinary transformation options. All authenticated users can download, with single-file downloads supporting transformations (resize, format, quality, background removal, etc.). Bulk downloads download originals without transformations.
todos: []
isProject: false
---

# Cloudinary Download Feature with Transformations

## Overview

Implement a reusable download system that opens a dialog when users click download, allowing them to choose Cloudinary transformations before downloading. The feature will be available throughout the app (MediaDetail, MediaTable, MediaGrid) with different behaviors for single vs bulk downloads.

## Architecture

### Components Structure

```
frontend/src/
├── components/
│   └── media/
│       └── DownloadDialog.tsx          # Main download dialog component
├── lib/
│   ├── cloudinary.ts                   # Add transformation utilities
│   └── downloadUtils.ts                # Download helper functions
└── pages/
    └── MediaDetail.tsx                 # Fix type error + integrate download
```

## Implementation Plan

### 1. Fix Type Error in MediaDetail.tsx

**File**: `frontend/src/pages/MediaDetail.tsx`

**Issue**: Line 89 - `mediaDoc?.uploadedBy` can be `undefined`, but `getUserById` expects a `string`.

**Fix**: Add conditional check before querying:

```typescript
const uploadedByUser = useQuery(
  api.queries.users.getUserById,
  mediaDoc?.uploadedBy ? { userId: mediaDoc.uploadedBy } : "skip"
);
```

**Note**: `getUserById` currently requires admin role, which may not work for displaying uploader names. Consider creating a non-admin query or adjusting the permission check.

### 2. Create Cloudinary Transformation Utilities

**File**: `frontend/src/lib/cloudinary.ts`

Add functions to build Cloudinary transformation URLs:

```typescript
export interface ImageTransformationOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'scale' | 'thumb' | 'limit';
  format?: 'jpg' | 'png' | 'webp' | 'avif' | 'gif';
  quality?: 'auto' | number; // 1-100 or 'auto'
  removeBackground?: boolean; // Requires Cloudinary AI addon
  gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west';
  radius?: number; // Border radius
  effect?: string; // e.g., 'blur:300', 'sharpen', 'vignette'
}

export interface VideoTransformationOptions {
  width?: number;
  height?: number;
  format?: 'mp4' | 'webm' | 'mov';
  quality?: 'auto' | number;
  bitRate?: number; // Video bitrate
  fps?: number; // Frames per second
  startOffset?: number; // Start time in seconds
  duration?: number; // Duration in seconds
}

/**
 * Build Cloudinary transformation URL for images
 */
export function buildImageTransformationUrl(
  publicId: string,
  options: ImageTransformationOptions
): string

/**
 * Build Cloudinary transformation URL for videos
 */
export function buildVideoTransformationUrl(
  publicId: string,
  options: VideoTransformationOptions
): string

/**
 * Extract public ID from Cloudinary URL
 */
export function extractPublicIdFromUrl(url: string): string | null
```

### 3. Create Download Utilities

**File**: `frontend/src/lib/downloadUtils.ts` (new file)

```typescript
/**
 * Download a file from URL with custom filename
 */
export async function downloadFile(
  url: string,
  filename: string
): Promise<void>

/**
 * Download multiple files (for bulk downloads)
 */
export async function downloadMultipleFiles(
  files: Array<{ url: string; filename: string }>
): Promise<void>
```

### 4. Create DownloadDialog Component

**File**: `frontend/src/components/media/DownloadDialog.tsx` (new file)

**Features**:

- Tabbed interface for different transformation types
- Preview of transformed image/video
- Transformation options organized by category:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - **Size**: Width, height, crop mode, maintain aspect ratio
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - **Format**: JPG, PNG, WebP, AVIF (images) / MP4, WebM, MOV (videos)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - **Quality**: Auto or manual (1-100)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - **Advanced**: Background removal (images), effects, filters
- Real-time preview using transformed Cloudinary URL
- Download button that triggers actual download
- "Download Original" quick action

**Props**:

```typescript
interface DownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  media: MediaItem & {
    cloudinaryPublicId: string;
    cloudinarySecureUrl: string;
    width?: number;
    height?: number;
    format?: string;
  };
}
```

**UI Structure**:

- Header with media preview
- Tabs: "Size & Format", "Quality", "Advanced" (images only)
- Form controls for each transformation option
- Live preview area showing transformed result
- Footer with "Download Original" and "Download Transformed" buttons

### 5. Integrate DownloadDialog in MediaDetail

**File**: `frontend/src/pages/MediaDetail.tsx`

**Changes**:

1. Fix type error on line 89
2. Add state for download dialog: `const [downloadDialogOpen, setDownloadDialogOpen] = useState(false)`
3. Replace `downloadMedia` function to open dialog instead of direct download
4. Move download button outside `canEdit || canDelete` check (all authenticated users can download)
5. Import and render `DownloadDialog` component
6. Pass media data including `cloudinaryPublicId` to dialog

### 6. Add Download Support to MediaTable and MediaGrid

**Files**:

- `frontend/src/components/layout/MediaTable.tsx`
- `frontend/src/components/layout/MediaList.tsx` (grid view)

**For Single File Downloads**:

- Add download button/icon to each row/card
- Open `DownloadDialog` with transformation options

**For Bulk Downloads**:

- Add checkbox selection to table/grid
- Add "Download Selected" button in toolbar
- Download originals without transformation dialog (as per user requirement)
- Use `downloadMultipleFiles` utility

### 7. Additional Feature Suggestions

**Download Analytics** (Optional):

- Track download events in Convex
- Store: userId, mediaId, timestamp, transformations used
- Useful for understanding usage patterns

**Download Presets** (Optional):

- Save common transformation combinations as presets
- Quick-select: "Web Optimized", "Print Quality", "Thumbnail", etc.
- Store presets in user preferences

**Download History** (Optional):

- Show recently downloaded files
- Quick re-download with same transformations

**Watermarking** (Optional):

- Add text or image watermarks during download
- Useful for branded downloads

**Format-Specific Options**:

- **Images**: Remove background, apply filters, adjust colors
- **Videos**: Extract frame, trim duration, adjust quality
- **Documents**: Convert PDF pages to images

**Smart Defaults**:

- Auto-detect optimal format based on file type
- Suggest transformations based on file size
- Remember user's last transformation preferences

## File Changes Summary

### New Files

1. `frontend/src/components/media/DownloadDialog.tsx` - Main download dialog component
2. `frontend/src/lib/downloadUtils.ts` - Download helper functions

### Modified Files

1. `frontend/src/lib/cloudinary.ts` - Add transformation URL builders
2. `frontend/src/pages/MediaDetail.tsx` - Fix type error, integrate download dialog
3. `frontend/src/components/layout/MediaTable.tsx` - Add download buttons and bulk download
4. `frontend/src/components/layout/MediaList.tsx` - Add download buttons for grid view

## Technical Considerations

### Cloudinary URL Transformation Format

Cloudinary uses URL-based transformations:

- Image: `https://res.cloudinary.com/{cloudName}/image/upload/{transformations}/{publicId}`
- Video: `https://res.cloudinary.com/{cloudName}/video/upload/{transformations}/{publicId}`

Example transformations:

- Resize: `w_800,h_600,c_fill`
- Format: `f_webp`
- Quality: `q_auto` or `q_80`
- Background removal: `e_background_removal` (requires addon)

### Public ID Extraction

Need to extract `publicId` from `cloudinarySecureUrl` to build transformation URLs. Pattern:

- URL format: `https://res.cloudinary.com/{cloudName}/{resourceType}/upload/{publicId}.{format}`
- Extract everything after `/upload/` and before file extension

### Preview Implementation

- For images: Use transformed URL directly in `<img>` tag
- For videos: Use transformed URL in `<video>` or ReactPlayer
- Update preview when transformation options change
- Debounce preview updates to avoid excessive API calls

### Download Implementation

- Use `fetch()` to get transformed file
- Create blob URL: `URL.createObjectURL(blob)`
- Create temporary `<a>` element with `download` attribute
- Trigger click programmatically
- Clean up blob URL after download

## Testing Considerations

- Test with different media types (image, video, audio, document)
- Test transformation combinations
- Test download with various formats
- Test bulk download with multiple files
- Verify Cloudinary URL generation is correct
- Test error handling for failed downloads
- Test permission checks (all authenticated users can download)

## Dependencies

- Existing: Cloudinary config, Dialog component, MediaItem type
- No new npm packages required (using native browser APIs for downloads)