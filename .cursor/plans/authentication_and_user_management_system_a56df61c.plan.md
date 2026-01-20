---
name: Authentication and User Management System
overview: Implement complete authentication system with Convex Auth, role-based access control, user profiles with preferences, favorites functionality, and track uploadedBy on all media files.
todos:
  - id: "1"
    content: Install Convex Auth package and configure authentication
    status: completed
  - id: "2"
    content: "Update schema: Add users table, add uploadedBy and favoritedBy to media table"
    status: completed
  - id: "3"
    content: Create auth mutations and queries (signUp, getCurrentUser, etc.)
    status: completed
  - id: "4"
    content: Update media mutations to require auth and track uploadedBy
    status: completed
  - id: "5"
    content: Create favorites mutations (addFavorite, removeFavorite, toggleFavorite)
    status: completed
  - id: "6"
    content: Create useAuth hook and ProtectedRoute component
    status: completed
  - id: "7"
    content: Create Login and Signup pages
    status: completed
  - id: "8"
    content: Update App.tsx with auth routes and protected routes
    status: completed
  - id: "9"
    content: Create UserProfile page with profile editing and preferences
    status: completed
  - id: "10"
    content: Create MyUploads and FavoritesList components
    status: completed
  - id: "11"
    content: Create RBAC utilities and add authorization checks to mutations
    status: completed
  - id: "12"
    content: Update MediaList and MediaTable to show favorites and filter by user
    status: completed
  - id: "13"
    content: Update Sidebar with user menu and logout
    status: completed
  - id: "14"
    content: Add favorite button to media cards and detail page
    status: completed
  - id: "15"
    content: Migrate existing media to set uploadedBy field
    status: completed
---

# Authentication and User Management System

## Overview

Implement a complete authentication and user management system using Convex Auth (email/password), with role-based access control, user profiles, favorites, and tracking of who uploaded each media file.

## Architecture

### Authentication Flow

```
User Login → Convex Auth → JWT Token → Protected Routes → Role Checks → Data Access
```

### Database Schema Changes

#### 1. Users Table (`frontend/convex/schema.ts`)

- Add `users` table with:
  - `email`: string (unique, indexed)
  - `name`: string
  - `role`: union("user", "admin", "super_admin")
  - `avatarUrl`: optional string
  - `preferences`: object with:
    - `defaultViewMode`: "grid" | "list"
    - `defaultSortBy`: SortField
    - `defaultSortDirection`: "asc" | "desc"
    - `defaultMediaTypes`: array of MediaType
    - `notifications`: object with email preferences
  - `createdAt`: number
  - `lastLoginAt`: optional number
  - `invitedBy`: optional id("users")

#### 2. Media Table Updates (`frontend/convex/schema.ts`)

- Add `uploadedBy`: id("users") (required, indexed)
- Add `favoritedBy`: array of id("users") (for favorites)
- Add index `by_uploadedBy` for querying user's files

#### 3. Favorites Table (Optional - alternative approach)

- Could use `favoritedBy` array on media OR separate `favorites` table
- Recommendation: Use `favoritedBy` array for simplicity

## Implementation Steps

### Phase 1: Convex Auth Setup

#### 1.1 Install Convex Auth

- Add `@convex-dev/auth` package
- Configure auth in `frontend/convex/auth.ts`
- Set up email/password provider

#### 1.2 Update Schema

- Add `users` table to schema
- Add `uploadedBy` and `favoritedBy` to `media` table
- Add indexes for efficient queries

### Phase 2: Authentication Mutations & Queries

#### 2.1 Create Auth Mutations (`frontend/convex/mutations/auth.ts`)

- `signUp`: Create new user with default "user" role
- `signIn`: Already handled by Convex Auth
- `signOut`: Already handled by Convex Auth
- `updateProfile`: Update user name, avatar, preferences
- `changePassword`: Update user password
- `inviteUser`: Admin-only mutation to invite new users

#### 2.2 Create Auth Queries (`frontend/convex/queries/auth.ts`)

- `getCurrentUser`: Get authenticated user's profile
- `getUserById`: Get user by ID (for admins)
- `listUsers`: Admin-only query to list all users
- `getUserPreferences`: Get user preferences

