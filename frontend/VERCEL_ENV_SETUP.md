# Fix CORS Error: Vercel Environment Variables Setup

## Problem
Your production app is trying to use the dev Convex deployment (`usable-avocet-679`) instead of production (`ardent-hawk-798`), causing CORS errors.

## Solution: Set Environment Variables in Vercel

### Step 1: Go to Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (media-manager-app)
3. Navigate to **Settings** → **Environment Variables**

### Step 2: Add Production Convex URLs

Add these **required** variables:

```
VITE_CONVEX_URL=https://ardent-hawk-798.convex.cloud
VITE_CONVEX_SITE_URL=https://ardent-hawk-798.convex.site
```

**Important:** 
- Copy these EXACTLY (no spaces, no quotes)
- For each variable, select environments: **Production**, **Preview**, and optionally **Development**
- Click **Save** after adding each variable

### Step 3: Add Cloudinary Credentials

Add these variables (use your actual values):

```
VITE_CLOUDINARY_CLOUD_NAME=media-manager
VITE_CLOUDINARY_API_KEY=333869248735817
VITE_CLOUDINARY_UPLOAD_PRESET=ml_default
```

### Step 4: Add Gemini API Key (if using AI features)

```
VITE_GEMINI_API_KEY=AIzaSyC7FXM6PsXE925cS_bDyvGbC510AhLBq7c
```

### Step 5: Redeploy Vercel

**CRITICAL:** After adding environment variables, you MUST redeploy:

**Option A: Via Dashboard**
1. Go to **Deployments** tab
2. Find your latest deployment
3. Click the **"..."** menu → **Redeploy**
4. Make sure "Use existing Build Cache" is **unchecked** (to pick up new env vars)

**Option B: Via Git**
```bash
# Make a small change and push
git commit --allow-empty -m "chore: trigger redeploy with new env vars"
git push origin main
```

---

## Step 6: Set SITE_URL in Convex Dashboard

After you know your Vercel URL:

1. Go to [Convex Dashboard](https://dashboard.convex.dev)
2. Select your project
3. Navigate to **Settings** → **Environment Variables**
4. Find or add `SITE_URL`
5. Set it to your Vercel URL (e.g., `https://your-app.vercel.app`)
   - **Important:** Use your actual Vercel deployment URL
   - You can find it in Vercel Dashboard → Deployments → Click on a deployment → Copy the URL
6. Click **Save**

**Note:** Convex changes take effect immediately (no redeploy needed), but may take a few seconds to propagate.

---

## Verify It's Working

After redeploying Vercel:

1. Go to your Vercel deployment URL
2. Open browser DevTools → Console
3. Check that there are no CORS errors
4. Try logging in

**If you still see errors:**
- Check that `VITE_CONVEX_SITE_URL` in Vercel matches `ardent-hawk-798` (not `usable-avocet-679`)
- Verify `SITE_URL` in Convex Dashboard matches your Vercel URL exactly
- Wait a few seconds for Convex changes to propagate
- Hard refresh your browser (Cmd+Shift+R or Ctrl+Shift+R)

---

## Quick Checklist

- [ ] `VITE_CONVEX_URL` set in Vercel = `https://ardent-hawk-798.convex.cloud`
- [ ] `VITE_CONVEX_SITE_URL` set in Vercel = `https://ardent-hawk-798.convex.site`
- [ ] Cloudinary variables set in Vercel
- [ ] Variables enabled for **Production** environment
- [ ] Vercel deployment **redeployed** after adding variables
- [ ] `SITE_URL` set in Convex Dashboard = your Vercel URL
- [ ] Tested login on production URL

---

## Still Having Issues?

See the full troubleshooting guide: [ENV_SETUP.md](./ENV_SETUP.md#troubleshooting)
