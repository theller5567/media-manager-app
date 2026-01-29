import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import MediaTable from "./MediaTable";
import { useViewMode, useSearchQuery } from "@/store/uiStore";
import { usePaginatedMedia } from "@/hooks/usePaginatedMedia";
import { Search, Filter, DownloadIcon } from "lucide-react";
import ViewToggle from "../ui/ViewToggle";
import Pagination from "../ui/Pagination";
import LazyImage from "../ui/LazyImage";
import LoadingSkeleton from "../ui/LoadingSkeleton";
import MediaFilters from "../ui/MediaFilters";
import { getAvailableTags } from "@/lib/filteringUtils";
import { useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import DownloadDialog from "@/components/media/DownloadDialog";
import { downloadMultipleFiles } from "@/lib/downloadUtils";
import type { MediaItem } from "@/lib/mediaUtils";

const MediaList = () => {
  const { viewMode } = useViewMode();
  const { searchQuery, setSearchQuery } = useSearchQuery();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);
  
  // Check if filtering by "My Uploads"
  const filterMyUploads = searchParams.get("filter") === "my-uploads";
  
  // Fetch media from Convex - use getMyUploads if filtering
  const allMediaData = useQuery(api.queries.media.list) || [];
  const myUploadsData = useQuery(
    api.queries.media.getMyUploads,
    currentUser ? {} : "skip"
  ) || [];
  
  // Select which data to use based on filter
  const mediaData = filterMyUploads ? myUploadsData : allMediaData;
  
  // Convert Convex data to MediaItem format (with id as string)
  const mediaItems = useMemo(() => {
    return mediaData.map((item: any) => ({
      ...item,
      id: item._id,
      uploadedBy: item.uploadedBy,
      dateModified: new Date(item.dateModified),
      cloudinaryPublicId: item.cloudinaryPublicId,
      cloudinarySecureUrl: item.cloudinarySecureUrl,
    }));
  }, [mediaData]);

  // Handle single file download
  const handleDownloadClick = (media: MediaItem) => {
    setSelectedMedia(media);
    setDownloadDialogOpen(true);
  };

  // Handle bulk download
  const handleBulkDownload = async () => {
    if (selectedIds.size === 0) return;

    setIsBulkDownloading(true);
    try {
      const filesToDownload = mediaItems
        .filter((item) => selectedIds.has(item.id))
        .map((item) => ({
          url: item.cloudinarySecureUrl,
          filename: item.filename,
        }));

      await downloadMultipleFiles(filesToDownload);
      setSelectedIds(new Set());
    } catch (error) {
      console.error("Bulk download failed:", error);
      alert("Failed to download some files. Please try again.");
    } finally {
      setIsBulkDownloading(false);
    }
  };

  // Toggle selection
  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedData.length && paginatedData.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedData.map((item) => item.id)));
    }
  };

  // Extract available tags from Convex data
  const availableTags = getAvailableTags(mediaItems);

  // Use paginated media hook based on view mode
  // Hook handles debouncing internally
  const {
    data: paginatedData,
    isLoading,
    totalCount,
    currentPage,
    totalPages,
    setPage,
  } = usePaginatedMedia({
    allData: mediaItems,
    mode: viewMode === 'grid' ? 'grid' : 'table',
  });

  const isFiltering = searchQuery.trim() !== "";
  const hasResults = paginatedData && paginatedData.length > 0;

  const toggleMyUploads = () => {
    if (filterMyUploads) {
      searchParams.delete("filter");
    } else {
      searchParams.set("filter", "my-uploads");
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="rounded-md bg-slate-800 p-2 flex flex-col flex-1 min-h-0">
      {/* Search Input */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4">
        {/* Search input - full width on mobile, constrained on desktop */}
        <div className="relative w-full md:flex-1 md:max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
          <input
            placeholder="Search media..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="pl-8 h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-100 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>
        
        {/* Controls row - My Uploads and View Toggle on same row for mobile, full controls on desktop */}
        <div className="flex items-center justify-between md:justify-end gap-2">
          {/* Mobile: My Uploads and View Toggle only */}
          <div className="flex items-center  gap-2 md:hidden w-full justify-between">
            {currentUser && (
              <button
                onClick={toggleMyUploads}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${filterMyUploads 
                    ? "bg-cyan-600 text-white" 
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }
                `}
              >
                <Filter className="h-4 w-4" />
                {filterMyUploads ? "All Media" : "My Uploads"}
              </button>
            )}
            <ViewToggle />
          </div>
          
          {/* Desktop: Full controls with filters */}
          <div className="hidden md:flex items-center gap-2">
            {isFiltering && (
              <span className="text-sm text-slate-400">
                {totalCount} of {mediaItems.length} results
              </span>
            )}
            {currentUser && (
              <button
                onClick={toggleMyUploads}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${filterMyUploads 
                    ? "bg-cyan-600 text-white" 
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }
                `}
              >
                <Filter className="h-4 w-4" />
                {filterMyUploads ? "All Media" : "My Uploads"}
              </button>
            )}
            <MediaFilters availableTags={availableTags} />
            <ViewToggle />
          </div>
        </div>
      </div>

      {/* Bulk download toolbar */}
      {currentUser && viewMode === "grid" && selectedIds.size > 0 && (
        <div className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-md mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={selectedIds.size === paginatedData.length && paginatedData.length > 0}
                onChange={toggleSelectAll}
                className="rounded border-slate-600"
              />
              Select All
            </label>
            <span className="text-sm text-slate-300">
              {selectedIds.size} file{selectedIds.size !== 1 ? "s" : ""} selected
            </span>
          </div>
          <button
            onClick={handleBulkDownload}
            disabled={isBulkDownloading}
            className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 rounded-md hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            <DownloadIcon className="h-4 w-4" />
            {isBulkDownloading ? "Downloading..." : `Download ${selectedIds.size} File${selectedIds.size !== 1 ? "s" : ""}`}
          </button>
        </div>
      )}

      {/* View Content - flex-1 to fill space, pb-10 ensures 40px from bottom */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {viewMode === "grid" ? (
          <>
            {isLoading && !hasResults ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <LoadingSkeleton count={6} className="aspect-video" />
              </div>
            ) : hasResults ? (
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                {/* Scrollable grid container */}
                <div className="flex-1 min-h-0 overflow-y-auto pb-10">
                  <div className="grid mb-6 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-6">
                    {paginatedData.map((item) => (
                      <Link
                        key={item.id}
                        to={`/media/${item.id}`}
                        className="aspect-video rounded-lg bg-slate-700 border border-slate-600 shadow-sm overflow-hidden group relative block"
                      >
                        {/* Selection checkbox */}
                        {currentUser && (
                          <div className="absolute top-2 left-2 z-10">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(item.id)}
                              onChange={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleSelection(item.id);
                              }}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              className="rounded border-slate-600 bg-slate-800"
                            />
                          </div>
                        )}
                        {/* Download button */}
                        {currentUser && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDownloadClick(item);
                            }}
                            className="absolute top-2 right-2 z-10 p-1.5 bg-slate-800/90 text-slate-400 hover:text-cyan-500 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Download"
                          >
                            <DownloadIcon className="h-4 w-4" />
                          </button>
                        )}
                        <LazyImage
                          src={item.thumbnail || ''}
                          alt={item.altText || item.filename}
                          className="w-full h-full"
                          mediaType={item.mediaType}
                          title={item.title}
                          description={item.description}
                          showOverlay={true}
                        />
                        {/* Uploader info overlay */}
                        {/* {item.uploadedBy && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            Uploaded by: {item.uploadedBy}
                          </div>
                        )} */}
                      </Link>
                    ))}
                  </div>
                </div>
                {/* Pagination controls - fixed at bottom */}
                {totalPages > 1 && (
                  <div className="shrink-0 pt-4 border-t border-slate-700">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setPage}
                      isLoading={isLoading}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="col-span-full text-center py-12 flex-1 flex items-center justify-center">
                <p className="text-slate-400">
                  {filterMyUploads 
                    ? "You haven't uploaded any media yet." 
                    : isFiltering 
                      ? "No results found." 
                      : "No media files found."
                  }
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex-1 min-h-0">
              <MediaTable />
            </div>
          </div>
        )}
      </div>
      {currentUser && selectedMedia && (
        <DownloadDialog
          open={downloadDialogOpen}
          onOpenChange={(open) => {
            setDownloadDialogOpen(open);
            if (!open) {
              setSelectedMedia(null);
            }
          }}
          media={
            selectedMedia as MediaItem & {
              cloudinaryPublicId: string;
              cloudinarySecureUrl: string;
              width?: number;
              height?: number;
              format?: string;
            }
          }
        />
      )}
    </div>
  )
}

export default MediaList
