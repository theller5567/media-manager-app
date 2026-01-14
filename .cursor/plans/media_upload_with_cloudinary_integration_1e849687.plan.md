---
name: Media Upload with Cloudinary Integration
overview: Implement a complete media upload system using Cloudinary for storage, featuring a ShadCN Dialog modal, drag-and-drop support, file validation, upload progress tracking, and integration with the existing media library.
todos:
  - id: install-dialog
    content: Install @radix-ui/react-dialog and create ShadCN dialog.tsx component
    status: pending
  - id: create-cloudinary-utils
    content: Create cloudinary.ts with upload functions, validation, and configuration
    status: pending
  - id: create-upload-hook
    content: Create useMediaUpload.ts hook for upload state management and orchestration
    status: pending
  - id: create-media-upload-component
    content: Create MediaUpload.tsx component with dialog, drag-and-drop, file preview, and progress tracking
    status: pending
  - id: update-media-header
    content: Connect MediaHeader upload button to open MediaUpload modal
    status: pending
  - id: update-media-library
    content: Integrate MediaUpload component and handle upload completion in MediaLibrary page
    status: pending
  - id: setup-env-vars
    content: Configure Cloudinary environment variables and upload preset in Cloudinary dashboard
    status: pending
---

# Media Upload with Cloudinary Integration

## Overview

Implement a complete media upload system that allows users to upload files directly to Cloudinary from the browser, with a modal dialog interface, drag-and-drop support, progress tracking, and seamless integration with the existing media library.

## Architecture

```
MediaLibrary Page
├── MediaHeader
│   └── Upload Button (triggers modal)
└── MediaUpload Modal (ShadCN Dialog)
    ├── Drag-and-Drop Zone
    ├── File Input
    ├── File Preview List
    ├── Upload Progress Indicators
    └── Error Handling
        ↓
    Cloudinary Direct Upload (browser → Cloudinary)
        ↓
    useMediaUpload Hook
        ↓
    Update mockMediaData (temporary) / Future: Convex mutation
```

## Implementation Details

### 1. Install ShadCN Dialog Component

**Action:** Install the dialog component and its Radix UI dependency

**Files:**

- Install `@radix-ui/react-dialog` package
- Create `frontend/src/components/ui/dialog.tsx` using ShadCN CLI or manual implementation

**Dependencies:**

- `@radix-ui/react-dialog` - Core dialog functionality
- Uses existing `@radix-ui/react-slot` (already installed)

### 2. Create Cloudinary Utilities (`frontend/src/lib/cloudinary.ts`)

**Purpose:** Handle Cloudinary configuration and upload logic

**Functions:**

- `configureCloudinary()` - Initialize Cloudinary with credentials from env vars
- `uploadToCloudinary(file: File, options?: UploadOptions): Promise<UploadResult>` - Direct browser upload
- `generateThumbnailUrl(publicId: string, options?: TransformOptions): string` - Generate thumbnail URLs
- `validateFile(file: File): ValidationResult` - Validate file type and size

**Configuration:**

- Use environment variables: `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_API_KEY`, `VITE_CLOUDINARY_UPLOAD_PRESET`
- Support unsigned upload preset (recommended for frontend)
- File size limits: 100MB default (configurable)
- Supported formats: images (jpg, png, gif, webp, svg), videos (mp4, mov, webm), documents (pdf, doc, docx), audio (mp3, wav, ogg)

**Error Handling:**

- Network errors
- File validation errors
- Cloudinary API errors
- Retry logic for failed uploads

### 3. Create Upload Hook (`frontend/src/hooks/useMediaUpload.ts`)

**Purpose:** Manage upload state and orchestrate upload process

**State:**

- `files: File[]` - Selected files
- `uploading: boolean` - Upload in progress
- `progress: Record<string, number>` - Per-file upload progress (0-100)
- `errors: Record<string, string>` - Per-file error messages
- `uploadedFiles: UploadedFile[]` - Successfully uploaded files

**Functions:**

- `addFiles(files: File[])` - Add files to upload queue
- `removeFile(fileId: string)` - Remove file from queue
- `uploadFiles()` - Start upload process for all files
- `retryUpload(fileId: string)` - Retry failed upload
- `reset()` - Clear all state

**Upload Flow:**

1. Validate each file (type, size)
2. Upload to Cloudinary sequentially or in parallel (configurable)
3. Track progress via Cloudinary's progress callback
4. Extract metadata (dimensions, duration, format, etc.)
5. Create MediaItem objects compatible with existing structure
6. Handle errors gracefully with retry options

### 4. Create MediaUpload Component (`frontend/src/components/media/MediaUpload.tsx`)

**Component Structure:**

- ShadCN Dialog wrapper
- Drag-and-drop overlay (when dragging files over page)
- File input area (click to browse)
- File preview list with thumbnails
- Upload progress bars
- Error messages
- Action buttons (Upload, Cancel, Clear)

**Features:**

**Drag-and-Drop:**

- Visual overlay when dragging files over the page
- Highlight drop zone
- Prevent default browser behavior
- Support multiple files

**File Preview:**

- Show thumbnails for images/videos
- Show icons for documents/audio
- Display filename, size, type
- Remove button for each file
- Validation status indicators