#### 2.3 Create User Mutations (`frontend/convex/mutations/users.ts`)

- `updateRole`: Admin-only mutation to change user roles
- `deleteUser`: Admin-only mutation to delete users
- `updatePreferences`: Update user preferences

### Phase 3: Update Media Mutations

#### 3.1 Update Media Create Mutation (`frontend/convex/mutations/media.ts`)

- Add `uploadedBy` parameter (get from `ctx.auth.getUserIdentity()`)
- Require authentication for all media operations
- Add authorization checks (users can only edit their own media unless admin)

#### 3.2 Update Media Queries (`frontend/convex/queries/media.ts`)

- Add `getByUserId`: Query media uploaded by specific user
- Add `getFavorites`: Query favorited media for current user
- Update `list` query to filter by user permissions

#### 3.3 Add Favorites Mutations (`frontend/convex/mutations/favorites.ts`)

- `addFavorite`: Add media to user's favorites
- `removeFavorite`: Remove media from user's favorites
- `toggleFavorite`: Toggle favorite status

### Phase 4: Frontend Authentication

#### 4.1 Create Auth Context/Hook (`frontend/src/hooks/useAuth.ts`)

- Use `useConvexAuth()` from Convex
- Provide `currentUser`, `isAuthenticated`, `isLoading`
- Provide `signIn`, `signOut` functions

#### 4.2 Create Protected Route Component (`frontend/src/components/auth/ProtectedRoute.tsx`)

- Wrapper component that checks authentication
- Redirects to login if not authenticated
- Shows loading state during auth check

#### 4.3 Create Login Page (`frontend/src/pages/Login.tsx`)

- Email/password form
- Error handling
- Redirect after successful login

#### 4.4 Create Signup Page (`frontend/src/pages/Signup.tsx`)

- Registration form
- Invitation code support (optional)
- Role assignment (default to "user")

#### 4.5 Update App Routes (`frontend/src/App.tsx`)

- Add `/login` and `/signup` routes (public)
- Wrap protected routes with `ProtectedRoute`
- Add redirect logic for authenticated users

### Phase 5: User Profile Page

#### 5.1 Create Profile Page (`frontend/src/pages/UserProfile.tsx`)

- Display user information (name, email, role, avatar)
- Edit profile form
- Preferences section:
  - Default view mode
  - Default sort preferences
  - Default media type filters
  - Notification preferences
