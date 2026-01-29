import { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, Plus } from 'lucide-react';
import type { CustomField, CustomFieldType } from '@/types/mediaType';
import { generateFieldId, validateFieldName } from '@/lib/mediaTypeUtils';
import { cn } from '@/lib/utils';

interface FieldBuilderProps {
  fields: CustomField[];
  onChange: (fields: CustomField[]) => void;
  className?: string;
}

const FIELD_TYPES: Array<{ value: CustomFieldType; label: string }> = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Dropdown' },
  { value: 'boolean', label: 'Checkbox' },
  { value: 'url', label: 'URL' },
];

export function FieldBuilder({ fields, onChange, className }: FieldBuilderProps) {
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [selectOptionInputs, setSelectOptionInputs] = useState<Record<string, string>>({});

  const toggleFieldExpansion = (fieldId: string) => {
    const newExpanded = new Set(expandedFields);
    if (newExpanded.has(fieldId)) {
      newExpanded.delete(fieldId);
    } else {
      newExpanded.add(fieldId);
    }
    setExpandedFields(newExpanded);
  };

  const addField = () => {
    const newField: CustomField = {
      id: generateFieldId(),
      name: '',
      label: '',
      type: 'text',
      required: false,
    };
    onChange([...fields, newField]);
    setExpandedFields(new Set([...expandedFields, newField.id]));
  };

  const removeField = (fieldId: string) => {
    onChange(fields.filter((f) => f.id !== fieldId));
    const newExpanded = new Set(expandedFields);
    newExpanded.delete(fieldId);
    setExpandedFields(newExpanded);
    const newErrors = { ...fieldErrors };
    delete newErrors[fieldId];
    setFieldErrors(newErrors);
  };

  const updateField = (fieldId: string, updates: Partial<CustomField>) => {
    const updatedFields = fields.map((f) => {
      if (f.id === fieldId) {
        const updated = { ...f, ...updates };
        
        // Clear options if type changes away from select
        if (updates.type && updates.type !== 'select' && updated.options) {
          updated.options = undefined;
          // Also clear the input state for this field
          const newInputs = { ...selectOptionInputs };
          delete newInputs[fieldId];
          setSelectOptionInputs(newInputs);
        }
        
        return updated;
      }
      return f;
    });
    onChange(updatedFields);

    // Validate field name if changed
    if (updates.name !== undefined) {
      const field = updatedFields.find((f) => f.id === fieldId);
      if (field) {
        const existingNames = updatedFields
          .filter((f) => f.id !== fieldId)
          .map((f) => f.name);
        const validation = validateFieldName(field.name, existingNames);
        if (!validation.isValid) {
          setFieldErrors({ ...fieldErrors, [fieldId]: validation.errors[0] });
        } else {
          const newErrors = { ...fieldErrors };
          delete newErrors[fieldId];
          setFieldErrors(newErrors);
        }
      }
    }
  };

  const moveField = (fieldId: string, direction: 'up' | 'down') => {
    const index = fields.findIndex((f) => f.id === fieldId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;

    const newFields = [...fields];
    [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
    onChange(newFields);
  };

  const updateSelectOptions = (fieldId: string, optionsString: string) => {
    // Store the raw input value to allow typing commas freely
    setSelectOptionInputs({
      ...selectOptionInputs,
      [fieldId]: optionsString,
    });
  };

  const parseSelectOptions = (fieldId: string) => {
    const optionsString = selectOptionInputs[fieldId] ?? '';
    const options = optionsString
      .split(',')
      .map((opt) => opt.trim())
      .filter((opt) => opt.length > 0);
    updateField(fieldId, { options: options.length > 0 ? options : undefined });
    // Clear the input state after parsing so it falls back to field.options
    const newInputs = { ...selectOptionInputs };
    delete newInputs[fieldId];
    setSelectOptionInputs(newInputs);
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <label className="hidden md:block text-sm font-medium text-slate-200">Custom Fields</label>
        <button
          type="button"
          onClick={addField}
          className="w-full md:w-auto flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-800 text-slate-200 text-sm font-medium border border-slate-700 hover:border-cyan-500 hover:bg-slate-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Field
        </button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-sm border border-dashed border-slate-700 rounded-md">
          No custom fields. Click "Add Field" to create one.
        </div>
      ) : (
        <div className="space-y-2">
          {fields.map((field, index) => {
            const isExpanded = expandedFields.has(field.id);
            const error = fieldErrors[field.id];

            return (
              <div
                key={field.id}
                className="border border-slate-700 rounded-md bg-slate-900"
              >
                {/* Field Header */}
                <div className="flex items-center gap-2 p-3">
                  <button
                    type="button"
                    onClick={() => toggleFieldExpansion(field.id)}
                    className="flex-1 flex items-center gap-2 text-left"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400 -rotate-90" />
                    )}
                    <span className="text-sm font-medium text-slate-200">
                      {field.label || `Field ${index + 1}`}
                      {field.required && (
                        <span className="text-red-400 ml-1">*</span>
                      )}
                    </span>
                    <span className="text-xs text-slate-500 capitalize">
                      ({field.type})
                    </span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveField(field.id, 'up')}
                      disabled={index === 0}
                      className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      aria-label="Move up"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveField(field.id, 'down')}
                      disabled={index === fields.length - 1}
                      className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      aria-label="Move down"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeField(field.id)}
                      className="p-1.5 rounded text-red-400 hover:text-red-300 hover:bg-slate-800 transition-colors"
                      aria-label="Delete field"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Field Details (Expanded) */}
                {isExpanded && (
                  <div className="px-3 pb-3 space-y-3 border-t border-slate-700 pt-3">
                    {/* Field Name */}
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Field Name (camelCase)
                      </label>
                      <input
                        type="text"
                        value={field.name}
                        onChange={(e) => updateField(field.id, { name: e.target.value })}
                        placeholder="fieldName"
                        className={cn(
                          'w-full h-9 rounded-md border px-3 py-1 text-sm',
                          'bg-slate-800 text-slate-100 placeholder:text-slate-400',
                          'focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500',
                          error && 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        )}
                      />
                      {error && (
                        <p className="mt-1 text-xs text-red-400">{error}</p>
                      )}
                    </div>

                    {/* Label */}
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Display Label
                      </label>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                        placeholder="Field Label"
                        className="w-full h-9 rounded-md border border-slate-700 bg-slate-800 px-3 py-1 text-sm text-slate-100 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>

                    {/* Type and Required */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          Field Type
                        </label>
                        <select
                          value={field.type}
                          onChange={(e) =>
                            updateField(field.id, { type: e.target.value as CustomFieldType })
                          }
                          className="w-full h-9 rounded-md border border-slate-700 bg-slate-800 px-3 py-1 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        >
                          {FIELD_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-end">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) =>
                              updateField(field.id, { required: e.target.checked })
                            }
                            className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
                          />
                          <span className="text-xs text-slate-400">Required</span>
                        </label>
                      </div>
                    </div>

                    {/* Options (for select type) */}
                    {field.type === 'select' && (
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          Options (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={selectOptionInputs[field.id] !== undefined 
                            ? selectOptionInputs[field.id] 
                            : field.options?.join(', ') || ''}
                          onChange={(e) =>
                            updateSelectOptions(field.id, e.target.value)
                          }
                          onBlur={() => parseSelectOptions(field.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              parseSelectOptions(field.id);
                              e.currentTarget.blur();
                            }
                          }}
                          placeholder="Option 1, Option 2, Option 3"
                          className="w-full h-9 rounded-md border border-slate-700 bg-slate-800 px-3 py-1 text-sm text-slate-100 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        />
                        <p className="mt-1 text-xs text-slate-500">
                          Type options separated by commas. Press Enter or click away to save.
                        </p>
                      </div>
                    )}

                    {/* Placeholder */}
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Placeholder (optional)
                      </label>
                      <input
                        type="text"
                        value={field.placeholder || ''}
                        onChange={(e) =>
                          updateField(field.id, {
                            placeholder: e.target.value || undefined,
                          })
                        }
                        placeholder="Enter placeholder text"
                        className="w-full h-9 rounded-md border border-slate-700 bg-slate-800 px-3 py-1 text-sm text-slate-100 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>

                    {/* Validation Regex */}
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Validation Regex (optional)
                      </label>
                      <input
                        type="text"
                        value={field.validationRegex || ''}
                        onChange={(e) =>
                          updateField(field.id, {
                            validationRegex: e.target.value || undefined,
                          })
                        }
                        placeholder="^[A-Z0-9]{8}$"
                        className="w-full h-9 rounded-md border border-slate-700 bg-slate-800 px-3 py-1 text-sm text-slate-100 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                      />
                      <p className="mt-1 text-xs text-slate-500">
                        JavaScript regex pattern for validation
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
