import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Library, Tag, User, Settings } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Media Library', href: '/library', icon: Library },
  { label: 'Tag Management', href: '/tags', icon: Tag },
  { label: 'Profile', href: '/profile', icon: User },
  { label: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <div className="flex h-full flex-col bg-slate-900 text-white w-64">
      <div className="p-6">
        <h1 className="text-xl font-bold tracking-tight text-cyan-400">Media Manager</h1>
      </div>
      
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.href}
              to={item.href}
              className={twMerge(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-slate-800 text-white" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className={twMerge(
                "mr-3 h-5 w-5 shrink-0",
                isActive ? "text-cyan-400" : "text-slate-400 group-hover:text-white"
              )} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
        v1.0.0
      </div>
    </div>
  )
}
