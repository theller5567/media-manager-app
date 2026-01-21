import { useState, useMemo } from 'react';
import { Edit, Trash2, Tag, Search, Loader2 } from 'lucide-react';
import type { MediaTag } from '@/types/mediaTag';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface MediaTagListProps {
  tags: MediaTag[];
  usageCounts: Record<string, number>;
  onEdit: (tag: MediaTag) => void;
  onDelete: (id: string) => void;
  onViewMedia?: (tagId: string) => void;
}

export function MediaTagList({
  tags,
  usageCounts,
  onEdit,
  onDelete,
  onViewMedia,
}: MediaTagListProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'usage'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

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

  // Filter and sort tags
  const filteredAndSortedTags = useMemo(() => {
    let filtered = tags;
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((tag) =>
        tag.name.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else {
        const countA = usageCounts[a.id] || 0;
        const countB = usageCounts[b.id] || 0;
        comparison = countA - countB;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  }, [tags, usageCounts, searchQuery, sortBy, sortOrder]);

  if (tags.length === 0) {
    return (
      <div className="text-center py-12 border border-slate-700 rounded-md bg-slate-800">
        <Tag className="h-12 w-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-300 mb-2">
          No Tags Created
        </h3>
        <p className="text-sm text-slate-400 mb-4">
          Create your first tag to organize and categorize your media files.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-md text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'usage')}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="name">Sort by Name</option>
            <option value="usage">Sort by Usage</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white text-sm hover:bg-slate-800 transition-colors"
            title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Results count */}
      {searchQuery && (
        <p className="text-sm text-slate-400">
          Found {filteredAndSortedTags.length} of {tags.length} tags
        </p>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                Tag Name
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                Usage Count
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedTags.map((tag) => {
              const usageCount = usageCounts[tag.id] || 0;
              const isDeleting = deleteConfirmId === tag.id;
              const isOptimistic = tag.id.startsWith('optimistic-');

              return (
                <tr
                  key={tag.id}
                  className={cn(
                    "border-b border-slate-700 hover:bg-slate-800/50 transition-colors",
                    isOptimistic && "opacity-75"
                  )}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {isOptimistic ? (
                        <Loader2 className="h-4 w-4 text-cyan-500 animate-spin" />
                      ) : (
                        <Tag className="h-4 w-4 text-cyan-500" />
                      )}
                      <span className={cn("font-medium", isOptimistic ? "text-slate-300" : "text-slate-200")}>
                        {tag.name}
                        {isOptimistic && (
                          <span className="ml-2 text-xs text-slate-500 italic">(creating...)</span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          usageCount > 0
                            ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
                            : "bg-slate-700 text-slate-400 border-slate-600"
                        )}
                      >
                        {usageCount} {usageCount === 1 ? 'file' : 'files'}
                      </Badge>
                      {usageCount > 0 && onViewMedia && (
                        <button
                          onClick={() => onViewMedia(tag.id)}
                          className="text-xs text-cyan-400 hover:text-cyan-300 underline"
                        >
                          View
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      {isDeleting ? (
                        <>
                          <span className="text-xs text-red-400 mr-2">Delete?</span>
                          <button
                            onClick={() => handleDeleteClick(tag.id)}
                            className="p-1.5 rounded text-red-400 hover:bg-red-500/20 transition-colors"
                            title="Confirm delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={handleCancelDelete}
                            className="p-1.5 rounded text-slate-400 hover:bg-slate-700 transition-colors"
                            title="Cancel"
                          >
                            ×
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => onEdit(tag)}
                            className="p-1.5 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-700 transition-colors"
                            title="Edit tag"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(tag.id)}
                            className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors"
                            title="Delete tag"
                            disabled={usageCount > 0}
                          >
                            <Trash2 className={cn("h-4 w-4", usageCount > 0 && "opacity-50")} />
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
      <div className="md:hidden space-y-3">
        {filteredAndSortedTags.map((tag) => {
          const usageCount = usageCounts[tag.id] || 0;
          const isDeleting = deleteConfirmId === tag.id;
          const isOptimistic = tag.id.startsWith('optimistic-');

          return (
            <div
              key={tag.id}
              className={cn(
                "p-4 rounded-lg border border-slate-700 bg-slate-800/50",
                isOptimistic && "opacity-75"
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {isOptimistic ? (
                    <Loader2 className="h-4 w-4 text-cyan-500 shrink-0 animate-spin" />
                  ) : (
                    <Tag className="h-4 w-4 text-cyan-500 shrink-0" />
                  )}
                  <span className={cn("font-medium truncate", isOptimistic ? "text-slate-300" : "text-slate-200")}>
                    {tag.name}
                    {isOptimistic && (
                      <span className="ml-2 text-xs text-slate-500 italic">(creating...)</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {isDeleting ? (
                    <>
                      <button
                        onClick={() => handleDeleteClick(tag.id)}
                        className="p-1.5 rounded text-red-400 hover:bg-red-500/20 transition-colors"
                        title="Confirm delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleCancelDelete}
                        className="p-1.5 rounded text-slate-400 hover:bg-slate-700 transition-colors"
                        title="Cancel"
                      >
                        ×
                      </button>
                    </>
                  ) : (
                    <>
                      {!isOptimistic && (
                        <button
                          onClick={() => onEdit(tag)}
                          className="p-1.5 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-700 transition-colors"
                          title="Edit tag"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {!isOptimistic && (
                        <button
                          onClick={() => handleDeleteClick(tag.id)}
                          className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors"
                          title="Delete tag"
                          disabled={usageCount > 0}
                        >
                          <Trash2 className={cn("h-4 w-4", usageCount > 0 && "opacity-50")} />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    usageCount > 0
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
                      : "bg-slate-700 text-slate-400 border-slate-600"
                  )}
                >
                  {usageCount} {usageCount === 1 ? 'file' : 'files'}
                </Badge>
                {usageCount > 0 && onViewMedia && (
                  <button
                    onClick={() => onViewMedia(tag.id)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 underline"
                  >
                    View media
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty search results */}
      {searchQuery && filteredAndSortedTags.length === 0 && (
        <div className="text-center py-12 border border-slate-700 rounded-md bg-slate-800">
          <p className="text-slate-400">No tags found matching "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
}
