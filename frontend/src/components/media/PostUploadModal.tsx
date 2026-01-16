import React from 'react';
import { CheckCircle, Plus, Eye, ArrowLeft } from 'lucide-react';
import type { MediaItem } from '@/lib/mediaUtils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import LazyImage from '@/components/ui/LazyImage';
import { getMediaTypeIcon } from '@/lib/mediaUtils';

interface PostUploadModalProps {
  open: boolean;
  uploadedFiles: MediaItem[];
  onAddAnother: () => void;
  onViewDetails: (action: 'view-details', fileId: string) => void;
  onGoToLibrary: () => void;
}

export function PostUploadModal({
  open,
  uploadedFiles,
  onAddAnother,
  onViewDetails,
  onGoToLibrary,
}: PostUploadModalProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const lastUploadedFile = uploadedFiles[uploadedFiles.length - 1];

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <DialogTitle className="text-xl text-white">
                Upload Successful!
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} uploaded successfully
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Uploaded Files List */}
          {uploadedFiles.length > 1 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <h4 className="text-sm font-medium text-white">Uploaded Files:</h4>
              {uploadedFiles.map((file) => {
                const Icon = getMediaTypeIcon(file.mediaType);
                return (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-2 rounded border border-slate-700 bg-slate-800/50"
                  >
                    <div className="shrink-0">
                      {file.thumbnail ? (
                        <LazyImage
                          src={file.thumbnail}
                          alt={file.filename}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-slate-700 flex items-center justify-center">
                          {React.createElement(Icon, { className: "h-5 w-5 text-slate-400" })}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {file.title || file.filename}
                      </p>
                      <p className="text-xs text-slate-400">{formatFileSize(file.fileSize)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onViewDetails('view-details', file.id)}
                      className="px-2 py-1 text-xs text-cyan-400 hover:text-cyan-300 rounded hover:bg-slate-700 transition-colors"
                    >
                      View
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onAddAnother}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Another File
            </button>
            {lastUploadedFile && (
              <button
                type="button"
                onClick={() => onViewDetails('view-details', lastUploadedFile.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded transition-colors"
              >
                <Eye className="h-4 w-4" />
                View Details
              </button>
            )}
            <button
              type="button"
              onClick={onGoToLibrary}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-slate-600 hover:bg-slate-700 text-white rounded transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Go to Library
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
