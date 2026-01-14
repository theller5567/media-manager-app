---
name: MediaType Management Page
overview: Build a complete MediaType management interface with list view, create/edit forms, field builder, format restrictions, color picker, default tags, and live form preview. Uses mock data storage for now, ready for Convex migration later.
todos:
  - id: create-media-type-types
    content: Create TypeScript types for MediaType and CustomField in types/mediaType.ts
    status: completed
  - id: create-mock-media-types
    content: Create mockMediaTypes.ts data store with CRUD functions and example data
    status: completed
  - id: create-color-picker
    content: Create ColorPicker component for hex color selection
    status: completed
  - id: create-format-selector
    content: Create FormatSelector component for multi-select file format restrictions
    status: completed
  - id: create-field-builder
    content: Create FieldBuilder component for building custom field schemas
    status: completed
  - id: create-media-type-form
    content: Create MediaTypeForm component with all sections and live preview
    status: completed
  - id: create-media-type-list
    content: Create MediaTypeList component to display existing MediaTypes
    status: completed
  - id: create-validation-utils
    content: Create mediaTypeUtils.ts with validation functions
    status: completed
  - id: implement-media-type-creator-page
    content: Implement MediaTypeCreator page with list and form views
    status: completed
---

# MediaType Management Page

## Overview

Build a comprehensive MediaType management interface that allows admins to create, view, edit, and delete custom MediaTypes. Each MediaType defines accepted file formats, custom metadata fields, UI color coding, and default tags that auto-apply during upload.

## Architecture

```
MediaTypeCreator Page
├── MediaType List View
│   ├── Table/Cards showing existing MediaTypes
│   ├── Color badges, format indicators
│   ├── Usage count (how many media items use this type)
│   ├── Edit button
│   └── Delete button (with confirmation)
└── MediaType Form (Create/Edit)
    ├── Basic Info (name, description, color)
    ├── Format Restrictions (multi-select file extensions)
    ├── Field Builder (add/edit/reorder custom fields)
    ├── Default Tags (multi-select with autocomplete)
    └── Live Preview (generated form preview)
```

## Implementation Details

### 1. Create TypeScript Types (`frontend/src/types/mediaType.ts`)

**New file with MediaType interfaces:**

