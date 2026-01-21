import React, { useState, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Search, X } from 'lucide-react';
import { filterMediaItems } from '@/lib/mediaUtils';
import { Badge } from '@/components/ui/Badge';
import LazyImage from '@/components/ui/LazyImage';
import { getMediaTypeIcon } from '@/lib/mediaUtils';

interface RelatedFilesSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  excludeIds?: string[];
}

export function RelatedFilesSelector({
  selectedIds,
  onChange,
  excludeIds = [],
}: RelatedFilesSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch media from Convex
  const mediaData = useQuery(api.queries.media.list) || [];
  
  // Convert Convex data to MediaItem format
  const allMediaItems = useMemo(() => {
    return mediaData.map((item: any) => ({
      ...item,
      id: item._id,
      dateModified: new Date(item.dateModified),
    }));
  }, [mediaData]);

  const availableFiles = useMemo(() => {
    return allMediaItems.filter((file) => !excludeIds.includes(file.id));
  }, [allMediaItems, excludeIds]);

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) {
      return availableFiles;
    }
    return filterMediaItems(availableFiles, searchQuery);
  }, [availableFiles, searchQuery]);

  const selectedFiles = useMemo(() => {
    return availableFiles.filter((file) => selectedIds.includes(file.id));
  }, [availableFiles, selectedIds]);

  const toggleFile = (fileId: string) => {
    if (selectedIds.includes(fileId)) {
      onChange(selectedIds.filter((id) => id !== fileId));
    } else {
      onChange([...selectedIds, fileId]);
    }
  };

  const removeFile = (fileId: string) => {
    onChange(selectedIds.filter((id) => id !== fileId));
  };

  return (
    <div className="space-y-4">
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
            Selected ({selectedFiles.length})
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
            const isSelected = selectedIds.includes(file.id);
            const Icon = getMediaTypeIcon(file.mediaType);

            return (
              <button
                key={file.id}
                type="button"
                onClick={() => toggleFile(file.id)}
                className={`relative p-3 rounded-lg border transition-colors text-left ${
                  isSelected
                    ? 'border-cyan-500 bg-cyan-500/20'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                <div className="w-full aspect-square rounded bg-slate-700 mb-2 overflow-hidden flex items-center justify-center">
                  {file.thumbnail ? (
                    <LazyImage
                      src={file.thumbnail}
                      alt={file.filename}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    React.createElement(Icon, { className: "h-8 w-8 text-slate-400" })
                  )}
                </div>

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
