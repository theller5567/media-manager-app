import type { AISuggestions } from '@/types/upload';
import type { MediaType } from '@/types/mediaType';
import { fileToBase64 } from './fileUtils';

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
    // Check file size (Gemini has limits - typically 20MB for images)
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      console.warn(`File size (${file.size} bytes) exceeds Gemini limit, using fallback`);
      return getFallbackSuggestions(file, mediaType);
    }

    // Convert file to base64
    const base64 = await fileToBase64(file);

    // Prepare MediaType data for the action
    const mediaTypeData = mediaType
      ? {
          name: mediaType.name,
          description: mediaType.description,
          defaultTags: mediaType.defaultTags,
        }
      : undefined;

    // Call Convex action
    console.log('[AI] Calling Convex action with base64 data (length:', base64.length, ')');
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
