---
name: Google Gemini Integration for Media Uploader
overview: Integrate Google Gemini AI for analyzing uploaded media files and generating metadata suggestions (title, description, alt text, tags) via a secure server-side Convex action, replacing the current mock implementation.
todos:
  - id: "1"
    content: Create Convex action `analyzeMedia.ts` with Gemini API integration
    status: completed
  - id: "2"
    content: Add `fileToBase64` utility function to `fileUtils.ts`
    status: completed
  - id: "3"
    content: Update `analyzeFileWithAI` in `aiUtils.ts` to call Convex action
    status: completed
  - id: "4"
    content: Add `GEMINI_API_KEY` to environment variables
    status: completed
  - id: "5"
    content: Test integration with sample image and video files
    status: completed
  - id: "6"
    content: Add error handling for API failures and rate limits
    status: completed
---

# Google Gemini Integration for Media Uploader

## Overview

Replace the mock AI implementation in `analyzeFileWithAI` with real Google Gemini API calls via a Convex action. This keeps the API key secure on the server while analyzing uploaded files to generate metadata suggestions.

## Architecture

```
User Uploads File
    ↓
useMediaUpload Hook
    ↓
analyzeFileWithAI (aiUtils.ts)
    ↓
Convex Action: analyzeMediaWithGemini
    ↓
Google Gemini API
    ↓
Returns AISuggestions
```

## Implementation Steps

### 1. Create Convex Action for Gemini Analysis

**File**: `frontend/convex/actions/analyzeMedia.ts`

- Use `"use node"` directive (required for external API calls)
- Import `@google/genai` package
- Accept file data (base64 string, mimeType, filename) and MediaType as arguments
- Initialize Gemini client with API key from `process.env.GEMINI_API_KEY`
- Build prompt based on MediaType context
- Call Gemini API with multimodal input (image/video base64 + text prompt)
- Parse response into `AISuggestions` format
- Handle errors gracefully

**Key considerations**:

- Use `gemini-1.5-flash` or `gemini-2.0-flash-001` model (supports vision)
- Convert file to base64 in client before sending (Convex actions can't receive File objects directly)
- Include MediaType context in prompt for better suggestions
- Return structured JSON response

### 2. Update aiUtils.ts

**File**: `frontend/src/lib/aiUtils.ts`

- Replace mock `analyzeFileWithAI` function
- Convert File to base64 before calling Convex action
- Use `useAction` hook from Convex React
- Handle loading states and errors
- Maintain same function signature for backward compatibility

**Implementation details**:

- Convert File to base64: `const base64 = await fileToBase64(file)`
- Call Convex action: `await analyzeMediaWithGemini({ base64, mimeType: file.type, filename: file.name, mediaType })`
- Return `AISuggestions` object

### 3. Create File Conversion Utility

**File**: `frontend/src/lib/fileUtils.ts` (add to existing file)

- Add `fileToBase64` helper function
- Handle both images and videos
- Return Promise<string> with base64 data

### 4. Update useMediaUpload Hook

**File**: `frontend/src/hooks/useMediaUpload.ts`

- Import updated `analyzeFileWithAI` from `aiUtils.ts`
- No changes needed to `processAI` callback (already calls `analyzeFileWithAI`)
- Ensure error handling works with async Convex action calls

### 5. Environment Variable Setup

**File**: `.env` (or `.env.local`)

- Add `GEMINI_API_KEY=your_api_key_here`
- Document in `.env.example` if it exists
- Note: Convex actions access env vars via `process.env`, not `import.meta.env`

### 6. Error Handling & User Feedback

**Files**: `frontend/src/hooks/useMediaUpload.ts`, `frontend/src/components/media/upload/Step1FilesAndMediaType.tsx`

- Update error messages for AI failures
- Show user-friendly error messages if Gemini API fails
- Consider rate limiting or quota exceeded scenarios

## Technical Details

### Gemini API Usage

- **Model**: `gemini-1.5-flash` or `gemini-2.0-flash-001` (multimodal support)
- **Input Format**: Base64-encoded image/video with MIME type
- **Prompt Structure**: Include MediaType context, request structured JSON output
- **Response Parsing**: Extract title, description, altText, tags from Gemini's response

### Prompt Template

```
Analyze this ${mediaType} file (${filename}) and provide:
1. A concise title (max 60 characters)
2. A brief description (1-2 sentences)
3. Alt text for accessibility (if image)
4. Relevant tags (3-5 tags)

Media Type Context: ${mediaType.name} - ${mediaType.description}

Return JSON format: { "title": "...", "description": "...", "altText": "...", "tags": ["..."] }
```

### File Size Considerations

- Gemini has file size limits (typically 20MB for images, varies for videos)
- Consider adding file size validation before calling Gemini
- May need to compress/resize large images before analysis

## Testing Checklist

- [ ] Test with image files (JPG, PNG)
- [ ] Test with video files (MP4)
- [ ] Test with MediaType context
- [ ] Test error handling (invalid API key, network errors)
- [ ] Test with large files (verify size limits)
- [ ] Verify AISuggestions populate correctly in Step 2
- [ ] Test "Accept All AI" functionality

## Files to Modify

1. `frontend/convex/actions/analyzeMedia.ts` (NEW)
2. `frontend/src/lib/aiUtils.ts` (UPDATE)
3. `frontend/src/lib/fileUtils.ts` (UPDATE - add fileToBase64)
4. `frontend/src/hooks/useMediaUpload.ts` (MINOR - ensure compatibility)
5. `.env` (UPDATE - add GEMINI_API_KEY)

## Dependencies

- `@google/genai` (already installed v1.37.0)
- Convex actions support (already configured)

## Security Notes

- API key stored in environment variable (not committed to git)
- API key only accessible server-side via Convex action
- No client-side exposure of credentials