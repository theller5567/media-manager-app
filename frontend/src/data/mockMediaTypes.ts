import type { MediaType, CustomField } from '@/types/mediaType';
import { generateFieldId } from '@/lib/mediaTypeUtils';
import { mockMediaData } from './mockMediaData';

// Helper function to create initial MediaTypes with proper field IDs
function createInitialMediaTypes(): MediaType[] {
  return [
    {
      id: '1',
      name: 'Product Image',
      description: 'Images for product catalogs and e-commerce',
      color: '#3b82f6',
      allowedFormats: ['.jpg', '.png', '.webp'],
      fields: [
        {
          id: generateFieldId(),
          name: 'sku',
          label: 'SKU',
          type: 'text',
          required: true,
          validationRegex: '^[A-Z0-9]{8}$',
          placeholder: 'Enter 8-character SKU',
        },
        {
          id: generateFieldId(),
          name: 'productCategory',
          label: 'Product Category',
          type: 'select',
          required: true,
          options: ['Clothing', 'Electronics', 'Home'],
        },
        {
          id: generateFieldId(),
          name: 'photographer',
          label: 'Photographer',
          type: 'text',
          required: false,
          placeholder: 'Photographer name',
        },
        {
          id: generateFieldId(),
          name: 'shootDate',
          label: 'Shoot Date',
          type: 'date',
          required: false,
        },
      ],
      defaultTags: ['product', 'catalog'],
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
    },
    {
      id: '2',
      name: 'Webinar Video',
      description: 'Recorded webinar sessions and presentations',
      color: '#ef4444',
      allowedFormats: ['.mp4', '.mov'],
      fields: [
        {
          id: generateFieldId(),
          name: 'speakerName',
          label: 'Speaker Name',
          type: 'text',
          required: true,
          placeholder: 'Enter speaker name',
        },
        {
          id: generateFieldId(),
          name: 'webinarDate',
          label: 'Webinar Date',
          type: 'date',
          required: true,
        },
        {
          id: generateFieldId(),
          name: 'quality',
          label: 'Quality',
          type: 'select',
          required: false,
          options: ['HD', '4K'],
        },
        {
          id: generateFieldId(),
          name: 'ctaLink',
          label: 'CTA Link',
          type: 'url',
          required: false,
          placeholder: 'https://example.com',
        },
      ],
      defaultTags: ['webinar', 'video', 'education'],
      createdAt: new Date('2024-01-02T00:00:00Z'),
      updatedAt: new Date('2024-01-02T00:00:00Z'),
    },
  ];
}

// In-memory store for MediaTypes
let mediaTypesStore: MediaType[] = createInitialMediaTypes();

/**
 * Get all MediaTypes
 */
export function getAllMediaTypes(): MediaType[] {
  return [...mediaTypesStore];
}

/**
 * Get MediaType by ID
 */
export function getMediaTypeById(id: string): MediaType | undefined {
  return mediaTypesStore.find((mt) => mt.id === id);
}

/**
 * Get MediaType by name (case-insensitive)
 */
export function getMediaTypeByName(name: string): MediaType | undefined {
  return mediaTypesStore.find((mt) => mt.name.toLowerCase() === name.toLowerCase());
}

/**
 * Create a new MediaType
 */
export function createMediaType(
  data: Omit<MediaType, 'id' | 'createdAt' | 'updatedAt'>
): MediaType {
  const now = new Date();
  const newMediaType: MediaType = {
    ...data,
    id: `mediatype_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: now,
    updatedAt: now,
  };

  mediaTypesStore.push(newMediaType);
  return { ...newMediaType };
}

/**
 * Update an existing MediaType
 */
export function updateMediaType(id: string, data: Partial<MediaType>): MediaType {
  const index = mediaTypesStore.findIndex((mt) => mt.id === id);
  if (index === -1) {
    throw new Error(`MediaType with id ${id} not found`);
  }

  const updatedMediaType: MediaType = {
    ...mediaTypesStore[index],
    ...data,
    id, // Ensure ID doesn't change
    updatedAt: new Date(),
  };

  mediaTypesStore[index] = updatedMediaType;
  return { ...updatedMediaType };
}

/**
 * Delete a MediaType
 */
export function deleteMediaType(id: string): boolean {
  const index = mediaTypesStore.findIndex((mt) => mt.id === id);
  if (index === -1) {
    return false;
  }

  mediaTypesStore.splice(index, 1);
  return true;
}

/**
 * Get usage count for a MediaType (how many media items use this type)
 * For now, checks mockMediaData. In future, this would query Convex.
 */
export function getMediaTypeUsageCount(id: string): number {
  // TODO: When Convex is integrated, query media table for items with this mediaTypeId
  // For now, return 0 as mockMediaData doesn't have mediaTypeId references yet
  return 0;
}

/**
 * Get usage counts for all MediaTypes
 */
export function getAllMediaTypeUsageCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  mediaTypesStore.forEach((mt) => {
    counts[mt.id] = getMediaTypeUsageCount(mt.id);
  });
  return counts;
}

/**
 * Reset store to initial state (useful for testing)
 */
export function resetMediaTypesStore(): void {
  mediaTypesStore = createInitialMediaTypes();
}
