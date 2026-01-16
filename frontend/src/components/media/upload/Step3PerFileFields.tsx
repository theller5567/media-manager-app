import { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, CheckSquare } from 'lucide-react';
import type { FilePreview } from '@/types/upload';
import type { MediaType, CustomField } from '@/types/mediaType';
import { cn } from '@/lib/utils';

interface Step3PerFileFieldsProps {
  files: FilePreview[];
  selectedMediaType: MediaType | null;
  perFileFields: Record<string, Record<string, any>>;
  onFieldChange: (fileId: string, fieldName: string, value: any) => void;
  errors: Record<string, Record<string, string[]>>;
}

export function Step3PerFileFields({
  files,
  selectedMediaType,
  perFileFields,
  onFieldChange,
  errors = {},
}: Step3PerFileFieldsProps) {
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set([files[0]?.id]));

  const toggleFile = (fileId: string) => {
    setExpandedFiles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const copyFromPrevious = (currentIndex: number) => {
    if (currentIndex === 0) return;
    
    const previousFile = files[currentIndex - 1];
    const currentFile = files[currentIndex];
    const previousFields = perFileFields[previousFile.id] || {};

    Object.entries(previousFields).forEach(([fieldName, value]) => {
      onFieldChange(currentFile.id, fieldName, value);
    });
  };

  const applyToAll = (fileId: string) => {
    const sourceFields = perFileFields[fileId] || {};
    files.forEach((file) => {
      Object.entries(sourceFields).forEach(([fieldName, value]) => {
        onFieldChange(file.id, fieldName, value);
      });
    });
  };

  const renderField = (field: CustomField, fileId: string) => {
    const value = perFileFields[fileId]?.[field.name] || '';
    const fieldErrors = errors[fileId]?.[field.name] || [];
    const hasError = fieldErrors.length > 0;

    switch (field.type) {
      case 'text':
      case 'url':
        return (
          <div key={field.id} className="space-y-1">
            <label className="block text-sm font-medium text-white">
              {field.label}
              {field.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <input
              type={field.type === 'url' ? 'url' : 'text'}
              value={value}
              onChange={(e) => onFieldChange(fileId, field.name, e.target.value)}
              placeholder={field.placeholder}
              className={cn(
                'w-full px-3 py-2 bg-slate-800 border rounded-md text-white placeholder:text-slate-500 focus:outline-none focus:ring-2',
                hasError ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-cyan-500'
              )}
              required={field.required}
            />
            {hasError && (
              <div className="space-y-1">
                {fieldErrors.map((error, idx) => (
                  <p key={idx} className="text-xs text-red-400 flex items-start gap-1">
                    <span className="text-red-500">•</span>
                    <span>{error}</span>
                  </p>
                ))}
              </div>
            )}
            {field.validationRegex && !hasError && value && (
              <p className="text-xs text-slate-500">{field.placeholder || 'Format validated'}</p>
            )}
          </div>
        );

      case 'number':
        return (
          <div key={field.id} className="space-y-1">
            <label className="block text-sm font-medium text-white">
              {field.label}
              {field.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => onFieldChange(fileId, field.name, parseFloat(e.target.value) || '')}
              placeholder={field.placeholder}
              className={cn(
                'w-full px-3 py-2 bg-slate-800 border rounded-md text-white placeholder:text-slate-500 focus:outline-none focus:ring-2',
                hasError ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-cyan-500'
              )}
              required={field.required}
            />
            {hasError && (
              <div className="space-y-1">
                {fieldErrors.map((error, idx) => (
                  <p key={idx} className="text-xs text-red-400 flex items-start gap-1">
                    <span className="text-red-500">•</span>
                    <span>{error}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        );

      case 'date':
        return (
          <div key={field.id} className="space-y-1">
            <label className="block text-sm font-medium text-white">
              {field.label}
              {field.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <input
              type="date"
              value={value}
              onChange={(e) => onFieldChange(fileId, field.name, e.target.value)}
              className={cn(
                'w-full px-3 py-2 bg-slate-800 border rounded-md text-white focus:outline-none focus:ring-2',
                hasError ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-cyan-500'
              )}
              required={field.required}
            />
            {hasError && (
              <div className="space-y-1">
                {fieldErrors.map((error, idx) => (
                  <p key={idx} className="text-xs text-red-400 flex items-start gap-1">
                    <span className="text-red-500">•</span>
                    <span>{error}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className="space-y-1">
            <label className="block text-sm font-medium text-white">
              {field.label}
              {field.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => onFieldChange(fileId, field.name, e.target.value)}
              className={cn(
                'w-full px-3 py-2 bg-slate-800 border rounded-md text-white focus:outline-none focus:ring-2',
                hasError ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-cyan-500'
              )}
              required={field.required}
            >
              <option value="">Select {field.label}</option>
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {hasError && (
              <div className="space-y-1">
                {fieldErrors.map((error, idx) => (
                  <p key={idx} className="text-xs text-red-400 flex items-start gap-1">
                    <span className="text-red-500">•</span>
                    <span>{error}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        );

      case 'boolean':
        return (
          <div key={field.id} className="space-y-1">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!value}
                onChange={(e) => onFieldChange(fileId, field.name, e.target.checked)}
                className={cn(
                  'w-4 h-4 rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-2',
                  hasError ? 'border-red-500 focus:ring-red-500' : 'focus:ring-cyan-500'
                )}
              />
              <span className="text-sm font-medium text-white">
                {field.label}
                {field.required && <span className="text-red-400 ml-1">*</span>}
              </span>
            </label>
            {hasError && (
              <div className="space-y-1 ml-6">
                {fieldErrors.map((error, idx) => (
                  <p key={idx} className="text-xs text-red-400 flex items-start gap-1">
                    <span className="text-red-500">•</span>
                    <span>{error}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!selectedMediaType) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Select a MediaType in Step 1 to see custom fields</p>
      </div>
    );
  }

  if (selectedMediaType.fields.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">This MediaType has no custom fields</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {files.map((file, index) => {
        const isExpanded = expandedFiles.has(file.id);

        return (
          <div
            key={file.id}
            className="border border-slate-700 rounded-lg bg-slate-800/50 overflow-hidden"
          >
            {/* File Header */}
            <button
              type="button"
              onClick={() => toggleFile(file.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-slate-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                )}
                <span className="text-sm font-medium text-white">
                  {file.file.name}
                </span>
              </div>
              {index > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyFromPrevious(index);
                  }}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-slate-400 hover:text-white rounded hover:bg-slate-700 transition-colors"
                >
                  <Copy className="h-3 w-3" />
                  Copy from Previous
                </button>
              )}
            </button>

            {/* File Fields */}
            {isExpanded && (
              <div className="p-4 space-y-4 border-t border-slate-700">
                {selectedMediaType.fields.map((field) => renderField(field, file.id))}
                
                {files.length > 1 && (
                  <button
                    type="button"
                    onClick={() => applyToAll(file.id)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-cyan-400 hover:text-cyan-300 rounded hover:bg-slate-700 transition-colors"
                  >
                    <CheckSquare className="h-4 w-4" />
                    Apply to All Files
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
