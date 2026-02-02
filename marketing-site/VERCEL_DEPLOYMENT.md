# Marketing Site Vercel Deployment Guide

## Quick Setup Steps

### 1. Create Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your Git repository (`media-manager-app`)
4. **Important:** This should be a **separate project** from your frontend app

### 2. Configure Project Settings

In Vercel project settings:

**Framework Preset:**
- Framework: **Next.js** (should auto-detect)

**Build and Output Settings:**
- **Root Directory**: `marketing-site` ⚠️ **CRITICAL**
- **Build Command**: `pnpm build` (or `npm run build`)
- **Output Directory**: `.next` (Next.js default)
- **Install Command**: `pnpm install` (or `npm install`)

### 3. Set Environment Variables

Go to **Settings** → **Environment Variables** and add:

**Required:**
```
NEXT_PUBLIC_APP_URL=https://your-marketing-site.vercel.app
```
- Initially, use the Vercel-generated URL
- After first deployment, update with your actual URL

**Optional (can add later):**
```
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
```

**Important:**
- Enable variables for: **Production**, **Preview**, and optionally **Development**
- Click **Save** after adding each variable

### 4. Deploy

**Option A: Automatic (Recommended)**
- After configuring settings, Vercel will auto-deploy when you push to main
- Or click **"Deploy"** button in Vercel Dashboard

**Option B: Manual via CLI**
```bash
cd marketing-site
vercel --prod
```

### 5. Verify Deployment

After deployment completes:

- [ ] Site loads at Vercel URL
- [ ] Homepage (/) loads correctly
- [ ] Pricing page (/pricing) loads
- [ ] Features page (/features) loads
- [ ] Demo page (/demo) loads
- [ ] Contact form submits (check Vercel function logs)
- [ ] Demo request form submits (check Vercel function logs)
- [ ] No console errors
- [ ] Mobile responsive

### 6. Update Environment Variables

After first deployment:

1. Copy your Vercel deployment URL (e.g., `https://marketing-site-xyz.vercel.app`)
2. Go to Vercel Dashboard → Settings → Environment Variables
3. Update `NEXT_PUBLIC_APP_URL` with your actual URL
4. Redeploy to apply changes

## Troubleshooting

### Build Fails

**Issue:** Build errors in Vercel logs
- Check that **Root Directory** is set to `marketing-site`
- Verify build command is `pnpm build` or `npm run build`
- Check that all dependencies are in `package.json`

### Pages Return 404

**Issue:** Routes not working
- Verify Next.js framework is detected correctly
- Check that `next.config.ts` is valid
- Ensure all pages are in `app/` directory

### Forms Not Working

**Issue:** Contact/demo forms don't submit
- Check Vercel function logs (Deployments → Click deployment → Functions tab)
- Forms currently log to console (SendGrid not implemented yet)
- Verify API routes are in `app/api/` directory

### Images Not Loading

**Issue:** Cloudinary images not displaying
- Verify `next.config.ts` has `remotePatterns` configured for `res.cloudinary.com`
- Check that image URLs are correct

## Post-Deployment Checklist

- [ ] Site accessible at Vercel URL
- [ ] All pages load correctly
- [ ] Forms submit (check logs)
- [ ] Images load from Cloudinary
- [ ] Mobile responsive
- [ ] No console errors
- [ ] SEO metadata working (check page source)
- [ ] Update `NEXT_PUBLIC_APP_URL` with actual URL

## Next Steps

After successful deployment:

1. **Add Email Functionality**
   - Implement SendGrid in API routes
   - Set `SENDGRID_API_KEY` in Vercel

2. **Add Analytics**
   - Set up Google Analytics 4
   - Add `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` in Vercel

3. **Create OG Image**
   - Create `public/og-image.png` (1200x630px)
   - Uncomment OG image references in `app/layout.tsx`

4. **Custom Domain**
   - Add custom domain in Vercel Dashboard
   - Update DNS settings
   - Update `NEXT_PUBLIC_APP_URL` with custom domain
