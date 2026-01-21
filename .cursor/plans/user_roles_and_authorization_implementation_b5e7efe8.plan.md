---
name: User Roles and Authorization Implementation
overview: Implement role-based access control (RBAC) and authorization throughout the app, including protected routes, mutation authorization checks, and role-based UI features. This establishes the security foundation before adding 2FA and password recovery features.
todos:
  - id: "1"
    content: "Update schema: Add uploadedBy field to media table and create index"
    status: completed
  - id: "2"
    content: Create server-side auth helpers (requireAuth, getCurrentUser, requireRole)
    status: completed
  - id: "3"
    content: Create client-side RBAC utilities (hasRole, canEditMedia, etc.)
    status: completed
  - id: "4"
    content: Create ProtectedRoute component for route protection
    status: completed
  - id: "5"
    content: Update App.tsx to wrap routes with ProtectedRoute
    status: completed
  - id: "6"
    content: "Update media mutations: Add auth checks and uploadedBy tracking"
    status: completed
  - id: "7"
    content: "Update media queries: Add getByUserId and getMyUploads queries"
    status: completed
  - id: "8"
    content: Create user queries and mutations for role management
    status: completed
  - id: "9"
    content: "Update Sidebar: Add role-based UI and My Uploads link"
    status: completed
  - id: "10"
    content: "Update MediaList: Add My Uploads filter and show uploader info"
    status: completed
  - id: "11"
    content: "Update MediaDetail: Add ownership checks and conditional edit/delete buttons"
    status: completed
  - id: "12"
    content: "Update useMediaUpload hook: Ensure uploadedBy is set on media creation"
    status: completed
  - id: "13"
    content: Create migration to set uploadedBy for existing media and assign admin role
    status: completed
---

# User Roles and Authorization Implementation

## Current State Analysis

**What's Working:**

- Basic login/signup with BetterAuth ✅
- `useAuth` hook provides user session data ✅
- User data displayed in Sidebar ✅

**Critical Gaps:**

- ❌ No authorization checks in mutations (anyone can create/update/delete media)
- ❌ No protected routes (all routes publicly accessible)
- ❌ No role-based access control
- ❌ No `uploadedBy` tracking on media files
- ❌ No ownership checks (users can edit any media)

## Implementation Strategy

### Phase 1: Schema Updates & User Roles

#### 1.1 Update Schema (`frontend/convex/schema.ts`)

