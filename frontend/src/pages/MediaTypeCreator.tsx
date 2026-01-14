import { useState, useEffect, useMemo } from 'react';
import { Plus } from 'lucide-react';
import type { MediaType } from '@/types/mediaType';
import {
  getAllMediaTypes,
  createMediaType,
  updateMediaType,
  deleteMediaType,
  getAllMediaTypeUsageCounts,
} from '@/data/mockMediaTypes';
import { getAvailableTags } from '@/lib/filteringUtils';
import { mockMediaData } from '@/data/mockMediaData';
import { MediaTypeList } from '@/components/media/MediaTypeList';
import { MediaTypeForm } from '@/components/media/MediaTypeForm';

const MediaTypeCreator = () => {
  const [mediaTypes, setMediaTypes] = useState<MediaType[]>([]);
  const [editingMediaType, setEditingMediaType] = useState<MediaType | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [usageCounts, setUsageCounts] = useState<Record<string, number>>({});

  // Load available tags from mockMediaData
  const availableTags = useMemo(() => getAvailableTags(mockMediaData), []);

  // Load MediaTypes and usage counts
  useEffect(() => {
    const loadedMediaTypes = getAllMediaTypes();
    setMediaTypes(loadedMediaTypes);
    const counts = getAllMediaTypeUsageCounts();
    setUsageCounts(counts);
  }, []);

  const handleCreate = () => {
    setEditingMediaType(null);
    setShowForm(true);
  };

  const handleEdit = (mediaType: MediaType) => {
    setEditingMediaType(mediaType);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    const success = deleteMediaType(id);
    if (success) {
      const updatedMediaTypes = getAllMediaTypes();
      setMediaTypes(updatedMediaTypes);
      const counts = getAllMediaTypeUsageCounts();
      setUsageCounts(counts);
    }
  };

  const handleFormSubmit = (data: Omit<MediaType, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingMediaType) {
        // Update existing MediaType
        updateMediaType(editingMediaType.id, data);
        const updatedMediaTypes = getAllMediaTypes();
        setMediaTypes(updatedMediaTypes);
      } else {
        // Create new MediaType
        createMediaType(data);
        const updatedMediaTypes = getAllMediaTypes();
        setMediaTypes(updatedMediaTypes);
      }

      // Update usage counts
      const counts = getAllMediaTypeUsageCounts();
      setUsageCounts(counts);

      // Return to list view
      setShowForm(false);
      setEditingMediaType(null);
    } catch (error) {
      console.error('Error saving MediaType:', error);
      // Error handling could show a toast notification here
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
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
