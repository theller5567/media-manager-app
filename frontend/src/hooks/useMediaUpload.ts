import { useState, useCallback, useRef, useEffect } from 'react';
import { useMutation, useQuery, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { FilePreview, CommonFields, AISuggestions, UploadState } from '@/types/upload';
import type { MediaType } from '@/types/mediaType';
import { createFilePreview, revokePreviewUrl } from '@/lib/fileUtils';
import { validateFile } from '@/lib/cloudinary';
import { analyzeFileWithAI } from '@/lib/aiUtils';
import { normalizeFileExtension } from '@/lib/mediaTypeUtils';

const initialCommonFields: CommonFields = {
  title: '',
  description: '',
  altText: '',
  tags: [],
};

const initialAISuggestions: AISuggestions = {};

// Helper function to generate validation error messages
function getFieldValidationError(field: { name: string; label: string; type: string; required?: boolean; validationRegex?: string; placeholder?: string }, value: any): string | null {
  // Check if required field is empty
  if (field.required) {
    if (field.type === 'boolean') {
      if (value === undefined || value === null || value === '') {
        return `${field.label} is required`;
      }
    } else if (field.type === 'select') {
      if (value === undefined || value === null || value === '') {
        return `Please select a ${field.label.toLowerCase()}`;
      }
    } else {
      if (value === undefined || value === null || value === '') {
        return `${field.label} is required`;
      }
    }
  }
  
  // Check regex validation
  if (field.validationRegex && typeof value === 'string' && value !== '') {
    try {
      const regex = new RegExp(field.validationRegex);
      if (!regex.test(value)) {
        // Generate helpful message based on regex pattern
        if (field.validationRegex === '^[A-Z0-9]{8}$') {
          return `${field.label} must be exactly 8 uppercase letters or numbers (e.g., "ABCD1234")`;
        }
        // Generic regex error message
        return `${field.label} format is invalid${field.placeholder ? ` (${field.placeholder})` : ''}`;
      }
    } catch {
      // Invalid regex, skip validation
    }
  }
  
  return null;
}

export function useMediaUpload() {
  // Get Convex action for Gemini AI analysis
  // Note: useAction returns undefined if the action is not available (e.g., during initial load)
  const analyzeMediaWithGemini = useAction(api.actions.analyzeMedia.analyzeMediaWithGemini);
  
  // Log when action becomes available
  useEffect(() => {
    if (analyzeMediaWithGemini) {
      console.log('[useMediaUpload] Gemini action is now available');
    } else {
      console.warn('[useMediaUpload] Gemini action not yet available');
    }
  }, [analyzeMediaWithGemini]);

  const [state, setState] = useState<UploadState>({
    step: 0,
    files: [],
    selectedMediaType: null,
    useAI: false,
    aiProcessing: false,
    aiSuggestions: initialAISuggestions,
    commonFields: initialCommonFields,
    perFileFields: {},
    relatedFiles: [],
    perFileRelatedFiles: {},
    errors: {},
    fieldValidationErrors: {}, // Per-file, per-field validation errors: Record<fileId, Record<fieldName, string[]>>
    uploading: false,
    uploadProgress: {},
  });

  const addFiles = useCallback(async (files: File[]) => {
    const newPreviews: FilePreview[] = [];
    const errors: Record<string, string[]> = {};

    for (const file of files) {
      const validation = validateFile(file);
      if (!validation.isValid) {
        errors[file.name] = validation.errors;
        continue;
      }

      try {
        const preview = await createFilePreview(file);
        newPreviews.push(preview);
      } catch (error) {
        errors[file.name] = [error instanceof Error ? error.message : 'Failed to create preview'];
      }
    }

    setState((prev) => ({
      ...prev,
      files: [...prev.files, ...newPreviews],
      errors: { ...prev.errors, ...errors },
    }));
  }, []);

  const removeFile = useCallback((fileId: string) => {
    setState((prev) => {
      const file = prev.files.find((f) => f.id === fileId);
      if (file) {
        revokePreviewUrl(file.preview);
      }

      const newFiles = prev.files.filter((f) => f.id !== fileId);
      const newPerFileFields = { ...prev.perFileFields };
      delete newPerFileFields[fileId];

      const newErrors = { ...prev.errors };
      delete newErrors[fileId];

      return {
        ...prev,
        files: newFiles,
        perFileFields: newPerFileFields,
        errors: newErrors,
      };
    });
  }, []);

  const processAI = useCallback(async () => {
    setState((prev) => {
      if (!prev.useAI || !prev.selectedMediaType || prev.files.length === 0) {
        return prev;
      }

      // Start AI processing asynchronously
      (async () => {
        try {
          // Get current state snapshot
          const currentState = { ...prev };
          
          // Process first file for common fields (all files get same common fields)
          const firstFile = currentState.files[0];
          
          // Pass the Convex action directly to analyzeFileWithAI
          // analyzeMediaWithGemini may be undefined initially, so pass it conditionally
          console.log('[useMediaUpload] processAI called, analyzeMediaWithGemini available:', !!analyzeMediaWithGemini);
          const suggestions = await analyzeFileWithAI(
            firstFile.file, 
            currentState.selectedMediaType!,
            analyzeMediaWithGemini ?? undefined
          );

          // Apply MediaType default tags
          if (currentState.selectedMediaType!.defaultTags && currentState.selectedMediaType!.defaultTags.length > 0) {
            suggestions.tags = [
              ...(suggestions.tags || []),
              ...currentState.selectedMediaType!.defaultTags,
            ];
            suggestions.tags = [...new Set(suggestions.tags)]; // Remove duplicates
          }

          setState((latest) => ({
            ...latest,
            aiProcessing: false,
            aiSuggestions: suggestions,
            commonFields: {
              title: suggestions.title || latest.commonFields.title,
              description: suggestions.description || latest.commonFields.description,
              altText: suggestions.altText || latest.commonFields.altText,
              tags: suggestions.tags || latest.commonFields.tags,
            },
          }));
        } catch (error) {
          setState((current) => ({
            ...current,
            aiProcessing: false,
            errors: {
              ...current.errors,
              ai: [
                error instanceof Error 
                  ? error.message.includes('API key') 
                    ? 'AI service configuration error. Please check your API key.'
                    : error.message.includes('quota') || error.message.includes('rate limit')
                    ? 'AI service quota exceeded. Please try again later.'
                    : error.message.includes('too large')
                    ? 'File is too large for AI analysis. Maximum size is 20MB.'
                    : `AI processing failed: ${error.message}`
                  : 'AI processing failed. Please try again.',
              ],
            },
          }));
        }
      })();

      return { ...prev, aiProcessing: true };
    });
  }, [analyzeMediaWithGemini]);

  const setMediaType = useCallback((mediaType: MediaType | null) => {
    setState((prev) => {
      const newState = { ...prev, selectedMediaType: mediaType };
      
      // If AI is enabled and MediaType is selected, trigger AI processing
      if (prev.useAI && mediaType) {
        setTimeout(() => processAI(), 0);
      }
      
      return newState;
    });
  }, [processAI]);

  const setUseAI = useCallback((useAI: boolean) => {
    setState((prev) => {
      const newState = { ...prev, useAI };
      
      // If enabling AI and MediaType is selected, trigger AI processing
      if (useAI && prev.selectedMediaType) {
        setTimeout(() => processAI(), 0);
      }
      
      return newState;
    });
  }, [processAI]);

  const setCommonFields = useCallback((fields: Partial<CommonFields>) => {
    setState((prev) => ({
      ...prev,
      commonFields: {
        ...prev.commonFields,
        ...fields,
      },
    }));
  }, []);

  const setPerFileField = useCallback((fileId: string, fieldName: string, value: any) => {
    setState((prev) => {
      const newPerFileFields = {
        ...prev.perFileFields,
        [fileId]: {
          ...prev.perFileFields[fileId],
          [fieldName]: value,
        },
      };
      
      // Clear validation error for this field when user types
      const newFieldValidationErrors = { ...prev.fieldValidationErrors };
      if (newFieldValidationErrors[fileId]) {
        newFieldValidationErrors[fileId] = {
          ...newFieldValidationErrors[fileId],
          [fieldName]: [], // Clear errors for this field
        };
        // Remove file entry if no errors remain
        if (Object.values(newFieldValidationErrors[fileId]).every(errors => errors.length === 0)) {
          delete newFieldValidationErrors[fileId];
        }
      }
      
      return {
        ...prev,
        perFileFields: newPerFileFields,
        fieldValidationErrors: newFieldValidationErrors,
      };
    });
  }, []);

  const setRelatedFiles = useCallback((files: string[]) => {
    setState((prev) => ({
      ...prev,
      relatedFiles: files,
    }));
  }, []);

  const setPerFileRelatedFiles = useCallback((fileId: string, files: string[]) => {
    setState((prev) => ({
      ...prev,
      perFileRelatedFiles: {
        ...prev.perFileRelatedFiles,
        [fileId]: files,
      },
    }));
  }, []);

  // Use a ref to always read the latest state for validation
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Separate function to update validation errors (called from event handlers, not during render)
  const updateValidationErrors = useCallback((errors: Record<string, Record<string, string[]>>) => {
    setState((prev) => {
      // Only update if errors have changed
      if (JSON.stringify(prev.fieldValidationErrors) !== JSON.stringify(errors)) {
        return {
          ...prev,
          fieldValidationErrors: errors,
        };
      }
      return prev;
    });
  }, []);

  const validateStep = useCallback((step: number, updateErrors: boolean = false): boolean => {
    // Always read from the ref to get the latest state
    const currentState = stateRef.current;
    
    const validateStepInternal = (stepNum: number): boolean => {
      switch (stepNum) {
        case 0: // Step 1: Files + MediaType
          return currentState.files.length > 0 && currentState.files.every((f) => !currentState.errors[f.id] || currentState.errors[f.id].length === 0);
        
        case 1: // Step 2: Common Fields
          return !!(
            currentState.commonFields.title.trim() &&
            currentState.commonFields.description.trim() &&
            currentState.commonFields.altText.trim() &&
            currentState.commonFields.tags.length > 0
          );
        
        case 2: // Step 3: Per-File Custom Fields
          if (!currentState.selectedMediaType) {
            return true; // No MediaType = no custom fields required
          }
          
          const requiredFields = currentState.selectedMediaType.fields.filter((f) => f.required);
          
          if (requiredFields.length === 0) {
            return true;
          }
          
          // Build validation errors object
          const newFieldValidationErrors: Record<string, Record<string, string[]>> = {};
          let step2Result = true;
          
          currentState.files.forEach((file) => {
            const fileFields = currentState.perFileFields[file.id] || {};
            const fileErrors: Record<string, string[]> = {};
            
            requiredFields.forEach((field) => {
              const value = fileFields[field.name];
              const error = getFieldValidationError(field, value);
              
              if (error) {
                fileErrors[field.name] = [error];
                step2Result = false;
              }
            });
            
            if (Object.keys(fileErrors).length > 0) {
              newFieldValidationErrors[file.id] = fileErrors;
            }
          });
          
          // Only update validation errors if explicitly requested (from event handlers, not during render)
          if (updateErrors) {
            updateValidationErrors(newFieldValidationErrors);
          }
          
          return step2Result;
        
        case 3: // Step 4: Related Files (optional)
          return true;
        
        case 4: // Step 5: Review
          // Validate all previous steps
          return validateStepInternal(0) && validateStepInternal(1) && validateStepInternal(2) && validateStepInternal(3);
        
        default:
          return true;
      }
    };
    
    return validateStepInternal(step);
  }, [updateValidationErrors]);

  const nextStep = useCallback(() => {
    // Use ref to get latest state for validation
    const currentState = stateRef.current;
    const isValid = validateStep(currentState.step, true);
    if (isValid) {
      setState((prev) => ({
        ...prev,
        step: Math.min(prev.step + 1, 4),
      }));
    }
  }, [validateStep]);

  const previousStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      step: Math.max(prev.step - 1, 0),
    }));
  }, []);

  const goToStep = useCallback((step: number) => {
    setState((prev) => {
      // Can only go to completed steps or next sequential step
      const completedSteps = new Set<number>();
      for (let i = 0; i < step; i++) {
        // Use a closure-safe validateStep call
        const isValid = (() => {
          switch (i) {
            case 0: return prev.files.length > 0 && prev.selectedMediaType !== null;
            case 1: {
              const hasTitle = prev.commonFields.title.trim() !== '';
              const hasDescription = prev.commonFields.description.trim() !== '';
              const hasAltText = prev.commonFields.altText.trim() !== '';
              const hasTags = prev.commonFields.tags.length > 0;
              return hasTitle && hasDescription && hasAltText && hasTags;
            }
            case 2: {
              if (!prev.selectedMediaType) return true;
              const requiredFields = prev.selectedMediaType.fields.filter((f) => f.required);
              if (requiredFields.length === 0) return true;
              return prev.files.every((file) => {
                const fileFields = prev.perFileFields[file.id] || {};
                return requiredFields.every((field) => {
                  const value = fileFields[field.name];
                  if (field.type === 'boolean') {
                    return value !== undefined && value !== null && value !== '';
                  }
                  if (field.type === 'select') {
                    return value !== undefined && value !== null && value !== '';
                  }
                  if (value === undefined || value === null || value === '') return false;
                  if (field.validationRegex && typeof value === 'string') {
                    try {
                      const regex = new RegExp(field.validationRegex);
                      return regex.test(value);
                    } catch {
                      return true;
                    }
                  }
                  return true;
                });
              });
            }
            case 3: return true;
            case 4: return true;
            default: return false;
          }
        })();
        if (isValid) {
          completedSteps.add(i);
        }
      }
      
      // Can only go to completed steps or next sequential step
      if (completedSteps.has(step) || step === prev.step + 1) {
        return {
          ...prev,
          step,
        };
      }
      return prev;
    });
  }, []);

  const createMedia = useMutation(api.mutations.media.create);

  const submitUpload = useCallback(async (onProgress?: (fileId: string, progress: number) => void): Promise<any[]> => {
    let currentState: UploadState;
    
    setState((prev) => {
      currentState = prev;
      return { ...prev, uploading: true, uploadProgress: {} };
    });

    const { uploadFile } = await import('@/lib/cloudinary');
    const uploadedItems: any[] = [];

    try {
      for (let i = 0; i < currentState!.files.length; i++) {
        const filePreview = currentState!.files[i];
        try {
          const result = await uploadFile(filePreview.file, (progress) => {
            setState((prev) => ({
              ...prev,
              uploadProgress: {
                ...prev.uploadProgress,
                [filePreview.id]: progress,
              },
            }));
            if (onProgress) {
              onProgress(filePreview.id, progress);
            }
          });

          // Extract format from filename
          const format = filePreview.file.name.split('.').pop() || 'unknown';
          
          // Create media item in Convex
          const mediaDoc = await createMedia({
            cloudinaryPublicId: result.publicId,
            cloudinarySecureUrl: result.secureUrl,
            filename: filePreview.file.name,
            thumbnail: filePreview.preview || result.secureUrl,
            mediaType: filePreview.type as any,
            customMediaTypeId: currentState!.selectedMediaType?.id,
            title: currentState!.files.length > 1 
              ? `${currentState!.commonFields.title} ${i + 1}`
              : currentState!.commonFields.title,
            description: currentState!.commonFields.description,
            altText: currentState!.commonFields.altText,
            fileSize: filePreview.size,
            format,
            width: result.width,
            height: result.height,
            duration: result.duration,
            tags: currentState!.commonFields.tags,
            relatedFiles: currentState!.relatedFiles,
            customMetadata: currentState!.perFileFields[filePreview.id] || {},
            aiGenerated: currentState!.useAI,
            dateModified: Date.now(),
            isMockData: false,
          });

          // Convert Convex document to MediaItem format
          if (!mediaDoc) {
            throw new Error('Failed to create media item: document not returned from database');
          }

          const mediaItem = {
            id: String(mediaDoc._id), // Convert Convex ID to string
            filename: mediaDoc.filename,
            thumbnail: mediaDoc.thumbnail,
            mediaType: mediaDoc.mediaType,
            customMediaTypeId: mediaDoc.customMediaTypeId,
            title: mediaDoc.title,
            description: mediaDoc.description,
            altText: mediaDoc.altText,
            fileSize: mediaDoc.fileSize,
            tags: mediaDoc.tags,
            dateModified: new Date(mediaDoc.dateModified),
            relatedFiles: mediaDoc.relatedFiles,
            customMetadata: mediaDoc.customMetadata,
            aiGenerated: mediaDoc.aiGenerated,
          };

          uploadedItems.push(mediaItem);
        } catch (error) {
          setState((prev) => ({
            ...prev,
            errors: {
              ...prev.errors,
              [filePreview.id]: [error instanceof Error ? error.message : 'Upload failed'],
            },
          }));
        }
      }

      setState((prev) => ({ ...prev, uploading: false }));
      return uploadedItems;
    } catch (error) {
      setState((prev) => ({ ...prev, uploading: false }));
      throw error;
    }
  }, [createMedia]);

  const reset = useCallback(() => {
    setState((prev) => {
      // Clean up preview URLs
      prev.files.forEach((file) => {
        revokePreviewUrl(file.preview);
      });

      return {
        step: 0,
        files: [],
        selectedMediaType: null,
        useAI: false,
        aiProcessing: false,
        aiSuggestions: initialAISuggestions,
        commonFields: initialCommonFields,
        perFileFields: {},
        relatedFiles: [],
        perFileRelatedFiles: {},
        errors: {},
        fieldValidationErrors: {},
        uploading: false,
        uploadProgress: {},
      };
    });
  }, []);

  // Fetch all MediaTypes from Convex
  const allMediaTypesData = useQuery(api.queries.mediaTypes.list);
  
  const getFilteredMediaTypes = useCallback((): MediaType[] => {
    if (state.files.length === 0 || !allMediaTypesData) return [];

    const fileExtensions = state.files.map((f) => normalizeFileExtension(f.extension));
    // Convert Convex documents to MediaType format
    const allMediaTypes: MediaType[] = allMediaTypesData.map((mt) => ({
      ...mt,
      id: mt._id,
      createdAt: new Date(mt.createdAt), // Convert number to Date object
      updatedAt: new Date(mt.updatedAt), // Convert number to Date object
    }));

    return allMediaTypes.filter((mt) => {
      return fileExtensions.some((ext) => mt.allowedFormats.includes(ext));
    });
  }, [state.files, allMediaTypesData]);

  const clearAISuggestions = useCallback(() => {
    setState((prev) => ({
      ...prev,
      aiSuggestions: initialAISuggestions,
    }));
  }, []);

  return {
    ...state,
    addFiles,
    removeFile,
    setMediaType,
    setUseAI,
    processAI,
    setCommonFields,
    setPerFileField,
    setRelatedFiles,
    setPerFileRelatedFiles,
    validateStep,
    nextStep,
    previousStep,
    goToStep,
    submitUpload,
    reset,
    getFilteredMediaTypes,
    clearAISuggestions,
  };
}