```typescript
export type CustomFieldType = 'text' | 'number' | 'date' | 'select' | 'boolean' | 'url';

export interface CustomField {
  id: string; // Unique ID for React keys
  name: string; // Field name (camelCase, used as key)
  label: string; // Display label
  type: CustomFieldType;
  required: boolean;
  options?: string[]; // For 'select' type
  validationRegex?: string; // Optional regex pattern
  placeholder?: string; // Optional placeholder text
}

export interface MediaType {
  id: string;
  name: string;
  description?: string;
  color: string; // Hex color code
  allowedFormats: string[]; // e.g., ['.jpg', '.png', '.webp']
  fields: CustomField[];
  defaultTags: string[]; // Tags to auto-apply when using this MediaType
  usageCount?: number; // How many media items use this type (for display)
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. Create Mock Data Store (`frontend/src/data/mockMediaTypes.ts`)

**Purpose:** Store MediaTypes in memory (migrate to Convex later)

**Structure:**

- Array of MediaType objects
- CRUD utility functions:
  - `getAllMediaTypes(): MediaType[]`
  - `getMediaTypeById(id: string): MediaType | undefined`
  - `createMediaType(data: Omit<MediaType, 'id' | 'createdAt' | 'updatedAt'>): MediaType`
  - `updateMediaType(id: string, data: Partial<MediaType>): MediaType`
  - `deleteMediaType(id: string): boolean`
  - `getMediaTypeUsageCount(id: string): number` (counts items in mockMediaData using this type)

**Initial Data:**

- Include 2-3 example MediaTypes matching PROJECT.md examples:
  - "Product Image" (Color: #3b82f6, Formats: .jpg, .png, .webp)
  - "Webinar Video" (Color: #ef4444, Formats: .mp4, .mov)

### 3. Create Field Builder Component (`frontend/src/components/media/FieldBuilder.tsx`)

**Purpose:** Reusable component for building custom field schemas

**Features:**

- Add new field button
- List of fields with drag-and-drop reordering (optional, or use up/down buttons)
- For each field:
  - Field name input (camelCase validation)
  - Label input
  - Type dropdown (text, number, date, select, boolean, url)
  - Required checkbox
  - Options input (for select type - comma-separated or multi-input)
  - Validation regex input (optional)
  - Placeholder input (optional)
  - Delete button
- Field validation (ensure unique field names)

**Props:**

- `fields: CustomField[]`
- `onChange: (fields: CustomField[]) => void`
- `availableTags?: string[]` (for autocomplete if needed)

### 4. Create MediaType Form Component (`frontend/src/components/media/MediaTypeForm.tsx`)

**Purpose:** Form for creating/editing MediaTypes

**Sections:**

**1. Basic Information:**

- Name input (required, unique validation)
- Description textarea (optional)
- Color picker (hex color input with visual preview)

**2. Format Restrictions:**

- Multi-select or checkbox list of file extensions
- Grouped by category (Images, Videos, Documents, Audio)
- Custom format input (add arbitrary extensions)
- Visual indicators for selected formats

**3. Custom Fields:**

- Use FieldBuilder component
- Add/remove/reorder fields
- Field validation

**4. Default Tags:**

- Multi-select with autocomplete
- Use existing tags from mockMediaData (via getAvailableTags)
- Allow creating new tags inline (optional)
- Display selected tags as badges

**5. Live Preview:**

- Show generated form that would appear during upload
- Render based on current field configuration
- Use React Hook Form + Zod for preview validation
- Show required field indicators

**Form Validation:**

- Name: Required, unique, alphanumeric + spaces/hyphens
- Color: Valid hex color format
- Allowed Formats: At least one format required
- Fields: Unique field names, required fields must have labels
- Select fields: Must have at least one option

**Props:**

- `mediaType?: MediaType` (for edit mode)
- `onSubmit: (data: MediaType) => void`
- `onCancel: () => void`
- `availableTags: string[]`

### 5. Create MediaType List Component (`frontend/src/components/media/MediaTypeList.tsx`)

**Purpose:** Display all MediaTypes in a table or card layout

**Display Columns/Info:**

- Color badge (visual indicator)
- Name
- Description (truncated)
- Allowed Formats (badges or comma-separated)
- Field Count (number of custom fields)
- Default Tags (badges, truncated if many)
- Usage Count (how many media items use this type)
- Actions (Edit, Delete)

**Features:**

- Empty state when no MediaTypes exist
- Delete confirmation dialog
- Edit button opens form in edit mode
- Responsive design (table on desktop, cards on mobile)

**Props:**

- `mediaTypes: MediaType[]`
- `onEdit: (mediaType: MediaType) => void`
- `onDelete: (id: string) => void`
- `usageCounts: Record<string, number>`

### 6. Update MediaTypeCreator Page (`frontend/src/pages/MediaTypeCreator.tsx`)

**Page Structure:**

- Header with title and "Create New MediaType" button
- Toggle between List View and Form View
- List View: Shows MediaTypeList component
- Form View: Shows MediaTypeForm component (create or edit mode)

**State Management:**

- `mediaTypes: MediaType[]` - Loaded from mockMediaTypes
- `editingMediaType: MediaType | null` - Currently editing (null = create mode)
- `showForm: boolean` - Toggle between list and form views

**Actions:**

- Create new MediaType
- Edit existing MediaType
- Delete MediaType (with confirmation)
- Cancel edit (return to list)

**Integration:**

- Load available tags from mockMediaData
- Calculate usage counts by checking mockMediaData
- Update mockMediaTypes store on create/update/delete

### 7. Create Color Picker Component (`frontend/src/components/ui/ColorPicker.tsx`)

**Purpose:** Simple hex color picker with visual preview

**Features:**

- Hex input field
- Visual color swatch/preview
- Preset color palette (optional - common colors)
- Validation for hex format (#RRGGBB)

**Props:**

- `value: string` (hex color)
- `onChange: (color: string) => void`

**Alternative:** Use HTML5 color input if browser support is sufficient

### 8. Create Format Selector Component (`frontend/src/components/media/FormatSelector.tsx`)

**Purpose:** Multi-select interface for file format restrictions

**Features:**

- Grouped checkboxes by category:
  - Images: .jpg, .jpeg, .png, .gif, .webp, .svg, .avif
  - Videos: .mp4, .mov, .avi, .webm, .mkv
  - Documents: .pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx
  - Audio: .mp3, .wav, .ogg, .flac
- Custom format input (add arbitrary extensions)
- Visual indicators for selected formats
- "Select All" per category (optional)

**Props:**

- `selectedFormats: string[]`
- `onChange: (formats: string[]) => void`

### 9. Update MediaItem Interface (if needed)

**Check if MediaItem needs to reference MediaType:**

- Current: `mediaType: MediaType` (basic type: image/video/audio/document)
- Future: May need `customMediaTypeId?: string` to link to MediaType
- For now: Keep as-is, MediaType is separate concept

### 10. Create Validation Utilities (`frontend/src/lib/mediaTypeUtils.ts`)

**Functions:**

- `validateFieldName(name: string): ValidationResult` - Check camelCase, uniqueness
- `validateHexColor(color: string): boolean` - Validate hex format
- `validateMediaType(data: Partial<MediaType>): ValidationResult` - Full MediaType validation
- `generateFieldId(): string` - Generate unique IDs for fields
- `getFileExtensionCategory(ext: string): 'image' | 'video' | 'document' | 'audio' | 'other'`

## Files to Create

1. `frontend/src/types/mediaType.ts` - TypeScript interfaces
2. `frontend/src/data/mockMediaTypes.ts` - Mock data store with CRUD functions
3. `frontend/src/components/media/FieldBuilder.tsx` - Field builder component
4. `frontend/src/components/media/MediaTypeForm.tsx` - Create/edit form
5. `frontend/src/components/media/MediaTypeList.tsx` - List view component
6. `frontend/src/components/ui/ColorPicker.tsx` - Color picker component
7. `frontend/src/components/media/FormatSelector.tsx` - Format selector component
8. `frontend/src/lib/mediaTypeUtils.ts` - Validation utilities

## Files to Modify

1. `frontend/src/pages/MediaTypeCreator.tsx` - Main page implementation
2. `frontend/src/lib/mediaUtils.tsx` - May need to export MediaType type if shared

## UI/UX Considerations

**Form Layout:**

- Use sections with clear headings
- Progressive disclosure (show advanced options on expand)
- Inline validation with error messages
- Save/Cancel buttons at bottom
- Loading states during save

**List View:**

- Responsive table (desktop) / cards (mobile)
- Search/filter MediaTypes (optional)
- Sort by name, usage count, date created
- Empty state with CTA to create first MediaType

**Color Coding:**

- Show color swatch in list view
- Use color in badges/indicators throughout UI
- Ensure sufficient contrast for accessibility

**Field Builder:**

- Drag-and-drop for reordering (or up/down buttons)
- Collapsible field details
- Clear visual hierarchy
- Validation feedback inline

**Live Preview:**

- Show in sidebar or below form
- Update in real-time as fields are added/modified
- Show required field indicators
- Display sample form with proper input types

## State Flow

```
Page Load
  ↓
Load MediaTypes from mockMediaTypes
  ↓
Calculate usage counts from mockMediaData
  ↓
Display List View
  ↓
User clicks "Create" or "Edit"
  ↓
Show Form View with MediaTypeForm
  ↓
User fills form, adds fields, selects formats/tags
  ↓
Live Preview updates in real-time
  ↓
User clicks "Save"
  ↓
Validate form data
  ↓
Save to mockMediaTypes store
  ↓
Return to List View
  ↓
Refresh list with updated data
```

## Testing Considerations

- Test creating MediaType with all field types
- Test field validation (unique names, required fields)
- Test format selection (single, multiple, custom)
- Test color picker (hex validation)
- Test default tags selection
- Test edit existing MediaType
- Test delete with confirmation
- Test live preview updates correctly
- Test usage count calculation
- Test form validation errors
- Test responsive design

## Future Enhancements (Out of Scope)

- Convex backend integration (migrate mockMediaTypes to Convex)
- Field reordering with drag-and-drop library
- Import/export MediaType definitions (JSON)
- MediaType templates/presets
- Duplicate MediaType functionality
- MediaType versioning/history
- Advanced validation rules (min/max, custom validators)
- Field dependencies (show field B only if field A has value)
- MediaType categories/grouping