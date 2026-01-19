import type { AISuggestions } from '@/types/upload';
import type { MediaType } from '@/types/mediaType';
import { fileToBase64 } from './fileUtils';

/**
 * Maximum file size for AI analysis (Convex action argument limit)
 * Base64 encoding increases size by ~33%, so limit original file to ~3.5MB
 * to safely stay under Convex's 5MB argument limit
 */
export const MAX_FILE_SIZE_FOR_AI = 3.5 * 1024 * 1024; // ~3.5MB

/**
 * Check if a file is too large for AI analysis
 */
export function isFileTooLargeForAI(file: File): boolean {
  return file.size > MAX_FILE_SIZE_FOR_AI;
}

/**
 * Analyze file with AI and generate suggestions using Google Gemini
 * 
 * This function converts the file to base64 and calls the Convex action
 * which securely communicates with Google Gemini API.
 * 
 * @param file - The file to analyze
 * @param mediaType - Optional MediaType for context
 * @param analyzeAction - The Convex action function to call (optional, will use fallback if not provided)
 */
export async function analyzeFileWithAI(
  file: File, 
  mediaType?: MediaType,
  analyzeAction?: (args: {
    base64: string;
    mimeType: string;
    filename: string;
    mediaType?: {
      name: string;
      description?: string;
      defaultTags?: string[];
    };
  }) => Promise<AISuggestions>
): Promise<AISuggestions> {
  // Check if action is available
  if (!analyzeAction) {
    // Fallback to mock data if action not available
    console.warn('[AI] analyzeAction not provided, using fallback suggestions');
    return getFallbackSuggestions(file, mediaType);
  }

  console.log('[AI] Starting Gemini analysis for file:', file.name);

  try {
    // Check file size constraints
    // 1. Convex action argument limit: 5MB total for all arguments
    //    Base64 encoding increases size by ~33% (4/3 ratio), so limit original file to ~3.5MB
    //    This leaves room for other arguments (mimeType, filename, mediaType object)
    // 2. Gemini API limit: 20MB for images/videos
    const geminiLimit = 20 * 1024 * 1024; // 20MB Gemini limit
    
    if (file.size > MAX_FILE_SIZE_FOR_AI) {
      console.warn(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds Convex action argument limit (~3.5MB). Base64 encoding increases size by ~33%, and Convex actions have a 5MB total argument limit. Using fallback suggestions instead.`);
      return getFallbackSuggestions(file, mediaType);
    }
    
    if (file.size > geminiLimit) {
      console.warn(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds Gemini limit (20MB), using fallback`);
      return getFallbackSuggestions(file, mediaType);
    }

    // Convert file to base64
    const base64 = await fileToBase64(file);
    
    // Final safety check: verify base64 string length doesn't exceed Convex limit
    // Base64 string length in characters (each char = 1 byte in UTF-8)
    // We need to account for other arguments too, so keep base64 under ~4.5MB
    const maxBase64Size = 4.5 * 1024 * 1024; // 4.5MB to leave room for other args
    
    if (base64.length > maxBase64Size) {
      console.warn(`Base64 string length (${(base64.length / 1024 / 1024).toFixed(2)}MB) exceeds safe limit for Convex action arguments, using fallback`);
      return getFallbackSuggestions(file, mediaType);
    }

    // Prepare MediaType data for the action
    const mediaTypeData = mediaType
      ? {
          name: mediaType.name,
          description: mediaType.description,
          defaultTags: mediaType.defaultTags,
        }
      : undefined;

    // Call Convex action
    // Log base64 size for debugging
    const base64SizeMB = (base64.length / 1024 / 1024).toFixed(2);
    console.log('[AI] Calling Convex action with base64 data (length:', base64.length, 'chars, ~', base64SizeMB, 'MB)');
    
    const suggestions = await analyzeAction({
      base64,
      mimeType: file.type,
      filename: file.name,
      mediaType: mediaTypeData,
    });

    console.log('[AI] Received suggestions from Gemini:', suggestions);
    return suggestions;
  } catch (error) {
    console.error('[AI] Analysis failed:', error);
    console.error('[AI] Error details:', error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      name: error.name
    } : error);
    
    // Check if error is related to Convex argument size limit
    if (error instanceof Error && (
      error.message.includes('arguments size is too large') ||
      error.message.includes('maximum size is 5 MiB') ||
      error.message.includes('5 MiB limit')
    )) {
      console.warn('[AI] File too large for Convex action arguments. Skipping AI analysis for this file.');
      return getFallbackSuggestions(file, mediaType);
    }
    
    // Return fallback suggestions on error
    return getFallbackSuggestions(file, mediaType);
  }
}

/**
 * Fallback suggestions when AI is unavailable or fails
 */
function getFallbackSuggestions(file: File, mediaType?: MediaType): AISuggestions {
  const filename = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
  const cleanFilename = filename.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const suggestions: AISuggestions = {
    title: cleanFilename || 'Untitled Media',
    description: `A ${getFileTypeDescription(file.type)} file${mediaType ? ` categorized as ${mediaType.name}` : ''}.`,
    altText: `Image showing ${cleanFilename.toLowerCase()}`,
    tags: [],
  };

  // Add MediaType default tags if available
  if (mediaType?.defaultTags && mediaType.defaultTags.length > 0) {
    suggestions.tags = [...mediaType.defaultTags];
  }

  // Add some generic tags based on file type
  const typeTags = getTagsForFileType(file.type);
  suggestions.tags = [...(suggestions.tags || []), ...(typeTags || [])];

  // Generate more descriptive alt text for images
  if (file.type.startsWith('image/')) {
    suggestions.altText = `Image: ${cleanFilename}`;
  } else if (file.type.startsWith('video/')) {
    suggestions.altText = `Video: ${cleanFilename}`;
  }

  return suggestions;
}

/**
 * Generate title from filename and content analysis
 */
export function generateTitle(filename: string, _contentAnalysis: any): string {
  const cleanName = filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  return cleanName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

/**
 * Generate description from content analysis
 */
export function generateDescription(_contentAnalysis: any): string {
  // Mock implementation
  return 'Media file uploaded to the library.';
}

/**
 * Generate alt text from content analysis
 */
export function generateAltText(_contentAnalysis: any): string {
  // Mock implementation
  return 'Media file';
}

/**
 * Suggest tags from content analysis and MediaType
 */
export function suggestTags(contentAnalysis: any, mediaType?: MediaType): string[] {
  const tags: string[] = [];

  if (mediaType?.defaultTags) {
    tags.push(...mediaType.defaultTags);
  }

  // Add generic tags based on content
  if (contentAnalysis?.type) {
    tags.push(...getTagsForFileType(contentAnalysis.type));
  }

  return [...new Set(tags)]; // Remove duplicates
}

/**
 * Get file type description
 */
function getFileTypeDescription(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf')) return 'PDF document';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
  return 'file';
}

/**
 * Get tags for file type
 */
function getTagsForFileType(mimeType: string): string[] {
  const tags: string[] = [];

  if (mimeType.startsWith('image/')) {
    tags.push('image', 'photo');
  } else if (mimeType.startsWith('video/')) {
    tags.push('video', 'media');
  } else if (mimeType.startsWith('audio/')) {
    tags.push('audio', 'sound');
  } else if (mimeType.includes('pdf')) {
    tags.push('document', 'pdf');
  } else if (mimeType.includes('word') || mimeType.includes('document')) {
    tags.push('document', 'text');
  }

  return tags;
}
