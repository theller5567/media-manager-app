---
name: Support Large Video File Uploads
overview: Implement chunked uploads and update file size validation to support video files larger than 5MB, handling files up to 200MB+ using Cloudinary's chunked upload API.
todos: []
---

# Support Large Video File Uploads

## Problem Analysis

Currently, the app has a 5MB upload limit that prevents video uploads. The code shows a 100MB validation limit, but the actual restriction is likely:

1. **Cloudinary Upload Preset Configuration**: The unsigned upload preset may have a 5MB max file size configured
2. **Missing Chunked Upload Support**: Files >100MB require Cloudinary's chunked upload API
3. **File Type-Specific Limits**: Videos need different size limits than images

## Solution Overview

Implement a multi-layered approach:

1. Update validation to allow larger files with type-specific limits
2. Implement Cloudinary chunked uploads for large files (>100MB threshold)
3. Use Cloudinary's `upload_large` API for files exceeding the threshold
4. Update upload preset configuration documentation

## Implementation Plan

### 1. Update File Size Validation (`frontend/src/lib/cloudinary.ts`)

**Current State**: Single 100MB limit for all files

**Changes**:

- Implement type-specific size limits:
  - Images: 20MB (reasonable for most use cases)
  - Videos: 500MB (supports most video files, within free plan limits)
  - Documents/Audio: 100MB
- Update `validateFile()` function to check file type and apply appropriate limit
- Provide clear error messages indicating the limit per file type

**Code Changes**:

```typescript
// Replace single maxSize with type-specific limits
const getMaxFileSize = (fileType: string): number => {
  if (fileType.startsWith('image/')) return 20 * 1024 * 1024; // 20MB
  if (fileType.startsWith('video/')) return 500 * 1024 * 1024; // 500MB
  return 100 * 1024 * 1024; // 100MB default
};
```

### 2. Implement Chunked Upload Support (`frontend/src/lib/cloudinary.ts`)

**Current State**: Uses regular `/auto/upload` endpoint which has size limitations

**Changes**:

- Add `uploadLargeFile()` function for files >100MB
- Use Cloudinary's chunked upload endpoint: `/auto/upload_large`
- Implement chunk size configuration (default 20MB, minimum 5MB)
- Maintain progress tracking across chunks
- Handle chunk upload failures with retry logic

**Implementation Details**:

- Check file size before upload
- Route to `uploadLargeFile()` if file >100MB
- Use `chunk_size` parameter (20MB default)
- Track overall progress across all chunks
- Handle `async` parameter for very large files (>20GB, future-proofing)

**New Function Signature**:

```typescript
async function uploadLargeFile(
  file: File,
  onProgress?: (progress: number) => void,
  chunkSize?: number
): Promise<UploadResult>
```

### 3. Update Upload Function (`frontend/src/lib/cloudinary.ts`)

**Changes**:

- Modify `uploadFile()` to automatically detect large files
- Route to chunked upload for files >100MB
- Maintain backward compatibility for smaller files
- Add `resource_type` parameter to explicitly set "video" for video files

**Logic Flow**:

```
if (file.size > 100MB) {
  return uploadLargeFile(file, onProgress);
} else {
  return uploadRegularFile(file, onProgress);
}
```

### 4. Update Upload Preset Configuration Documentation

**File**: `frontend/GEMINI_SETUP.md` or create `frontend/CLOUDINARY_SETUP.md`

**Content**:

- Instructions for configuring upload preset in Cloudinary Dashboard
- Remove or increase max file size limit in preset settings
- Enable unsigned uploads
- Configure allowed resource types (image, video, raw)
- Note about chunked uploads for large files

**Key Settings**:

- Max file size: Remove limit or set to 500MB+
- Resource type: "auto" or "video" for videos
- Unsigned upload: Enabled
- Chunk size: 20MB (default)

### 5. Update Error Messages (`frontend/src/lib/cloudinary.ts`)