- Add `role` field to BetterAuth user (via BetterAuth's user extension or custom table)
- Add `uploadedBy` field to `media` table: `v.optional(v.id("betterAuth:user"))`
- Add index `by_uploadedBy` for efficient user media queries
- Note: BetterAuth manages user table via component, so we'll use `authComponent.getAuthUser()` for user data

#### 1.2 Create User Role Extension

- BetterAuth stores users in component-managed tables
- Create utility to get user role (may need to extend BetterAuth user or use separate roles table)
- Default role: "user" for all new signups
- Admin role: manually assignable (or via migration for first user)

### Phase 2: Authorization Utilities

#### 2.1 Create RBAC Utilities (`frontend/src/lib/rbac.ts`)

```typescript
// Helper functions for role checking
export function hasRole(user: User | null, role: "user" | "admin"): boolean
export function hasAnyRole(user: User | null, roles: string[]): boolean
export function canEditMedia(user: User | null, media: Media): boolean
export function canDeleteMedia(user: User | null, media: Media): boolean
export function isAdmin(user: User | null): boolean
```

#### 2.2 Create Auth Helpers (`frontend/convex/lib/auth.ts`)

```typescript
// Server-side auth utilities
export async function requireAuth(ctx: QueryCtx | MutationCtx)
export async function requireRole(ctx: QueryCtx | MutationCtx, role: string)
export async function getCurrentUser(ctx: QueryCtx | MutationCtx)
```

### Phase 3: Protected Routes

#### 3.1 Create ProtectedRoute Component (`frontend/src/components/auth/ProtectedRoute.tsx`)

- Wrapper component that checks `isAuthenticated` from `useAuth`
- Redirects to `/login` if not authenticated
- Shows loading state during auth check
- Preserves intended destination for redirect after login

#### 3.2 Update App Routes (`frontend/src/App.tsx`)

- Wrap all routes inside `<DashboardLayout>` with `<ProtectedRoute>`
- Keep `/login` and `/signup` as public routes
- Add redirect logic: if authenticated user visits `/login`, redirect to `/library`

### Phase 4: Mutation Authorization

#### 4.1 Update Media Mutations (`frontend/convex/mutations/media.ts`)

- **`create` mutation:**
  - Require authentication using `requireAuth(ctx)`
  - Get current user ID using `authComponent.getAuthUser(ctx)`
  - Add `uploadedBy` field to media record
  - Return error if user not authenticated

- **`update` mutation:**
  - Require authentication
  - Check ownership: user can only edit their own media OR be admin
  - Return error if unauthorized

- **`deleteMedia` mutation:**
  - Require authentication
  - Check ownership: user can only delete their own media OR be admin
  - Return error if unauthorized

#### 4.2 Update Media Type Mutations (`frontend/convex/mutations/mediaTypes.ts`)

- Add admin-only checks for create/update/delete operations
- Regular users shouldn't be able to modify media types (or make it optional based on requirements)

### Phase 5: Query Updates

#### 5.1 Update Media Queries (`frontend/convex/queries/media.ts`)

- Add `getByUserId` query: Get media uploaded by specific user
- Add `getMyUploads` query: Get current user's uploaded media
- Update `list` query to optionally filter by `uploadedBy`
- Add authorization context to queries (for admin to see all, users see their own)

#### 5.2 Create User Queries (`frontend/convex/queries/users.ts`)

- `getCurrentUser`: Get authenticated user's full profile (including role)
- `getUserById`: Admin-only query to get any user
- `listUsers`: Admin-only query to list all users

### Phase 6: Role Management

#### 6.1 Create User Mutations (`frontend/convex/mutations/users.ts`)

- `updateRole`: Admin-only mutation to change user roles
- `updateProfile`: User can update their own profile (name, avatar, etc.)
- Add role validation and error handling

#### 6.2 Admin Role Assignment

- Create migration or admin utility to assign admin role to first user
- Or create admin panel UI for role management (future phase)

### Phase 7: UI Updates

#### 7.1 Update Sidebar (`frontend/src/components/layout/Sidebar.tsx`)

- Show user role badge (if admin)
- Add "My Uploads" link (filtered view)
- Conditionally show admin links based on role

#### 7.2 Update Media Components

- **MediaList** (`frontend/src/components/layout/MediaList.tsx`):
  - Add filter toggle: "All Media" vs "My Uploads"
  - Show uploader name on media cards

- **MediaDetail** (`frontend/src/pages/MediaDetail.tsx`):
  - Show uploader information
  - Show edit/delete buttons only if user has permission
  - Disable actions user can't perform

- **MediaUpload** (`frontend/src/components/media/MediaUpload.tsx`):
  - Ensure `uploadedBy` is set when creating media
  - Show success message with user context

#### 7.3 Create Admin Components (Optional)

- Admin dashboard for user management
- Role assignment UI
- System statistics

### Phase 8: Testing & Validation

#### 8.1 Test Cases

- ✅ Unauthenticated user cannot access protected routes
- ✅ Unauthenticated user cannot create/update/delete media
- ✅ User can only edit their own media
- ✅ Admin can edit any media
- ✅ User can see their own uploads
- ✅ Admin can see all uploads
- ✅ Role checks work in both UI and mutations

## Files to Create

- `frontend/src/lib/rbac.ts` - Client-side RBAC utilities
- `frontend/src/components/auth/ProtectedRoute.tsx` - Route protection component
- `frontend/convex/lib/auth.ts` - Server-side auth helpers
- `frontend/convex/queries/users.ts` - User queries
- `frontend/convex/mutations/users.ts` - User management mutations

## Files to Modify

- `frontend/convex/schema.ts` - Add `uploadedBy` to media table, add index
- `frontend/convex/mutations/media.ts` - Add auth checks and `uploadedBy` tracking
- `frontend/convex/mutations/mediaTypes.ts` - Add admin-only checks (optional)
- `frontend/convex/queries/media.ts` - Add user-specific queries
- `frontend/src/App.tsx` - Add ProtectedRoute wrappers
- `frontend/src/components/layout/Sidebar.tsx` - Add role-based UI
- `frontend/src/components/layout/MediaList.tsx` - Add "My Uploads" filter
- `frontend/src/pages/MediaDetail.tsx` - Add ownership checks and UI
- `frontend/src/hooks/useMediaUpload.ts` - Ensure `uploadedBy` is passed

## Security Considerations

1. **Never trust client-side checks** - All authorization must happen server-side
2. **Default deny** - If auth check fails, deny access
3. **Role validation** - Verify roles exist and are valid
4. **Ownership verification** - Always check `uploadedBy` matches current user (unless admin)
5. **Error messages** - Don't reveal sensitive info in error messages

## Migration Notes

- Existing media: Set `uploadedBy` to first admin user or system user
- Mock data: Mark with system user ID
- First user: Manually assign admin role via Convex dashboard or migration

## Next Steps After This

Once roles and authorization are complete, we can add:

- Two-Factor Authentication (2FA)
- Forgot Password / Password Reset
- Email verification
- User invitations
- Advanced admin features