import { useState } from 'react';
import { validateHexColor } from '@/lib/mediaTypeUtils';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

// Preset colors for quick selection
const PRESET_COLORS = [
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#10b981', // Green
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#6366f1', // Indigo
  '#14b8a6', // Teal
  '#84cc16', // Lime
  '#eab308', // Yellow
];

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isValid, setIsValid] = useState(true);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (validateHexColor(newValue) || newValue === '') {
      setIsValid(true);
      if (newValue.startsWith('#')) {
        onChange(newValue);
      }
    } else {
      setIsValid(false);
    }
  };

  const handlePresetClick = (color: string) => {
    setInputValue(color);
    setIsValid(true);
    onChange(color);
  };

  const handleBlur = () => {
    // Ensure value starts with #
    if (inputValue && !inputValue.startsWith('#')) {
      const correctedValue = `#${inputValue}`;
      if (validateHexColor(correctedValue)) {
        setInputValue(correctedValue);
        onChange(correctedValue);
        setIsValid(true);
      } else {
        setIsValid(false);
      }
    } else if (!inputValue || !validateHexColor(inputValue)) {
      // Reset to current value if invalid
      setInputValue(value);
      setIsValid(true);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* Color Preview and Input */}
      <div className="flex items-center gap-3">
        <div
          className="h-10 w-10 rounded-md border-2 border-slate-600 flex-shrink-0"
          style={{ backgroundColor: isValid && value ? value : '#000000' }}
          title={value || 'No color selected'}
        />
        <div className="flex-1">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder="#3b82f6"
            className={cn(
              'h-10 w-full rounded-md border px-3 py-1 text-sm',
              'bg-slate-900 text-slate-100 placeholder:text-slate-400',
              'focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500',
              !isValid && 'border-red-500 focus:border-red-500 focus:ring-red-500'
            )}
          />
          {!isValid && (
            <p className="mt-1 text-xs text-red-400">Invalid hex color format</p>
          )}
        </div>
      </div>

      {/* Preset Colors */}
      <div className="space-y-2">
        <label className="text-xs text-slate-400">Preset Colors</label>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => handlePresetClick(color)}
              className={cn(
                'h-8 w-8 rounded-md border-2 transition-all',
                'hover:scale-110 hover:border-white',
                value === color
                  ? 'border-cyan-500 ring-2 ring-cyan-500 ring-offset-2 ring-offset-slate-800'
                  : 'border-slate-600'
              )}
              style={{ backgroundColor: color }}
              title={color}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
