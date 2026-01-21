import { useState } from 'react';
import { Edit, Trash2, FileText } from 'lucide-react';
import type { MediaType } from '@/types/mediaType';
import { Badge } from '@/components/ui/Badge';

interface MediaTypeListProps {
  mediaTypes: MediaType[];
  onEdit: (mediaType: MediaType) => void;
  onDelete: (id: string) => void;
  usageCounts: Record<string, number>;
}

export function MediaTypeList({
  mediaTypes,
  onEdit,
  onDelete,
  usageCounts,
}: MediaTypeListProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    if (deleteConfirmId === id) {
      onDelete(id);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(id);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmId(null);
  };

  if (mediaTypes.length === 0) {
    return (
      <div className="text-center py-12 border border-slate-700 rounded-md bg-slate-800">
        <FileText className="h-12 w-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-300 mb-2">
          No MediaTypes Created
        </h3>
        <p className="text-sm text-slate-400 mb-4">
          Create your first MediaType to define custom metadata fields and format restrictions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                Color
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                Name
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                Description
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                Formats
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                Fields
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                Default Tags
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                Usage
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {mediaTypes.map((mediaType) => {
              const usageCount = usageCounts[mediaType.id] || 0;
              const isDeleting = deleteConfirmId === mediaType.id;

              return (
                <tr
                  key={mediaType.id}
                  className="border-b border-slate-700 hover:bg-slate-800/50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div
                      className="h-6 w-6 rounded border-2 border-slate-600"
                      style={{ backgroundColor: mediaType.color }}
                      title={mediaType.color}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-200">{mediaType.name}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-slate-400 max-w-xs truncate">
                      {mediaType.description || '—'}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {mediaType.allowedFormats.slice(0, 3).map((format) => (
                        <Badge
                          key={format}
                          variant="outline"
                          className="text-xs bg-slate-900 text-slate-300 border-slate-700"
                        >
                          {format}
                        </Badge>
                      ))}
                      {mediaType.allowedFormats.length > 3 && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-slate-900 text-slate-300 border-slate-700"
                        >
                          +{mediaType.allowedFormats.length - 3}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-slate-400">
                      {mediaType.fields.length} field{mediaType.fields.length !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {mediaType.defaultTags.slice(0, 2).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {mediaType.defaultTags.length > 2 && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-slate-900 text-slate-300 border-slate-700"
                        >
                          +{mediaType.defaultTags.length - 2}
                        </Badge>
                      )}
                      {mediaType.defaultTags.length === 0 && (
                        <span className="text-xs text-slate-500">—</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-slate-400">{usageCount}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      {isDeleting ? (
                        <>
                          <button
                            type="button"
                            onClick={handleCancelDelete}
                            className="px-2 py-1 text-xs text-slate-400 hover:text-slate-200"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(mediaType.id)}
                            className="px-2 py-1 text-xs text-red-400 hover:text-red-300 font-medium"
                          >
                            Confirm
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => onEdit(mediaType)}
                            className="p-1.5 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                            aria-label={`Edit ${mediaType.name}`}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(mediaType.id)}
                            className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                            aria-label={`Delete ${mediaType.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {mediaTypes.map((mediaType) => {
          const usageCount = usageCounts[mediaType.id] || 0;
          const isDeleting = deleteConfirmId === mediaType.id;

          return (
            <div
              key={mediaType.id}
              className="p-4 rounded-md bg-slate-800 border border-slate-700 space-y-3"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-8 w-8 rounded border-2 border-slate-600 shrink-0"
                    style={{ backgroundColor: mediaType.color }}
                  />
                  <div>
                    <h3 className="font-semibold text-slate-200">{mediaType.name}</h3>
                    {mediaType.description && (
                      <p className="text-sm text-slate-400 mt-1">
                        {mediaType.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isDeleting ? (
                    <>
                      <button
                        type="button"
                        onClick={handleCancelDelete}
                        className="px-2 py-1 text-xs text-slate-400"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(mediaType.id)}
                        className="px-2 py-1 text-xs text-red-400 font-medium"
                      >
                        Confirm
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => onEdit(mediaType)}
                        className="p-1.5 rounded text-slate-400 hover:text-cyan-400"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(mediaType.id)}
                        className="p-1.5 rounded text-slate-400 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Formats */}
              <div>
                <p className="text-xs text-slate-400 mb-1">Allowed Formats</p>
                <div className="flex flex-wrap gap-1">
                  {mediaType.allowedFormats.map((format) => (
                    <Badge
                      key={format}
                      variant="outline"
                      className="text-xs bg-slate-900 text-slate-300 border-slate-700"
                    >
                      {format}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Fields and Tags */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Custom Fields</p>
                  <p className="text-slate-300">
                    {mediaType.fields.length} field{mediaType.fields.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Usage</p>
                  <p className="text-slate-300">{usageCount} items</p>
                </div>
              </div>

              {/* Default Tags */}
              {mediaType.defaultTags.length > 0 && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">Default Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {mediaType.defaultTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
