# Repository Separation Guide

## Overview

This guide walks you through separating the `marketing-site` from the `media-manager-app` monorepo into its own standalone repository.

## Why Separate?

- ✅ **Clear separation**: Marketing site and frontend app serve different purposes
- ✅ **Independent deployments**: Separate Vercel projects, different release cycles
- ✅ **Simpler maintenance**: No confusion about what code belongs where
- ✅ **Better organization**: Easier to onboard new team members
- ✅ **No shared dependencies**: Marketing site is completely independent

## Pre-Migration Checklist

- [x] Marketing site builds successfully (`pnpm build`)
- [x] All marketing-site files are committed
- [x] `pnpm-workspace.yaml` updated (marketing-site removed)
- [x] Marketing site README updated for standalone repo
- [x] Migration script created

## Step-by-Step Migration

### Step 1: Create New GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository:
   - **Name**: `media-manager-marketing-site` (or your preferred name)
   - **Description**: "Marketing website for Media Manager App"
   - **Visibility**: Private or Public (your choice)
   - **Important**: Do NOT initialize with README, .gitignore, or license

### Step 2: Run Migration Script

The easiest way is to use the provided migration script:

```bash
cd marketing-site
./migrate-to-new-repo.sh git@github.com:yourusername/media-manager-marketing-site.git
```

**Or manually:**

```bash
# Navigate to parent directory
cd /Users/travisheller/Sites/localhost

# Clone the new empty repo
git clone git@github.com:yourusername/media-manager-marketing-site.git
cd media-manager-marketing-site

# Copy marketing-site files
cp -r ../media-manager-app/marketing-site/* .
cp -r ../media-manager-app/marketing-site/.* . 2>/dev/null || true

# Remove pnpm-workspace.yaml (not needed for standalone)
rm pnpm-workspace.yaml

# Initialize and push
git add .
git commit -m "Initial commit: Marketing site migrated from monorepo"
git push -u origin main
```

### Step 3: Update Original Repository

After migrating, update the original repo:

```bash
cd /Users/travisheller/Sites/localhost/media-manager-app

# Remove marketing-site directory
rm -rf marketing-site

# Commit the removal
git add .
git commit -m "chore: remove marketing-site (migrated to separate repository)"
git push origin main
```

**Note**: The `.gitignore` has already been updated to ignore `marketing-site/`, so it won't be accidentally re-added.

### Step 4: Set Up Vercel for New Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import the new `media-manager-marketing-site` repository
4. Configure settings:
   - **Root Directory**: `/` (root, since it's now standalone)
   - **Framework**: Next.js (auto-detected)
   - **Build Command**: `pnpm build`
   - **Output Directory**: `.next`
   - **Install Command**: `pnpm install`
5. Set environment variables:
   - `NEXT_PUBLIC_APP_URL` = Your Vercel URL (update after first deploy)
   - Optional: `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID`
   - Optional: `SENDGRID_API_KEY`
6. Click **"Deploy"**

### Step 5: Verify Deployment

After deployment:
- [ ] Site loads at Vercel URL
- [ ] All pages work (`/`, `/pricing`, `/features`, `/demo`)
- [ ] Forms submit (check Vercel function logs)
- [ ] No console errors
- [ ] Mobile responsive

### Step 6: Clean Up (Optional)

If you had a Vercel project for marketing-site in the monorepo:
1. Archive or delete the old Vercel project
2. Update any documentation that references the old setup

## Files Changed

### In Original Repository (`media-manager-app`):
- ✅ `pnpm-workspace.yaml` - Removed `marketing-site` entry
- ✅ `.gitignore` - Added `marketing-site/` to ignore list
- ⏳ `marketing-site/` directory - Will be removed after migration

### In New Repository (`media-manager-marketing-site`):
- ✅ All marketing-site files copied
- ✅ `pnpm-workspace.yaml` removed (not needed)
- ✅ README updated for standalone repo
- ✅ `.gitignore` already configured

## Post-Migration Checklist

- [ ] New repository created on GitHub
- [ ] Marketing site code pushed to new repo
- [ ] Original repo updated (marketing-site removed)
- [ ] Vercel project created for new repo
- [ ] Environment variables set in new Vercel project
- [ ] Site deploys successfully
- [ ] All pages work correctly
- [ ] Forms submit successfully
- [ ] Old Vercel project archived/removed (if applicable)

## Troubleshooting

### Migration Script Fails

**Issue**: Script can't clone repository
- **Solution**: Make sure the repository exists and you have access
- Verify the repository URL is correct
- Check your SSH keys are set up: `ssh -T git@github.com`

### Build Fails in New Repo

**Issue**: `pnpm install` or `pnpm build` fails
- **Solution**: Make sure all files were copied correctly
- Check that `package.json` is present
- Try `rm -rf node_modules pnpm-lock.yaml && pnpm install`

### Vercel Deployment Fails

**Issue**: Build errors in Vercel
- **Solution**: Verify Root Directory is set to `/` (root)
- Check that Build Command is `pnpm build`
- Ensure environment variables are set

## Benefits Achieved

✅ **Separation of Concerns**: Marketing and app code are separate
✅ **Independent Versioning**: Different release cycles
✅ **Simpler CI/CD**: Dedicated pipelines for each project
✅ **Easier Onboarding**: Clear project boundaries
✅ **Better Organization**: No confusion about ownership

## Support

If you encounter issues during migration:
1. Check `marketing-site/MIGRATION_TO_SEPARATE_REPO.md` for detailed steps
2. Review Vercel deployment logs
3. Verify all files were copied correctly
4. Check that environment variables are set

## Next Steps

After successful migration:
1. Update any documentation that references the monorepo structure
2. Update team members about the new repository
3. Set up branch protection rules if needed
4. Configure any CI/CD pipelines for the new repo