- "My Uploads" section (list of user's files)
- "Favorites" section (list of favorited files)
- Avatar upload functionality

#### 5.2 Create Profile Components

- `ProfileForm.tsx`: Edit user information
- `PreferencesForm.tsx`: Manage user preferences
- `MyUploads.tsx`: Display user's uploaded files
- `FavoritesList.tsx`: Display favorited files

### Phase 6: Role-Based Access Control

#### 6.1 Create RBAC Utilities (`frontend/src/lib/rbac.ts`)

- `hasRole(user, role)`: Check if user has specific role
- `hasAnyRole(user, roles)`: Check if user has any of the roles
- `canEditMedia(user, media)`: Check if user can edit media
- `canDeleteMedia(user, media)`: Check if user can delete media

#### 6.2 Update Mutations with Authorization

- Add role checks to admin-only mutations
- Add ownership checks to media mutations
- Return appropriate errors for unauthorized access

#### 6.3 Update UI Based on Roles

- Show/hide admin features based on role
- Disable actions user can't perform
- Add role badges in user list

### Phase 7: Update Existing Components

#### 7.1 Update Media Upload (`frontend/src/hooks/useMediaUpload.ts`)

- Get `uploadedBy` from auth context
- Pass `uploadedBy` to media create mutation
- Show user's name in upload success message

#### 7.2 Update Media List (`frontend/src/components/layout/MediaList.tsx`)

- Filter by current user's uploads (if viewing "My Uploads")
- Show favorite button/icon on each media item
- Display uploader information

#### 7.3 Update Media Detail (`frontend/src/pages/MediaDetail.tsx`)

- Show uploader information
- Add favorite/unfavorite button
- Show edit/delete buttons only if user has permission

#### 7.4 Update Sidebar (`frontend/src/components/layout/Sidebar.tsx`)

- Add user profile link
- Add "My Uploads" link
- Add "Favorites" link
- Show user name and avatar
- Add logout button

### Phase 8: Favorites Functionality

#### 8.1 Add Favorite Button Component (`frontend/src/components/media/FavoriteButton.tsx`)

- Heart icon that toggles favorite status
- Optimistic UI updates
- Show favorite count

#### 8.2 Update Media Cards/Tables

- Add favorite button to grid view cards
- Add favorite column to table view
- Visual indicator for favorited items

## Files to Create/Modify

### New Files

- `frontend/convex/auth.ts` - Convex Auth configuration
- `frontend/convex/mutations/auth.ts` - Auth mutations
- `frontend/convex/queries/auth.ts` - Auth queries
- `frontend/convex/mutations/users.ts` - User management mutations
- `frontend/convex/mutations/favorites.ts` - Favorites mutations
- `frontend/src/hooks/useAuth.ts` - Auth hook
- `frontend/src/components/auth/ProtectedRoute.tsx` - Route protection
- `frontend/src/pages/Login.tsx` - Login page
- `frontend/src/pages/Signup.tsx` - Signup page
- `frontend/src/pages/UserProfile.tsx` - User profile page (replace placeholder)
- `frontend/src/components/profile/ProfileForm.tsx` - Profile editing form
- `frontend/src/components/profile/PreferencesForm.tsx` - Preferences form
- `frontend/src/components/profile/MyUploads.tsx` - User's uploads list
- `frontend/src/components/profile/FavoritesList.tsx` - Favorites list
- `frontend/src/components/media/FavoriteButton.tsx` - Favorite toggle button
- `frontend/src/lib/rbac.ts` - Role-based access control utilities

### Modified Files

- `frontend/convex/schema.ts` - Add users table, update media table
- `frontend/convex/mutations/media.ts` - Add uploadedBy, auth checks
- `frontend/convex/queries/media.ts` - Add user-specific queries
- `frontend/src/App.tsx` - Add auth routes, protected routes
- `frontend/src/hooks/useMediaUpload.ts` - Add uploadedBy tracking
- `frontend/src/components/layout/MediaList.tsx` - Add favorites, filter by user
- `frontend/src/components/layout/MediaTable.tsx` - Add favorites column
- `frontend/src/pages/MediaDetail.tsx` - Add favorite button, uploader info
- `frontend/src/components/layout/Sidebar.tsx` - Add user menu, logout

## Security Considerations

1. **Authentication Required**: All mutations require authentication
2. **Authorization Checks**: Verify user permissions in every mutation
3. **Role Validation**: Never trust client-side role checks
4. **Ownership Verification**: Users can only edit/delete their own media (unless admin)
5. **Input Validation**: Validate all user inputs in mutations
6. **Password Security**: Use Convex Auth's built-in password hashing

## Migration Strategy

1. **Existing Media**: Set `uploadedBy` to a system/admin user for existing files
2. **Mock Data**: Mark mock data with system user ID
3. **User Preferences**: Initialize with defaults from UI store
4. **Favorites**: Start with empty arrays

## Testing Checklist

- [ ] User can sign up and log in
- [ ] User can view their profile
- [ ] User can update preferences
- [ ] User can see their uploaded files
- [ ] User can favorite/unfavorite media
- [ ] User can only edit their own media (unless admin)
- [ ] Admin can manage users
- [ ] Admin can edit any media
- [ ] Protected routes redirect to login
- [ ] Logout clears session
- [ ] Role-based UI shows/hides correctly

## Dependencies to Add

- `@convex-dev/auth` - Convex Auth package
- `@convex-dev/auth-email-password` - Email/password provider (if separate)

## Notes

- Convex Auth handles session management automatically
- JWT tokens are managed by Convex
- No need for manual token refresh logic
- Auth state is reactive via `useConvexAuth()` hook
- Consider adding email verification in future phase
- Consider adding password reset functionality in future phase