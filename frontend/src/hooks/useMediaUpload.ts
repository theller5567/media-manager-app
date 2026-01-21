import { useState, useCallback, useRef, useEffect } from 'react';
import { useMutation, useQuery, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { FilePreview, CommonFields, AISuggestions, UploadState } from '@/types/upload';
import type { MediaType } from '@/types/mediaType';
import { createFilePreview, revokePreviewUrl } from '@/lib/fileUtils';
import { validateFile, generateVideoThumbnailUrl } from '@/lib/cloudinary';
import { analyzeFileWithAI, isFileTooLargeForAI, MAX_FILE_SIZE_FOR_AI } from '@/lib/aiUtils';
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
    // useAction returns a function, so it's always defined (never undefined)
    // We can't check if it's available until we try to call it
    // Just log that we have the action reference
    console.log('[useMediaUpload] Gemini action reference available');
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
  
  // Track which file is currently being analyzed by AI
  const [currentAIFileName, setCurrentAIFileName] = useState<string | undefined>(undefined);
  
  // Track if real AI processing is in progress to prevent multiple calls
  const aiProcessingRef = useRef(false);
  
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
    // Use ref to prevent multiple simultaneous calls - check and set atomically
    // This must be synchronous to prevent race conditions
    if (aiProcessingRef.current) {
      console.log('[useMediaUpload] processAI already in progress, skipping duplicate call', new Error().stack);
      return;
    }
    
    // Immediately set ref to prevent other calls (atomic operation)
    // We'll reset it if conditions aren't met
    aiProcessingRef.current = true;
    console.log('[useMediaUpload] processAI starting, ref set to true');
    
    setState((prev) => {
      // Check conditions inside setState to get latest state
      if (!prev.useAI || !prev.selectedMediaType || prev.files.length === 0 || prev.aiProcessing) {
        // Reset ref if conditions aren't met
        aiProcessingRef.current = false;
        return prev;
      }

      // Start AI processing asynchronously
      (async () => {
        try {
          // Get current state snapshot
          const currentState = { ...prev };
          
          // Process first file for common fields (all files get same common fields)
          const firstFile = currentState.files[0];
          
          // Set current file being analyzed
          setCurrentAIFileName(firstFile.file.name);
          
          // Pass the Convex action directly to analyzeFileWithAI
          // analyzeMediaWithGemini may be undefined initially, so pass it conditionally
          console.log('[useMediaUpload] processAI called, analyzeMediaWithGemini available:', !!analyzeMediaWithGemini);
          const suggestions = await analyzeFileWithAI(
            firstFile.file, 
            currentState.selectedMediaType!,
            analyzeMediaWithGemini ?? undefined
          );
          
          // Clear current file name after analysis completes
          setCurrentAIFileName(undefined);

          // Apply MediaType default tags
          if (currentState.selectedMediaType!.defaultTags && currentState.selectedMediaType!.defaultTags.length > 0) {
            suggestions.tags = [
              ...(suggestions.tags || []),
              ...currentState.selectedMediaType!.defaultTags,
            ];
            suggestions.tags = [...new Set(suggestions.tags)]; // Remove duplicates
          }

          setState((latest) => {
            // Only update fields if they have actual values from AI
            // Use nullish coalescing to distinguish between empty string and undefined/null
            const newCommonFields = { ...latest.commonFields };
            
            if (suggestions.title !== undefined && suggestions.title !== null && suggestions.title !== '') {
              newCommonFields.title = suggestions.title;
            }
            if (suggestions.description !== undefined && suggestions.description !== null && suggestions.description !== '') {
              newCommonFields.description = suggestions.description;
            }
            if (suggestions.altText !== undefined && suggestions.altText !== null && suggestions.altText !== '') {
              newCommonFields.altText = suggestions.altText;
            }
            if (suggestions.tags !== undefined && suggestions.tags !== null && suggestions.tags.length > 0) {
              newCommonFields.tags = [...suggestions.tags];
            }
            
            console.log('[useMediaUpload] Updating commonFields with AI suggestions:', {
              before: latest.commonFields,
              suggestions,
              after: newCommonFields,
            });
            
            return {
              ...latest,
              aiProcessing: false,
              aiSuggestions: suggestions,
              commonFields: newCommonFields,
            };
          });
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
                    : error.message.includes('too large') || error.message.includes('arguments size is too large') || error.message.includes('5 MiB limit')
                    ? 'File is too large for AI analysis. Files larger than ~3.75MB cannot be analyzed due to technical limits. Basic metadata will be generated instead.'
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
      // Only trigger if not already processing to prevent multiple calls
      if (prev.useAI && mediaType && !prev.aiProcessing && !aiProcessingRef.current) {
        // Check ref again inside setTimeout to prevent race conditions
        setTimeout(() => {
          if (!aiProcessingRef.current) {
            processAI();
          }
        }, 0);
      }
      
      return newState;
    });
  }, [processAI]);

  const setUseAI = useCallback((useAI: boolean) => {
    setState((prev) => {
      const newState = { ...prev, useAI };
      
      // If enabling AI and MediaType is selected, trigger AI processing
      // Only trigger if not already processing to prevent multiple calls
      if (useAI && prev.selectedMediaType && !prev.aiProcessing && !aiProcessingRef.current) {
        // Check ref again inside setTimeout to prevent race conditions
        setTimeout(() => {
          if (!aiProcessingRef.current) {
            processAI();
          }
        }, 0);
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

    const { uploadFile, uploadThumbnail } = await import('@/lib/cloudinary');
    const uploadedItems: any[] = [];

    try {
      for (let i = 0; i < currentState!.files.length; i++) {
        const filePreview = currentState!.files[i];
        try {
          let thumbnailUrl = '';
          
          // For video files, upload thumbnail first (before video upload) for better UX
          if (filePreview.type === 'video' && filePreview.thumbnailFile) {
            console.log(`[Video Upload] Starting thumbnail upload for ${filePreview.file.name}`, {
              thumbnailFile: filePreview.thumbnailFile.name,
              thumbnailSize: filePreview.thumbnailFile.size,
            });
            try {
              const thumbnailResult = await uploadThumbnail(filePreview.thumbnailFile, (progress) => {
                // Track thumbnail upload progress (0-50% of total progress for this file)
                setState((prev) => ({
                  ...prev,
                  uploadProgress: {
                    ...prev.uploadProgress,
                    [filePreview.id]: Math.floor(progress * 0.5), // Thumbnail is 50% of progress
                  },
                }));
                if (onProgress) {
                  onProgress(filePreview.id, Math.floor(progress * 0.5));
                }
              });
              thumbnailUrl = thumbnailResult.secureUrl;
              console.log(`[Video Upload] Thumbnail uploaded successfully:`, {
                thumbnailUrl,
                publicId: thumbnailResult.publicId,
              });
              
              // Revoke thumbnail preview blob URL after successful upload
              if (filePreview.preview && filePreview.preview.startsWith('blob:')) {
                revokePreviewUrl(filePreview.preview);
              }
            } catch (error) {
              // If thumbnail upload fails, fallback to Cloudinary's automatic thumbnail
              console.warn('[Video Upload] Thumbnail upload failed, falling back to Cloudinary automatic thumbnail:', error);
              // Will set thumbnailUrl below using generateVideoThumbnailUrl
            }
          } else if (filePreview.type === 'video') {
            console.warn(`[Video Upload] No thumbnailFile found for ${filePreview.file.name} - thumbnail extraction may have failed`);
          }
          
          // Upload the main file
          const result = await uploadFile(filePreview.file, (progress) => {
            // For video files with thumbnail, video upload is 50-100% of progress
            // For other files, it's 0-100%
            const baseProgress = filePreview.type === 'video' && filePreview.thumbnailFile ? 50 : 0;
            const adjustedProgress = baseProgress + Math.floor(progress * (filePreview.type === 'video' && filePreview.thumbnailFile ? 0.5 : 1));
            
            setState((prev) => ({
              ...prev,
              uploadProgress: {
                ...prev.uploadProgress,
                [filePreview.id]: adjustedProgress,
              },
            }));
            if (onProgress) {
              onProgress(filePreview.id, adjustedProgress);
            }
          });

          // Extract format from filename
          const format = filePreview.file.name.split('.').pop() || 'unknown';
          
          // Generate thumbnail URL from Cloudinary (not blob URL)
          // Blob URLs are temporary and don't work after navigation
          if (!thumbnailUrl) {
            if (filePreview.type === 'image') {
              // For images, use the secureUrl directly (Cloudinary serves optimized images)
              thumbnailUrl = result.secureUrl;
            } else if (filePreview.type === 'video') {
              // For videos, try to generate thumbnail from video frame (fallback)
              // Cloudinary video URLs can have .jpg appended for thumbnails
              try {
                thumbnailUrl = generateVideoThumbnailUrl(result.publicId, { width: 300, height: 300, crop: 'fill' });
              } catch (error) {
                // Fallback to secureUrl if thumbnail generation fails
                thumbnailUrl = result.secureUrl;
              }
            } else {
              // For other types, use empty string (will show icon instead)
              thumbnailUrl = '';
            }
          }
          
          // Revoke the blob URL since we're using Cloudinary URL instead
          if (filePreview.preview && filePreview.preview.startsWith('blob:')) {
            revokePreviewUrl(filePreview.preview);
          }
          
          // Only set thumbnail for image files, or if we have a valid thumbnail URL
          // For audio/video/document files, don't use the file URL as thumbnail
          const finalThumbnail = filePreview.type === 'image' 
            ? (thumbnailUrl || result.secureUrl)
            : (thumbnailUrl || ''); // Empty string for non-image files without thumbnails
          
          // Create media item in Convex
          const mediaDoc = await createMedia({
            cloudinaryPublicId: result.publicId,
            cloudinarySecureUrl: result.secureUrl,
            filename: filePreview.file.name,
            thumbnail: finalThumbnail,
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
    setCurrentAIFileName(undefined);
    aiProcessingRef.current = false; // Reset processing flag
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

  // Check if any files are too large for AI analysis
  const filesTooLargeForAI = state.files.some(file => isFileTooLargeForAI(file.file));
  const aiDisabledReason = filesTooLargeForAI 
    ? `One or more files exceed ${(MAX_FILE_SIZE_FOR_AI / 1024 / 1024).toFixed(1)}MB and cannot be analyzed with AI due to technical limits. Basic metadata will be generated instead.`
    : null;

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
    filesTooLargeForAI,
    aiDisabledReason,
    currentAIFileName,
  };
}
