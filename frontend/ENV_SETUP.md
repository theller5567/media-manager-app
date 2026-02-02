# Environment Variables Setup Guide

This guide explains how to configure environment variables for both local development and production (Vercel) deployments.

## Quick Reference

| Variable | Where to Set | Dev Value | Production Value |
|----------|-------------|-----------|-----------------|
| `VITE_CONVEX_URL` | `.env.local` (dev) / Vercel (prod) | `https://dev-xxx.convex.cloud` | `https://prod-xxx.convex.cloud` |
| `VITE_CONVEX_SITE_URL` | `.env.local` (dev) / Vercel (prod) | `https://dev-xxx.convex.site` | `https://prod-xxx.convex.site` |
| `VITE_CLOUDINARY_CLOUD_NAME` | `.env.local` (dev) / Vercel (prod) | Your cloud name | Same or separate |
| `VITE_CLOUDINARY_API_KEY` | `.env.local` (dev) / Vercel (prod) | Your API key | Same or separate |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | `.env.local` (dev) / Vercel (prod) | Your preset | Same or separate |
| `VITE_GEMINI_API_KEY` | `.env.local` (dev) / Vercel (prod) | Your API key | Same or separate |
| `SITE_URL` | Convex Dashboard | `http://localhost:5173` | `https://your-app.vercel.app` |
| `GEMINI_API_KEY` | Convex Dashboard | Your API key | Same or separate |

---

## Local Development Setup

### Step 1: Copy Environment Template

```bash
cd frontend
cp .env.example .env.local
```

### Step 2: Get Convex Development URLs

When you run `npx convex dev`, Convex automatically generates:
- `CONVEX_DEPLOYMENT` - Your dev deployment name
- `VITE_CONVEX_URL` - Your Convex deployment URL
- `VITE_CONVEX_SITE_URL` - Your Convex site URL (for Better Auth)

These are automatically added to `.env.local` by Convex CLI.

### Step 3: Add Cloudinary Credentials

