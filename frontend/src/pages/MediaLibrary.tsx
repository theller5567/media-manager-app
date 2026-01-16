import MediaHeader from "../components/layout/MediaHeader";
import MediaList from "../components/layout/MediaList";

function MediaLibrary() {
  // Convex automatically refetches queries when mutations complete
  // No need for manual refresh state
  
  return (
    <div className="relative flex flex-col gap-4 h-full flex-1 min-h-0">
      <h2 className="text-2xl font-bold text-white shrink-0">Media Library</h2>
      <MediaHeader onUploadComplete={() => {}} />
      <div className="flex-1 min-h-0 flex flex-col">
        <MediaList />
      </div>
    </div>
  );
}

export default MediaLibrary;
