import type { AISuggestions } from '@/types/upload';
import type { MediaType } from '@/types/mediaType';

/**
 * Analyze file with AI and generate suggestions
 * Currently returns mock data - future: integrate with OpenAI API
 */
export async function analyzeFileWithAI(file: File, mediaType?: MediaType): Promise<AISuggestions> {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

  const filename = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
  const cleanFilename = filename.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  // Mock AI suggestions based on filename and file type
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
