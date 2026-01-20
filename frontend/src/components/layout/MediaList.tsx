import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import MediaTable from "./MediaTable";
import { useViewMode, useSearchQuery } from "@/store/uiStore";
import { usePaginatedMedia } from "@/hooks/usePaginatedMedia";
import { Search, Filter } from "lucide-react";
import ViewToggle from "../ui/viewToggle";
import Pagination from "../ui/Pagination";
import LazyImage from "../ui/LazyImage";
import LoadingSkeleton from "../ui/LoadingSkeleton";
import MediaFilters from "../ui/MediaFilters";
import { getAvailableTags } from "@/lib/filteringUtils";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const MediaList = () => {
  const { viewMode } = useViewMode();
  const { searchQuery, setSearchQuery } = useSearchQuery();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser } = useAuth();
  
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
    }));
  }, [mediaData]);

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
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
            <input
              placeholder="Search media..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-8 h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-100 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
          {isFiltering && (
            <span className="text-sm text-slate-400 ml-4">
              {totalCount} of {mediaItems.length} results
            </span>
          )}
          {/* My Uploads Filter Toggle */}
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
        </div>
        <div className="flex items-center gap-2">
          <MediaFilters availableTags={availableTags} />
          <ViewToggle />
        </div>
      </div>

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
                      <div
                        key={item.id}
                        className="aspect-video rounded-lg bg-slate-700 border border-slate-600 shadow-sm overflow-hidden group relative"
                      >
                        <LazyImage
                          src={item.mediaType === 'image' ? (item.thumbnail || '') : ''}
                          alt={item.altText || item.filename}
                          className="w-full h-full"
                          mediaType={item.mediaType}
                          title={item.title}
                          description={item.description}
                          showOverlay={true}
                        />
                        {/* Uploader info overlay */}
                        {item.uploadedBy && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            Uploaded by: {item.uploadedBy}
                          </div>
                        )}
                      </div>
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
    </div>
  )
}

export default MediaList
