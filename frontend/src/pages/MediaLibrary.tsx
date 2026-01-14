import { useState } from "react";
import MediaHeader from "../components/layout/MediaHeader";
import MediaList from "../components/layout/MediaList";
import MediaUploader from "../components/layout/MediaUploader";

function MediaLibrary() {

  const [showUploader] = useState(false);
  
  return (
    <div className="relative flex flex-col gap-4 h-full flex-1 min-h-0">
      <h2 className="text-2xl font-bold text-white shrink-0">Media Library</h2>
      {showUploader && <MediaUploader />}
      <MediaHeader />
      <div className="flex-1 min-h-0 flex flex-col">
        <MediaList />
      </div>
    </div>
  );
}

export default MediaLibrary;
