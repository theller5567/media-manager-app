"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { GoogleGenAI } from "@google/genai";

type MediaTypeArg = {
  name: string;
  description?: string;
  defaultTags?: string[];
};

type Suggestions = {
  title?: string;
  description?: string;
  altText?: string;
  tags?: string[];
};

/**
 * Shared Gemini analysis: prompt building, API call, and response parsing.
 * Used by both analyzeMediaWithGemini (base64 from upload) and analyzeMediaFromUrl (fetch then base64).
 */
async function runGeminiAnalysis(args: {
  base64: string;
  mimeType: string;
  filename: string;
  mediaType?: MediaTypeArg;
}): Promise<Suggestions> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }

  const genAI = new GoogleGenAI({ apiKey });

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

  const isImage = args.mimeType.startsWith('image/');
  const isVideo = args.mimeType.startsWith('video/');

  if (!isImage && !isVideo) {
    const baseName = args.filename.replace(/\.[^/.]+$/, '');
    const cleanFilename = baseName.replace(/[-_]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
    return {
      title: cleanFilename || 'Untitled Media',
      description: `A ${args.mimeType.split('/')[1] || 'file'} file.`,
      altText: `${cleanFilename} file`,
      tags: args.mediaType?.defaultTags || [],
    };
  }

  const contents = [
    {
      role: "user" as const,
      parts: [
        { text: prompt },
        { inlineData: { data: args.base64, mimeType: args.mimeType } },
      ],
    },
  ];

  const result = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents,
    config: {
      responseMimeType: "application/json",
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  });

  const text = result.text;
  if (!text) throw new Error('Gemini API returned empty response');

  let jsonText = text.trim();
  const firstBrace = jsonText.indexOf('{');
  const lastBrace = jsonText.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    jsonText = jsonText.substring(firstBrace, lastBrace + 1);
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(jsonText);
  } catch (parseError) {
    let fixedJson = jsonText;
    if (!fixedJson.endsWith('}')) {
      const openBraces = (fixedJson.match(/\{/g) || []).length;
      const closeBraces = (fixedJson.match(/\}/g) || []).length;
      const quotes = (fixedJson.match(/"/g) || []).length;
      if (quotes % 2 !== 0) fixedJson += '"';
      for (let i = 0; i < openBraces - closeBraces; i++) fixedJson += '}';
      parsed = JSON.parse(fixedJson);
    } else {
      throw new Error(`Failed to parse Gemini response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }
  }

  const suggestions: Suggestions = {};
  if (parsed.title && typeof parsed.title === 'string') suggestions.title = parsed.title.trim();
  if (parsed.description && typeof parsed.description === 'string') suggestions.description = parsed.description.trim();
  if (parsed.altText && typeof parsed.altText === 'string') suggestions.altText = parsed.altText.trim();
  if (parsed.tags && Array.isArray(parsed.tags)) {
    const allTags = [
      ...(args.mediaType?.defaultTags || []),
      ...parsed.tags.filter((t: unknown): t is string => typeof t === 'string'),
    ];
    suggestions.tags = [...new Set(allTags.map((t: string) => t.toLowerCase().trim()))];
  } else if (args.mediaType?.defaultTags) {
    suggestions.tags = args.mediaType.defaultTags;
  }

  return suggestions;
}

/**
 * Analyze media file with Google Gemini AI and generate metadata suggestions.
 * Accepts base64-encoded file data (e.g. from upload).
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
  handler: async (_ctx, args): Promise<Suggestions> => {
    try {
      return await runGeminiAnalysis(args);
    } catch (error) {
      console.error("Gemini API error:", error);
      const baseName = args.filename.replace(/\.[^/.]+$/, '');
      const cleanFilename = baseName.replace(/[-_]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
      const fallback: Suggestions = {
        title: cleanFilename || 'Untitled Media',
        description: `A ${args.mimeType.split('/')[1] || 'file'} file.`,
        altText: `${baseName} file`,
        tags: args.mediaType?.defaultTags || [],
      };
      if (error instanceof Error) {
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
          throw new Error("Gemini model not available. Please check Google AI Studio for current model names.");
        }
      }
      return fallback;
    }
  },
});

/** Allowed host for media URL fetch (Cloudinary). */
const ALLOWED_MEDIA_URL_HOSTS = ['res.cloudinary.com', 'cloudinary.com'];

function isAllowedMediaUrl(urlString: string): boolean {
  try {
    const u = new URL(urlString);
    if (u.protocol !== 'https:') return false;
    const host = u.hostname.toLowerCase();
    return ALLOWED_MEDIA_URL_HOSTS.some((allowed) => host === allowed || host.endsWith('.' + allowed));
  } catch {
    return false;
  }
}

/**
 * Analyze media from a URL (e.g. Cloudinary) and generate metadata suggestions.
 * Used by the Media Edit Dialog when the client does not have the file (only URL).
 */
export const analyzeMediaFromUrl = action({
  args: {
    mediaUrl: v.string(),
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
  handler: async (_ctx, args): Promise<Suggestions> => {
    if (!isAllowedMediaUrl(args.mediaUrl)) {
      throw new Error("Media URL must be a valid HTTPS URL from an allowed host (e.g. Cloudinary).");
    }

    const response = await fetch(args.mediaUrl, { method: 'GET' });
    if (!response.ok) {
      throw new Error(`Failed to fetch media: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');

    return runGeminiAnalysis({
      base64,
      mimeType: args.mimeType,
      filename: args.filename,
      mediaType: args.mediaType,
    });
  },
});
