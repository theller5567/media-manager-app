import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Library, Tag, User, Settings, Plus, LogOut, Loader2, FolderOpen } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { useAuth } from '@/hooks/useAuth'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import Avatar from '../ui/Avatar'

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Media Library', href: '/library', icon: Library },
  { label: 'My Uploads', href: '/library?filter=my-uploads', icon: FolderOpen },
  { label: 'Tag Management', href: '/tag-management', icon: Tag },
  { label: 'Media Type Creator', href: '/media-type-creator', icon: Plus },
  { label: 'Profile', href: '/profile', icon: User },
  { label: 'Settings', href: '/settings', icon: Settings },
]

interface SidebarProps {
  onLinkClick?: () => void;
}

export function Sidebar({ onLinkClick }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, isLoading, isAuthenticated, signOut } = useAuth()
  
  // Only run auth queries when authenticated so we never hit the auth component for logged-out users
  const isAdmin = useQuery(api.queries.users.checkIsAdmin, isAuthenticated ? {} : "skip") ?? false
  const isDemoUser = useQuery(api.queries.users.checkIsDemoUser, isAuthenticated ? {} : "skip") ?? false

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter((item) => {
    // Show admin-only items if user is admin OR DemoUser
    // DemoUser can view these pages but changes won't be persisted
    if (item.href === '/tag-management' || item.href === '/media-type-creator') {
      return isAdmin || isDemoUser
    }
    return true
  })

  return (
    <div className="flex h-full flex-col bg-slate-900 text-white w-64">
      <div className="p-6">
        <h1 className="text-xl font-bold tracking-tight text-cyan-400">Media Manager</h1>
      </div>
      
      <nav className="flex-1 space-y-1 px-3">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href.includes('/library') && location.pathname === '/library')
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onLinkClick}
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

      {/* User info and logout */}
      <div className="p-4 border-t border-slate-800">
        {isLoading ? (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
          </div>
        ) : isAuthenticated && currentUser ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center">
                <Avatar user={currentUser} size='small' />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-white truncate">
                    {currentUser.name || 'User'}
                  </p>
                  {isAdmin && (
                    <span className="px-1.5 py-0.5 text-xs font-medium bg-cyan-600 text-white rounded">
                      Admin
                    </span>
                  )}
                  {isDemoUser && !isAdmin && (
                    <span className="px-1.5 py-0.5 text-xs font-medium bg-amber-600 text-white rounded">
                      Demo
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 truncate">
                  {currentUser.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            onClick={onLinkClick}
            className="block w-full text-center rounded-md px-3 py-2 text-sm font-medium text-cyan-400 hover:bg-slate-800 transition-colors"
          >
            Sign In
          </Link>
        )}
      </div>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
        v1.0.0
      </div>
    </div>
  )
}
