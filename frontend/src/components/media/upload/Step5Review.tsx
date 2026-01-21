import React from 'react';
import { CheckCircle, XCircle, Edit } from 'lucide-react';
import type { FilePreview } from '@/types/upload';
import type { MediaType as MediaTypeFromTypes } from '@/types/mediaType';
import { Badge } from '@/components/ui/Badge';
import { twMerge } from 'tailwind-merge';

import LazyImage from '@/components/ui/LazyImage';
import { getMediaTypeIcon } from '@/lib/mediaUtils';
import type { MediaType as MediaTypeFromUtils } from '@/lib/mediaUtils';

interface Step5ReviewProps {
  files: FilePreview[];
  selectedMediaType: MediaTypeFromTypes | null;
  commonFields: {
    title: string;
    description: string;
    altText: string;
    tags: string[];
  };
  perFileFields: Record<string, Record<string, any>>;
  relatedFiles: string[];
  onEditStep: (step: number) => void;
  validationErrors: Record<string, string[]>;
}

export function Step5Review({
  files,
  selectedMediaType,
  commonFields,
  perFileFields,
  relatedFiles,
  onEditStep,
  validationErrors,
}: Step5ReviewProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const hasErrors = Object.keys(validationErrors).length > 0;
  const isValid = !hasErrors;

  return (
    <div className="space-y-6">
      {/* Validation Status */}
      <div
        className={twMerge(
          'flex items-center gap-3 p-4 rounded-lg border',
          isValid
            ? 'bg-green-500/10 border-green-500/50'
            : 'bg-red-500/10 border-red-500/50'
        )}
      >
        {isValid ? (
          <>
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm font-medium text-green-400">All fields validated</p>
              <p className="text-xs text-slate-400">Ready to upload</p>
            </div>
          </>
        ) : (
          <>
            <XCircle className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-sm font-medium text-red-400">Validation errors found</p>
              <p className="text-xs text-slate-400">Please fix errors before submitting</p>
            </div>
          </>
        )}
      </div>

      {/* Files Summary */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-white">
            Files to Upload ({files.length})
          </h3>
          <button
            type="button"
            onClick={() => onEditStep(0)}
            className="flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <Edit className="h-4 w-4" />
            Edit
          </button>
        </div>

        {files.map((file, index) => {
          const fileFields = perFileFields[file.id] || {};
          const fileErrors = validationErrors[file.id] || [];
          // Convert file.type to MediaTypeFromUtils (they should match, but ensure type safety)
          const mediaType: MediaTypeFromUtils = file.type as MediaTypeFromUtils;
          const IconComponent = getMediaTypeIcon(mediaType);
          const fileTitle = files.length > 1 
            ? `${commonFields.title} ${index + 1}`
            : commonFields.title;

          return (
            <div
              key={file.id}
              className={twMerge(
                'border rounded-lg p-4',
                fileErrors.length > 0
                  ? 'border-red-500/50 bg-red-500/10'
                  : 'border-slate-700 bg-slate-800/50'
              )}
            >
              <div className="flex gap-4">
                {/* Thumbnail */}
                <div className="shrink-0">
                  {file.type === 'image' && file.preview ? (
                    <LazyImage
                      src={file.preview}
                      alt={file.file.name}
                      className="w-24 h-24 object-cover rounded"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded bg-slate-700 flex items-center justify-center">
                      {React.createElement(IconComponent, { className: "h-12 w-12 text-slate-400" })}
                    </div>
                  )}
                </div>

                {/* File Details */}
                <div className="flex-1 space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-white">{fileTitle}</h4>
                    <p className="text-xs text-slate-400">{file.file.name}</p>
                    <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
                  </div>

                  {/* MediaType */}
                  {selectedMediaType && (
                    <div>
                      <Badge
                        style={{ backgroundColor: selectedMediaType.color }}
                        className="text-white"
                      >
                        {selectedMediaType.name}
                      </Badge>
                    </div>
                  )}

                  {/* Common Fields Summary */}
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="text-slate-400">Description: </span>
                      <span className="text-white">{commonFields.description || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Alt Text: </span>
                      <span className="text-white">{commonFields.altText || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Tags: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {commonFields.tags.length > 0 ? (
                          commonFields.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs bg-slate-700 text-white border-slate-600">
                              {tag}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-slate-500">No tags</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Custom Fields Summary */}
                  {selectedMediaType && selectedMediaType.fields.length > 0 && Object.keys(fileFields).length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-400">Custom Fields:</p>
                      <div className="space-y-1">
                        {selectedMediaType.fields.map((field) => {
                          const value = fileFields[field.name];
                          if (value === undefined || value === null || value === '') return null;
                          
                          return (
                            <div key={field.id} className="text-xs">
                              <span className="text-slate-400">{field.label}: </span>
                              <span className="text-white">
                                {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Errors */}
                  {fileErrors.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-red-400">Errors:</p>
                      {fileErrors.map((error, idx) => (
                        <p key={idx} className="text-xs text-red-400">{error}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Related Files Summary */}
      {relatedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-white">
              Related Files ({relatedFiles.length})
            </h3>
            <button
              type="button"
              onClick={() => onEditStep(3)}
              className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <Edit className="h-3 w-3" />
              Edit
            </button>
          </div>
          <p className="text-xs text-slate-400">
            {relatedFiles.length} file{relatedFiles.length !== 1 ? 's' : ''} will be linked to all uploaded files
          </p>
        </div>
      )}
    </div>
  );
}
