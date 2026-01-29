import { useMemo } from 'react';
import { getFileExtensionsByCategory, normalizeFileExtension } from '@/lib/mediaTypeUtils';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface FormatSelectorProps {
  selectedFormats: string[];
  onChange: (formats: string[]) => void;
  className?: string;
}

export function FormatSelector({ selectedFormats, onChange, className }: FormatSelectorProps) {
  const formatsByCategory = useMemo(() => getFileExtensionsByCategory(), []);
  const toggleFormat = (format: string) => {
    const normalized = normalizeFileExtension(format);
    if (selectedFormats.includes(normalized)) {
      onChange(selectedFormats.filter((f) => f !== normalized));
    } else {
      onChange([...selectedFormats, normalized]);
    }
  };

  const toggleCategory = (category: string) => {
    const categoryFormats = formatsByCategory[category] || [];
    const allSelected = categoryFormats.every((f) => selectedFormats.includes(f));
    
    if (allSelected) {
      // Deselect all formats in category
      onChange(selectedFormats.filter((f) => !categoryFormats.includes(f)));
    } else {
      // Select all formats in category
      const newFormats = [...selectedFormats];
      categoryFormats.forEach((f) => {
        if (!newFormats.includes(f)) {
          newFormats.push(f);
        }
      });
      onChange(newFormats);
    }
  };

  const addCustomFormat = (format: string) => {
    const normalized = normalizeFileExtension(format);
    if (normalized && !selectedFormats.includes(normalized)) {
      onChange([...selectedFormats, normalized]);
    }
  };

  return (
    <>
    <div className={cn('space-y-4', className)}>
      {/* Format Categories */}
      {Object.entries(formatsByCategory).map(([category, formats]) => {
        const allSelected = formats.every((f) => selectedFormats.includes(f));
        // const someSelected = formats.some((f) => selectedFormats.includes(f));

        return (
          <div key={category} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-200">{category}</label>
              <button
                type="button"
                onClick={() => toggleCategory(category)}
                className="text-xs text-cyan-400 hover:text-cyan-300"
              >
                {allSelected ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formats.map((format) => {
                const isSelected = selectedFormats.includes(format);
                return (
                  <button
                    key={format}
                    type="button"
                    onClick={() => toggleFormat(format)}
                    className={cn(
                      'relative flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                      'border',
                      isSelected
                        ? 'bg-cyan-500 text-white border-cyan-500'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-cyan-500'
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                    <span>{format}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Custom Format Input */}
      <div className="space-y-2 pt-2 border-t border-slate-700">
        <label className="text-sm font-medium text-slate-200">Custom Format</label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder=".ext"
            className="h-9 flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-100 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const input = e.currentTarget;
                if (input.value.trim()) {
                  addCustomFormat(input.value.trim());
                  input.value = '';
                }
              }
            }}
          />
          <button
            type="button"
            onClick={(e) => {
              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
              if (input?.value.trim()) {
                addCustomFormat(input.value.trim());
                input.value = '';
              }
            }}
            className="px-4 py-1.5 rounded-md bg-slate-800 text-slate-200 text-sm font-medium border border-slate-700 hover:border-cyan-500 hover:bg-slate-700 transition-colors"
          >
            Add
          </button>
        </div>
        <p className="text-xs text-slate-400">
          Enter a file extension (e.g., .psd, .ai) and press Enter or click Add
        </p>
      </div>

      {/* Selected Formats Summary */}
      {selectedFormats.length > 0 && (
        <div className="pt-2 border-t border-slate-700">
          <p className="text-xs text-slate-400 mb-2">
            {selectedFormats.length} format{selectedFormats.length !== 1 ? 's' : ''} selected
          </p>
          <div className="flex flex-wrap gap-1">
            {selectedFormats.map((format) => (
              <span
                key={format}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300 border border-slate-700"
              >
                {format}
                <button
                  type="button"
                  onClick={() => toggleFormat(format)}
                  className="hover:text-red-400 transition-colors"
                  aria-label={`Remove ${format}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
    
    </>
  );
}
