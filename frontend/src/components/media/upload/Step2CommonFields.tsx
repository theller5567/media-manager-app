import { useState, useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';
import type { CommonFields, AISuggestions } from '@/types/upload';
import { Badge } from '@/components/ui/Badge';
import { twMerge } from 'tailwind-merge';
import { getAvailableTags } from '@/lib/filteringUtils';
import { mockMediaData } from '@/data/mockMediaData';

interface Step2CommonFieldsProps {
  commonFields: CommonFields;
  aiSuggestions: AISuggestions;
  useAI: boolean;
  onFieldsChange: (fields: Partial<CommonFields>) => void;
  onClearAISuggestions?: () => void;
  errors?: string[];
  validationAttempted?: boolean;
}

export function Step2CommonFields({
  commonFields,
  aiSuggestions,
  useAI,
  onFieldsChange,
  onClearAISuggestions,
  errors = [],
  validationAttempted = false,
}: Step2CommonFieldsProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>(commonFields.tags);
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  
  // Sync local selectedTags state with commonFields.tags prop
  useEffect(() => {
    setSelectedTags(commonFields.tags);
  }, [commonFields.tags]);
  
  const availableTags = getAvailableTags(mockMediaData);
  const filteredTagSuggestions = availableTags.filter(
    (tag) => tag.toLowerCase().includes(tagInput.toLowerCase()) && !selectedTags.includes(tag)
  );

  const handleAddTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      const newTags = [...selectedTags, tag];
      setSelectedTags(newTags);
      onFieldsChange({ tags: newTags });
      setTagInput('');
      setShowTagSuggestions(false);
    }
  };

  const handleRemoveTag = (tag: string) => {
    const newTags = selectedTags.filter((t) => t !== tag);
    setSelectedTags(newTags);
    onFieldsChange({ tags: newTags });
  };

  const handleAcceptAllAI = () => {
    // Use AI suggestions if they exist (check for undefined/null, not falsy)
    const newFields: Partial<CommonFields> = {};
    
    if (aiSuggestions.title !== undefined && aiSuggestions.title !== null) {
      newFields.title = aiSuggestions.title;
    }
    if (aiSuggestions.description !== undefined && aiSuggestions.description !== null) {
      newFields.description = aiSuggestions.description;
    }
    if (aiSuggestions.altText !== undefined && aiSuggestions.altText !== null) {
      newFields.altText = aiSuggestions.altText;
    }
    if (aiSuggestions.tags !== undefined && aiSuggestions.tags !== null && aiSuggestions.tags.length > 0) {
      newFields.tags = [...aiSuggestions.tags]; // Create a new array
      setSelectedTags([...aiSuggestions.tags]);
    }
    
    if (Object.keys(newFields).length > 0) {
      onFieldsChange(newFields);
    }
    
    // Clear AI suggestions after accepting all
    if (onClearAISuggestions) {
      onClearAISuggestions();
    }
  };

  const handleRejectAllAI = () => {
    // Clear AI suggestions when rejecting all
    if (onClearAISuggestions) {
      onClearAISuggestions();
    }
  };

  const hasAISuggestions = useAI && (
    aiSuggestions.title ||
    aiSuggestions.description ||
    aiSuggestions.altText ||
    (aiSuggestions.tags && aiSuggestions.tags.length > 0)
  );

  return (
    <div className="space-y-6">
      {/* AI Suggestions Header */}
      {hasAISuggestions && (
        <div className="flex items-center justify-between p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/50">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-500" />
            <span className="text-sm font-medium text-cyan-400">AI Suggestions Available</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAcceptAllAI}
              className="px-3 py-1 text-xs font-medium text-white bg-cyan-500 hover:bg-cyan-600 rounded transition-colors"
            >
              Accept All
            </button>
            <button
              type="button"
              onClick={handleRejectAllAI}
              className="px-3 py-1 text-xs font-medium text-slate-300 hover:text-white rounded transition-colors"
            >
              Reject All
            </button>
          </div>
        </div>
      )}

      {/* Title Field */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">
          Title <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={commonFields.title}
            onChange={(e) => {
              onFieldsChange({ title: e.target.value });
              // Clear error when user starts typing
              if (errors.includes('title') && e.target.value.trim()) {
                // Error will be cleared on next validation attempt
              }
            }}
            placeholder="Enter title"
            className={twMerge(
              'w-full px-3 py-2 bg-slate-800 border rounded-md text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500',
              validationAttempted && errors.includes('title') ? 'border-red-500' : 'border-slate-700'
            )}
            required
          />
          {useAI && aiSuggestions.title && aiSuggestions.title !== commonFields.title && (
            <div className="absolute right-2 top-2 flex items-center gap-1">
              <Badge variant="outline" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50">
                <Sparkles className="h-3 w-3 mr-1" />
                AI
              </Badge>
              <button
                type="button"
                onClick={() => onFieldsChange({ title: aiSuggestions.title! })}
                className="px-2 py-1 text-xs font-medium text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20 rounded transition-colors"
                title="Accept AI suggestion"
              >
                Accept
              </button>
            </div>
          )}
        </div>
        {validationAttempted && errors.includes('title') && (
          <p className="text-xs text-red-400">Title is required</p>
        )}
      </div>

      {/* Description Field */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">
          Description <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <textarea
            value={commonFields.description}
            onChange={(e) => {
              onFieldsChange({ description: e.target.value });
              // Clear error when user starts typing
            }}
            placeholder="Enter description"
            rows={4}
            className={twMerge(
              'w-full px-3 py-2 bg-slate-800 border rounded-md text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none',
              validationAttempted && errors.includes('description') ? 'border-red-500' : 'border-slate-700'
            )}
            required
          />
          {useAI && aiSuggestions.description && aiSuggestions.description !== commonFields.description && (
            <div className="absolute right-2 top-2 flex items-center gap-1">
              <Badge variant="outline" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50">
                <Sparkles className="h-3 w-3 mr-1" />
                AI
              </Badge>
              <button
                type="button"
                onClick={() => onFieldsChange({ description: aiSuggestions.description! })}
                className="px-2 py-1 text-xs font-medium text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20 rounded transition-colors"
                title="Accept AI suggestion"
              >
                Accept
              </button>
            </div>
          )}
        </div>
        {errors.includes('description') && (
          <p className="text-xs text-red-400">Description is required</p>
        )}
      </div>

      {/* Alt Text Field */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">
          Alt Text <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={commonFields.altText}
            onChange={(e) => {
              onFieldsChange({ altText: e.target.value });
              // Clear error when user starts typing
            }}
            placeholder="Enter alt text for accessibility"
            className={twMerge(
              'w-full px-3 py-2 bg-slate-800 border rounded-md text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500',
              validationAttempted && errors.includes('altText') ? 'border-red-500' : 'border-slate-700'
            )}
            required
          />
          {useAI && aiSuggestions.altText && aiSuggestions.altText !== commonFields.altText && (
            <div className="absolute right-2 top-2 flex items-center gap-1">
              <Badge variant="outline" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50">
                <Sparkles className="h-3 w-3 mr-1" />
                AI
              </Badge>
              <button
                type="button"
                onClick={() => onFieldsChange({ altText: aiSuggestions.altText! })}
                className="px-2 py-1 text-xs font-medium text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20 rounded transition-colors"
                title="Accept AI suggestion"
              >
                Accept
              </button>
            </div>
          )}
        </div>
        {validationAttempted && errors.includes('altText') && (
          <p className="text-xs text-red-400">Alt text is required</p>
        )}
      </div>

      {/* Tags Field */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">
          Tags <span className="text-red-400">*</span> (at least 1 required)
        </label>
        <div className="relative">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => {
              setTagInput(e.target.value);
              setShowTagSuggestions(true);
            }}
            onFocus={() => setShowTagSuggestions(true)}
            onBlur={() => {
              // Delay to allow clicking on suggestions
              setTimeout(() => setShowTagSuggestions(false), 200);
            }}
            placeholder="Type to search or add tags"
            className={twMerge(
              'w-full px-3 py-2 bg-slate-800 border rounded-md text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500',
              validationAttempted && errors.includes('tags') ? 'border-red-500' : 'border-slate-700'
            )}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && tagInput.trim()) {
                e.preventDefault();
                handleAddTag(tagInput.trim());
              }
            }}
          />
          {useAI && aiSuggestions.tags && aiSuggestions.tags.length > 0 && (
            <div className="absolute right-2 top-2 flex items-center gap-1">
              <Badge variant="outline" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50">
                <Sparkles className="h-3 w-3 mr-1" />
                AI
              </Badge>
              <button
                type="button"
                onClick={() => {
                  const newTags = [...(aiSuggestions.tags || [])];
                  onFieldsChange({ tags: newTags });
                  setSelectedTags(newTags);
                }}
                className="px-2 py-1 text-xs font-medium text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20 rounded transition-colors"
                title="Accept AI suggestion"
              >
                Accept
              </button>
            </div>
          )}
          
          {/* Tag Suggestions Dropdown */}
          {showTagSuggestions && filteredTagSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
              {filteredTagSuggestions.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAddTag(tag)}
                  className="w-full px-3 py-2 text-left text-sm text-white hover:bg-slate-700 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Selected Tags */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedTags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="bg-slate-700 text-white border-slate-600"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-2 hover:text-red-400 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        
        {validationAttempted && errors.includes('tags') && (
          <p className="text-xs text-red-400">At least one tag is required</p>
        )}
      </div>
    </div>
  );
}
