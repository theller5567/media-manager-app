import { useMemo, useState } from "react";
import { Plus, Tag, TrendingUp } from "lucide-react";
import { api } from "../../convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import type { MediaTag } from "@/types/mediaTag";
import type { Id } from "../../convex/_generated/dataModel";
import MediaTagForm from "@/components/media/MediaTagForm";
import { MediaTagList } from "@/components/media/MediaTagList";
import { MediaTagDetail } from "@/components/media/MediaTagDetail";
import Header from "@/components/layout/Header";


const TagManagement = () => {

    const [showForm, setShowForm] = useState<boolean>(false);
    const [editingMediaTag, setEditingMediaTag] = useState<MediaTag | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedTagId, setSelectedTagId] = useState<Id<"mediaTags"> | null>(null);
    const [showTagDetail, setShowTagDetail] = useState(false);
    // Optimistic tags - tags that are being created but not yet confirmed in database
    const [optimisticTags, setOptimisticTags] = useState<Map<string, MediaTag>>(new Map());
    
    const mediaTagsData = useQuery(api.queries.mediaTags.list);
    const usageCountsData = useQuery(api.queries.mediaTags.getUsageCounts);
    
    // Convex mutations
    const createTagMutation = useMutation(api.mutations.mediaTags.create);
    const updateTagMutation = useMutation(api.mutations.mediaTags.update);
    const deleteTagMutation = useMutation(api.mutations.mediaTags.deleteTag);

    const handleCreate = () => {
        setEditingMediaTag(null);
        setSubmitError(null);
        setShowForm(true);
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditingMediaTag(null);
        setSubmitError(null);
    };

    const handleEdit = (tag: MediaTag) => {
        setEditingMediaTag(tag);
        setSubmitError(null);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteTagMutation({ id: id as Id<"mediaTags"> });
        } catch (error) {
            console.error('Error deleting tag:', error);
            setSubmitError(error instanceof Error ? error.message : 'Failed to delete tag');
        }
    };

    const handleViewMedia = (tagId: string) => {
        setSelectedTagId(tagId as Id<"mediaTags">);
        setShowTagDetail(true);
    };

    const handleFormSubmit = async (data: Omit<MediaTag, 'id' | 'createdBy'> | Omit<MediaTag, 'id' | 'createdBy'>[]) => {
        setIsSubmitting(true);
        setSubmitError(null);
        
        try {
            const isEditMode = editingMediaTag !== null && editingMediaTag !== undefined;
            
            if (isEditMode) {
                // Update existing tag (single tag mode)
                const tagData = data as Omit<MediaTag, 'id' | 'createdBy'>;
                await updateTagMutation({
                    id: editingMediaTag.id as Id<"mediaTags">,
                    name: tagData.name,
                });
            } else {
                // Create mode - handle single or multiple tags
                const tagsToCreate = Array.isArray(data) ? data : [data];
                
                // Create optimistic tags immediately
                const newOptimisticTags = new Map<string, MediaTag>();
                tagsToCreate.forEach((tagData, index) => {
                    const tempId = `optimistic-${Date.now()}-${index}`;
                    const optimisticTag: MediaTag = {
                        id: tempId,
                        name: tagData.name,
                        createdBy: '', // Will be set when real tag is created
                    };
                    newOptimisticTags.set(tempId, optimisticTag);
                });
                
                // Add optimistic tags to state
                setOptimisticTags(prev => {
                    const updated = new Map(prev);
                    newOptimisticTags.forEach((tag, id) => updated.set(id, tag));
                    return updated;
                });
                
                // Close form immediately for better UX
                setShowForm(false);
                setEditingMediaTag(null);
                
                // Attempt to create tags in database
                const results = await Promise.allSettled(
                    tagsToCreate.map(tag => 
                        createTagMutation({
                            name: tag.name,
                        })
                    )
                );
                
                // Process results and remove failed optimistic tags
                const failures: { index: number; tagName: string; reason: string }[] = [];
                const successes: string[] = [];
                
                results.forEach((result, index) => {
                    const tempId = Array.from(newOptimisticTags.keys())[index];
                    if (result.status === 'rejected') {
                        failures.push({
                            index,
                            tagName: tagsToCreate[index].name,
                            reason: result.reason instanceof Error ? result.reason.message : String(result.reason)
                        });
                        // Remove failed optimistic tag
                        setOptimisticTags(prev => {
                            const updated = new Map(prev);
                            updated.delete(tempId);
                            return updated;
                        });
                    } else {
                        successes.push(tempId);
                    }
                });
                
                // Remove all optimistic tags after a short delay (Convex will sync real data)
                // This ensures smooth transition from optimistic to real data
                setTimeout(() => {
                    setOptimisticTags(prev => {
                        const updated = new Map(prev);
                        successes.forEach(id => updated.delete(id));
                        return updated;
                    });
                }, 1000);
                
                // Handle errors
                if (failures.length > 0) {
                    const errorMessages = failures.map(({ tagName, reason }) => 
                        `Failed to create "${tagName}": ${reason}`
                    );
                    
                    if (failures.length === tagsToCreate.length) {
                        // All failed - show error
                        setSubmitError(errorMessages.join('; '));
                        // Reopen form to allow retry
                        setShowForm(true);
                    } else {
                        // Some succeeded, some failed - show warning but keep form closed
                        setSubmitError(`Some tags were created successfully, but ${failures.length} failed:\n${errorMessages.join('\n')}`);
                        setTimeout(() => {
                            setSubmitError(null);
                        }, 5000);
                    }
                    return;
                }
            }
            
            // Success - reset state (form already closed for create mode)
            if (isEditMode) {
                setShowForm(false);
                setEditingMediaTag(null);
            }
            setSubmitError(null);
        } catch (error) {
            console.error('Error saving tag(s):', error);
            setSubmitError(error instanceof Error ? error.message : 'Failed to save tag(s)');
            // Remove all optimistic tags on error
            setOptimisticTags(new Map());
            // Reopen form to allow retry
            if (!editingMediaTag) {
                setShowForm(true);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Convert Convex documents to MediaTag format (map _id to id)
    const mediaTags: MediaTag[] = useMemo(() => {
        if (!mediaTagsData) return [];
        return mediaTagsData.map((tag: any) => ({
            id: tag._id,
            name: tag.name,
            createdBy: tag.createdBy || '',
        }));
    }, [mediaTagsData]);

    // Merge real tags with optimistic tags (optimistic tags take precedence by name to avoid duplicates)
    const allTags: MediaTag[] = useMemo(() => {
        const realTagsMap = new Map<string, MediaTag>();
        mediaTags.forEach(tag => {
            realTagsMap.set(tag.name.toLowerCase(), tag);
        });
        
        // Add optimistic tags (they'll be replaced by real tags when Convex syncs)
        optimisticTags.forEach(optimisticTag => {
            const normalizedName = optimisticTag.name.toLowerCase();
            // Only add if not already in real tags (to avoid duplicates)
            if (!realTagsMap.has(normalizedName)) {
                realTagsMap.set(normalizedName, optimisticTag);
            }
        });
        
        return Array.from(realTagsMap.values()).sort((a, b) => 
            a.name.localeCompare(b.name)
        );
    }, [mediaTags, optimisticTags]);

    // Normalize usage counts
    const usageCounts: Record<string, number> = useMemo(() => {
        return usageCountsData || {};
    }, [usageCountsData]);

    // Calculate statistics (using allTags to include optimistic tags)
    const statistics = useMemo(() => {
        const totalTags = allTags.length;
        const totalUsage = Object.values(usageCounts).reduce((sum: number, count: unknown) => sum + (count as number), 0);
        const mostUsedTag = allTags.length > 0 ? allTags.reduce((max, tag) => {
            const count = usageCounts[tag.id] || 0;
            const maxCount = usageCounts[max.id] || 0;
            return count > maxCount ? tag : max;
        }, allTags[0]) : null;
        const unusedTags = allTags.filter(tag => (usageCounts[tag.id] || 0) === 0).length;

        return {
            totalTags,
            totalUsage,
            mostUsedTag,
            unusedTags,
        };
    }, [allTags, usageCounts]);

    return (
        <div className="flex flex-col gap-6 h-full flex-1 min-h-0">
          {/* Header */}
          <Header title="Tag Management" description="Create and manage custom tags for your media items" >
          <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2 rounded-md bg-cyan-500 text-white font-medium hover:bg-cyan-600 transition-colors">
                <Plus className="h-4 w-4" />
                Create Tag
            </button>
          </Header>
    
          {/* Statistics Dashboard */}
          {!showForm && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
              <div className="bg-slate-800 p-4 rounded-sm border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-5 w-5 text-cyan-500" />
                  <p className="text-sm text-slate-400">Total Tags</p>
                </div>
                <p className="text-2xl font-bold text-white">{statistics.totalTags}</p>
              </div>
              <div className="bg-slate-800 p-4 rounded-sm border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-cyan-500" />
                  <p className="text-sm text-slate-400">Total Usage</p>
                </div>
                <p className="text-2xl font-bold text-white">{statistics.totalUsage}</p>
              </div>
              <div className="bg-slate-800 p-4 rounded-sm border border-slate-700">
                <p className="text-sm text-slate-400 mb-2">Most Used</p>
                <p className="text-lg font-semibold text-white truncate">
                  {statistics.mostUsedTag?.name || '—'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {statistics.mostUsedTag ? `${usageCounts[statistics.mostUsedTag.id] || 0} files` : ''}
                </p>
              </div>
              <div className="bg-slate-800 p-4 rounded-sm border border-slate-700">
                <p className="text-sm text-slate-400 mb-2">Unused Tags</p>
                <p className="text-2xl font-bold text-white">{statistics.unusedTags}</p>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="relative z-10 flex-1 min-h-0 overflow-y-auto bg-slate-800 rounded-sm overflow-hidden">
            {showForm ? (
            <div className="max-w-6xl mx-auto p-4">
                {submitError && (
                    <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/50">
                        <p className="text-sm text-red-400">{submitError}</p>
                    </div>
                )}
                <MediaTagForm 
                    mediaTag={editingMediaTag || undefined}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                    availableTags={allTags}
                    isSubmitting={isSubmitting}
                />
            </div>
            ) : (
            <><div className="max-w-7xl mx-auto p-4">
                <MediaTagList
                    tags={allTags}
                    usageCounts={usageCounts}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onViewMedia={handleViewMedia}
                />
            </div>
            <div className="sticky bottom-0 left-0 h-15 w-full bg-linear-to-t from-slate-900 to-transparent z-10"></div>
            </>
            )}
            
          </div>

          {/* Tag Detail Dialog */}
          <MediaTagDetail
              tagId={selectedTagId}
              open={showTagDetail}
              onOpenChange={setShowTagDetail}
          />
        </div>
    );
};

export default TagManagement