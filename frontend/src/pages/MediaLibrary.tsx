import { useState } from "react";
import MediaList from "../components/layout/MediaList";
import Header from "../components/layout/Header";
import type { MediaItem } from "@/lib/mediaUtils";
import { MediaUpload } from "../components/media/MediaUpload";
import { UploadIcon } from "lucide-react";

function MediaLibrary() {
  // Convex automatically refetches queries when mutations complete
  // No need for manual refresh state
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  
  const handleUploadComplete = (files: MediaItem[]) => {
    // Convex automatically refetches queries, so no manual refresh needed
    // This callback can be used for additional actions if needed
    console.log('Upload complete:', files);
  };
  
  return (
    <>
    <div className="relative flex flex-col gap-4 h-full flex-1 min-h-0">
      <Header title="Media Library" description="Manage your media library">
        <button onClick={() => setUploadDialogOpen(true)} className="flex items-center gap-2 bg-cyan-500 text-white px-4 py-2 rounded-sm hover:bg-cyan-600 transition-colors cursor-pointer"><UploadIcon className="h-4 w-4" />Upload Media</button>
      </Header>
      {/* <MediaHeader onUploadComplete={() => {}} /> */}
      <div className="flex-1 min-h-0 flex flex-col">
        <MediaList />
      </div>
    </div>
    <MediaUpload
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUploadComplete={handleUploadComplete}
      />
    </>
  );
}

export default MediaLibrary;
