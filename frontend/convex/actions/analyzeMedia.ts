"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { GoogleGenAI } from "@google/genai";

/**
 * Analyze media file with Google Gemini AI and generate metadata suggestions
 * 
 * This action accepts base64-encoded file data and uses Gemini's vision capabilities
 * to analyze images/videos and generate title, description, alt text, and tags.
 */
export const analyzeMediaWithGemini = action({
  args: {
    base64: v.string(),
    mimeType: v.string(),
    filename: v.string(),
    mediaType: v.optional(
      v.object({
        name: v.string(),
        description: v.optional(v.string()),
        defaultTags: v.optional(v.array(v.string())),
      })
    ),
  },
  handler: async (ctx, args): Promise<{
    title?: string;
    description?: string;
    altText?: string;
    tags?: string[];
  }> => {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }

    // Initialize Gemini client
    const genAI = new GoogleGenAI({ apiKey });

    // Build prompt with MediaType context
    const mediaTypeContext = args.mediaType
      ? `\n\nMedia Type Context: "${args.mediaType.name}"${args.mediaType.description ? ` - ${args.mediaType.description}` : ""}`
      : "";

    const defaultTagsContext = args.mediaType?.defaultTags && args.mediaType.defaultTags.length > 0
      ? `\n\nDefault tags for this media type: ${args.mediaType.defaultTags.join(", ")}`
      : "";

    const prompt = `Analyze this ${args.mimeType.startsWith('image/') ? 'image' : args.mimeType.startsWith('video/') ? 'video' : 'media'} file (${args.filename}) and provide metadata suggestions:

1. A concise, descriptive title (max 60 characters) based on the visual content
2. A brief description (1-2 sentences) describing what is shown
3. Alt text for accessibility (if image) - be descriptive and specific. No more than 10 words in description.
4. Relevant tags (3-5 tags) that describe the content, style, or subject matter${mediaTypeContext}${defaultTagsContext}

Return your response as a JSON object with this exact format:
{
  "title": "descriptive title here",
  "description": "brief description here",
  "altText": "descriptive alt text for accessibility. No more than 10 words in description.",
  "tags": ["tag1", "tag2", "tag3"]
}

Be specific and descriptive. For images, describe what you see. For videos, describe the content and style.`;

    try {
      // Determine if this is an image or video (Gemini supports both)
      const isImage = args.mimeType.startsWith('image/');
      const isVideo = args.mimeType.startsWith('video/');
      
      if (!isImage && !isVideo) {
        // For non-image/video files, return basic suggestions based on filename
        const filename = args.filename.replace(/\.[^/.]+$/, '');
        const cleanFilename = filename.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        return {
          title: cleanFilename || 'Untitled Media',
          description: `A ${args.mimeType.split('/')[1] || 'file'} file.`,
          altText: `${cleanFilename} file`,
          tags: args.mediaType?.defaultTags || [],
        };
      }

      // Prepare content for Gemini - use inline data for base64 images/videos
      // The API expects contents as an array with role and parts
      const contents = [
        {
          role: "user" as const,
          parts: [
            {
              text: prompt,
            },
            {
              inlineData: {
                data: args.base64,
                mimeType: args.mimeType,
              },
            },
          ],
        },
      ];

      // Call Gemini API using the correct method
      // Note: @google/genai package recommends using getGenerativeModel
      // Using gemini-2.5-flash which is stable and supports vision for images/videos
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      });

      const result = await model.generateContent({
        contents,
      });

      // Extract text from response
      const text = result.response.text();
      
      if (!text) {
        throw new Error('Gemini API returned empty response');
      }

      // Parse JSON response from Gemini
      let jsonText = text.trim();
      
      // With responseMimeType: "application/json", text should be pure JSON
      // but we'll keep some basic extraction just in case
      const firstBrace = jsonText.indexOf('{');
      const lastBrace = jsonText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        jsonText = jsonText.substring(firstBrace, lastBrace + 1);
      }

      let parsed;
      try {
        parsed = JSON.parse(jsonText);
      } catch (parseError) {
        // If parsing fails, try to fix potentially truncated JSON
        // (common if model hits output limits or has network issues)
        try {
          // Very basic fix for common truncation: close unclosed strings and braces
          let fixedJson = jsonText;
          if (!fixedJson.endsWith('}')) {
            // Count open/close braces and quotes
            const openBraces = (fixedJson.match(/\{/g) || []).length;
            const closeBraces = (fixedJson.match(/\}/g) || []).length;
            const quotes = (fixedJson.match(/"/g) || []).length;
            
            if (quotes % 2 !== 0) fixedJson += '"';
            for (let i = 0; i < (openBraces - closeBraces); i++) {
              fixedJson += '}';
            }
            parsed = JSON.parse(fixedJson);
            console.warn('Fixed truncated JSON from Gemini:', fixedJson);
          } else {
            throw parseError;
          }
        } catch (retryError) {
          console.error('Failed to parse Gemini JSON response. Text:', jsonText);
          throw new Error(`Failed to parse Gemini response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
        }
      }

      // Validate and structure response
      const suggestions: {
        title?: string;
        description?: string;
        altText?: string;
        tags?: string[];
      } = {};

      if (parsed.title && typeof parsed.title === 'string') {
        suggestions.title = parsed.title.trim();
      }

      if (parsed.description && typeof parsed.description === 'string') {
        suggestions.description = parsed.description.trim();
      }

      if (parsed.altText && typeof parsed.altText === 'string') {
        suggestions.altText = parsed.altText.trim();
      }

      if (parsed.tags && Array.isArray(parsed.tags)) {
        // Combine with MediaType default tags and remove duplicates
        const allTags = [
          ...(args.mediaType?.defaultTags || []),
          ...parsed.tags.filter((tag: any) => typeof tag === 'string'),
        ];
        suggestions.tags = [...new Set(allTags.map((tag: string) => tag.toLowerCase().trim()))];
      } else if (args.mediaType?.defaultTags) {
        suggestions.tags = args.mediaType.defaultTags;
      }

      return suggestions;
    } catch (error) {
      // Log error for debugging
      console.error("Gemini API error:", error);
      
      // Return fallback suggestions based on filename
      const filename = args.filename.replace(/\.[^/.]+$/, '');
      const cleanFilename = filename.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      const fallback: {
        title?: string;
        description?: string;
        altText?: string;
        tags?: string[];
      } = {
        title: cleanFilename || 'Untitled Media',
        description: `A ${args.mimeType.split('/')[1] || 'file'} file.`,
        altText: `${cleanFilename} file`,
        tags: args.mediaType?.defaultTags || [],
      };

      // If it's a known error, throw it; otherwise return fallback
      if (error instanceof Error) {
        // Check for common API errors
        if (error.message.includes('API key') || error.message.includes('authentication')) {
          throw new Error("Invalid Gemini API key. Please check your GEMINI_API_KEY environment variable.");
        }
        if (error.message.includes('quota') || error.message.includes('rate limit')) {
          throw new Error("Gemini API quota exceeded. Please try again later.");
        }
        if (error.message.includes('size') || error.message.includes('too large')) {
          throw new Error("File is too large for AI analysis. Maximum size is 20MB.");
        }
        if (error.message.includes('not found') || error.message.includes('404')) {
          // Model not found - try to provide helpful error message
          console.error("Model not found. Available models may have changed. Try: gemini-2.0-flash-001, gemini-2.5-flash, or gemini-2.5-pro");
          throw new Error("Gemini model not available. The API may have changed available models. Please check Google AI Studio for current model names.");
        }
      }

      // For other errors, return fallback but log the error
      return fallback;
    }
  },
});
