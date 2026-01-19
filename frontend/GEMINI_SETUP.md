# Google Gemini AI Integration Setup

## Environment Variable Configuration

The Google Gemini API key must be set in your Convex environment variables, not in the frontend `.env` file.

### For Local Development

1. **Option 1: Convex Dashboard (Recommended)**
   - Go to your Convex Dashboard: https://dashboard.convex.dev
   - Select your project
   - Navigate to Settings → Environment Variables
   - Add: `GEMINI_API_KEY` = `your_api_key_here`
   - Click "Save"

2. **Option 2: Convex CLI**
   ```bash
   npx convex env set GEMINI_API_KEY your_api_key_here
   ```

### For Production

Set the environment variable in the Convex Dashboard under Settings → Environment Variables for your production deployment.

## How It Works

1. User uploads a file and enables AI analysis
2. File is converted to base64 on the client
3. Base64 data is sent to Convex action `analyzeMediaWithGemini`
4. Convex action securely calls Google Gemini API with the API key
5. Gemini analyzes the image/video and returns metadata suggestions
6. Suggestions are displayed in the upload form for user review

## API Key Security

- ✅ API key is stored server-side only (Convex action)
- ✅ API key never exposed to client-side code
- ✅ All API calls happen through Convex backend

## Testing

After setting up the API key:

1. Start your Convex dev server: `npx convex dev`
2. Start your frontend: `npm run dev`
3. Upload an image file
4. Enable "Use AI to generate metadata" toggle
5. Wait for AI analysis to complete
6. Review the generated suggestions in Step 2

## Troubleshooting

**Error: "GEMINI_API_KEY environment variable is not set"**
- Make sure you've set the variable in Convex Dashboard
- Restart your Convex dev server after adding the variable

**Error: "Invalid Gemini API key"**
- Verify your API key is correct
- Check that the key has proper permissions
- Ensure you're using a valid Gemini API key from Google AI Studio

**Error: "File is too large for AI analysis"**
- **Convex Action Limit**: Files larger than ~3.75MB cannot be analyzed due to Convex's 5MB argument size limit (base64 encoding increases file size by ~33%)
- **Gemini API Limit**: Gemini has a 20MB limit for images/videos
- **Solution**: Files larger than ~3.75MB will automatically use fallback metadata generation instead of AI analysis
- Consider compressing large images before upload if you want AI analysis

**AI suggestions not appearing**
- Check browser console for errors
- Verify Convex action is being called (check Convex dashboard logs)
- Ensure file is an image or video (other file types use fallback suggestions)
