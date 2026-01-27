import { GridIcon, ListIcon, Columns } from 'lucide-react'
import { useViewMode } from '@/store/uiStore'

const ViewToggle = () => {
  const { viewMode, setViewMode } = useViewMode()
  return (
    <div className="flex items-center gap-2 justify-end">
      <div
        className="cursor-pointer border border-transparent bg-slate-900 py-2 px-2 rounded-sm hover:border-white transition-colors"
        onClick={() => setViewMode("grid")}
        title="Grid View"
      >
        <GridIcon className={`h-6 w-6 ${viewMode === "grid" ? "text-cyan-500" : "text-slate-400"}`} />
      </div>
      <div
        className="cursor-pointer border border-transparent bg-slate-900 py-2 px-2 rounded-sm hover:border-white transition-colors"
        onClick={() => setViewMode("list")}
        title="List View"
      >
        <ListIcon className={`h-6 w-6 ${viewMode === "list" ? "text-cyan-500" : "text-slate-400"}`} />
      </div>
      <div
        className="cursor-pointer border border-transparent bg-slate-900 py-2 px-2 rounded-sm hover:border-white transition-colors"
        onClick={() => setViewMode("kanban")}
        title="Kanban View"
      >
        <Columns className={`h-6 w-6 ${viewMode === "kanban" ? "text-cyan-500" : "text-slate-400"}`} />
      </div>
    </div>
  )
}

export default ViewToggle