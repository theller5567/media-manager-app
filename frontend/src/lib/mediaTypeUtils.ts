import type { MediaType, ValidationResult } from '@/types/mediaType';

/**
 * Validate field name (must be camelCase, alphanumeric)
 */
export function validateFieldName(name: string, existingNames: string[] = []): ValidationResult {
  const errors: string[] = [];

  if (!name || name.trim() === '') {
    errors.push('Field name is required');
    return { isValid: false, errors };
  }

  // Check camelCase format (starts with lowercase letter, contains only alphanumeric)
  const camelCaseRegex = /^[a-z][a-zA-Z0-9]*$/;
  if (!camelCaseRegex.test(name)) {
    errors.push('Field name must be in camelCase (start with lowercase letter, no spaces or special characters)');
  }

  // Check uniqueness
  if (existingNames.includes(name)) {
    errors.push(`Field name "${name}" already exists`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate hex color format (#RRGGBB)
 */
export function validateHexColor(color: string): boolean {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(color);
}

/**
 * Generate unique field ID
 */
export function generateFieldId(): string {
  return `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get file extension category
 */
export function getFileExtensionCategory(ext: string): 'image' | 'video' | 'document' | 'audio' | 'other' {
  const normalizedExt = ext.toLowerCase().replace(/^\./, '');
  
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'];
  const videoExts = ['mp4', 'mov', 'avi', 'webm', 'mkv'];
  const documentExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
  const audioExts = ['mp3', 'wav', 'ogg', 'flac'];

  if (imageExts.includes(normalizedExt)) return 'image';
  if (videoExts.includes(normalizedExt)) return 'video';
  if (documentExts.includes(normalizedExt)) return 'document';
  if (audioExts.includes(normalizedExt)) return 'audio';
  
  return 'other';
}

/**
 * Validate MediaType data
 */
export function validateMediaType(
  data: Partial<MediaType>,
  existingMediaTypes: MediaType[] = [],
  excludeId?: string
): ValidationResult {
  const errors: string[] = [];

  // Validate name
  if (!data.name || data.name.trim() === '') {
    errors.push('MediaType name is required');
  } else {
    // Check uniqueness (excluding current MediaType if editing)
    const isDuplicate = existingMediaTypes.some(
      (mt) => mt.name.toLowerCase() === data.name!.toLowerCase() && mt.id !== excludeId
    );
    if (isDuplicate) {
      errors.push(`MediaType name "${data.name}" already exists`);
    }
  }

  // Validate color
  if (!data.color || !validateHexColor(data.color)) {
    errors.push('Valid hex color is required (e.g., #3b82f6)');
  }

  // Validate allowed formats
  if (!data.allowedFormats || data.allowedFormats.length === 0) {
    errors.push('At least one file format must be selected');
  }

  // Validate fields
  if (data.fields) {
    const fieldNames: string[] = [];
    data.fields.forEach((field, index) => {
      // Validate field name
      const nameValidation = validateFieldName(field.name, fieldNames);
      if (!nameValidation.isValid) {
        nameValidation.errors.forEach((err) => {
          errors.push(`Field ${index + 1}: ${err}`);
        });
      }
      fieldNames.push(field.name);

      // Validate label
      if (!field.label || field.label.trim() === '') {
        errors.push(`Field ${index + 1}: Label is required`);
      }

      // Validate select fields have options
      if (field.type === 'select' && (!field.options || field.options.length === 0)) {
        errors.push(`Field ${index + 1} (${field.label}): Select fields must have at least one option`);
      }

      // Validate regex if provided
      if (field.validationRegex) {
        try {
          new RegExp(field.validationRegex);
        } catch (e) {
          errors.push(`Field ${index + 1} (${field.label}): Invalid regex pattern`);
        }
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Normalize file extension (ensure it starts with dot)
 */
export function normalizeFileExtension(ext: string): string {
  return ext.startsWith('.') ? ext.toLowerCase() : `.${ext.toLowerCase()}`;
}

/**
 * Get all available file extensions grouped by category
 */
export function getFileExtensionsByCategory(): Record<string, string[]> {
  return {
    Images: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif'],
    Videos: ['.mp4', '.mov', '.avi', '.webm', '.mkv'],
    Documents: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'],
    Audio: ['.mp3', '.wav', '.ogg', '.flac'],
  };
}
