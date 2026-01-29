export type CustomFieldType = 'text' | 'number' | 'date' | 'select' | 'boolean' | 'url';

export interface CustomField {
  id: string; // Unique ID for React keys
  name: string; // Field name (camelCase, used as key)
  label: string; // Display label
  type: CustomFieldType;
  required: boolean;
  options?: string[]; // For 'select' type
  validationRegex?: string; // Optional regex pattern
  placeholder?: string; // Optional placeholder text
}

export interface DimensionConstraints {
  enabled: boolean;
  aspectRatio: {
    label: string;
    value: number | null;
  };
  minWidth?: number;
  minHeight?: number;
}

export interface MediaType {
  id: string;
  name: string;
  description?: string;
  color: string; // Hex color code
  allowedFormats: string[]; // e.g., ['.jpg', '.png', '.webp']
  fields: CustomField[];
  defaultTags: string[]; // Tags to auto-apply when using this MediaType
  dimensionConstraints?: DimensionConstraints;
  usageCount?: number; // How many media items use this type (for display)
  createdAt: Date;
  updatedAt: Date;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
