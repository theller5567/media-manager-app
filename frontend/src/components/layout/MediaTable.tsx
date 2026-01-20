import React, { useRef, useEffect, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useReactTable, getCoreRowModel, type ColumnDef, flexRender } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { getMediaTypeIcon, formatFileSize, type MediaItem, getMediaTypeColor, getCustomMediaTypeById } from "@/lib/mediaUtils";
import { usePaginatedMedia } from "@/hooks/usePaginatedMedia";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import { Link, useSearchParams } from "react-router-dom";
import type { MediaType } from "@/types/mediaType";
import { useAuth } from "@/hooks/useAuth";

const MediaTable: React.FC = () => {
  const [searchParams] = useSearchParams();
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
  
  // Fetch MediaTypes from Convex
  const mediaTypesData = useQuery(api.queries.mediaTypes.list) || [];
  
  // Create MediaType lookup map by ID
  const mediaTypesMap = useMemo(() => {
    const map = new Map<string, MediaType>();
    mediaTypesData.forEach((mt) => {
      map.set(mt._id, { 
        ...mt, 
        id: mt._id,
        createdAt: new Date(mt.createdAt),
        updatedAt: new Date(mt.updatedAt),
      });
    });
    return map;
  }, [mediaTypesData]);
  
  // Convert Convex data to MediaItem format
  const mediaItems = useMemo(() => {
    return mediaData.map((item: any) => ({
      ...item,
      id: item._id,
      dateModified: new Date(item.dateModified),
    }));
  }, [mediaData]);

  // Define columns with uploader column
  const columns: ColumnDef<MediaItem>[] = useMemo(() => [
    {
      accessorKey: "thumbnail",
      header: "Thumbnail",
      cell: ({ row }) => {
        const item = row.original;
        const Icon = getMediaTypeIcon(item.mediaType);
        
        const isImageUrl = (url: string): boolean => {
          if (!url) return false;
          const lowerUrl = url.toLowerCase();
          const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif', '.bmp'];
          const audioExtensions = ['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a'];
          const videoExtensions = ['.mp4', '.mov', '.avi', '.webm', '.mkv', '.flv'];
          const documentExtensions = ['.pdf', '.doc', '.docx', '.txt'];
          
          const imageHostingServices = ['picsum.photos', 'unsplash.com', 'pexels.com', 'imgur.com', 'cloudinary.com'];
          if (imageHostingServices.some(service => lowerUrl.includes(service))) return true;
          
          if (audioExtensions.some(ext => lowerUrl.includes(ext))) return false;
          if (videoExtensions.some(ext => lowerUrl.includes(ext))) return false;
          if (documentExtensions.some(ext => lowerUrl.includes(ext))) return false;
          
          if (imageExtensions.some(ext => lowerUrl.includes(ext))) return true;
          if (item.mediaType === 'image') return true;
          
          return false;
        };
        
        const shouldShowImage = item.mediaType === 'image' && item.thumbnail && isImageUrl(item.thumbnail);
        
        return (
          <div className="w-12 h-12 rounded border overflow-hidden bg-gray-100 flex items-center justify-center">
            {shouldShowImage ? (
              <img
                src={item.thumbnail}
                alt={item.filename}
                className="w-full h-full object-cover"
              />
            ) : (
              React.createElement(Icon, { className: "h-6 w-6 text-slate-400" })
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => {
        const title = row.getValue("title") as string;
        return (
          <div className="font-medium text-sm max-w-xs truncate" title={title}>
            <Link to={`/media/${row.original.id}`}>{title}</Link>
          </div>
        );
      },
    },
    {
      accessorKey: "mediaType",
      header: "Type",
      cell: ({ row, table }) => {
        const mediaType = row.getValue("mediaType") as MediaItem["mediaType"];
        const IconComponent = getMediaTypeIcon(mediaType);
        const customMediaType = row.original.customMediaTypeId 
          ? (table.options.meta as any)?.getMediaType?.(row.original.customMediaTypeId)
          : undefined;
        const mediaColor = getMediaTypeColor(customMediaType);
        
        return (
          <div className="flex items-center gap-2">
            <span style={{ color: mediaColor }}>
              {React.createElement(IconComponent, { className: "h-4 w-4" })}
            </span>
            <span className="text-sm capitalize">{mediaType}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "uploadedBy",
      header: "Uploaded By",
      cell: ({ row }) => {
        const uploadedBy = (row.original as any).uploadedBy;
        if (!uploadedBy) {
          return <span className="text-sm text-slate-400">Unknown</span>;
        }
        // For now, show the user ID - can be enhanced to show user name
        return (
          <span className="text-sm text-slate-300">
            {uploadedBy}
          </span>
        );
      },
    },
    {
      accessorKey: "fileSize",
      header: "Size",
      cell: ({ row }) => {
        const fileSize = row.getValue("fileSize") as number;
        return (
          <span className="text-sm text-gray-600">
            {formatFileSize(fileSize)}
          </span>
        );
      },
    },
    {
      accessorKey: "customMediaTypeId",
      header: "Custom Type",
      cell: ({ row, table }) => {
        const customMediaTypeId = row.getValue("customMediaTypeId") as string;
        const customMediaType = customMediaTypeId 
          ? (table.options.meta as any)?.getMediaType?.(customMediaTypeId)
          : undefined;
        const customMediaTypeName = getCustomMediaTypeById(customMediaType);
        return (
          <span className="text-sm text-gray-600">
            {customMediaTypeName}
          </span>
        );
      },
    },
    {
      accessorKey: "tags",
      header: "Tags",
      cell: ({ row }) => {
        const tags = row.getValue("tags") as string[];
        return (
          <div className="flex flex-wrap gap-1 max-w-xs">
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="outline" className="text-xs text-white">
                +{tags.length - 3}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "dateModified",
      header: "Modified",
      cell: ({ row }) => {
        const date = row.getValue("dateModified") as Date;
        return (
          <span className="text-sm text-gray-600">
            {format(date, "MMM dd, yyyy")}
          </span>
        );
      },
    },
  ], []);

  // Use paginated media hook for table mode (infinite scroll)
  const { data, isLoading, hasMore, loadMore } = usePaginatedMedia({
    allData: mediaItems,
    mode: 'table',
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      getMediaType: (id: string) => mediaTypesMap.get(id),
    },
  });

  // Ref for the scrollable container
  const parentRef = useRef<HTMLDivElement>(null);

  // Virtualizer for row virtualization
  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 5,
  });

  // Get visible rows from virtualizer
  const virtualRows = rowVirtualizer.getVirtualItems();

  // Intersection Observer for infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoading, loadMore]);

  return (
    <div className="rounded-md border border-slate-700 overflow-hidden flex flex-col h-full">
      <div
        ref={parentRef}
        className="flex-1 min-h-0 overflow-auto relative"
      >
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-slate-800">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="bg-slate-800">
                    {header.isPlaceholder
                      ? null
                      : typeof header.column.columnDef.header === 'string'
                        ? header.column.columnDef.header
                        : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <p className="text-slate-400">
                    {filterMyUploads 
                      ? "You haven't uploaded any media yet." 
                      : "No media files found."
                    }
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              <>
                {virtualRows.length > 0 && virtualRows[0]?.start > 0 && (
                  <TableRow style={{ height: `${virtualRows[0].start}px` }}>
                    {columns.map((_, index) => (
                      <TableCell key={`spacer-top-${index}`} style={{ padding: 0, border: 'none' }} />
                    ))}
                  </TableRow>
                )}
                
                {virtualRows.map((virtualRow) => {
                  const row = table.getRowModel().rows[virtualRow.index];
                  if (!row) return null;

                  return (
                    <TableRow
                      key={row.id}
                      data-index={virtualRow.index}
                      ref={rowVirtualizer.measureElement}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}

                {virtualRows.length > 0 && (
                  <TableRow
                    style={{
                      height: `${
                        rowVirtualizer.getTotalSize() -
                        (virtualRows[virtualRows.length - 1]?.end ?? rowVirtualizer.getTotalSize())
                      }px`,
                    }}
                  >
                    {columns.map((_, index) => (
                      <TableCell key={`spacer-bottom-${index}`} style={{ padding: 0, border: 'none' }} />
                    ))}
                  </TableRow>
                )}

                {hasMore && (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="py-4" style={{ paddingBottom: '40px' }}>
                      <div ref={loadMoreRef} className="flex items-center justify-center">
                        {isLoading ? (
                          <div className="flex items-center gap-2 text-slate-400">
                            <LoadingSkeleton className="h-4 w-4" />
                            <span className="text-sm">Loading more...</span>
                          </div>
                        ) : (
                          <div className="h-4" />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default MediaTable;