**Upload Progress:**

- Per-file progress bars
- Overall progress indicator
- Upload speed/time remaining (optional)
- Success/error states

**UI/UX:**

- Match existing slate-800/slate-900 theme
- Responsive design (mobile-friendly)
- Loading states during upload
- Success animations
- Error recovery options

**Props:**

- `open: boolean` - Control dialog visibility
- `onOpenChange: (open: boolean) => void` - Handle dialog state
- `onUploadComplete?: (files: MediaItem[]) => void` - Callback when uploads complete

### 5. Update MediaHeader Component (`frontend/src/components/layout/MediaHeader.tsx`)

**Changes:**

- Connect "Upload Media" button to open MediaUpload modal
- Manage dialog open/close state
- Handle upload completion callback

**State Management:**

- Use local state for dialog visibility
- Or add to Zustand store if needed globally

### 6. Update MediaLibrary Page (`frontend/src/pages/MediaLibrary.tsx`)

**Changes:**

- Remove placeholder `MediaUploader` import from `components/layout/`
- Import `MediaUpload` from `components/media/`
- Handle upload completion to refresh media list (temporary: add to mockMediaData, future: Convex mutation)

**Integration:**

- When uploads complete, add new items to mockMediaData array
- Trigger re-render of MediaList
- Show success notification (optional)

### 7. Environment Variables Setup

**Create/Update `.env.local`:**

```bash
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_API_KEY=333869248735817
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset_name
```

**Note:** API_SECRET should NOT be in frontend - it's backend-only. For unsigned uploads, use an upload preset configured in Cloudinary dashboard.

**Cloudinary Dashboard Setup:**

1. Create unsigned upload preset
2. Configure allowed formats
3. Set max file size
4. Configure folder structure (optional)
5. Enable auto-tagging (optional, for future AI features)

### 8. File Type Detection & Validation

**Validation Rules:**

- File type: Check MIME type and extension
- File size: Enforce limits per type
- File count: Limit concurrent uploads (e.g., 10 files max)
- Duplicate detection: Check filename (optional)

**Supported Types:**

- Images: jpg, jpeg, png, gif, webp, svg, avif
- Videos: mp4, mov, avi, webm, mkv
- Documents: pdf, doc, docx, xls, xlsx, ppt, pptx
- Audio: mp3, wav, ogg, flac

### 9. Error Handling & User Feedback

**Error Types:**

- File too large
- Invalid file type
- Network errors
- Cloudinary API errors
- Quota exceeded

**User Feedback:**

- Inline error messages per file
- Toast notifications for critical errors (optional)
- Retry buttons for failed uploads
- Clear error messages (user-friendly, not technical)

### 10. Performance Optimizations

**Upload Strategy:**

- Sequential uploads (simpler, more reliable)
- Or parallel uploads with concurrency limit (faster, more complex)
- Progress tracking via Cloudinary's XHR progress events

**Memory Management:**

- Clean up file objects after upload
- Don't store large File objects in state unnecessarily
- Use object URLs for previews, revoke after use

## Files to Create

1. `frontend/src/components/ui/dialog.tsx` - ShadCN Dialog component
2. `frontend/src/lib/cloudinary.ts` - Cloudinary utilities
3. `frontend/src/hooks/useMediaUpload.ts` - Upload state management hook
4. `frontend/src/components/media/MediaUpload.tsx` - Main upload component

## Files to Modify

1. `frontend/src/components/layout/MediaHeader.tsx` - Connect upload button
2. `frontend/src/pages/MediaLibrary.tsx` - Integrate MediaUpload component
3. `frontend/.env.local` - Add Cloudinary environment variables
4. `frontend/package.json` - Add @radix-ui/react-dialog dependency

## State Flow

```
User clicks Upload Button
  ↓
MediaUpload Dialog Opens
  ↓
User selects/drops files
  ↓
useMediaUpload Hook validates files
  ↓
Files added to upload queue
  ↓
User clicks "Upload" button
  ↓
For each file:
  - Upload to Cloudinary (direct browser upload)
  - Track progress
  - Extract metadata
  - Create MediaItem object
  ↓
On completion:
  - Add to mockMediaData (temporary)
  - Close dialog
  - Refresh MediaList
```

## Testing Considerations

- Test drag-and-drop functionality
- Test file validation (invalid types, oversized files)
- Test upload progress tracking
- Test error handling (network failures, API errors)
- Test multiple file uploads
- Test cancel/retry functionality
- Test responsive design (mobile, tablet, desktop)
- Verify Cloudinary uploads appear in dashboard
- Test with various file types (images, videos, documents, audio)

## Future Enhancements (Out of Scope)

- Convex mutation integration (replace mockData updates)
- Batch upload optimization
- Upload queue management (pause/resume)
- Image compression before upload
- Video transcoding options
- Metadata editing during upload
- Folder selection during upload
- Tag assignment during upload
- AI auto-tagging trigger option

## Security Considerations

- Never expose API_SECRET in frontend code
- Use unsigned upload preset for frontend uploads
- Validate file types server-side (future: Convex validation)
- Implement rate limiting (future: Convex)
- Sanitize filenames before upload
- Set appropriate CORS policies in Cloudinary dashboard