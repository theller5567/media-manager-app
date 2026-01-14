import { UploadIcon } from "lucide-react"

function MediaHeader() {
  return (
    <div className="flex items-center justify-between bg-slate-800 p-4 rounded-sm">
        <div>
            <button className="flex items-center gap-2 bg-cyan-500 text-white px-4 py-2 rounded-sm hover:bg-cyan-600 transition-colors cursor-pointer">
                <UploadIcon className="h-4 w-4" />
                Upload Media
            </button>
        </div>
        <div className="flex items-center gap-4">
        </div>
    </div>
  )
}

export default MediaHeader