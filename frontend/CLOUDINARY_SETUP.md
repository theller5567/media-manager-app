# Cloudinary Upload Configuration

## Overview

This guide explains how to configure Cloudinary upload presets to support large video file uploads (up to 500MB) and enable chunked uploads for files over 100MB.

## Upload Preset Configuration

### Step 1: Access Cloudinary Dashboard

1. Go to [Cloudinary Dashboard](https://console.cloudinary.com/)
2. Sign in to your account
3. Navigate to **Settings** → **Upload** → **Upload presets**

### Step 2: Create or Edit Upload Preset

**For New Preset:**
1. Click **"Add upload preset"**
2. Give it a name (e.g., `media-manager-unsigned`)
3. Set **Signing mode** to **"Unsigned"**

**For Existing Preset:**
1. Find your preset in the list
2. Click **"Edit"**

### Step 3: Configure Upload Settings

**Critical Settings:**

1. **Max file size**: 
   - **Remove the limit** OR set to **500MB or higher**
   - This is the most important setting - if set to 5MB, it will block larger files
   - Location: **Upload** tab → **Upload manipulation** → **Max file size**

2. **Resource type**:
   - Set to **"Auto"** to support images, videos, and other files
   - Or create separate presets for different resource types
   - Location: **Upload** tab → **Upload manipulation** → **Resource type**

3. **Unsigned upload**:
   - Ensure **"Signing mode"** is set to **"Unsigned"**
   - This allows client-side uploads without server-side signing

4. **Allowed formats** (optional):
   - Configure which file formats are allowed
   - Default: All formats allowed
   - Location: **Upload** tab → **Upload manipulation** → **Allowed formats**

### Step 4: Save Configuration

1. Click **"Save"** at the bottom of the page
2. Copy the preset name
3. Add it to your `.env.local` file as `VITE_CLOUDINARY_UPLOAD_PRESET`

## Environment Variables

Add these to your `.env.local` file in the `frontend` directory:

```bash
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_API_KEY=your_api_key
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset_name
```

**Important:** 
- Do NOT include `CLOUDINARY_API_SECRET` in frontend environment variables
- API secret should only be used server-side
- For unsigned uploads, only the API key and preset are needed

## File Size Limits

The application enforces the following size limits:

- **Images**: 20MB maximum
- **Videos**: 500MB maximum  
- **Documents/Audio**: 100MB maximum

### Chunked Uploads

Files larger than **100MB** automatically use Cloudinary's chunked upload API (`upload_large`):

- **Chunk size**: 20MB (default, minimum 5MB)
- **Automatic**: No configuration needed - handled automatically
- **Progress tracking**: Works seamlessly with chunked uploads
- **Free plan**: Supports up to 100MB videos without chunking, 100MB+ requires chunked upload

## Troubleshooting

### Error: "File size exceeds limit"

**Possible causes:**
1. Upload preset has a max file size limit set too low
   - **Solution**: Remove or increase the limit in Cloudinary Dashboard
2. File exceeds application's type-specific limit
   - **Solution**: Check file size against limits (images: 20MB, videos: 500MB)

### Error: "413 Request Entity Too Large"

**Cause**: File is too large for regular upload endpoint

**Solution**: 
- Files >100MB automatically use chunked upload
- If you see this error, check that your upload preset allows large files
- Verify chunked upload is working (check browser network tab)

### Error: "Chunked upload failed"

**Possible causes:**
1. Network connectivity issues
   - **Solution**: Check internet connection, try again
2. Cloudinary account limits exceeded
   - **Solution**: Check your Cloudinary plan limits
3. Upload preset misconfiguration
   - **Solution**: Verify preset settings in Cloudinary Dashboard

### Upload Preset Not Found

**Error**: "Upload preset not found" or similar

**Solution**:
1. Verify preset name matches `VITE_CLOUDINARY_UPLOAD_PRESET` in `.env.local`
2. Check that preset exists in Cloudinary Dashboard
3. Ensure preset is set to "Unsigned" mode
4. Restart your development server after changing environment variables

## Cloudinary Plan Limits

### Free Plan
- **Images**: ~10MB
- **Videos**: ~100MB (requires chunked upload for larger files)
- **Raw files**: ~10MB

### Paid/Plus Plans
- **Images**: ~20MB+
- **Videos**: Up to 2GB+ (depending on plan)
- **Raw files**: ~20MB+

**Note**: For files larger than your plan's limits, you may need to:
1. Upgrade your Cloudinary plan
2. Use chunked uploads (automatic for files >100MB)
3. Contact Cloudinary support for custom limits

## Testing Large File Uploads

After configuration:

1. **Small video (<100MB)**:
   - Should use regular upload endpoint
   - Should complete quickly

2. **Medium video (100-200MB)**:
   - Should automatically use chunked upload
   - Progress bar should show upload progress
   - May take several minutes depending on connection

3. **Large video (200-500MB)**:
   - Should use chunked upload
   - Progress tracking should work correctly
   - Upload time depends on file size and connection speed

## Additional Resources

- [Cloudinary Upload API Documentation](https://cloudinary.com/documentation/image_upload_api_reference)
- [Cloudinary Chunked Upload Guide](https://cloudinary.com/documentation/image_upload_api_reference#chunked_upload)
- [Cloudinary Upload Presets](https://cloudinary.com/documentation/upload_presets)
