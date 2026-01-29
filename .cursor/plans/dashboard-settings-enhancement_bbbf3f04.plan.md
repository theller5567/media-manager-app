---
name: dashboard-settings-enhancement
overview: Enhance the Dashboard and Settings pages with meaningful data visualization, quick actions, and user preferences.
todos:
  - id: update-convex-stats
    content: Update api.queries.users.getUserStats to include storage breakdown by mediaType and total storage limit
    status: completed
  - id: create-statcard
    content: Create reusable StatCard component in frontend/src/components/ui/StatCard.tsx
    status: completed
  - id: implement-dashboard-stats
    content: Implement Statistics Grid in Dashboard.tsx including storage breakdown and remaining storage
    status: completed
  - id: implement-dashboard-recent
    content: Implement Recent Uploads section in Dashboard.tsx using api.queries.media.list (limited to 5)
    status: completed
  - id: implement-dashboard-actions
    content: Implement Quick Actions in Dashboard.tsx (Upload button, links)
    status: completed
  - id: implement-settings-ui
    content: Add UI Preferences section to Settings.tsx (view mode toggle)
    status: completed
  - id: implement-settings-integrations
    content: Add Integration Status section to Settings.tsx (Cloudinary, Gemini)
    status: completed
isProject: false
---

# Dashboard and Settings Page Enhancements

This plan outlines the implementation of meaningful content for the Dashboard and Settings pages, leveraging existing data structures and UI patterns.

## Dashboard Enhancement

The Dashboard will serve as a central hub for users to see their media library at a glance.

### 1. Stats Overview Section

- Implement a grid of statistic cards using data from `api.queries.users.getUserStats`.
- **Total Files**: Count of all media items.
- **Storage Used**: Human-readable total file size (using `formatFileSize` from `mediaUtils`).
- **Remaining Storage**: Calculate based on a 1GB limit (hardcoded for now).
- **Storage Breakdown**: A visual breakdown (progress bar or list) of storage used by each media type (Images, Videos, Documents, etc.).
- **Media Types**: A breakdown of media by count.

### 2. Recent Activity / Uploads

- Display a "Recent Uploads" section showing the last 5 items.
- Reuse `LazyImage` for thumbnails and link to `MediaDetail`.

### 3. Quick Actions

- Add a prominent "Upload New Media" button that triggers the `MediaUpload` dialog.
- Links to "Manage Tags" and "Media Library".

## Settings Page Enhancement

The Settings page will allow users to configure their experience.

### 1. UI Preferences

- **Default View**: Allow users to choose between 'Grid' and 'List' as their default view mode (linked to `uiStore`).
- **Theme Selection**: Placeholder for Dark/Light mode (if applicable).

### 2. User Profile Integration

- Link to the `Profile` page for name, password, and avatar gradient settings.

### 3. Service Integrations

- **Cloudinary Status**: Informational section showing that Cloudinary is connected.
- **Gemini AI Status**: Status of AI auto-tagging features.

## Proposed New Features

### 1. Activity Log

- A simple table on the Dashboard showing recent actions (Uploaded, Deleted, Edited) with timestamps.

### 2. Media Collections (Virtual Folders)

- Add a new table/query for "Collections" to group media items without physical folder structures.

### 3. Bulk Operations

- Allow selecting multiple items in the Library to apply tags in bulk.

## File Changes

- `frontend/src/pages/Dashboard.tsx`: Add stats grid and recent uploads.
- `frontend/src/pages/Settings.tsx`: Add UI preferences and integration status.
- `frontend/src/components/ui/StatCard.tsx`: Create a reusable card component for statistics.