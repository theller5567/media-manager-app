import { useState, useRef, useCallback } from 'react';
import { Upload, X, FileImage, FileVideo, FileText, FileAudio, File, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import type { FilePreview } from '@/types/upload';
import type { MediaType } from '@/types/mediaType';
import { Badge } from '@/components/ui/Badge';
import { twMerge } from 'tailwind-merge';

interface Step1FilesAndMediaTypeProps {
  files: FilePreview[];
  selectedMediaType: MediaType | null;
  useAI: boolean;
  aiProcessing: boolean;
  filteredMediaTypes: MediaType[];
  onFilesAdd: (files: File[]) => void;
  onFileRemove: (fileId: string) => void;
  onMediaTypeSelect: (mediaType: MediaType | null) => void;
  onUseAIToggle: (useAI: boolean) => void;
  errors: Record<string, string[]>;
  filesTooLargeForAI?: boolean;
  aiDisabledReason?: string | null;
  currentAIFileName?: string;
}

export function Step1FilesAndMediaType({
  files,
  selectedMediaType,
  useAI,
  aiProcessing,
  filteredMediaTypes,
  onFilesAdd,
  onFileRemove,
  onMediaTypeSelect,
  onUseAIToggle,
  errors,
  filesTooLargeForAI = false,
  aiDisabledReason = null,
  currentAIFileName,
}: Step1FilesAndMediaTypeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      onFilesAdd(droppedFiles);
    }
  }, [onFilesAdd]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      onFilesAdd(selectedFiles);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onFilesAdd]);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return FileImage;
      case 'video':
        return FileVideo;
      case 'document':
        return FileText;
      case 'audio':
        return FileAudio;
      default:
        return File;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      

      {/* Drag and Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={twMerge(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragging
            ? 'border-cyan-500 bg-cyan-500/10'
            : 'border-slate-600 hover:border-slate-500 bg-slate-800/50'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileInput}
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
        />
        <Upload className="h-12 w-12 mx-auto mb-4 text-slate-400" />
        <p className="text-lg font-medium text-white mb-2">
          Drag and drop files here, or click to browse
        </p>
        <p className="text-sm text-slate-400">
          Supports images, videos, audio, and documents
        </p>
      </div>

      {/* File Preview List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-white">Selected Files ({files.length})</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {files.map((file) => {
              const FileIcon = getFileIcon(file.type);
              const fileErrors = errors[file.id] || [];

              return (
                <div
                  key={file.id}
                  className={twMerge(
                    'flex items-center gap-3 p-3 rounded-lg border',
                    fileErrors.length > 0
                      ? 'border-red-500/50 bg-red-500/10'
                      : 'border-slate-700 bg-slate-800/50'
                  )}
                >
                  {/* Thumbnail/Icon */}
                  <div className="shrink-0">
                    {file.type === 'image' && file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.file.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded bg-slate-700 flex items-center justify-center">
                        <FileIcon className="h-6 w-6 text-slate-400" />
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{file.file.name}</p>
                    <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
                    {fileErrors.length > 0 && (
                      <div className="mt-1">
                        {fileErrors.map((error, idx) => (
                          <p key={idx} className="text-xs text-red-400">{error}</p>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFileRemove(file.id);
                    }}
                    className="shrink-0 p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MediaType Selector */}
      {files.length > 0 && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-white">
            Select Media Type (Optional)
          </label>
          <select
            value={selectedMediaType?.id || ''}
            onChange={(e) => {
              const mediaTypeId = e.target.value;
              const mediaType = filteredMediaTypes.find((mt) => mt.id === mediaTypeId) || null;
              onMediaTypeSelect(mediaType);
            }}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">None (Generic Upload)</option>
            {filteredMediaTypes.map((mt) => (
              <option key={mt.id} value={mt.id}>
                {mt.name}
              </option>
            ))}
          </select>
          {selectedMediaType && (
            <div className="flex items-center gap-2">
              <Badge
                style={{ backgroundColor: selectedMediaType.color }}
                className="text-white"
              >
                {selectedMediaType.name}
              </Badge>
              {selectedMediaType.description && (
                <p className="text-xs text-slate-400">{selectedMediaType.description}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* AI Choice Toggle */}
      {selectedMediaType && (
        <div className={`flex flex-col gap-3 p-4 rounded-lg border ${filesTooLargeForAI ? 'border-amber-500/50 bg-amber-500/5' : 'border-slate-700 bg-slate-800/50'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className={`h-5 w-5 ${filesTooLargeForAI ? 'text-amber-500' : 'text-cyan-500'}`} />
              <div>
                <p className={`text-sm font-medium ${filesTooLargeForAI ? 'text-amber-400' : 'text-white'}`}>
                  Use AI to generate metadata?
                </p>
                <p className={`text-xs ${filesTooLargeForAI ? 'text-amber-300/80' : 'text-slate-400'}`}>
                  {filesTooLargeForAI 
                    ? aiDisabledReason || 'Files are too large for AI analysis'
                    : 'AI will analyze your files and suggest titles, descriptions, alt text, and tags'
                  }
                </p>
              </div>
            </div>
            <label className={`relative inline-flex items-center ${filesTooLargeForAI ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
              <input
                type="checkbox"
                checked={useAI && !filesTooLargeForAI}
                onChange={(e) => !filesTooLargeForAI && onUseAIToggle(e.target.checked)}
                className="sr-only peer"
                disabled={aiProcessing || filesTooLargeForAI}
              />
              <div className={`w-11 h-6 ${filesTooLargeForAI ? 'bg-slate-600' : 'bg-slate-700'} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${filesTooLargeForAI ? '' : 'peer-checked:bg-cyan-500'}`}></div>
            </label>
          </div>
          {filesTooLargeForAI && (
            <div className="flex items-start gap-2 text-xs text-amber-300/90 bg-amber-500/10 p-2 rounded border border-amber-500/30">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <p>
                Files larger than 3.5MB cannot be analyzed with AI due to technical limitations. 
                Basic metadata will be generated from filenames instead.
              </p>
            </div>
          )}
        </div>
      )}

      {/* AI Processing Indicator */}
      {aiProcessing && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/50">
          <Loader2 className="h-5 w-5 animate-spin text-cyan-500 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-cyan-400 mb-1">Analyzing files with AI...</p>
            {currentAIFileName && (
              <p className="text-xs text-cyan-300/80">Processing: {currentAIFileName}</p>
            )}
            <p className="text-xs text-slate-400 mt-1">This may take a few moments. Please wait...</p>
          </div>
        </div>
      )}

      {/* File Upload Limits Information */}
      <div className="mb-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
        <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
          <File className="h-4 w-4" />
          File Upload Limits
        </h4>
        <ul className="text-xs text-slate-400 space-y-1 mb-2">
          <li>• Images: Up to 20MB</li>
          <li>• Videos: Up to 500MB</li>
          <li>• Other files: Up to 100MB</li>
          <li>• AI analysis: Files up to 3.5MB</li>
        </ul>
        <p className="text-xs text-slate-500 mt-2">
          Supported formats: Images (JPEG, PNG, GIF, WebP), Videos (MP4, MOV, AVI), Audio (MP3, WAV), Documents (PDF, DOC, DOCX)
        </p>
      </div>
    </div>
  );
}
