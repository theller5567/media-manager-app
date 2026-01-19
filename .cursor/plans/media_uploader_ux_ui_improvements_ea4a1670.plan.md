---
name: Media Uploader UX/UI Improvements
overview: "Fix three critical UX issues: disable Next button during AI processing, prevent premature field validation errors, and display file size limits upfront. Also includes additional UX enhancements for better user experience."
todos:
  - id: disable-next-during-ai
    content: Disable Next button when AI is processing in MediaUpload.tsx
    status: completed
  - id: track-validation-attempts
    content: Add validation attempt tracking to prevent premature error display
    status: completed
  - id: add-file-limits-info
    content: Add file size limits information section to Step1FilesAndMediaType.tsx
    status: completed
  - id: export-file-limit-function
    content: Export getFileSizeLimitMessage from cloudinary.ts for reuse in UI
    status: completed
  - id: clear-errors-on-input
    content: Clear field errors when user starts typing in Step2CommonFields
    status: completed
  - id: improve-ai-feedback
    content: Enhance AI processing feedback with file-by-file progress indication
    status: completed
---

# Media Uploader UX/UI Improvements

## Issues to Fix

### 1. Next Button Enabled During AI Processing

**Problem**: When AI assistant is processing, the Next button remains clickable, allowing users to proceed before AI suggestions are ready.

**Solution**:

- Disable Next button when `aiProcessing` is true
- Update `canProceed` calculation in `MediaUpload.tsx` to include `aiProcessing` check
- Show visual indicator that AI is processing and Next is disabled

**Files to modify**:

- `frontend/src/components/media/MediaUpload.tsx` - Update `canProceed` logic and Next button disabled state

### 2. Premature Field Validation Errors

**Problem**: When navigating to Step 2 without using AI, all required fields are immediately highlighted in red before the user interacts with them.

**Solution**:

- Track whether user has attempted to proceed (`hasAttemptedNext` state)
- Only show validation errors after user clicks Next or attempts to proceed
- Clear error highlighting when user starts typing in a field
- Initialize errors array as empty, only populate when validation is triggered with `updateErrors: true`

**Files to modify**:

- `frontend/src/components/media/MediaUpload.tsx` - Add `hasAttemptedNext` state tracking
- `frontend/src/components/media/upload/Step2CommonFields.tsx` - Only show errors if validation was attempted
- `frontend/src/hooks/useMediaUpload.ts` - Track validation attempts per step

### 3. Missing File Size Limits Information

**Problem**: Users don't see file size limits and restrictions until after they try to upload invalid files.

**Solution**:

- Add an informational section above the drag-and-drop zone showing:
  - Maximum file sizes by type (Images: 20MB, Videos: 500MB, Others: 100MB)
  - AI analysis limit (3.5MB for AI processing)
  - Supported file types
- Display this info prominently before file selection

**Files to modify**:

- `frontend/src/components/media/upload/Step1FilesAndMediaType.tsx` - Add file limits info section
- Export `getFileSizeLimitMessage` from `frontend/src/lib/cloudinary.ts` for reuse

## Additional UX Improvements

### 4. Better AI Processing Feedback

- Show progress indicator with estimated time
- Display which file is currently being analyzed
- Add cancel option for AI processing

### 5. Improved Error Messages

- More specific error messages for file size violations
- Clear indication of which files exceed limits
- Suggestions for resolving issues (e.g., "Try compressing images larger than 20MB")

### 6. Visual Feedback Enhancements

- Show file type icons more prominently
- Add loading states for file processing
- Better visual distinction between valid and invalid files

### 7. Accessibility Improvements

- Ensure all error messages are announced to screen readers
- Add ARIA labels for validation states
- Keyboard navigation improvements

## Implementation Details

### File Changes

**`frontend/src/components/media/MediaUpload.tsx`**:

```typescript
// Add state to track validation attempts per step
const [validationAttempted, setValidationAttempted] = useState<Set<number>>(new Set());

// Update canProceed to include AI processing check
const isValid = uploadState.validateStep(uploadState.step, false);
const canProceed = isValid && !uploadState.aiProcessing;

// Track validation attempts in handleNext
const handleNext = () => {
  setValidationAttempted(prev => new Set(prev).add(uploadState.step));
  const isValid = uploadState.validateStep(uploadState.step, true);
  // ...
};

// Pass validationAttempted to Step2CommonFields
errors={validationAttempted.has(1) ? step2Errors : []}
```

**`frontend/src/components/media/upload/Step1FilesAndMediaType.tsx`**:

```typescript
// Add file limits info section before drag-and-drop zone
<div className="mb-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
  <h4 className="text-sm font-medium text-white mb-2">File Upload Limits</h4>
  <ul className="text-xs text-slate-400 space-y-1">
    <li>• Images: Up to 20MB</li>
    <li>• Videos: Up to 500MB</li>
    <li>• Other files: Up to 100MB</li>
    <li>• AI analysis: Files up to 3.5MB</li>
  </ul>
  <p className="text-xs text-slate-500 mt-2">
    Supported formats: Images (JPEG, PNG, GIF, WebP), Videos (MP4, MOV, AVI), Audio (MP3, WAV), Documents (PDF, DOC, DOCX)
  </p>
</div>
```

**`frontend/src/components/media/upload/Step2CommonFields.tsx`**:

- No changes needed - already uses `errors` prop correctly

**`frontend/src/lib/cloudinary.ts`**:

```typescript
// Export getFileSizeLimitMessage for use in UI
export function getFileSizeLimitMessage(fileType: string): string {
  // ... existing implementation
}
```

## Testing Checklist

- [ ] Next button is disabled when AI is processing
- [ ] Step 2 fields don't show errors until user clicks Next
- [ ] File size limits are visible before file selection
- [ ] Error highlighting clears when user starts typing
- [ ] Validation errors only appear after validation attempt
- [ ] AI processing indicator is visible and clear
- [ ] File limits info is accurate and helpful

## Additional Considerations

- Consider adding a "Skip AI" option if processing takes too long
- Add tooltips explaining why certain limits exist
- Consider progressive enhancement: show basic limits, expand for details
- Ensure mobile responsiveness of file limits info section