import MediaTable from "./MediaTable";
import { mockMediaData } from "@/data/mockMediaData";
import { useViewMode, useSearchQuery } from "@/store/uiStore";
import { usePaginatedMedia } from "@/hooks/usePaginatedMedia";
import { Search } from "lucide-react";
import ViewToggle from "../ui/viewToggle";
import Pagination from "../ui/Pagination";
import LazyImage from "../ui/LazyImage";
import LoadingSkeleton from "../ui/LoadingSkeleton";

const MediaList = () => {
  const { viewMode } = useViewMode();
  const { searchQuery, setSearchQuery } = useSearchQuery();

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
    allData: mockMediaData || [],
    mode: viewMode === 'grid' ? 'grid' : 'table',
  });

  const isFiltering = searchQuery.trim() !== "";
  const hasResults = paginatedData && paginatedData.length > 0;

  return (
    <div className="rounded-md bg-slate-800 p-2 flex flex-col flex-1 min-h-0">
      {/* Search Input */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center">
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
              {totalCount} of {mockMediaData.length} results
            </span>
          )}
        </div>
        <ViewToggle />
      </div>

      {/* View Content - flex-1 to fill space, pb-10 ensures 40px from bottom */}
      <div className="flex-1 min-h-0 flex flex-col pb-10">
        {viewMode === "grid" ? (
          <>
            {isLoading && !hasResults ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <LoadingSkeleton count={6} className="aspect-video" />
              </div>
            ) : hasResults ? (
              <>
                <div className="grid mb-6 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-6">
                  {paginatedData.map((item) => (
                    <div
                      key={item.id}
                      className="aspect-video rounded-lg bg-slate-700 border border-slate-600 shadow-sm overflow-hidden"
                    >
                      <LazyImage
                        src={item.thumbnail}
                        alt={item.filename}
                        className="w-full h-full"
                        mediaType={item.mediaType}
                      />
                    </div>
                  ))}
                </div>
                {/* Pagination controls */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    isLoading={isLoading}
                  />
                )}
              </>
            ) : (
              <div className="col-span-full text-center py-12 flex-1 flex items-center justify-center">
                <p className="text-slate-400">
                  {isFiltering ? "No results found." : "No media files found."}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex-1 min-h-0" >
              <MediaTable />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MediaList