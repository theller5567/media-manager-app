---
name: Video Thumbnail Extraction and Upload
overview: Implement client-side video thumbnail extraction and upload the generated thumbnail image to Cloudinary as a separate image resource, ensuring reliable thumbnails for video files in the media library.
todos:
  - id: enhance-thumbnail-extraction
    content: Enhance createVideoThumbnail in fileUtils.ts to return both preview URL and File object, with improved error handling and optional timestamp parameter
    status: completed
  - id: update-filepreview-type
    content: "Add thumbnailFile?: File field to FilePreview interface in types/upload.ts"
    status: completed
  - id: update-createfilepreview
    content: Update createFilePreview function to generate and store thumbnail File for video files
    status: completed
  - id: add-thumbnail-upload
    content: Add uploadThumbnail function to cloudinary.ts for uploading thumbnail images separately
    status: completed
  - id: integrate-thumbnail-upload
    content: Integrate thumbnail upload into submitUpload flow in useMediaUpload.ts, uploading thumbnail before or after video upload
    status: completed
  - id: update-progress-tracking
    content: Update progress tracking to account for thumbnail upload progress
    status: completed
  - id: cleanup-blob-urls
    content: Ensure proper cleanup of thumbnail blob URLs after upload completes
    status: completed
---

# Video Thumbnail Extraction and Upload Plan

## Current State Analysis

**Existing Implementation:**

- Client-side thumbnail extraction exists in `frontend/src/lib/fileUtils.ts` using HTML5 video + canvas
- Creates blob URL for preview purposes only
- After upload, relies on Cloudinary's automatic video thumbnail generation (`generateVideoThumbnailUrl`)
- Cloudinary's automatic thumbnails may not always be reliable or available immediately

**Issues:**

- Thumbnail is only used for preview (blob URL, temporary)
- No mechanism to upload the client-generated thumbnail to Cloudinary
- Reliance on Cloudinary's automatic thumbnail generation which may fail or be delayed

## Solution Approach

**Hybrid Strategy:**

1. **Client-side extraction** - Generate thumbnail immediately when video is selected (already implemented)
2. **Convert blob to File** - Convert canvas-generated blob to File object for upload
3. **Upload thumbnail separately** - Upload thumbnail image to Cloudinary as a separate image resource
4. **Store thumbnail URL** - Use uploaded thumbnail URL in media record instead of relying on Cloudinary's video thumbnail

## Implementation Steps

### 1. Enhance Thumbnail Extraction (`frontend/src/lib/fileUtils.ts`)

**Current function:** `createVideoThumbnail` returns blob URL string
**Enhancement:** Add function to convert canvas blob to File object

- Add `createVideoThumbnailFile()` function that:
- Uses existing `createVideoThumbnail` logic
- Converts canvas blob to File object with proper filename
- Returns both blob URL (for preview) and File object (for upload)
- Improve error handling and seek timing
- Add option to specify timestamp (default: 0.1 seconds, or 10% of duration)

**File:** `frontend/src/lib/fileUtils.ts`

- Add `createVideoThumbnailFile(file: File, timestamp?: number): Promise<{ previewUrl: string; thumbnailFile: File }>`
- Enhance existing `createVideoThumbnail` to optionally accept timestamp parameter

### 2. Update FilePreview Type (`frontend/src/types/upload.ts`)

**Add thumbnail file storage:**

- Extend `FilePreview` interface to optionally store thumbnail File object
- Add `thumbnailFile?: File` field for video files

**File:** `frontend/src/types/upload.ts`

- Add `thumbnailFile?: File` to `FilePreview` interface

### 3. Update File Preview Creation (`frontend/src/lib/fileUtils.ts`)

**Modify `createFilePreview` function:**

- For video files, generate both preview URL and thumbnail File
- Store thumbnail File in FilePreview object

**File:** `frontend/src/lib/fileUtils.ts`

- Update `createFilePreview` to call `createVideoThumbnailFile` for videos
- Store thumbnail File in returned FilePreview

