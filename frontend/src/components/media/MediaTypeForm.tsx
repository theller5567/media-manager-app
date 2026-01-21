import { useState, useEffect, useMemo } from 'react';
import { X, Eye, FileText, File, Settings, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { MediaType, CustomField } from '@/types/mediaType';
import { validateMediaType, validateFieldName } from '@/lib/mediaTypeUtils';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { FormatSelector } from './FormatSelector';
import { FieldBuilder } from './FieldBuilder';
import { Badge } from '@/components/ui/Badge';
import { StepIndicator, type Step } from '@/components/ui/StepIndicator';
import { twMerge } from 'tailwind-merge';

interface MediaTypeFormProps {
  mediaType?: MediaType;
  onSubmit: (data: Omit<MediaType, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  availableTags: string[];
}

const STEPS: Step[] = [
  {
    id: 'basic',
    title: 'Basic Information',
    description: 'Name, description, and color',
    icon: FileText,
  },
  {
    id: 'formats',
    title: 'Format Restrictions',
    description: 'Allowed file formats',
    icon: File,
  },
  {
    id: 'fields',
    title: 'Custom Fields',
    description: 'Define metadata fields',
    icon: Settings,
  },
  {
    id: 'tags',
    title: 'Default Tags',
    description: 'Auto-applied tags',
    icon: Tag,
  },
  {
    id: 'review',
    title: 'Review',
    description: 'Review your MediaType',
    icon: Eye,
  }
];

export function MediaTypeForm({
  mediaType,
  onSubmit,
  onCancel,
  availableTags,
}: MediaTypeFormProps) {
  const [name, setName] = useState(mediaType?.name || '');
  const [description, setDescription] = useState(mediaType?.description || '');
  const [color, setColor] = useState(mediaType?.color || '#3b82f6');
  const [allowedFormats, setAllowedFormats] = useState<string[]>(
    mediaType?.allowedFormats || []
  );
  const [fields, setFields] = useState<CustomField[]>(mediaType?.fields || []);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    mediaType?.defaultTags || []
  );
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(true);
  
  // Step management
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [stepErrors, setStepErrors] = useState<Record<number, string[]>>({});

  // Fetch MediaTypes from Convex
  const mediaTypesData = useQuery(api.queries.mediaTypes.list);
  const existingMediaTypes = useMemo(() => {
    if (!mediaTypesData) return [];
    return mediaTypesData.map((mt: any) => ({
      ...mt,
      id: mt._id,
      createdAt: new Date(mt.createdAt), // Convert number to Date object
      updatedAt: new Date(mt.updatedAt), // Convert number to Date object
    }));
  }, [mediaTypesData]);

  useEffect(() => {
    if (mediaType) {
      setName(mediaType.name);
      setDescription(mediaType.description || '');
      setColor(mediaType.color);
      setAllowedFormats(mediaType.allowedFormats);
      setFields(mediaType.fields);
      setSelectedTags(mediaType.defaultTags);
      // Mark all steps as completed when editing
      setCompletedSteps(new Set([0, 1, 2, 3, 4]));
    }
  }, [mediaType]);

  // Per-step validation functions
  const validateBasicInfo = (): string[] => {
    const errors: string[] = [];
    if (!name || name.trim() === '') {
      errors.push('Name is required');
    }
    if (!color || !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
      errors.push('Valid hex color is required');
    }
    return errors;
  };

  const validateFormats = (): string[] => {
    const errors: string[] = [];
    if (!allowedFormats || allowedFormats.length === 0) {
      errors.push('At least one file format must be selected');
    }
    return errors;
  };

  const validateFields = (): string[] => {
    const errors: string[] = [];
    const fieldNames: string[] = [];
    
    fields.forEach((field, index) => {
      if (!field.name || field.name.trim() === '') {
        errors.push(`Field ${index + 1}: Name is required`);
        return;
      }
      
      const nameValidation = validateFieldName(field.name, fieldNames);
      if (!nameValidation.isValid) {
        errors.push(...nameValidation.errors.map(err => `Field ${index + 1}: ${err}`));
      }
      fieldNames.push(field.name);

      if (!field.label || field.label.trim() === '') {
        errors.push(`Field ${index + 1}: Label is required`);
      }

      if (field.type === 'select' && (!field.options || field.options.length === 0)) {
        errors.push(`Field ${index + 1} (${field.label}): Select fields must have at least one option`);
      }
    });
    
    return errors;
  };

  const validateTags = (): string[] => {
    // Tags are optional, no validation needed
    return [];
  };

  // Check if step is complete
  const checkStepCompletion = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0:
        return name.trim() !== '' && /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
      case 1:
        return allowedFormats.length > 0;
      case 2:
        if (fields.length === 0) return true; // Optional step
        return fields.every(f => 
          f.name.trim() !== '' && 
          f.label.trim() !== '' &&
          (f.type !== 'select' || (f.options && f.options.length > 0))
        );
      case 3:
        return true; // Always complete (optional step)
      case 4:
        return true; // Review step is always accessible
      default:
        return false;
    }
  };

  // Update completed steps when form data changes
  useEffect(() => {
    const newCompleted = new Set<number>();
    for (let i = 0; i < STEPS.length; i++) {
      if (checkStepCompletion(i)) {
        newCompleted.add(i);
      }
    }
    setCompletedSteps(newCompleted);
  }, [name, color, allowedFormats, fields]);

  const canNavigateToStep = (stepIndex: number): boolean => {
    return completedSteps.has(stepIndex) || stepIndex === currentStep + 1;
  };

  const handleStepClick = (stepIndex: number) => {
    if (!canNavigateToStep(stepIndex)) return;

    // Don't allow clicking on the review step if we're not ready
    // User must use Next button to reach review step
    if (stepIndex === STEPS.length - 1 && currentStep < STEPS.length - 2) {
      // Only allow direct navigation to review if all previous steps are completed
      const allPreviousStepsComplete = Array.from({ length: STEPS.length - 1 }, (_, i) => i)
        .every(step => completedSteps.has(step));
      if (!allPreviousStepsComplete) {
        return;
      }
    }

    // Validate current step before navigating away
    if (stepIndex !== currentStep) {
      const currentErrors = validateCurrentStep();
      if (currentErrors.length > 0) {
        setStepErrors({ ...stepErrors, [currentStep]: currentErrors });
        return;
      }
    }

    setCurrentStep(stepIndex);
    // Clear errors for the step we're navigating to
    const newStepErrors = { ...stepErrors };
    newStepErrors[stepIndex] = [];
    setStepErrors(newStepErrors);
  };

  const validateCurrentStep = (): string[] => {
    switch (currentStep) {
      case 0:
        return validateBasicInfo();
      case 1:
        return validateFormats();
      case 2:
        return validateFields();
      case 3:
        return validateTags();
      default:
        return [];
    }
  };

  const handleNext = (e?: React.MouseEvent) => {
    // Prevent form submission if event is provided
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const currentErrors = validateCurrentStep();
    if (currentErrors.length > 0) {
      setStepErrors({ ...stepErrors, [currentStep]: currentErrors });
      return;
    }

    // Mark current step as complete
    const newCompleted = new Set(completedSteps);
    newCompleted.add(currentStep);
    setCompletedSteps(newCompleted);
    setStepErrors({ ...stepErrors, [currentStep]: [] });

    // Move to next step
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = (e?: React.MouseEvent) => {
    // Prevent form submission if event is provided
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      // Clear errors for the step we're navigating to
      const newStepErrors = { ...stepErrors };
      newStepErrors[currentStep - 1] = [];
      setStepErrors(newStepErrors);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setStepErrors({});

    // Validate all steps
    const allErrors: string[] = [];
    const newStepErrors: Record<number, string[]> = {};

    for (let i = 0; i < STEPS.length; i++) {
      let stepErrors: string[] = [];
      switch (i) {
        case 0:
          stepErrors = validateBasicInfo();
          break;
        case 1:
          stepErrors = validateFormats();
          break;
        case 2:
          stepErrors = validateFields();
          break;
        case 3:
          stepErrors = validateTags();
          break;
      }
      
      if (stepErrors.length > 0) {
        newStepErrors[i] = stepErrors;
        allErrors.push(...stepErrors);
      }
    }

    if (allErrors.length > 0) {
      setStepErrors(newStepErrors);
      setErrors(allErrors);
      // Navigate to first step with errors
      const firstErrorStep = Object.keys(newStepErrors)[0];
      if (firstErrorStep) {
        setCurrentStep(parseInt(firstErrorStep));
      }
      return;
    }

    const formData: Omit<MediaType, 'id' | 'createdAt' | 'updatedAt'> = {
      name,
      description: description || undefined,
      color,
      allowedFormats,
      fields,
      defaultTags: selectedTags,
    };

    const validation = validateMediaType(
      formData,
      existingMediaTypes,
      mediaType?.id
    );

    if (!validation.isValid) {
      setErrors(validation.errors);
      // If there are validation errors, stay on review step to show them
      return;
    }

    onSubmit(formData);
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const addCustomTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !selectedTags.includes(trimmed)) {
      setSelectedTags([...selectedTags, trimmed]);
      setTagInput('');
    }
  };

  const filteredTags = useMemo(() => {
    if (!tagInput.trim()) return availableTags;
    const search = tagInput.toLowerCase();
    return availableTags.filter((tag) =>
      tag.toLowerCase().includes(search)
    );
  }, [availableTags, tagInput]);

  const renderStepContent = () => {
    const currentStepErrors = stepErrors[currentStep] || [];

    switch (currentStep) {
      case 0:
        return (
          <section className="space-y-4 p-6 rounded-md bg-slate-800 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Basic Information</h3>
              {completedSteps.has(0) && (
                <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/50">
                  Complete
                </Badge>
              )}
            </div>

            {currentStepErrors.length > 0 && (
              <div className="rounded-md bg-red-900/20 border border-red-500/50 p-3 mb-4">
                <ul className="list-disc list-inside space-y-1 text-sm text-red-300">
                  {currentStepErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">
                Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Product Image"
                required
                className="w-full h-10 rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-100 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this MediaType..."
                rows={3}
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">
                Color <span className="text-red-400">*</span>
              </label>
              <ColorPicker value={color} onChange={setColor} />
            </div>
          </section>
        );

      case 1:
        return (
          <section className="space-y-4 p-6 rounded-md bg-slate-800 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Format Restrictions <span className="text-red-400">*</span>
              </h3>
              {completedSteps.has(1) && (
                <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/50">
                  Complete
                </Badge>
              )}
            </div>

            {currentStepErrors.length > 0 && (
              <div className="rounded-md bg-red-900/20 border border-red-500/50 p-3 mb-4">
                <ul className="list-disc list-inside space-y-1 text-sm text-red-300">
                  {currentStepErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <FormatSelector
              selectedFormats={allowedFormats}
              onChange={setAllowedFormats}
            />
          </section>
        );

      case 2:
        return (
          <section className="space-y-4 p-6 rounded-md bg-slate-800 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Custom Fields</h3>
              {completedSteps.has(2) && (
                <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/50">
                  Complete
                </Badge>
              )}
            </div>

            {currentStepErrors.length > 0 && (
              <div className="rounded-md bg-red-900/20 border border-red-500/50 p-3 mb-4">
                <ul className="list-disc list-inside space-y-1 text-sm text-red-300">
                  {currentStepErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <FieldBuilder fields={fields} onChange={setFields} />
          </section>
        );

      case 3:
        return (
          <section className="space-y-4 p-6 rounded-md bg-slate-800 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Default Tags</h3>
              {completedSteps.has(3) && (
                <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/50">
                  Complete
                </Badge>
              )}
            </div>

            <p className="text-sm text-slate-400">
              Tags that will be automatically applied when uploading media with this MediaType
            </p>

            {/* Selected Tags */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className="ml-2 hover:text-red-400"
                      aria-label={`Remove ${tag}`}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Tag Input */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (filteredTags.length > 0) {
                        toggleTag(filteredTags[0]);
                        setTagInput('');
                      } else {
                        addCustomTag();
                      }
                    }
                  }}
                  placeholder="Search or add tags..."
                  className="flex-1 h-10 rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-100 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <button
                  type="button"
                  onClick={addCustomTag}
                  disabled={!tagInput.trim()}
                  className="px-4 py-2 rounded-md bg-slate-700 text-slate-200 text-sm font-medium hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add
                </button>
              </div>

              {/* Tag Suggestions */}
              {tagInput.trim() && filteredTags.length > 0 && (
                <div className="max-h-40 overflow-y-auto border border-slate-700 rounded-md bg-slate-900">
                  {filteredTags.slice(0, 10).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        toggleTag(tag);
                        setTagInput('');
                      }}
                      className={twMerge(
                        'w-full px-3 py-2 text-left text-sm hover:bg-slate-800 transition-colors',
                        selectedTags.includes(tag)
                          ? 'bg-cyan-500/20 text-cyan-300'
                          : 'text-slate-300'
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}

              {/* Available Tags */}
              {!tagInput.trim() && availableTags.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-400">Available tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.slice(0, 20).map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={twMerge(
                          'px-2 py-1 rounded text-xs border transition-colors',
                          selectedTags.includes(tag)
                            ? 'bg-cyan-500 text-white border-cyan-500'
                            : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-cyan-500'
                        )}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        );

      case 4:
        return (
          <section className="space-y-4 p-6 rounded-md bg-slate-800 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Review & Submit</h3>
              <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/50">
                Ready to Submit
              </Badge>
            </div>

            <p className="text-sm text-slate-400 mb-6">
              Please review your MediaType configuration before submitting. You can go back to any step to make changes.
            </p>

            <div className="space-y-2 grid grid-cols-1 lg:grid-cols-2 gap-2">
              {/* Basic Information Summary */}
              <div className="p-4 rounded-md bg-slate-900 border border-slate-700 col-span-2 md:col-span-1">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Basic Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 w-24">Name:</span>
                    <span className="text-slate-200 font-medium">{name || '—'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 w-24">Description:</span>
                    <span className="text-slate-200">{description || '—'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 w-24">Color:</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-6 w-6 rounded border-2 border-slate-600"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-slate-200 font-mono text-xs">{color}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Format Restrictions Summary */}
              <div className="p-4 rounded-md bg-slate-900 border border-slate-700 col-span-2 md:col-span-1">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <File className="h-4 w-4" />
                  Format Restrictions
                </h4>
                <div className="flex flex-wrap gap-2">
                  {allowedFormats.length > 0 ? (
                    allowedFormats.map((format) => (
                      <Badge
                        key={format}
                        variant="outline"
                        className="bg-slate-800 text-slate-300 border-slate-700"
                      >
                        {format}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">No formats selected</span>
                  )}
                </div>
              </div>

              {/* Custom Fields Summary */}
              <div className="p-4 rounded-md bg-slate-900 border border-slate-700 col-span-2 md:col-span-1">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Custom Fields
                </h4>
                {fields.length > 0 ? (
                  <div className="space-y-3">
                    {fields.map((field) => (
                      <div key={field.id} className="pb-3 border-b border-slate-700 last:border-0 last:pb-0">
                        <div className="flex items-start justify-between mb-1">
                          <span className="text-sm font-medium text-slate-200">
                            {field.label || field.name}
                            {field.required && (
                              <span className="text-red-400 ml-1">*</span>
                            )}
                          </span>
                          <span className="text-xs text-slate-500 capitalize">{field.type}</span>
                        </div>
                        <div className="text-xs text-slate-400 space-y-1">
                          <div>Field Name: <code className="text-slate-300">{field.name}</code></div>
                          {field.placeholder && (
                            <div>Placeholder: <span className="text-slate-300">{field.placeholder}</span></div>
                          )}
                          {field.type === 'select' && field.options && (
                            <div>
                              Options: <span className="text-slate-300">{field.options.join(', ')}</span>
                            </div>
                          )}
                          {field.validationRegex && (
                            <div>
                              Validation: <code className="text-slate-300 text-xs">{field.validationRegex}</code>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-slate-500">No custom fields defined</span>
                )}
              </div>

              {/* Default Tags Summary */}
              <div className="p-4 rounded-md bg-slate-900 border border-slate-700 col-span-1">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Default Tags
                </h4>
                {selectedTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-slate-500">No default tags set</span>
                )}
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  // Prevent form submission on Enter key press (except for submit button)
  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    // Only allow Enter to submit if we're on the review step and focus is on the submit button
    if (e.key === 'Enter' && currentStep < STEPS.length - 1) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <form 
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        // Only submit if we're on the review step
        if (currentStep === STEPS.length - 1) {
          handleSubmit(e);
        }
      }}
      onKeyDown={handleFormKeyDown}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">
          {mediaType ? 'Edit MediaType' : 'Create New MediaType'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          aria-label="Cancel"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Global Error Messages */}
      {errors.length > 0 && (
        <div className="rounded-md bg-red-900/20 border border-red-500/50 p-4">
          <h3 className="text-sm font-semibold text-red-400 mb-2">
            Please fix the following errors:
          </h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-red-300">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Step Indicator Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <StepIndicator
              steps={STEPS}
              currentStep={currentStep}
              completedSteps={completedSteps}
              onStepClick={handleStepClick}
            />
          </div>
        </div>

        {/* Current Step Content */}
        <div className={twMerge("lg:col-span-2", currentStep === 4 && "lg:col-span-3")}>
          {renderStepContent()}
        </div>

        {/* Live Preview Sidebar */}
        {currentStep !== 4 && <div className="lg:col-span-1">
          <div className="sticky top-4">
            <div className="p-4 rounded-md bg-slate-800 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Live Preview
                </h3>
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  {showPreview ? 'Hide' : 'Show'}
                </button>
              </div>

              {showPreview && (
                <div className="space-y-4">
                  {/* Preview Header */}
                  <div className="pb-4 border-b border-slate-700">
                    <div
                      className="h-2 w-full rounded mb-2"
                      style={{ backgroundColor: color }}
                    />
                    <h4 className="text-sm font-semibold text-white">{name || 'MediaType Name'}</h4>
                    {description && (
                      <p className="text-xs text-slate-400 mt-1">{description}</p>
                    )}
                  </div>

                  {/* Preview Form */}
                  <div className="space-y-3">
                    <p className="text-xs text-slate-400">
                      Form that will appear during upload:
                    </p>
                    {fields.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">
                        No custom fields defined
                      </p>
                    ) : (
                      fields.map((field) => (
                        <div key={field.id} className="space-y-1">
                          <label className="block text-xs font-medium text-slate-300">
                            {field.label || field.name}
                            {field.required && (
                              <span className="text-red-400 ml-1">*</span>
                            )}
                          </label>
                          {field.type === 'text' && (
                            <input
                              type="text"
                              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                              disabled
                              className="w-full h-8 rounded border border-slate-700 bg-slate-900 px-2 text-xs text-slate-400"
                            />
                          )}
                          {field.type === 'number' && (
                            <input
                              type="number"
                              placeholder={field.placeholder || 'Enter number'}
                              disabled
                              className="w-full h-8 rounded border border-slate-700 bg-slate-900 px-2 text-xs text-slate-400"
                            />
                          )}
                          {field.type === 'date' && (
                            <input
                              type="date"
                              disabled
                              className="w-full h-8 rounded border border-slate-700 bg-slate-900 px-2 text-xs text-slate-400"
                            />
                          )}
                          {field.type === 'select' && (
                            <select
                              disabled
                              className="w-full h-8 rounded border border-slate-700 bg-slate-900 px-2 text-xs text-slate-400"
                            >
                              <option>
                                {field.options?.length
                                  ? `Select ${field.label.toLowerCase()}`
                                  : 'No options'}
                              </option>
                            </select>
                          )}
                          {field.type === 'boolean' && (
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                disabled
                                className="h-4 w-4 rounded border-slate-600 bg-slate-900"
                              />
                              <span className="text-xs text-slate-400">
                                {field.label}
                              </span>
                            </label>
                          )}
                          {field.type === 'url' && (
                            <input
                              type="url"
                              placeholder={field.placeholder || 'https://example.com'}
                              disabled
                              className="w-full h-8 rounded border border-slate-700 bg-slate-900 px-2 text-xs text-slate-400"
                            />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>}
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-700">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handlePrevious(e);
          }}
          disabled={currentStep === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-slate-800 text-slate-200 text-sm font-medium border border-slate-700 hover:border-slate-600 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-md bg-slate-800 text-slate-200 text-sm font-medium border border-slate-700 hover:border-slate-600 hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          {currentStep < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleNext(e);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-600 transition-colors"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSubmit(e);
              }}
              className="px-4 py-2 rounded-md bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-600 transition-colors"
            >
              {mediaType ? 'Update MediaType' : 'Create MediaType'}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
