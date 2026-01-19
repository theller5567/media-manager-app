import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LazyImage } from '@/components/ui/LazyImage';
import { getMediaTypeIcon } from '@/lib/mediaUtils';

interface MediaTagDetailProps {
  tagId: Id<"mediaTags"> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MediaTagDetail({ tagId, open, onOpenChange }: MediaTagDetailProps) {
  const allTags = useQuery(api.queries.mediaTags.list);
  const tag = tagId ? allTags?.find((t) => t._id === tagId) : null;

  const mediaItems = useQuery(
    api.queries.mediaTags.getMediaByTag,
    tagId ? { tagId } : 'skip'
  );

  if (!tag || !tagId) return null;

  const usageCount = mediaItems?.length || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-cyan-500" />
            {tag.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
              <p className="text-sm text-slate-400 mb-1">Usage Count</p>
              <p className="text-2xl font-bold text-white">{usageCount}</p>
              <p className="text-xs text-slate-500 mt-1">
                {usageCount === 1 ? 'media file' : 'media files'}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
              <p className="text-sm text-slate-400 mb-1">Tag ID</p>
              <p className="text-xs font-mono text-slate-300 break-all">{tag._id}</p>
            </div>
          </div>

          {/* Associated Media Files */}
          {usageCount > 0 ? (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Associated Media Files ({usageCount})
              </h3>
              {mediaItems?.length && mediaItems.length < 9 ? <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {mediaItems?.map((item) => {
                  const Icon = getMediaTypeIcon(item.mediaType);
                  return (
                    <Link to={`/media/${item._id}`}
                      key={item._id}
                      className="group relative aspect-square rounded-lg overflow-hidden border border-slate-700 bg-slate-800 hover:border-cyan-500 transition-colors cursor-pointer"
                    >
                      {item.mediaType === 'image' ? (
                        <LazyImage
                          src={item.thumbnail || item.cloudinarySecureUrl}
                          alt={item.altText || item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-900">
                          <Icon className="h-12 w-12 text-slate-600" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white text-sm font-medium px-2 text-center line-clamp-2">
                          {item.title}
                        </p>
                      </div>
                    </Link>
                  );
                })} 
              </div> : <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                {mediaItems?.map((item) => {
                  return (
                    <Link to={`/media/${item._id}`} key={item._id} className="flex items-center justify-start">
                      <p className="text-white text-xs truncate-lines-1">{item.title}</p>
                    </Link>
                  );
                })}
              </div>}
            </div>
          ) : (
            <div className="text-center py-12 border border-slate-700 rounded-lg bg-slate-800">
              <Tag className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No media files are using this tag yet.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
