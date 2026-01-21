import React, { useState, useMemo } from 'react';
import { Search, X, Link2 } from 'lucide-react';
import { mockMediaData } from '@/data/mockMediaData';
import { filterMediaItems } from '@/lib/mediaUtils';
import { Badge } from '@/components/ui/Badge';
import { twMerge } from 'tailwind-merge';
import LazyImage from '@/components/ui/LazyImage';
import { getMediaTypeIcon } from '@/lib/mediaUtils';

interface Step4RelatedFilesProps {
  selectedRelatedFiles: string[];
  onRelatedFilesChange: (fileIds: string[]) => void;
  excludeFileIds?: string[];
}

export function Step4RelatedFiles({
  selectedRelatedFiles,
  onRelatedFilesChange,
  excludeFileIds = [],
}: Step4RelatedFilesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [linkToAllFiles, setLinkToAllFiles] = useState(true);

  const availableFiles = useMemo(() => {
    return mockMediaData.filter((file) => !excludeFileIds.includes(file.id));
  }, [excludeFileIds]);

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) {
      return availableFiles;
    }
    return filterMediaItems(availableFiles, searchQuery);
  }, [availableFiles, searchQuery]);

  const selectedFiles = useMemo(() => {
    return availableFiles.filter((file) => selectedRelatedFiles.includes(file.id));
  }, [availableFiles, selectedRelatedFiles]);

  const toggleFile = (fileId: string) => {
    if (selectedRelatedFiles.includes(fileId)) {
      onRelatedFilesChange(selectedRelatedFiles.filter((id) => id !== fileId));
    } else {
      onRelatedFilesChange([...selectedRelatedFiles, fileId]);
    }
  };

  const removeFile = (fileId: string) => {
    onRelatedFilesChange(selectedRelatedFiles.filter((id) => id !== fileId));
  };

  return (
    <div className="space-y-6">
      {/* Link to All Files Toggle */}
      <div className="flex items-center justify-between p-4 rounded-lg border border-slate-700 bg-slate-800/50">
        <div className="flex items-center gap-3">
          <Link2 className="h-5 w-5 text-cyan-500" />
          <div>
            <p className="text-sm font-medium text-white">Link to all files</p>
            <p className="text-xs text-slate-400">
              {linkToAllFiles
                ? 'Selected files will be linked to all uploaded files'
                : 'Each uploaded file can have different related files'}
            </p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={linkToAllFiles}
            onChange={(e) => setLinkToAllFiles(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
        </label>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search media library..."
          className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-md text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-white">
            Selected Related Files ({selectedFiles.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file) => (
              <Badge
                key={file.id}
                variant="outline"
                className="bg-slate-700 text-white border-slate-600 flex items-center gap-2"
              >
                {file.filename}
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  className="hover:text-red-400 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Media Files Grid */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-white">
          Available Media ({filteredFiles.length})
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
          {filteredFiles.map((file) => {
            const isSelected = selectedRelatedFiles.includes(file.id);
            // Ensure mediaType is valid, default to 'document' if not
            const validMediaTypes = ['image', 'video', 'audio', 'document'] as const;
            const mediaType = (validMediaTypes.includes(file.mediaType as any) ? file.mediaType : 'document') as 'image' | 'video' | 'audio' | 'document';
            const IconComponent = getMediaTypeIcon(mediaType);

            return (
              <button
                key={file.id}
                type="button"
                onClick={() => toggleFile(file.id)}
                className={twMerge(
                  'relative p-3 rounded-lg border transition-colors text-left',
                  isSelected
                    ? 'border-cyan-500 bg-cyan-500/20'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                )}
              >
                {/* Checkbox Indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                {/* Thumbnail */}
                <div className="w-full aspect-square rounded bg-slate-700 mb-2 overflow-hidden flex items-center justify-center">
                  {file.thumbnail ? (
                    <LazyImage
                      src={file.thumbnail}
                      alt={file.filename}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    React.createElement(IconComponent, { className: "h-8 w-8 text-slate-400" })
                  )}
                </div>

                {/* Filename */}
                <p className="text-xs text-white truncate">{file.filename}</p>
              </button>
            );
          })}
        </div>

        {filteredFiles.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-400">No media files found</p>
          </div>
        )}
      </div>
    </div>
  );
}