### 4. Add Thumbnail Upload Function (`frontend/src/lib/cloudinary.ts`)

**Create dedicated thumbnail upload function:**

- `uploadThumbnail(thumbnailFile: File, onProgress?: (progress: number) => void): Promise<UploadResult>`
- Uses existing `uploadRegularFile` logic but:
- Forces `resource_type: 'image'`
- Adds folder/tagging to identify as thumbnails
- Optimizes for thumbnail size (smaller, faster upload)

**File:** `frontend/src/lib/cloudinary.ts`

- Add `uploadThumbnail()` function
- Use `resource_type: 'image'` explicitly
- Optionally add folder prefix like `thumbnails/` or tag

### 5. Update Upload Flow (`frontend/src/hooks/useMediaUpload.ts`)

**Modify `submitUpload` function:**

- For video files, upload thumbnail image before or after video upload
- Store thumbnail URL from uploaded thumbnail image
- Fallback to Cloudinary's automatic thumbnail if custom upload fails

**File:** `frontend/src/hooks/useMediaUpload.ts`

- In `submitUpload`, check if `filePreview.thumbnailFile` exists
- Upload thumbnail image to Cloudinary using `uploadThumbnail()`
- Use uploaded thumbnail URL instead of `generateVideoThumbnailUrl()`
- Handle errors gracefully with fallback to Cloudinary's automatic thumbnail

### 6. Update Upload Progress Tracking

**Track thumbnail upload progress separately:**

- Add thumbnail upload progress to progress tracking
- Show combined progress (video + thumbnail) or separate indicators

**File:** `frontend/src/hooks/useMediaUpload.ts`

- Update progress tracking to include thumbnail upload
- Modify progress callback to account for thumbnail upload percentage

### 7. Cleanup and Memory Management

**Properly revoke blob URLs:**

- Revoke thumbnail blob URL after upload completes
- Ensure no memory leaks from unused blob URLs

**File:** `frontend/src/hooks/useMediaUpload.ts`

- Revoke thumbnail preview URL after thumbnail is uploaded
- Clean up in error cases

## Technical Considerations

**Thumbnail Quality:**

- Use reasonable canvas size (e.g., max 1920x1080) to avoid memory issues
- JPEG quality 0.8 (80%) for good balance of quality and file size
- Consider allowing user to select frame in future enhancement

**Upload Order:**

- Upload video first, then thumbnail (thumbnail depends on video publicId for naming)
- Or upload thumbnail first, then video (faster thumbnail availability)
- Recommendation: Upload thumbnail first for better UX

**Error Handling:**

- If thumbnail extraction fails, skip thumbnail upload
- If thumbnail upload fails, fallback to Cloudinary's automatic thumbnail
- Log errors for debugging but don't block video upload

**Performance:**

- Thumbnail extraction is async and non-blocking
- Thumbnail upload is small (typically <100KB) and fast
- Consider parallel uploads (video + thumbnail) if Cloudinary supports it

## Files to Modify

1. `frontend/src/lib/fileUtils.ts` - Enhance thumbnail extraction, add File conversion
2. `frontend/src/types/upload.ts` - Add thumbnailFile to FilePreview
3. `frontend/src/lib/cloudinary.ts` - Add uploadThumbnail function
4. `frontend/src/hooks/useMediaUpload.ts` - Integrate thumbnail upload into upload flow

## Testing Considerations

- Test with various video formats (MP4, MOV, WebM, AVI)
- Test with videos of different sizes and durations
- Test error cases (corrupted video, extraction failure, upload failure)
- Verify thumbnail appears correctly in MediaList and MediaTable
- Ensure blob URLs are properly cleaned up

## Future Enhancements (Out of Scope)

- Allow user to select specific frame for thumbnail
- Generate multiple thumbnails for video preview scrubber
- Support custom thumbnail upload (user uploads their own thumbnail image)
- Thumbnail regeneration/update functionality