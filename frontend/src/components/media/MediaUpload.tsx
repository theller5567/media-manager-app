import { useState, useEffect } from 'react';
import { Upload, FileImage, FileText, Link2, Eye, ChevronLeft, ChevronRight, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';
import { StepIndicator, type Step } from '@/components/ui/StepIndicator';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import { Step1FilesAndMediaType } from './upload/Step1FilesAndMediaType';
import { Step2CommonFields } from './upload/Step2CommonFields';
import { Step3PerFileFields } from './upload/Step3PerFileFields';
import { Step4RelatedFiles } from './upload/Step4RelatedFiles';
import { Step5Review } from './upload/Step5Review';
import { PostUploadModal } from './PostUploadModal';
import type { MediaItem } from '@/lib/mediaUtils';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const STEPS: Step[] = [
  {
    id: 'files',
    title: 'Files & MediaType',
    description: 'Select files and MediaType',
    icon: Upload,
  },
  {
    id: 'common',
    title: 'Common Fields',
    description: 'Title, description, alt text, tags',
    icon: FileText,
  },
  {
    id: 'custom',
    title: 'Custom Fields',
    description: 'Per-file custom fields',
    icon: FileImage,
  },
  {
    id: 'related',
    title: 'Related Files',
    description: 'Link to existing media',
    icon: Link2,
  },
  {
    id: 'review',
    title: 'Review',
    description: 'Review and submit',
    icon: Eye,
  },
];

interface MediaUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete?: (files: MediaItem[]) => void;
}

