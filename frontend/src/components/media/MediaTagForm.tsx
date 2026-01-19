import type { MediaTag } from '@/types/mediaTag';
import { useEffect, useState } from 'react';

interface MediaTagFormProps {
  mediaTag?: MediaTag;
  onSubmit: (data: Omit<MediaTag, 'id' | 'createdBy'> | Omit<MediaTag, 'id' | 'createdBy'>[]) => void;
  onCancel: () => void;
  availableTags: MediaTag[];
  isSubmitting?: boolean;
}

const MediaTagForm = ({ mediaTag, onSubmit, onCancel, availableTags, isSubmitting = false }: MediaTagFormProps) => {
    const [name, setName] = useState(mediaTag?.name || '');
    const [errors, setErrors] = useState<string[]>([]);
    const [tagPreview, setTagPreview] = useState<string[]>([]);

    useEffect(() => {
        if (mediaTag) {
            setName(mediaTag.name);
            setTagPreview([]);
        } else {
            // Parse comma-separated tags for preview
            const input = name.trim();
            if (input.includes(',')) {
                const tags = input
                    .split(',')
                    .map(tag => tag.trim())
                    .filter(tag => tag.length > 0);
                setTagPreview(tags);
            } else {
                setTagPreview([]);
            }
        }
    }, [mediaTag, name]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (isSubmitting) {
            return; // Prevent double submission
        }
        
        setErrors([]);
        const input = name.trim();
        
        // Validation
        if (!input) {
            setErrors(['Tag name(s) are required']);
            return;
        }
        
        // Check if editing (single tag mode)
        if (mediaTag) {
            const normalizedTagName = input.toLowerCase();
            const duplicateTag = availableTags.find(
                (tag) => tag.name.toLowerCase().trim() === normalizedTagName && tag.id !== mediaTag.id
            );
            
            if (duplicateTag) {
                setErrors(['A tag with this name already exists']);
                return;
            }
            
            onSubmit({ name: input });
            return;
        }
        
        // Create mode - handle comma-separated tags
        const tagNames = input
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);
        
        if (tagNames.length === 0) {
            setErrors(['At least one tag name is required']);
            return;
        }
        
        // Validate each tag
        const validationErrors: string[] = [];
        const duplicateTags: string[] = [];
        const existingTagNames = new Set(availableTags.map(tag => tag.name.toLowerCase().trim()));
        
        tagNames.forEach((tagName, index) => {
            const normalized = tagName.toLowerCase();
            
            // Check for duplicates within the input
            const duplicateInInput = tagNames.slice(0, index).some(
                (prevTag) => prevTag.toLowerCase() === normalized
            );
            
            if (duplicateInInput) {
                duplicateTags.push(tagName);
            }
            
            // Check for duplicates with existing tags
            if (existingTagNames.has(normalized)) {
                validationErrors.push(`"${tagName}" already exists`);
            }
        });
        
        if (duplicateTags.length > 0) {
            validationErrors.push(`Duplicate tags in input: ${duplicateTags.join(', ')}`);
        }
        
        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return;
        }
        
        // Submit all valid tags
        const tagsToCreate = tagNames.map(tagName => ({ name: tagName }));
        onSubmit(tagsToCreate);
    }

  return (
    <form onSubmit={handleSubmit}>
        <div className="space-y-4">
            <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-white">
                    {mediaTag ? 'Tag Name' : 'Tag Name(s)'}
                </label>
                <input 
                    type="text" 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder={mediaTag ? 'Enter tag name' : 'Enter tag names separated by commas (e.g., tag1, tag2, tag3)'}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500" 
                />
                {!mediaTag && tagPreview.length > 0 && (
                    <div className="mt-2 p-2 bg-slate-900 rounded-md border border-slate-700">
                        <p className="text-xs text-slate-400 mb-1">Preview ({tagPreview.length} tag{tagPreview.length !== 1 ? 's' : ''}):</p>
                        <div className="flex flex-wrap gap-1">
                            {tagPreview.map((tag: string, idx: number) => (
                                <span 
                                    key={idx}
                                    className="text-xs px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/50"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
                {errors.length > 0 && (
                    <div className="text-red-400 text-sm space-y-1">
                        {errors.map((error, idx) => (
                            <p key={idx}>{error}</p>
                        ))}
                    </div>
                )}
            </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
            <button 
                type="button" 
                onClick={onCancel}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-md bg-slate-800 text-white hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Cancel
            </button>
            <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-4 py-2 rounded-md bg-cyan-500 text-white hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
                {isSubmitting ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {mediaTag ? 'Saving...' : tagPreview.length > 1 ? `Creating ${tagPreview.length} tags...` : 'Creating...'}
                    </>
                ) : (
                    mediaTag ? 'Save' : tagPreview.length > 1 ? `Create ${tagPreview.length} Tags` : 'Create Tag'
                )}
            </button>
        </div>
    </form>
  )
}

export default MediaTagForm