import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Menu, X } from 'lucide-react'

export function DashboardLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* Desktop Sidebar (Visible md and up) */}
      <div className="hidden md:flex md:shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 flex md:hidden" 
          role="dialog" 
          aria-modal="true"
        >
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-600 bg-opacity-75 transition-opacity" 
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>

          {/* Sidebar drawer */}
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-slate-900 transition duration-300 ease-in-out transform">
            <div className="absolute right-0 top-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden bg-linear-to-r from-purple-500 via-indigo-500 to-cyan-500 text-white">
        {/* Mobile Header (Hidden on md and up) */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden">
          <h1 className="text-lg font-bold text-slate-900">Media Manager</h1>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-500 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-7xl h-full flex flex-col">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
