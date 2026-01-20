---
name: Tag Management Page Improvements
overview: Fix the tag form submission, make createdBy optional, add tag list with usage counts, show associated media files, and improve the overall UX/UI of the Tag Management page.
todos:
  - id: fix-schema
    content: Make createdBy optional in mediaTags schema
    status: completed
  - id: fix-mutations
    content: Update mutations to handle optional createdBy and add update/delete mutations
    status: completed
  - id: add-usage-queries
    content: Add queries for tag usage counts and associated media files
    status: completed
  - id: fix-form-submission
    content: Fix handleFormSubmit to actually call the mutation with proper error handling
    status: completed
  - id: create-tag-list
    content: Create MediaTagList component to display tags with usage counts
    status: completed
  - id: create-tag-detail
    content: Create MediaTagDetail component to show tag info and associated media
    status: completed
  - id: enhance-main-page
    content: Enhance TagManagement page with list view, search, and statistics
    status: completed
  - id: improve-form-ux
    content: Add loading states, better validation, and success feedback to MediaTagForm
    status: completed
---

# Tag Management Page Improvements

## Current Issues

1. **Form not saving**: `handleFormSubmit` only logs data, doesn't call the mutation
2. **createdBy requirement**: Schema requires `createdBy` but no users table exists
3. **Missing features**: No tag list display, usage counts, or associated media files
4. **Poor UX**: Empty content area when not showing form

## Implementation Plan

### 1. Fix Schema and Mutations

**`frontend/convex/schema.ts`**:

- Make `createdBy` optional in `mediaTags` table: `createdBy: v.optional(v.id("users"))`

**`frontend/convex/mutations/mediaTags.ts`**:

- Make `createdBy` optional in mutation args
- Add `update` mutation for editing tags
- Add `delete` mutation for removing tags
- Add validation for name uniqueness (case-insensitive)

### 2. Add Tag Usage Queries

**`frontend/convex/queries/mediaTags.ts`**:

- Add `getUsageCounts` query: Count how many media items use each tag (by matching tag strings)
- Add `getMediaByTag` query: Return media items that have a specific tag
- Add `getAllWithUsage` query: Return all tags with their usage counts

### 3. Fix Form Submission

**`frontend/src/pages/TagManagement.tsx`**:

- Import `useMutation` from `convex/react`
- Create mutation hooks: `createTagMutation`, `updateTagMutation`, `deleteTagMutation`
- Update `handleFormSubmit` to actually call the mutation
- Add error handling and loading states
- Add success feedback (toast or inline message)

### 4. Build Tag List Component

**`frontend/src/components/media/MediaTagList.tsx`** (new file):

- Display tags in a table/grid layout
- Show tag name, usage count, and actions (edit/delete)
- Add search/filter functionality
- Show empty state when no tags exist
- Similar pattern to `MediaTypeList.tsx`

### 5. Add Tag Detail View

**`frontend/src/components/media/MediaTagDetail.tsx`** (new file):

- Show tag information
- Display usage count prominently
- List associated media files (with thumbnails)
- Allow navigation to media detail pages
- Show when tag was created (if available)

### 6. Enhance Tag Management Page

**`frontend/src/pages/TagManagement.tsx`**:

- Add tag list view (default state)
- Integrate `MediaTagList` component
- Add search/filter UI
- Add view toggle: List view vs Grid view
- Add bulk actions (select multiple tags)
- Show statistics: Total tags, total usage, most used tags

### 7. Update Form Component

**`frontend/src/components/media/MediaTagForm.tsx`**:

- Add loading state during submission
- Add success/error feedback
- Improve validation (check for duplicates case-insensitively)
- Add form reset after successful submission
- Better error display

### 8. Additional UX Improvements

- **Search/Filter**: Search tags by name, filter by usage count
- **Sorting**: Sort by name, usage count, date created
- **Statistics Dashboard**: Show tag usage statistics at the top
- **Quick Actions**: Bulk delete unused tags, merge duplicate tags
- **Tag Preview**: Show preview of media files using the tag
- **Responsive Design**: Mobile-friendly layout

## File Changes

### Modified Files:

- `frontend/convex/schema.ts` - Make createdBy optional
- `frontend/convex/mutations/mediaTags.ts` - Add update/delete, make createdBy optional
- `frontend/convex/queries/mediaTags.ts` - Add usage count and media queries
- `frontend/src/pages/TagManagement.tsx` - Fix form submission, add list view
- `frontend/src/components/media/MediaTagForm.tsx` - Add loading states, better validation

### New Files:

- `frontend/src/components/media/MediaTagList.tsx` - Tag list component with usage counts
- `frontend/src/components/media/MediaTagDetail.tsx` - Tag detail view with associated media

## Implementation Details

### Tag Usage Count Logic

Since `media.tags` stores strings (not references), we'll count usage by:

1. Query all media items
2. For each tag, count media items where `tags` array includes the tag name (case-insensitive)
3. Return counts as `Record<tagId, count>`

### Tag-Media Relationship

Tags are stored as strings in `media.tags`, so we'll:

- Match tags by name (case-insensitive comparison)
- Show media items that contain the tag in their tags array
- Allow filtering media library by tag

### Form Submission Flow

```typescript
handleFormSubmit → 
  Check if editing or creating →
    Call appropriate mutation →
      Show loading state →
        On success: Close form, refresh list →
        On error: Show error message
```

## Testing Checklist

- [ ] Form successfully creates tags
- [ ] Form successfully updates tags
- [ ] Tags can be deleted
- [ ] Usage counts display correctly
- [ ] Associated media files show correctly
- [ ] Search/filter works
- [ ] Validation prevents duplicate tags
- [ ] Error handling works properly
- [ ] Loading states display correctly
- [ ] Mobile responsive layout works