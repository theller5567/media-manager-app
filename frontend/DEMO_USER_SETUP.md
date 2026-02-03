# DemoUser Role Setup Guide

## Overview

The DemoUser role allows users to experience all functionality of the application without making any changes to the database. Mutations (create, update, delete) will return fake success responses, while queries continue to work normally, showing real data.

Users can access the demo mode in two ways:
1. **"Try Demo" Link**: Click the "To Demo app click here" button on the signin page to automatically sign in as a demo user
2. **Manual Login**: Sign in with an account that has the DemoUser role assigned

## How It Works

- **Mutations**: Return fake IDs and success responses without saving to database
- **Queries**: Work normally, showing real data from the database
- **UI**: Appears to work normally - users can upload media, create media types, etc.
- **Visual Indicator**: Yellow banner at top of application shows "Demo Mode: Changes will not be saved"

## Setting Up DemoUser Role

### Method 1: Environment Variable (Recommended)

Set `DEMO_USER_EMAIL` in Convex Dashboard environment variables:

1. Go to [Convex Dashboard](https://dashboard.convex.dev)
2. Select your deployment (Development or Production)
3. Navigate to **Settings** → **Environment Variables**
4. Add new variable:
   - **Name**: `DEMO_USER_EMAIL`
   - **Value**: The email address of the user who should have DemoUser role
   - Example: `demo@example.com`
5. Save the changes

**Note**: You need to set this separately for Development and Production deployments.

### Method 2: User Role Field

Alternatively, you can set the role directly on the user object:

```typescript
// In your user management code or migration
user.role = "demoUser"
```

This method requires direct database access or a custom user management interface.

## Setting Up "Try Demo" Feature

The "Try Demo" feature allows users to access the app as a demo user without manually entering credentials. This requires:

### 1. Create Demo User Account

First, create a demo user account in your application:

1. Go to the signup page (`/signup`)
2. Create an account with:
   - **Email**: Must match `DEMO_USER_EMAIL` in Convex Dashboard (e.g., `demo@example.com`)
   - **Password**: Choose a password (e.g., `demo123`)
   - **Name**: Can be anything (e.g., "Demo User")

**Important**: The email must exactly match the `DEMO_USER_EMAIL` environment variable set in Convex Dashboard.

### 2. Configure Frontend Environment Variables

Add demo credentials to your frontend environment variables:

**For local development** (`frontend/.env.local`):
```env
VITE_DEMO_USER_EMAIL=demo@example.com
VITE_DEMO_USER_PASSWORD=demo123
```

**For production** (Vercel Dashboard → Settings → Environment Variables):
- Add `VITE_DEMO_USER_EMAIL` with the demo user email
- Add `VITE_DEMO_USER_PASSWORD` with the demo user password

**Security Note**: These credentials are exposed in the frontend bundle. This is acceptable for demo purposes, but use a simple password that's not used elsewhere.

### 3. Verify Configuration

1. Ensure `DEMO_USER_EMAIL` in Convex Dashboard matches `VITE_DEMO_USER_EMAIL` in frontend env vars
2. Ensure the demo user account exists and can be logged into
3. Test the "Try Demo" button on the signin page

### How "Try Demo" Works

1. User clicks "To Demo app click here" button on signin page
2. Frontend reads `VITE_DEMO_USER_EMAIL` and `VITE_DEMO_USER_PASSWORD` from environment variables
3. Automatically calls `signIn(demoEmail, demoPassword)` via BetterAuth
4. On success, user is redirected to `/library` with demo user session
5. Demo banner appears at top of application
6. All mutations return fake responses (no persistence)

## Behavior

### What DemoUser Can Do

- ✅ View all media, media types, and tags (queries work normally)
- ✅ Use upload media functionality (appears to work)
- ✅ Create new media types (appears to work)
- ✅ Create and manage tags (appears to work)
- ✅ Update media metadata (appears to work)
- ✅ Delete media (appears to work)
- ✅ Update profile preferences (appears to work)

### What Actually Happens

- ❌ **No data is saved** - All mutations return fake responses
- ❌ **No database changes** - Nothing persists
- ✅ **Queries still work** - DemoUser sees real data from other users
- ✅ **UI appears normal** - Success messages, fake IDs returned

### Example Flow

1. DemoUser uploads a media file
2. Mutation returns fake media object with fake ID
3. UI shows success message and displays the "uploaded" media
4. On page refresh, the media disappears (was never saved)
5. DemoUser can still see real media uploaded by other users

## Technical Details

### Role Detection

The system checks for DemoUser in two ways:
1. `user.email === process.env.DEMO_USER_EMAIL`
2. `(user as any).role === "demoUser"`

If either condition is true, the user is treated as DemoUser.

### Fake ID Generation

Fake IDs are generated using a pattern that:
- Matches Convex ID format
- Starts with `demo` prefix
- Includes timestamp and random characters
- Won't conflict with real IDs

Example fake ID: `demo1234567890abcdef`

### Mutation Pattern

All mutations follow this pattern:

```typescript
handler: async (ctx, args) => {
  const user = await requireAuth(ctx);
  
  // Check if user is DemoUser
  if (await isDemoUser(ctx)) {
    // Return fake success response
    return generateFakeResponse(args);
  }
  
  // Normal mutation logic
  // ... actual database operations
}
```

## Testing DemoUser

### Testing via "Try Demo" Button

1. **Set up demo account and credentials**:
   - Create demo user account via signup page
   - Set `DEMO_USER_EMAIL` in Convex Dashboard to match demo email
   - Set `VITE_DEMO_USER_EMAIL` and `VITE_DEMO_USER_PASSWORD` in frontend env vars

2. **Test "Try Demo" feature**:
   - Go to signin page (`/login`)
   - Click "To Demo app click here" button
   - Should automatically sign in and redirect to library
   - Yellow demo banner should appear at top

3. **Test functionality**:
   - Upload a media file
   - Create a media type
   - Create a tag
   - Update media metadata
   - All should appear to work

4. **Verify no persistence**:
   - Refresh the page
   - Your changes should disappear
   - Real data from other users should still be visible

### Testing via Manual Login

1. **Set up DemoUser**:
   - Add `DEMO_USER_EMAIL` to Convex Dashboard
   - Set it to your test email address

2. **Sign up/Login**:
   - Create account with that email (or login if exists)
   - You should see the yellow demo banner at top

3. **Test functionality**:
   - Upload a media file
   - Create a media type
   - Create a tag
   - Update media metadata
   - All should appear to work

4. **Verify no persistence**:
   - Refresh the page
   - Your changes should disappear
   - Real data from other users should still be visible

## Removing DemoUser Role

To remove DemoUser role:

1. **Method 1**: Remove `DEMO_USER_EMAIL` from Convex Dashboard environment variables
2. **Method 2**: Change user's role field to something else (e.g., `"user"`)

After removing, the user will need to log out and log back in for changes to take effect.

## Use Cases

- **Product demos**: Show full functionality without risk of data pollution
- **Training**: Allow users to practice without affecting production data
- **Testing**: Test UI flows without creating test data
- **Sales**: Demonstrate features to potential customers

## Limitations

- DemoUser changes are not visible to other users (they're not saved)
- DemoUser cannot see their own "created" items after refresh
- Fake IDs won't work for navigation (e.g., `/media/{fakeId}` won't load)
- Optimistic UI updates may show data temporarily, but it disappears on refresh

## Security Considerations

- DemoUser role does NOT grant admin access
- DemoUser cannot bypass authentication
- DemoUser cannot modify other users' data (mutations are blocked entirely)
- DemoUser cannot change roles (explicitly prevented)

## Troubleshooting

### Banner Not Showing

- Check that `DEMO_USER_EMAIL` is set correctly in Convex Dashboard
- Verify the email matches exactly (case-sensitive)
- Ensure user is logged in
- Check browser console for errors

### Changes Still Persisting

- Verify `isDemoUser()` is being called in mutations
- Check that environment variable is set in correct deployment
- Ensure user logged out and back in after role assignment

### Fake IDs Causing Errors

- Fake IDs are for UI display only
- Navigation to fake IDs will fail (expected behavior)
- Frontend should handle missing data gracefully
