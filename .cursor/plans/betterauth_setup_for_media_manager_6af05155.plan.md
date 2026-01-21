---
name: BetterAuth Login & Logout Setup
overview: Set up basic BetterAuth authentication with Convex integration - focus on login and logout functionality only. No RBAC, media integration, or user management yet.
todos: []
---

# BetterAuth Login & Logout Setup Plan

## Overview

Set up basic BetterAuth authentication system integrated with Convex. This phase focuses ONLY on getting login and logout working. We'll add user management, RBAC, and media integration in later phases.

## Architecture Flow

```
User Login → BetterAuth Client → Convex Auth Functions → Database
                ↓
         Session Management
                ↓
         Logout → Clear Session
```

## Implementation Steps

### Phase 1: Package Installation & Configuration

**1.1 Install Required Packages**

- Install `@convex-dev/better-auth` and `better-auth@1.4.9` (pinned version)
- Verify Convex version is >= 1.25.0 (currently 1.31.4 ✓)

**1.2 Create Convex Configuration**

- Create `frontend/convex/convex.config.ts` to register BetterAuth component
- Import `betterAuth` from `@convex-dev/better-auth/convex.config`
- Use `app.use(betterAuth)` to register

**1.3 Create Auth Config Provider**

- Create `frontend/convex/auth.config.ts`
- Use `getAuthConfigProvider()` from `@convex-dev/better-auth/auth-config`
- Export as default AuthConfig

**1.4 Set Environment Variables**

- Generate `BETTER_AUTH_SECRET` using `openssl rand -base64 32`
- Set `SITE_URL` (e.g., `http://localhost:5173` for Vite dev server)
- Add to Convex deployment: `npx convex env set BETTER_AUTH_SECRET=...` and `npx convex env set SITE_URL=...`
- Ensure `VITE_CONVEX_URL` is already set in `.env.local`

### Phase 2: Server-Side Auth Setup

**2.1 Create Auth Instance (`frontend/convex/auth.ts`)**

- Import `createClient` from `@convex-dev/better-auth`
- Import `convex` and `crossDomain` plugins (required for Vite SPA)
- Configure BetterAuth with:
  - `emailAndPassword` provider enabled
  - `crossDomain` plugin with `siteUrl` from env
  - `convex` plugin for Convex integration
  - Basic configuration only (no custom fields yet)
- Export `authComponent` and `createAuth` function

**2.2 Schema Updates (`frontend/convex/schema.ts`)**

- BetterAuth will auto-generate auth tables (`user`, `session`, `account`, `verification`)
- No schema changes needed for basic login/logout
- Keep existing `media` table unchanged

### Phase 3: Client-Side Auth Setup

**3.1 Create Auth Client (`frontend/src/lib/auth.ts`)**

- Import `createAuthClient` from `better-auth/react`
- Configure with `baseURL` pointing to Convex auth endpoint
- Export `authClient` instance

**3.2 Create Auth Hook (`frontend/src/hooks/useAuth.ts`)**

- Use `authClient.useSession()` to get current session
- Use `authClient.useUser()` to get current user
- Export `signIn`, `signOut` functions
- Return `{ currentUser, isLoading, isAuthenticated, signIn, signOut }`

### Phase 4: Login & Logout Pages

**4.1 Create Login Page (`frontend/src/pages/Login.tsx`)**

- Form with email and password fields
- Use `authClient.signIn.email()` on submit
- Handle errors and loading states
- Redirect to `/library` on success
- Show error messages if login fails

**4.2 Update App Routes (`frontend/src/App.tsx`)**

- Add `/login` route (public)
- Keep existing routes accessible (no protection yet)

**4.3 Add Logout to Sidebar (`frontend/src/components/layout/Sidebar.tsx`)**

- Add logout button that calls `signOut()` from `useAuth` hook
- Show user email/name if authenticated (basic display)
- Show "Sign In" link if not authenticated

### Phase 5: Testing & Verification

**5.1 Test Login Flow**

- Create test user via signup (if signup page exists) or manually
- Sign in with email/password
- Verify session persists on page refresh
- Check that user info is accessible

**5.2 Test Logout Flow**

- Click logout button
- Verify session is cleared
- Verify redirect to login or home page
- Verify user cannot access protected data after logout

## Key Files to Create/Modify

**New Files:**

- `frontend/convex/convex.config.ts`
- `frontend/convex/auth.config.ts`
- `frontend/convex/auth.ts` (replace existing)
- `frontend/src/lib/auth.ts`
- `frontend/src/pages/Login.tsx`
- `frontend/src/hooks/useAuth.ts`

**Modified Files:**

- `frontend/package.json` (add dependencies)
- `frontend/src/App.tsx` (add login route)
- `frontend/src/components/layout/Sidebar.tsx` (add logout button, basic user display)

## Important Notes

1. **Vite SPA Requirement**: Must use `crossDomain` plugin for Vite SPAs
2. **Session Management**: BetterAuth handles sessions automatically via cookies
3. **Environment Variables**: Must set `BETTER_AUTH_SECRET` and `SITE_URL` in Convex deployment
4. **Client Actions**: All auth actions (signIn, signOut) happen client-side
5. **Schema Migration**: BetterAuth will auto-generate auth tables on first run
6. **No Custom Fields Yet**: Keep it simple - no role, preferences, or custom user fields in this phase

## Success Criteria

- Users can sign in with email/password
- Users can sign out and session is cleared
- Session persists across page refreshes
- User info is accessible when authenticated
- Login page displays and handles errors correctly
- Logout button works in sidebar

## Out of Scope (For Later Phases)

- Signup page (can be added after login works)
- Protected routes (add after login/logout verified)
- User profile management
- Role-based access control
- Media integration with auth
- Favorites functionality
- Custom user fields (role, preferences, etc.)