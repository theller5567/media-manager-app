import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import type { MediaType } from '@/types/mediaType';
import { MediaTypeList } from '@/components/media/MediaTypeList';
import { MediaTypeForm } from '@/components/media/MediaTypeForm';

const MediaTypeCreator = () => {
  const [editingMediaType, setEditingMediaType] = useState<MediaType | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Convex queries
  const mediaTypesData = useQuery(api.queries.mediaTypes.list);
  const usageCountsData = useQuery(api.queries.mediaTypes.getAllUsageCounts);
  const allMediaItems = useQuery(api.queries.media.list);

  // Convex mutations - use useCallback to ensure stable references
  const createMediaTypeMutation = useMutation(api.mutations.mediaTypes.create);
  const updateMediaTypeMutation = useMutation(api.mutations.mediaTypes.update);
  const deleteMediaTypeMutation = useMutation(api.mutations.mediaTypes.deleteMediaType);

  // Convert Convex documents to MediaType format (map _id to id, convert timestamps to Date objects)
  const mediaTypes: MediaType[] = useMemo(() => {
    if (!mediaTypesData) return [];
    return mediaTypesData.map((mt: any) => ({
      ...mt,
      id: mt._id,
      createdAt: new Date(mt.createdAt), // Convert number to Date object
      updatedAt: new Date(mt.updatedAt), // Convert number to Date object
    }));
  }, [mediaTypesData]);

  // Convert usage counts (map Convex IDs to string IDs)
  const usageCounts: Record<string, number> = useMemo(() => {
    if (!usageCountsData) return {};
    const counts: Record<string, number> = {};
    Object.entries(usageCountsData).forEach(([convexId, count]: [string, unknown]) => {
      counts[convexId] = typeof count === 'number' ? count : 0;
    });
    return counts;
  }, [usageCountsData]);

  // Load available tags from all media items
  const availableTags = useMemo(() => {
    if (!allMediaItems) return [];
    const allTags = new Set<string>();
    allMediaItems.forEach((item: any) => {
      if (Array.isArray(item.tags)) {
        item.tags.forEach((tag: string) => allTags.add(tag));
      }
    });
    return Array.from(allTags).sort();
  }, [allMediaItems]);

  const handleCreate = () => {
    // Explicitly clear editingMediaType to prevent any cached object from leaking
    setEditingMediaType(null);
    setShowForm(true);
  };

  const handleEdit = (mediaType: MediaType) => {
    setEditingMediaType(mediaType);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMediaTypeMutation({ id: id as Id<"mediaTypes"> });
      // Convex will automatically update the queries
    } catch (error) {
      console.error('Error deleting MediaType:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete MediaType');
    }
  };

  const handleFormSubmit = async (data: Omit<MediaType, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const isEditMode = editingMediaType !== null && editingMediaType !== undefined;
      
      if (isEditMode) {
        // Update existing MediaType
        await updateMediaTypeMutation({
          id: editingMediaType!.id as Id<"mediaTypes">,
          name: data.name,
          description: data.description,
          color: data.color,
          allowedFormats: data.allowedFormats,
          fields: data.fields.map((f) => ({
            id: f.id,
            name: f.name,
            label: f.label,
            type: f.type,
            required: f.required,
            ...(f.options && { options: f.options }),
            ...(f.validationRegex && { validationRegex: f.validationRegex }),
            ...(f.placeholder && { placeholder: f.placeholder }),
          })),
          defaultTags: data.defaultTags,
        });
      } else {
        // Create new MediaType - use useCallback pattern to ensure fresh mutation call
        // Extract all values to primitives first to prevent any object references
        const nameValue = String(data.name);
        const descriptionValue = data.description ? String(data.description) : undefined;
        const colorValue = String(data.color);
        const allowedFormatsValue = Array.isArray(data.allowedFormats) 
          ? data.allowedFormats.map(f => String(f)) 
          : [];
        const fieldsValue = Array.isArray(data.fields)
          ? data.fields.map((f) => {
              const fieldObj: any = {
                id: String(f.id),
                name: String(f.name),
                label: String(f.label),
                type: f.type,
                required: Boolean(f.required),
              };
              if (f.options && Array.isArray(f.options)) {
                fieldObj.options = f.options.map(o => String(o));
              }
              if (f.validationRegex) {
                fieldObj.validationRegex = String(f.validationRegex);
              }
              if (f.placeholder) {
                fieldObj.placeholder = String(f.placeholder);
              }
              return fieldObj;
            })
          : [];
        const defaultTagsValue = Array.isArray(data.defaultTags)
          ? data.defaultTags.map(t => String(t))
          : [];

        // Build mutation args object
        const mutationArgs = {
          name: nameValue,
          ...(descriptionValue !== undefined && { description: descriptionValue }),
          color: colorValue,
          allowedFormats: allowedFormatsValue,
          fields: fieldsValue,
          defaultTags: defaultTagsValue,
        };

        await createMediaTypeMutation(mutationArgs);
      }

      // Convex will automatically update the queries
      // Return to list view
      setShowForm(false);
      setEditingMediaType(null);
    } catch (error) {
      console.error('Error saving MediaType:', error);
      alert(error instanceof Error ? error.message : 'Failed to save MediaType');
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    // Explicitly clear editingMediaType to prevent any cached object from leaking
    setEditingMediaType(null);
  };

  return (
    <div className="flex flex-col gap-6 h-full flex-1 min-h-0 p-6">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0 bg-slate-800 p-4 rounded-sm">
        <div>
          <h2 className="text-2xl font-bold text-white">Media Type Management</h2>
          <p className="text-sm text-slate-400 mt-1">
            Create and manage custom MediaTypes with format restrictions, custom fields, and default tags
          </p>
        </div>
        {!showForm && (
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-cyan-500 text-white font-medium hover:bg-cyan-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create MediaType
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto bg-slate-800 p-4 rounded-sm">
        {showForm ? (
          <div className="max-w-6xl mx-auto">
            <MediaTypeForm
              mediaType={editingMediaType || undefined}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              availableTags={availableTags}
            />
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            <MediaTypeList
              mediaTypes={mediaTypes}
              onEdit={handleEdit}
              onDelete={handleDelete}
              usageCounts={usageCounts}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaTypeCreator;