1. Go to [Cloudinary Dashboard](https://console.cloudinary.com/)
2. Navigate to **Settings** → **Account Details**
3. Copy your:
   - **Cloud Name**
   - **API Key**
4. Create or get your **Upload Preset** name from **Settings** → **Upload** → **Upload presets**
5. Add to `.env.local`:
   ```bash
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   VITE_CLOUDINARY_API_KEY=your_api_key
   VITE_CLOUDINARY_UPLOAD_PRESET=your_preset_name
   ```

### Step 4: Add AI Service Keys (Optional)

If using AI features, add your Gemini API key:

```bash
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### Step 5: Verify Setup

```bash
# Start Convex dev server (generates/updates .env.local)
npx convex dev

# In another terminal, start frontend
npm run dev
```

Your app should now work at `http://localhost:5173`

---

## Production (Vercel) Setup

### Step 1: Create Production Convex Deployment (Recommended)

**Option A: Use Same Deployment (Simpler)**
- Use your existing dev deployment for production
- Less secure but easier to manage
- Good for small projects or testing

**Option B: Create Separate Production Deployment (Recommended)**
```bash
cd frontend
npx convex deploy
```
- Creates separate production deployment
- Keeps dev and production data isolated
- Better security and testing

After deployment, note your production URLs:
- Production Convex URL: `https://prod-xxx.convex.cloud`
- Production Convex Site URL: `https://prod-xxx.convex.site`

### Step 2: Set Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **Environment Variables**
4. Add each variable:

   **Required Variables:**
   ```
   VITE_CONVEX_URL=https://your-production-deployment.convex.cloud
   VITE_CONVEX_SITE_URL=https://your-production-deployment.convex.site
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   VITE_CLOUDINARY_API_KEY=your_api_key
   VITE_CLOUDINARY_UPLOAD_PRESET=your_preset_name
   ```

   **Optional Variables:**
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

5. For each variable, select environments:
   - **Production** - For production deployments
   - **Preview** - For preview deployments (PRs)
   - **Development** - For development deployments (optional)

6. Click **Save**

### Step 3: Get Your Vercel Deployment URL

1. In Vercel Dashboard, go to your project
2. Navigate to **Deployments**
3. Copy your production deployment URL (e.g., `https://your-app.vercel.app`)
4. You'll need this for Convex `SITE_URL` configuration

---

## Convex Backend Setup

### Step 1: Set SITE_URL in Convex Dashboard

The `SITE_URL` environment variable tells Convex which frontend URLs to allow for CORS.

1. Go to [Convex Dashboard](https://dashboard.convex.dev)
2. Select your project
3. Navigate to **Settings** → **Environment Variables**
4. Add:

   **For Development:**
   ```
   SITE_URL=http://localhost:5173
   ```

   **For Production:**
   ```
   SITE_URL=https://your-vercel-app.vercel.app
   ```

   **For Both (Multiple Values):**
   - You can set different values for different deployments
   - Or update the value when switching between dev/prod
   - The code supports multiple origins, so you can also add both URLs

5. Click **Save**

### Step 2: Set Server-Side Environment Variables (Optional)

If using AI features server-side, set in Convex Dashboard:

```
GEMINI_API_KEY=your_gemini_api_key
```

**Note:** Server-side variables (without `VITE_` prefix) are only accessible in Convex functions, not in the browser.

---

## How It Works

### Environment Variable Flow

```
┌─────────────────────────────────────────────────────────┐
│                    Local Development                     │
├─────────────────────────────────────────────────────────┤
│  .env.local (git-ignored)                               │
│  ├─ VITE_CONVEX_URL → Dev Convex deployment            │
│  ├─ VITE_CONVEX_SITE_URL → Dev Convex site            │
│  └─ Other VITE_ variables → Local values               │
│                                                          │
│  Convex Dashboard                                        │
│  └─ SITE_URL → http://localhost:5173                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  Production (Vercel)                     │
├─────────────────────────────────────────────────────────┤
│  Vercel Dashboard → Environment Variables               │
│  ├─ VITE_CONVEX_URL → Prod Convex deployment           │
│  ├─ VITE_CONVEX_SITE_URL → Prod Convex site           │
│  └─ Other VITE_ variables → Production values           │
│                                                          │
│  Convex Dashboard                                        │
│  └─ SITE_URL → https://your-app.vercel.app             │
└─────────────────────────────────────────────────────────┘
```

### Why This Works

1. **Local Development**: Vite reads `.env.local` automatically
2. **Vercel Production**: Vercel injects environment variables during build
3. **No Code Changes**: Your code reads `import.meta.env.VITE_*` - works in both environments
4. **Convex CORS**: Backend reads `SITE_URL` from Convex environment variables

---

## Troubleshooting

### Issue: "Missing VITE_CONVEX_URL environment variable"

**Local:**
- Check that `.env.local` exists in `frontend/` directory
- Verify `VITE_CONVEX_URL` is set in `.env.local`
- Restart your dev server after adding variables

**Vercel:**
- Go to Vercel Dashboard → Settings → Environment Variables
- Verify `VITE_CONVEX_URL` is set
- Check that it's enabled for the correct environment (Production/Preview)
- Redeploy after adding variables

### Issue: CORS Errors on Vercel

**Symptoms:**
```
Cross-Origin Request Blocked: CORS header 'Access-Control-Allow-Origin' missing
```

**Solution:**
1. Get your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
2. Go to Convex Dashboard → Settings → Environment Variables
3. Set `SITE_URL` to your Vercel URL
4. Save and wait a few seconds for changes to propagate
5. Try logging in again

### Issue: Login Works Locally But Not on Vercel

**Check:**
1. ✅ `VITE_CONVEX_SITE_URL` is set in Vercel (should match your Convex deployment)
2. ✅ `SITE_URL` is set in Convex Dashboard (should be your Vercel URL)
3. ✅ Both URLs are correct and match their respective deployments
4. ✅ Vercel environment variables are set for "Production" environment

### Issue: Wrong Convex Deployment Being Used

**Local:**
- Check `.env.local` has correct `VITE_CONVEX_URL`
- Run `npx convex dev` to regenerate if needed

**Vercel:**
- Verify `VITE_CONVEX_URL` in Vercel Dashboard points to production deployment
- Check deployment logs to see which URL is being used

### Issue: Environment Variables Not Updating

**Vercel:**
- After adding/changing variables, you must **redeploy**
- Go to Deployments → Click "..." → Redeploy
- Or push a new commit to trigger automatic deployment

**Convex:**
- Changes to Convex environment variables take effect immediately
- No redeploy needed, but may take a few seconds to propagate

---

## Best Practices

1. **Never Commit Secrets**: `.env.local` is git-ignored for a reason
2. **Use Separate Deployments**: Keep dev and production Convex deployments separate
3. **Document Changes**: Update this guide when adding new environment variables
4. **Test Both Environments**: Verify local dev and Vercel production work independently
5. **Use Vercel Preview**: Test environment variables in preview deployments before production

---

## Quick Setup Checklist

### Local Development
- [ ] Copy `.env.example` to `.env.local`
- [ ] Run `npx convex dev` to generate Convex URLs
- [ ] Add Cloudinary credentials to `.env.local`
- [ ] Add optional AI service keys
- [ ] Verify app works at `http://localhost:5173`

### Production (Vercel)
- [ ] Create production Convex deployment (optional but recommended)
- [ ] Get production Convex URLs
- [ ] Set all `VITE_*` variables in Vercel Dashboard
- [ ] Get Vercel deployment URL
- [ ] Set `SITE_URL` in Convex Dashboard to Vercel URL
- [ ] Redeploy Vercel project
- [ ] Test login on production deployment

---

## Additional Resources

- [Vite Environment Variables](https://vite.dev/guide/env-and-mode.html)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Convex Environment Variables](https://docs.convex.dev/production/environment-variables)
- [Better Auth CORS Configuration](https://www.better-auth.com/docs/configuration/cors)
