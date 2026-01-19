import { useState, useRef, useEffect } from 'react';
import { Filter, X, ArrowUpDown, ArrowUp, ArrowDown, ChevronDown } from 'lucide-react';
import { useUIStore, type SortField } from '@/store/uiStore';
import type { MediaType } from '@/lib/mediaUtils';
import { getSortOptions } from '@/lib/sortingUtils';
import { cn } from '@/lib/utils';

interface MediaFiltersProps {
  availableTags: string[];
}

const MediaFilters: React.FC<MediaFiltersProps> = ({ availableTags }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    sortBy,
    sortDirection,
    secondarySortBy,
    secondarySortDirection,
    selectedMediaTypes,
    selectedTags,
    setSortBy,
    setSecondarySort,
    clearSorting,
    setMediaTypeFilter,
    setTagFilter,
    clearFilters,
  } = useUIStore();

  const sortOptions = getSortOptions();
  const mediaTypes: MediaType[] = ['image', 'video', 'audio', 'document', 'other'];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Calculate active filter count
  // Check if sort differs from default (dateModified desc)
  const isDefaultSort = sortBy === 'dateModified' && sortDirection === 'desc' && secondarySortBy === null;
  const activeFilterCount =
    (selectedMediaTypes.length > 0 ? 1 : 0) +
    (selectedTags.length > 0 ? 1 : 0) +
    (!isDefaultSort ? 1 : 0);

  const handleSortChange = (field: SortField) => {
    // Toggle direction if same field, otherwise set to ascending
    const newDirection = sortBy === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortBy(field, newDirection);
  };

  const handleSecondarySortChange = (field: SortField | null) => {
    if (field === null) {
      setSecondarySort(null, 'asc');
    } else {
      const newDirection = secondarySortBy === field && secondarySortDirection === 'asc' ? 'desc' : 'asc';
      setSecondarySort(field, newDirection);
    }
  };

  const toggleMediaType = (type: MediaType) => {
    const newTypes = selectedMediaTypes.includes(type)
      ? selectedMediaTypes.filter((t) => t !== type)
      : [...selectedMediaTypes, type];
    setMediaTypeFilter(newTypes);
  };

  const toggleTag = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    setTagFilter(newTags);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md border transition-colors",
          "bg-slate-900 border-slate-700 text-slate-100",
          "hover:border-cyan-500 hover:bg-slate-800",
          "focus:outline-none focus:ring-1 focus:ring-cyan-500",
          isOpen && "border-cyan-500 bg-slate-800"
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Filter className="h-4 w-4" />
        <span className="text-sm font-medium">Filters & Sort</span>
        {activeFilterCount > 0 && (
          <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-cyan-500 text-white text-xs font-semibold">
            {activeFilterCount}
          </span>
        )}
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-md border border-slate-700 bg-slate-800 shadow-lg z-50">
          <div className="p-4 space-y-6 max-h-[600px] overflow-y-auto">
            {/* Sort Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  Sort
                </h3>
                {(sortBy !== 'dateModified' || sortDirection !== 'desc' || secondarySortBy !== null) && (
                  <button
                    onClick={clearSorting}
                    className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    Clear
                  </button>
                )}
              </div>

              {/* Primary Sort */}
              <div className="space-y-2">
                <label className="text-xs text-slate-400">Primary Sort</label>
                <div className="flex items-center gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value as SortField)}
                    className="flex-1 h-9 rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setSortBy(sortBy, sortDirection === 'asc' ? 'desc' : 'asc')}
                    className="h-9 w-9 flex items-center justify-center rounded-md border border-slate-700 bg-slate-900 hover:border-cyan-500 transition-colors"
                    title={`Sort ${sortDirection === 'asc' ? 'Descending' : 'Ascending'}`}
                  >
                    {sortDirection === 'asc' ? (
                      <ArrowUp className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Secondary Sort */}
              <div className="space-y-2 mt-4">
                <label className="text-xs text-slate-400">Secondary Sort (Optional)</label>
                <div className="flex items-center gap-2">
                  <select
                    value={secondarySortBy || ''}
                    onChange={(e) => handleSecondarySortChange(e.target.value ? (e.target.value as SortField) : null)}
                    className="flex-1 h-9 rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  >
                    <option value="">None</option>
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {secondarySortBy && (
                    <button
                      onClick={() => setSecondarySort(secondarySortBy, secondarySortDirection === 'asc' ? 'desc' : 'asc')}
                      className="h-9 w-9 flex items-center justify-center rounded-md border border-slate-700 bg-slate-900 hover:border-cyan-500 transition-colors"
                      title={`Sort ${secondarySortDirection === 'asc' ? 'Descending' : 'Ascending'}`}
                    >
                      {secondarySortDirection === 'asc' ? (
                        <ArrowUp className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-slate-400" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-700" />

            {/* Filter Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </h3>
                {(selectedMediaTypes.length > 0 || selectedTags.length > 0) && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    Clear
                  </button>
                )}
              </div>

              {/* Media Type Filter */}
              <div className="space-y-2 mb-4">
                <label className="text-xs text-slate-400">Media Type</label>
                <div className="flex flex-wrap gap-2">
                  {mediaTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => toggleMediaType(type)}
                      className={cn(
                        "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                        selectedMediaTypes.includes(type)
                          ? "bg-cyan-500 text-white"
                          : "bg-slate-900 text-slate-300 border border-slate-700 hover:border-cyan-500"
                      )}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags Filter */}
              <div className="space-y-2">
                <label className="text-xs text-slate-400">Tags</label>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {availableTags.length === 0 ? (
                    <p className="text-xs text-slate-500 py-2">No tags available</p>
                  ) : (
                    availableTags.map((tag) => (
                      <label
                        key={tag}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-slate-700 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTags.includes(tag)}
                          onChange={() => toggleTag(tag)}
                          className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-800"
                        />
                        <span className="text-sm text-slate-300">{tag}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaFilters;
