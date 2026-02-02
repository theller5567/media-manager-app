---
name: Environment Variables Setup for Dev and Production
overview: Set up environment variable management for both local development and Vercel production deployments, ensuring seamless switching between environments without manual configuration changes.
todos:
  - id: create-env-example
    content: Create frontend/.env.example template file with all required variables and comments
    status: completed
  - id: create-env-setup-docs
    content: Create frontend/ENV_SETUP.md with step-by-step setup instructions for dev and production
    status: completed
  - id: update-project-md
    content: Update PROJECT.md environment variables section with clear dev/prod separation and setup instructions
    status: in_progress
  - id: verify-auth-config
    content: Verify frontend/convex/auth.ts CORS configuration supports both localhost and Vercel URLs
    status: pending
isProject: false
---

# Environment Variables Setup for Dev and Production

## Current Situation

- **Local Development**: Uses `.env.local` with `dev:usable-avocet-679` Convex deployment
- **Production (Vercel)**: Needs separate environment variables pointing to production URLs
- **Problem**: Manual switching between dev and production configurations causes errors

## Solution Overview

Create a comprehensive environment variable management system that:

1. Keeps local dev configuration in `.env.local` (git-ignored)
2. Sets production variables in Vercel Dashboard
3. Sets backend variables in Convex Dashboard
4. Provides clear documentation and templates

## Implementation Steps

### 1. Create Environment Variable Template Files

**Create `frontend/.env.example`** - Template for local development:

```bash
# Convex Configuration (Dev)
CONVEX_DEPLOYMENT=dev:your-deployment-name
VITE_CONVEX_URL=https://your-deployment.convex.cloud
VITE_CONVEX_SITE_URL=https://your-deployment.convex.site

# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_API_KEY=your_api_key
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset_name

# AI Services (if used)
VITE_GEMINI_API_KEY=your_gemini_key
```

**Create `frontend/.env.production.example`** - Template for production:

```bash
# Convex Configuration (Production)
# Note: These should be set in Vercel Dashboard, not in this file
VITE_CONVEX_URL=https://your-production-deployment.convex.cloud
VITE_CONVEX_SITE_URL=https://your-production-deployment.convex.site

# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_API_KEY=your_api_key
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset_name

# AI Services
VITE_GEMINI_API_KEY=your_gemini_key
```

### 2. Update Convex Auth Configuration

**File: `frontend/convex/auth.ts`**

- Already supports multiple origins via `trustedOrigins` array
- Needs `SITE_URL` environment variable set in Convex Dashboard
- Current implementation allows localhost + configured SITE_URL

**Action**: Ensure `SITE_URL` is documented and can accept Vercel URL

### 3. Create Environment Setup Documentation

**Create `frontend/ENV_SETUP.md`** with:

- Step-by-step instructions for local development setup
- Step-by-step instructions for Vercel production setup
- Step-by-step instructions for Convex Dashboard setup
- Troubleshooting guide
- Quick reference table of all required variables

### 4. Update PROJECT.md

**Update `PROJECT.md`** Environment Variables section:

- Add clear separation between dev and production
- Document where each variable should be set (Vercel vs Convex)
- Add links to setup guides
- Include Vercel deployment URL configuration

### 5. Optional: Create Production Convex Deployment

**Recommendation**: Create a separate production Convex deployment:

- Keeps dev and production data separate
- Allows testing production deployments safely
- Better security isolation

**Steps**:

1. Run `npx convex deploy --prod` to create production deployment
2. Get production deployment URL from Convex Dashboard
3. Use production URL in Vercel environment variables

## Files to Create/Modify

1. **`frontend/.env.example`** - Template for local development
2. **`frontend/ENV_SETUP.md`** - Comprehensive setup guide
3. **`PROJECT.md`** - Update environment variables section
4. **`frontend/convex/auth.ts`** - Verify/update CORS configuration if needed

## Environment Variables Summary

### Frontend (Vite) - Set in Vercel Dashboard for Production

**Required:**

- `VITE_CONVEX_URL` - Convex deployment URL (dev vs prod)
- `VITE_CONVEX_SITE_URL` - Convex site URL for Better Auth (dev vs prod)
- `VITE_CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `VITE_CLOUDINARY_API_KEY` - Cloudinary API key
- `VITE_CLOUDINARY_UPLOAD_PRESET` - Upload preset name

**Optional:**

- `VITE_GEMINI_API_KEY` - For AI features

### Convex Backend - Set in Convex Dashboard

**Required:**

- `SITE_URL` - Frontend URL (localhost for dev, Vercel URL for prod)

**Optional:**

- `GEMINI_API_KEY` - For AI features (server-side only)

## Key Configuration Points

1. **Local Development**: Uses `.env.local` (git-ignored) with dev Convex URLs
2. **Vercel Production**: Uses environment variables set in Vercel Dashboard with production Convex URLs
3. **Convex Backend**: Uses `SITE_URL` from Convex Dashboard environment variables for CORS
4. **No Code Changes**: Environment variables are read automatically - no switching needed

## Testing Checklist

- [ ] Local dev works with `.env.local`
- [ ] Vercel build succeeds with production env vars
- [ ] Login works on Vercel deployment
- [ ] CORS errors resolved
- [ ] Both environments work independently