**Changes**:

- Provide specific error messages for different failure scenarios:
  - File too large for regular upload (suggest chunked upload)
  - Chunked upload failure
  - Network errors during chunked upload
  - Cloudinary API errors

### 6. Update Progress Tracking (`frontend/src/hooks/useMediaUpload.ts`)

**Current State**: Progress tracking works for regular uploads

**Changes**:

- Ensure progress tracking works correctly for chunked uploads
- Progress should reflect overall file progress, not individual chunk progress
- Handle progress updates during chunk uploads

### 7. Testing Considerations

**Test Cases**:

- Upload small video (<100MB) - should use regular upload
- Upload medium video (100-200MB) - should use chunked upload
- Upload large video (200-500MB) - should use chunked upload
- Verify progress tracking works for chunked uploads
- Test error handling for failed chunk uploads
- Test with different video formats (MP4, MOV, AVI, WebM)

## Files to Modify

1. **`frontend/src/lib/cloudinary.ts`**

   - Update `validateFile()` with type-specific limits
   - Add `uploadLargeFile()` function
   - Modify `uploadFile()` to route to chunked upload when needed
   - Update error handling

2. **`frontend/src/lib/cloudinary.ts`** (documentation)

   - Add JSDoc comments explaining chunked upload behavior
   - Document size limits per file type

3. **`frontend/CLOUDINARY_SETUP.md`** (NEW)

   - Create documentation for Cloudinary upload preset configuration
   - Include instructions for removing/increasing file size limits

## Technical Considerations

### Cloudinary Chunked Upload API

- **Endpoint**: `https://api.cloudinary.com/v1_1/{cloud_name}/{resource_type}/upload_large`
- **Method**: POST with FormData
- **Required Parameters**:
  - `file`: File object (will be chunked automatically)
  - `upload_preset`: Upload preset name
  - `api_key`: API key
- **Optional Parameters**:
  - `chunk_size`: Size of each chunk in bytes (default: 20MB, min: 5MB)
  - `async`: Set to `true` for files >20GB
  - `resource_type`: "auto", "image", "video", or "raw"

### Browser Compatibility

- Chunked uploads work in all modern browsers
- FileReader API is used for chunking (widely supported)
- XMLHttpRequest supports progress events for chunks

### Performance Considerations

- Chunked uploads may take longer due to multiple requests
- Progress tracking helps user understand upload status
- Consider showing estimated time remaining for large files

## Alternative Approaches Considered

1. **Server-Side Upload**: Upload through Convex action

   - Pros: More control, can handle very large files
   - Cons: Requires server resources, slower for users, more complex
   - **Decision**: Not chosen - client-side upload is simpler and faster

2. **Cloudinary Widget**: Use Cloudinary's pre-built upload widget

   - Pros: Handles chunking automatically, built-in UI
   - Cons: Less control over UI/UX, harder to customize
   - **Decision**: Not chosen - want full control over upload flow

3. **Direct Cloudinary SDK**: Use `@cloudinary/upload-widget` package

   - Pros: Official SDK with chunking support
   - Cons: Additional dependency, may conflict with current implementation
   - **Decision**: Not chosen - current XMLHttpRequest approach works well

## Success Criteria

- Users can upload video files up to 500MB
- Chunked uploads work seamlessly for files >100MB
- Progress tracking accurately reflects upload status
- Clear error messages guide users when uploads fail
- Upload preset configuration allows large files

## Dependencies

- No new npm packages required
- Cloudinary account with appropriate plan (free plan supports up to 100MB videos, 500MB+ may require paid plan)
- Upload preset configured in Cloudinary Dashboard

## Notes

- The 5MB limit is likely configured in the Cloudinary upload preset
- Users need to update their preset settings in Cloudinary Dashboard
- Chunked uploads are required for files >100MB on free plan
- Paid Cloudinary plans support larger files without chunking (up to 2GB+)