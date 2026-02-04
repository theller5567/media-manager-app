import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { ArrowLeft, Loader2, Pencil, Trash2, ImageIcon, DownloadIcon } from "lucide-react";
import LazyImage from "@/components/ui/LazyImage";
import { formatFileSize, type MediaItem } from "@/lib/mediaUtils";
import { useState } from "react";
import MediaEditDialog from "@/components/media/MediaEditDialog";
import ThumbnailChangeDialog from "@/components/media/ThumbnailChangeDialog";
import DownloadDialog from "@/components/media/DownloadDialog";
import ReactPlayer from "react-player";
import { useAuth } from "@/hooks/useAuth";
import { useRoleChecks } from "@/hooks/useRoleChecks";
import { canEditMedia, canDeleteMedia } from "@/lib/rbac";
import type { User } from "@/lib/rbac";
import Header from "@/components/layout/Header";

const MediaDetail = () => {
  const { mediaId } = useParams<{ mediaId: string }>();
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [thumbnailDialogOpen, setThumbnailDialogOpen] = useState(false);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const { currentUser } = useAuth();
  const { isAdmin: userIsAdmin } = useRoleChecks();

  const mediaDoc = useQuery(
    api.queries.media.getById,
    mediaId ? { id: mediaId as Id<"media"> } : "skip"
  );

  const deleteMediaMutation = useMutation(api.mutations.media.deleteMedia);

  // Convert Convex document to MediaItem format
  const media = mediaDoc
    ? {
        id: mediaDoc._id,
        filename: mediaDoc.filename,
        thumbnail: mediaDoc.thumbnail,
        cloudinarySecureUrl: mediaDoc.cloudinarySecureUrl,
        cloudinaryPublicId: mediaDoc.cloudinaryPublicId,
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
        uploadedBy: mediaDoc.uploadedBy,
        uploadedByEmail: (mediaDoc as any).uploadedByEmail,
        uploadedByName: (mediaDoc as any).uploadedByName,
      }
    : null;

  // Check permissions
  // Use server-side admin check (includes email-based admin) combined with ownership check
  // If user is admin (via server check), they can edit/delete any media
  // Otherwise, use the client-side RBAC check (which checks ownership)
  const canEdit = media && currentUser
    ? (userIsAdmin === true || canEditMedia(currentUser as User | null, media as any))
    : false;
  const canDelete = media && currentUser
    ? (userIsAdmin === true || canDeleteMedia(currentUser as User | null, media as any))
    : false;

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
  

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this media file? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteMediaMutation({ id: media.id as Id<"media"> });
      navigate("/library");
    } catch (error) {
      console.error("Failed to delete media:", error);
      alert(
        "Failed to delete media. You may not have permission to delete this file."
      );
    }
  };

  const handleDownload = () => {
    setDownloadDialogOpen(true);
  };

  return (
    <>
      <div className="relative flex flex-col gap-4 h-full flex-1 min-h-0">
        <Header title="Media Detail" description="View and manage media details" childrenLarge={true} >
              <>
                  {currentUser && (
                    <button
                      className="bg-slate-700 cursor-pointer text-white hover:text-cyan-500 transition-colors inline-flex items-center gap-2 px-3 py-2 rounded-md"
                      onClick={handleDownload}
                    >
                      <DownloadIcon className="h-4 w-4" />
                      <span>Download</span>
                    </button>
                  )}
                {(canEdit || canDelete) && (
                  <>
                {canEdit && media.mediaType === "video" && (
                  <button
                    className="bg-slate-700 cursor-pointer text-white hover:text-cyan-500 transition-colors inline-flex items-center gap-2 px-3 py-2 rounded-md"
                    onClick={() => setThumbnailDialogOpen(true)}
                  >
                    <ImageIcon className="h-4 w-4" />
                    <span>Change Thumbnail</span>
                  </button>
                )}
                {canEdit && (
                  <button
                    className="bg-slate-700 cursor-pointer text-white hover:text-cyan-500 transition-colors inline-flex items-center gap-2 px-3 py-2 rounded-md"
                    onClick={() => setEditDialogOpen(true)}
                  >
                    <Pencil className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                )}
                {canDelete && (
                  <button
                    className="bg-slate-700 cursor-pointer text-white hover:text-red-500 transition-colors inline-flex items-center gap-2 px-3 py-2 rounded-md"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </button>
                )}
                  </>
                )}
              </>
        </Header>
        <div className="grid grid-cols-1 md:grid-cols-3 md:gap-6">
          <div className="mb-4 space-y-4 bg-slate-800 rounded-lg p-4 col-span-2 md:mb-0">
            
            <div>
              {media.mediaType === "image" ? (
                <LazyImage
                  src={media.thumbnail}
                  alt={media.altText || media.title}
                  mediaType={media.mediaType}
                  showOverlay={false}
                  className="w-full h-auto rounded"
                />
              ) : media.mediaType === "video" || media.mediaType === "audio" ? (
                <>
                  {/* Video Player */}
                  <div
                    className="w-full bg-slate-900 rounded overflow-hidden"
                    style={{ maxHeight: "800px" }}
                  >
                    <div
                      className="relative w-full"
                      style={{
                        paddingTop:
                          media.width && media.height
                            ? `${(media.height / media.width) * 100}%`
                            : "56.25%",
                        maxHeight: "800px",
                      }}
                    >
                      <div className="absolute inset-0" style={{ maxHeight: "800px" }} >
                        <ReactPlayer
                          src={media.cloudinarySecureUrl}
                          width="100%"
                          height="100%"
                          light={media.thumbnail}
                          className="rounded"
                          controls
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          <div className="space-y-6 bg-slate-800 rounded-lg gap-2">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-white mb-2">Details</h2>
              <div className="space-y-3">
                {(media.uploadedByEmail || media.uploadedByName) && (
                  <div>
                    <label className="text-sm font-medium text-slate-400">
                      Uploaded By
                    </label>
                    <p className="text-white">
                      {media.uploadedByName ||
                        media.uploadedByEmail ||
                        "Unknown User"}
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-slate-400">
                    Filename
                  </label>
                  <p className="text-white">{media.filename}</p>
                </div>

                {media.description && (
                  <div>
                    <label className="text-sm font-medium text-slate-400">
                      Description
                    </label>
                    <p className="text-white">{media.description}</p>
                  </div>
                )}

                {media.altText && (
                  <div>
                    <label className="text-sm font-medium text-slate-400">
                      Alt Text
                    </label>
                    <p className="text-white">{media.altText}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-slate-400">
                    File Size
                  </label>
                  <p className="text-white">{formatFileSize(media.fileSize)}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-400">
                    Format
                  </label>
                  <p className="text-white">{media.format}</p>
                </div>

                {media.width && media.height && (
                  <div>
                    <label className="text-sm font-medium text-slate-400">
                      Dimensions
                    </label>
                    <p className="text-white">
                      {media.width} × {media.height}
                    </p>
                  </div>
                )}

                {media.duration && (
                  <div>
                    <label className="text-sm font-medium text-slate-400">
                      Duration
                    </label>
                    <p className="text-white">
                      {Math.floor(media.duration / 60)}:
                      {(media.duration % 60).toString().padStart(2, "0")}
                    </p>
                  </div>
                )}

                {media.tags.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-slate-400">
                      Tags
                    </label>
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
                  <label className="text-sm font-medium text-slate-400">
                    Date Modified
                  </label>
                  <p className="text-white">
                    {new Date(media.dateModified).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {currentUser && media && (
        <DownloadDialog
          open={downloadDialogOpen}
          onOpenChange={setDownloadDialogOpen}
          media={
            media as MediaItem & {
              cloudinaryPublicId: string;
              cloudinarySecureUrl: string;
              width?: number;
              height?: number;
              format?: string;
            }
          }
        />
      )}
      {canEdit && (
        <>
          <MediaEditDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            media={media}
          />
          {media.mediaType === "video" && (
            <ThumbnailChangeDialog
              open={thumbnailDialogOpen}
              onOpenChange={setThumbnailDialogOpen}
              media={
                media as MediaItem & {
                  duration?: number;
                  cloudinarySecureUrl: string;
                }
              }
            />
          )}
        </>
      )}
    </>
  );
};

export default MediaDetail;
