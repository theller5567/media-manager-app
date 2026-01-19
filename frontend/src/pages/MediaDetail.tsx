import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { ArrowLeft, Loader2, Pencil, Trash2 } from "lucide-react";
import LazyImage from "@/components/ui/LazyImage";
import { formatFileSize } from "@/lib/mediaUtils";
import { useState } from "react";
import MediaEditDialog from "@/components/media/MediaEditDialog";
import ReactPlayer from 'react-player'

const MediaDetail = () => {
  const { mediaId } = useParams<{ mediaId: string }>();
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  
  const mediaDoc = useQuery(
    api.queries.media.getById,
    mediaId ? { id: mediaId as Id<"media"> } : "skip"
  );
  
  // Convert Convex document to MediaItem format
  const media = mediaDoc ? {
    id: mediaDoc._id,
    filename: mediaDoc.filename,
    thumbnail: mediaDoc.thumbnail,
    cloudinarySecureUrl: mediaDoc.cloudinarySecureUrl,
    mediaType: mediaDoc.mediaType,
    customMediaTypeId: mediaDoc.customMediaTypeId,
    title: mediaDoc.title,
    description: mediaDoc.description,
    altText: mediaDoc.altText,
    fileSize: mediaDoc.fileSize,
    format: mediaDoc.format,
    width: mediaDoc.width,
    height: mediaDoc.height,
    duration: mediaDoc.duration,
    tags: mediaDoc.tags,
    relatedFiles: mediaDoc.relatedFiles,
    customMetadata: mediaDoc.customMetadata,
    aiGenerated: mediaDoc.aiGenerated,
    dateModified: new Date(mediaDoc.dateModified),
  } : null;
  
  if (mediaDoc === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (media === null) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-slate-400">Media not found</p>
        <button
          onClick={() => navigate("/library")}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-200 bg-slate-700 border border-slate-600 rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Library
        </button>
      </div>
    );
  }

  const deleteMediaFIle = () => {
    
  };


  return (
    <>
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/library")}
          className="cursor-pointer inline-flex items-center px-4 py-2 text-sm font-medium text-slate-200 bg-slate-700 border border-slate-600 rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Library
        </button>
        <h1 className="text-2xl font-bold text-white">{media.title}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="space-y-4 bg-slate-800 rounded-lg p-4 col-span-2">
        <div className="flex justify-end gap-2">
            <button className="cursor-pointer text-white hover:text-cyan-500 transition-colors" onClick={() => setEditDialogOpen(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                <span className="sr-only">Edit</span>
            </button>
            <button className="cursor-pointer text-white hover:text-cyan-500 transition-colors" onClick={deleteMediaFIle}>
                <Trash2 className="h-4 w-4 mr-2" />
                <span className="sr-only">Delete</span>
            </button>
        </div>
          <div>
            {media.mediaType === 'image' ? (
            <LazyImage
              src={media.thumbnail}
              alt={media.altText || media.title}
              mediaType={media.mediaType}
              className="w-full h-auto rounded"
            />
            ) : media.mediaType === 'video' || media.mediaType === 'audio' ? (
              <div className="w-full bg-slate-900 rounded overflow-hidden" style={{ maxHeight: '800px' }}>
                <div 
                  className="relative w-full" 
                  style={{ 
                    paddingTop: media.width && media.height 
                      ? `${(media.height / media.width) * 100}%`
                      : '56.25%',
                    maxHeight: '800px'
                  }}
                >
                  <div className="absolute inset-0" style={{ maxHeight: '800px' }}>
                    
                    <ReactPlayer 
                      src={media.cloudinarySecureUrl} 
                      width="100%" 
                      height="100%"
                      className="rounded"
                      controls 
                    />
                  </div>
                </div>
              </div>
            ) : null }
          </div>
        </div>

        <div className="space-y-6 bg-slate-800 rounded-lg">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white">Details</h2>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-400">Filename</label>
                <p className="text-white">{media.filename}</p>
              </div>

              {media.description && (
                <div>
                  <label className="text-sm font-medium text-slate-400">Description</label>
                  <p className="text-white">{media.description}</p>
                </div>
              )}

              {media.altText && (
                <div>
                  <label className="text-sm font-medium text-slate-400">Alt Text</label>
                  <p className="text-white">{media.altText}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-slate-400">File Size</label>
                <p className="text-white">{formatFileSize(media.fileSize)}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-400">Format</label>
                <p className="text-white">{media.format}</p>
              </div>

              {media.width && media.height && (
                <div>
                  <label className="text-sm font-medium text-slate-400">Dimensions</label>
                  <p className="text-white">{media.width} × {media.height}</p>
                </div>
              )}

              {media.duration && (
                <div>
                  <label className="text-sm font-medium text-slate-400">Duration</label>
                  <p className="text-white">{Math.floor(media.duration / 60)}:{(media.duration % 60).toString().padStart(2, '0')}</p>
                </div>
              )}

              {media.tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-slate-400">Tags</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {media.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-slate-700 text-slate-200 rounded text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-slate-400">Date Modified</label>
                <p className="text-white">
                  {new Date(media.dateModified).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <MediaEditDialog
      open={editDialogOpen}
      onOpenChange={setEditDialogOpen}
      media={media}
    />
    </>
  );
};

export default MediaDetail;
