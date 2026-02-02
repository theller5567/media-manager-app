# Fix CORS 500 Error: SITE_URL Configuration

## Problem
You're getting CORS errors with a 500 status code, even though Vercel is using the correct production Convex URL (`ardent-hawk-798`).

## Root Cause
The `SITE_URL` environment variable in Convex Dashboard is either:
- Not set
- Set to localhost instead of your Vercel URL
- Doesn't match your Vercel URL exactly (typos, trailing slashes, etc.)

---

## Step-by-Step Fix

### Step 1: Find Your Exact Vercel URL

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project
3. Go to **Deployments** tab
4. Click on your latest production deployment
5. **Copy the exact URL** shown at the top (e.g., `https://media-manager-app.vercel.app` or `https://media-manager-app-git-main-yourname.vercel.app`)

**Important:** Copy the EXACT URL - it might have a branch name or custom domain.

---

### Step 2: Set SITE_URL in Convex Dashboard

1. Go to [Convex Dashboard](https://dashboard.convex.dev)
2. **Select your production deployment** (`ardent-hawk-798`) - make sure you're in the right deployment!
3. Navigate to **Settings** → **Environment Variables**
4. Look for `SITE_URL`:
   - **If it exists:** Click Edit and update it
   - **If it doesn't exist:** Click "Add Variable"
5. Set the value to your **exact Vercel URL** (from Step 1)
   - Example: `https://media-manager-app.vercel.app`
   - **No trailing slash** (`/`)
   - **No spaces**
   - **Must start with `https://`**
6. Click **Save**

---

### Step 3: Verify It's Set Correctly

**Check the value:**
- In Convex Dashboard → Settings → Environment Variables
- Make sure `SITE_URL` shows your Vercel URL (not localhost)
- Make sure there are no extra spaces or characters

**Wait a few seconds:**
- Convex changes take effect immediately but may take 5-10 seconds to propagate

---

### Step 4: Test Again

1. Go to your Vercel deployment URL
2. Open browser DevTools → Console
3. Try logging in
4. Check for errors

**If you still see CORS errors:**
- Hard refresh your browser (Cmd+Shift+R or Ctrl+Shift+R)
- Clear browser cache
- Try in an incognito/private window
- Wait 30 seconds and try again (Convex propagation delay)

---

## Common Mistakes

### ❌ Wrong: Using localhost
```
SITE_URL=http://localhost:5173
```
This only works for local dev, not production!

### ✅ Correct: Using Vercel URL
```
SITE_URL=https://media-manager-app.vercel.app
```

### ❌ Wrong: Trailing slash
```
SITE_URL=https://media-manager-app.vercel.app/
```

### ✅ Correct: No trailing slash
```
SITE_URL=https://media-manager-app.vercel.app
```

### ❌ Wrong: Wrong deployment
- Setting `SITE_URL` in the **dev deployment** (`usable-avocet-679`) instead of **production** (`ardent-hawk-798`)

### ✅ Correct: Right deployment
- Make sure you're setting it in the **production deployment** (`ardent-hawk-798`)

---

## How to Check Which Deployment You're In

In Convex Dashboard:
1. Look at the top-left corner
2. You should see the deployment name (e.g., "ardent-hawk-798")
3. If it says "usable-avocet-679", you're in the wrong deployment!
4. Click the deployment selector and switch to production

---

## Alternative: Support Multiple Origins

If you want to support both localhost AND Vercel (for testing), you can use the `ADDITIONAL_ORIGINS` environment variable:

1. In Convex Dashboard → Settings → Environment Variables
2. Set `SITE_URL` to your Vercel URL (primary)
3. Add `ADDITIONAL_ORIGINS` = `http://localhost:5173,http://localhost:3000`
4. This allows both local dev and production to work

---

## Still Not Working?

### Check Convex Logs

1. Go to Convex Dashboard → Logs
2. Look for errors around the time you tried to login
3. The 500 error might give you more details about what's failing

### Verify Auth Configuration

Make sure your `frontend/convex/auth.ts` is correctly reading `SITE_URL`:
- It should use `process.env.SITE_URL`
- Fallback to `http://localhost:5173` if not set

### Check Vercel Build Logs

1. Go to Vercel Dashboard → Deployments
2. Click on your latest deployment
3. Check the build logs for any errors
4. Verify environment variables are being injected correctly

---

## Quick Checklist

- [ ] Found exact Vercel URL from Deployments tab
- [ ] Opened Convex Dashboard → Production deployment (`ardent-hawk-798`)
- [ ] Set `SITE_URL` = exact Vercel URL (no trailing slash, no spaces)
- [ ] Saved the environment variable
- [ ] Waited 10-30 seconds for propagation
- [ ] Hard refreshed browser
- [ ] Tested login again

---

## Need More Help?

See the full environment setup guide: [ENV_SETUP.md](./ENV_SETUP.md)