export function MediaUpload({ open, onOpenChange, onUploadComplete }: MediaUploadProps) {
  const uploadState = useMediaUpload();
  const navigate = useNavigate();
  const [showPostUploadModal, setShowPostUploadModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<MediaItem[]>([]);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [canProceed, setCanProceed] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [validationAttempted, setValidationAttempted] = useState<Set<number>>(new Set());

  // Track perFileFields changes using a stringified key
  const perFileFieldsKey = JSON.stringify(uploadState.perFileFields);
  
  // Only validate when dialog is open and update canProceed state
  useEffect(() => {
    if (!open) {
      setCanProceed(false);
      return;
    }
    
    // Validate current step and update canProceed
    const isValid = uploadState.validateStep(uploadState.step, false);
    setCanProceed(isValid);
    
    // Update completed steps (include current step if valid)
    const newCompletedSteps = new Set<number>();
    for (let i = 0; i <= uploadState.step; i++) {
      if (uploadState.validateStep(i, false)) {
        newCompletedSteps.add(i);
      }
    }
    setCompletedSteps(newCompletedSteps);
  }, [
    open,
    uploadState.step,
    uploadState.files.length,
    uploadState.commonFields.title,
    uploadState.commonFields.description,
    uploadState.commonFields.altText,
    uploadState.commonFields.tags.length,
    uploadState.selectedMediaType?.id,
    perFileFieldsKey, // Use stringified key to detect deep changes
    uploadState.validateStep,
    uploadState.aiProcessing, // Include AI processing state in dependencies
  ]);

  // Reset upload state when dialog closes
  useEffect(() => {
    if (!open) {
      uploadState.reset();
      setShowPostUploadModal(false);
      setUploadedFiles([]);
      setCanProceed(false);
      setCompletedSteps(new Set());
      setValidationAttempted(new Set());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleStepClick = (stepIndex: number) => {
    uploadState.goToStep(stepIndex);
    // Update canProceed after navigation
    setTimeout(() => {
      const isValid = uploadState.validateStep(stepIndex, false);
      setCanProceed(isValid);
    }, 0);
  };

  const handleNext = () => {
    // Track that validation was attempted for this step
    setValidationAttempted(prev => new Set(prev).add(uploadState.step));
    
    // Validate with error updates enabled (we're in an event handler, so setState is safe)
    const isValid = uploadState.validateStep(uploadState.step, true);
    if (isValid) {
      uploadState.nextStep();
    }
  };

  const handlePrevious = () => {
    uploadState.previousStep();
  };

  const handleSubmit = async () => {
    // Validate all steps before submitting
    const allStepsValid = uploadState.validateStep(4);
    if (!allStepsValid) {
      // Navigate to first step with errors
      for (let i = 0; i < 5; i++) {
        if (!uploadState.validateStep(i)) {
          uploadState.goToStep(i);
          return;
        }
      }
      return;
    }

    try {
      const files = await uploadState.submitUpload();
      setUploadedFiles(files as MediaItem[]);
      setShowPostUploadModal(true);
      
      if (onUploadComplete) {
        onUploadComplete(files as MediaItem[]);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadError(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  };

  const handlePostUploadAction = (action: 'add-another' | 'view-details' | 'go-to-library', fileId?: string) => {
    switch (action) {
      case 'add-another':
        setShowPostUploadModal(false);
        uploadState.reset();
        uploadState.goToStep(0);
        break;
      case 'view-details':
        if (fileId) {
          // Close modal first
          setShowPostUploadModal(false);
          // Close upload dialog
          onOpenChange(false);
          // Navigate to detail page
          navigate(`/media/${fileId}`);
        }
        break;
      case 'go-to-library':
        uploadState.reset();
        onOpenChange(false);
        break;
    }
  };

  const renderStepContent = () => {
    if (!open) return null;
    
    switch (uploadState.step) {
      case 0:
        return (
          <Step1FilesAndMediaType
            files={uploadState.files}
            selectedMediaType={uploadState.selectedMediaType}
            useAI={uploadState.useAI}
            aiProcessing={uploadState.aiProcessing}
            filteredMediaTypes={uploadState.getFilteredMediaTypes()}
            onFilesAdd={uploadState.addFiles}
            onFileRemove={uploadState.removeFile}
            onMediaTypeSelect={uploadState.setMediaType}
            onUseAIToggle={uploadState.setUseAI}
            errors={(uploadState.errors?.files && typeof uploadState.errors.files === 'object' && !Array.isArray(uploadState.errors.files) && 'files' in uploadState.errors) ? (uploadState.errors.files as Record<string, string[]>) : {}}
            filesTooLargeForAI={uploadState.filesTooLargeForAI}
            aiDisabledReason={uploadState.aiDisabledReason}
            currentAIFileName={uploadState.currentAIFileName}
          />
        );
      case 1:
        // Validate Step 2 fields - only show errors if validation was attempted
        const step2Errors: string[] = [];
        if (validationAttempted.has(1)) {
          if (!uploadState.commonFields.title.trim()) step2Errors.push('title');
          if (!uploadState.commonFields.description.trim()) step2Errors.push('description');
          if (!uploadState.commonFields.altText.trim()) step2Errors.push('altText');
          if (uploadState.commonFields.tags.length === 0) step2Errors.push('tags');
        }
        
        return (
          <Step2CommonFields
            commonFields={uploadState.commonFields}
            aiSuggestions={uploadState.aiSuggestions}
            useAI={uploadState.useAI}
            onFieldsChange={uploadState.setCommonFields}
            onClearAISuggestions={uploadState.clearAISuggestions}
            errors={step2Errors}
            validationAttempted={validationAttempted.has(1)}
          />
        );
      case 2:
        return (
          <Step3PerFileFields
            files={uploadState.files}
            selectedMediaType={uploadState.selectedMediaType}
            perFileFields={uploadState.perFileFields}
            onFieldChange={uploadState.setPerFileField}
            errors={uploadState.fieldValidationErrors}
          />
        );
      case 3:
        return (
          <Step4RelatedFiles
            selectedRelatedFiles={uploadState.relatedFiles}
            onRelatedFilesChange={uploadState.setRelatedFiles}
            excludeFileIds={uploadState.files.map((f) => f.id)}
          />
        );
      case 4:
        return (
          <Step5Review
            files={uploadState.files}
            selectedMediaType={uploadState.selectedMediaType}
            commonFields={uploadState.commonFields}
            perFileFields={uploadState.perFileFields}
            relatedFiles={uploadState.relatedFiles}
            onEditStep={handleStepClick}
            validationErrors={uploadState.errors}
          />
        );
      default:
        console.log('[MediaUpload] Rendering default (null)');
        return null;
    }
  };

  
  const isLastStep = uploadState.step === STEPS.length - 1;
  const isFirstStep = uploadState.step === 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-full h-full left-0 top-0 translate-x-0 translate-y-0 md:left-[50%] md:top-[50%] md:translate-x-[-50%] md:translate-y-[-50%] md:max-w-6xl md:max-h-[90vh] flex flex-col p-0 rounded-none md:rounded-lg">
          <DialogHeader className="px-4 md:px-6 pt-4 md:pt-6 pb-4 border-b border-slate-700">
            <DialogTitle className="text-xl md:text-2xl text-white">Upload Media</DialogTitle>
            <DialogDescription className="text-slate-400 text-sm md:text-base">
              Upload and organize your media files with metadata
            </DialogDescription>
          </DialogHeader>

          {/* Mobile: Step indicator at top */}
          <div className="md:hidden border-b border-slate-700 p-4">
            <StepIndicator
              variant="mobile"
              steps={STEPS}
              currentStep={uploadState.step}
              completedSteps={completedSteps}
              onStepClick={handleStepClick}
            />
          </div>

          {/* Desktop: Sidebar with step indicator */}
          <div className="hidden md:flex flex-1 min-h-0">
            <div className="w-64 shrink-0 border-r border-slate-700 p-6">
              <StepIndicator
                variant="desktop"
                steps={STEPS}
                currentStep={uploadState.step}
                completedSteps={completedSteps}
                onStepClick={handleStepClick}
              />
            </div>

            {/* Desktop Main Content */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-6">
                {renderStepContent()}
              </div>

              {/* Desktop Navigation Footer */}
              <div className="border-t border-slate-700 p-6 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={isFirstStep}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded transition-colors',
                    isFirstStep
                      ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                      : 'bg-slate-700 text-white hover:bg-slate-600'
                  )}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {isLastStep ? (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={uploadState.uploading || !canProceed}
                      className={cn(
                        'flex items-center gap-2 px-6 py-2 rounded font-medium transition-colors',
                        uploadState.uploading || !canProceed
                          ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                          : 'bg-cyan-500 text-white hover:bg-cyan-600'
                      )}
                    >
                      {uploadState.uploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        'Submit Upload'
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={!canProceed || uploadState.aiProcessing}
                      className={cn(
                        'flex items-center gap-2 px-6 py-2 rounded font-medium transition-colors',
                        !canProceed || uploadState.aiProcessing
                          ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                          : 'bg-cyan-500 text-white hover:bg-cyan-600'
                      )}
                      title={uploadState.aiProcessing ? 'Please wait for AI analysis to complete' : undefined}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile: Full-width content */}
          <div className="md:hidden flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto p-4">
              {renderStepContent()}
            </div>

            {/* Mobile Navigation Footer - stacked buttons */}
            <div className="border-t border-slate-700 p-4 flex flex-col gap-3">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={isFirstStep}
                className={cn(
                  'w-full flex items-center justify-center gap-2 px-4 py-3 rounded transition-colors min-h-[44px]',
                  isFirstStep
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    : 'bg-slate-700 text-white hover:bg-slate-600'
                )}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              {isLastStep ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={uploadState.uploading || !canProceed}
                  className={cn(
                    'w-full flex items-center justify-center gap-2 px-6 py-3 rounded font-medium transition-colors min-h-[44px]',
                    uploadState.uploading || !canProceed
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      : 'bg-cyan-500 text-white hover:bg-cyan-600'
                  )}
                >
                  {uploadState.uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Submit Upload'
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canProceed || uploadState.aiProcessing}
                  className={cn(
                    'w-full flex items-center justify-center gap-2 px-6 py-3 rounded font-medium transition-colors min-h-[44px]',
                    !canProceed || uploadState.aiProcessing
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      : 'bg-cyan-500 text-white hover:bg-cyan-600'
                  )}
                  title={uploadState.aiProcessing ? 'Please wait for AI analysis to complete' : undefined}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Post-Upload Modal */}
      <PostUploadModal
        open={showPostUploadModal}
        uploadedFiles={uploadedFiles}
        onAddAnother={() => handlePostUploadAction('add-another')}
        onViewDetails={(action, fileId) => handlePostUploadAction(action, fileId)}
        onGoToLibrary={() => handlePostUploadAction('go-to-library')}
      />

      {/* Upload Error Modal */}
      <Dialog open={!!uploadError} onOpenChange={(open: boolean) => !open && setUploadError(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-red-400 flex items-center gap-2">
              <XCircle className="h-6 w-6" />
              Upload Failed
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              The following errors occurred during upload:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-md bg-red-900/20 border border-red-500/50 p-4">
              <pre className="text-sm text-red-300 whitespace-pre-wrap font-mono">
                {uploadError}
              </pre>
            </div>
            <div className="text-sm text-slate-400 space-y-2">
              <p><strong>Common solutions:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Ensure your Cloudinary upload preset is configured for unsigned uploads</li>
                <li>Check that VITE_CLOUDINARY_UPLOAD_PRESET is set correctly in your .env file</li>
                <li>Verify the upload preset exists in your Cloudinary dashboard</li>
                <li>Make sure the upload preset allows unsigned uploads</li>
              </ul>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
              <button
                type="button"
                onClick={() => setUploadError(null)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
