import { useState } from "react";
import { UploadIcon } from "lucide-react";
import { MediaUpload } from "../media/MediaUpload";
import type { MediaItem } from "@/lib/mediaUtils";

interface MediaHeaderProps {
  onUploadComplete?: (files: MediaItem[]) => void;
}

function MediaHeader({ onUploadComplete }: MediaHeaderProps) {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between bg-slate-800 p-4 rounded-sm">
        <div>
          <button
            onClick={() => setUploadDialogOpen(true)}
            className="flex items-center gap-2 bg-cyan-500 text-white px-4 py-2 rounded-sm hover:bg-cyan-600 transition-colors cursor-pointer"
          >
            <UploadIcon className="h-4 w-4" />
            Upload Media
          </button>
        </div>
        <div className="flex items-center gap-4">
        </div>
      </div>
      <MediaUpload
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUploadComplete={onUploadComplete}
      />
    </>
  );
}

export default MediaHeader;