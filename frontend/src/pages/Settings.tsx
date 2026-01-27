import Header from '@/components/layout/Header';
import { 
  LayoutGrid, 
  List, 
  Cloud, 
  Cpu, 
  User, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Palette
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Settings = () => {
  const { viewMode, setViewMode } = useUIStore();

  const sections = [
    {
      title: "UI Preferences",
      description: "Customize how the application looks and feels.",
      icon: Palette,
      content: (
        <div className="space-y-6">
          <div className="flex flex-col gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-tight">Default View Mode</label>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">Choose how your media library is displayed by default.</p>
            </div>
            <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700 w-full">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-bold transition-all uppercase tracking-tight",
                  viewMode === 'grid' 
                    ? "bg-slate-800 text-cyan-400 shadow-sm border border-slate-700" 
                    : "text-slate-500 hover:text-slate-300"
                )}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-bold transition-all uppercase tracking-tight",
                  viewMode === 'list' 
                    ? "bg-slate-800 text-cyan-400 shadow-sm border border-slate-700" 
                    : "text-slate-500 hover:text-slate-300"
                )}
              >
                <List className="w-3.5 h-3.5" />
                List
              </button>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "User Profile",
      description: "Manage your account information and security settings.",
      icon: User,
      content: (
        <Link 
          to="/profile"
          className="flex items-center justify-between p-3 rounded-xl border border-slate-700 bg-slate-900/50 hover:bg-slate-900 transition-colors group shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-slate-800 border border-slate-700 group-hover:scale-110 transition-transform">
              <User className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-white uppercase tracking-tight">Account Settings</span>
              <p className="text-[10px] text-slate-500 font-medium">Update name, email, and password.</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
        </Link>
      )
    },
    {
      title: "Service Integrations",
      description: "Status of connected external services.",
      icon: Zap,
      content: (
        <div className="flex flex-col gap-3">
          <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-slate-900 border border-emerald-500/20 text-emerald-400 shadow-sm shrink-0">
              <Cloud className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-white uppercase tracking-tight">Cloudinary</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold uppercase">Active</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Media storage and real-time transformations are connected.</p>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-blue-500/20 bg-blue-500/5 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-slate-900 border border-blue-500/20 text-blue-400 shadow-sm shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-white uppercase tracking-tight">Gemini AI</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-bold uppercase">Active</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed">AI-powered media analysis and tagging is enabled.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Security & Privacy",
      description: "Manage your data and privacy preferences.",
      icon: ShieldCheck,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-700 bg-slate-900/30 shadow-sm opacity-50 cursor-not-allowed">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-white uppercase tracking-tight">Two-Factor Auth</span>
              <p className="text-[10px] text-slate-500 font-medium leading-tight">Add an extra layer of security.</p>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-500 font-bold uppercase border border-slate-700 whitespace-nowrap">Coming Soon</span>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="relative flex flex-col gap-6 h-full flex-1 min-h-0">
      <Header 
        title="Settings" 
        description="Configure global application settings and integrations." 
      />
      
      <div className="flex-1 min-h-0 flex-wrap pb-10">
        <div className="grid grid-cols-2 gap-6">
          {sections.map((section, index) => (
            <div key={index} className="bg-slate-800 rounded-sm w-full flex flex-col gap-4 shrink-0">
              {/* Kanban Column Header */}
              <div className="flex items-center justify-between px-2 py-1 border-b border-slate-700/50">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-slate-800 border border-slate-700 text-cyan-400">
                    <section.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">{section.title}</h3>
                </div>
                <div className="h-5 w-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500">
                  {index + 1}
                </div>
              </div>
              
              {/* Kanban Column Card */}
              <div className="bg-slate-800/40 rounded-xl border border-slate-700/60 p-5 shadow-sm hover:border-slate-700 transition-colors flex flex-col gap-4">
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-tight leading-relaxed">
                  {section.description}
                </p>
                <div className="flex-1">
                  {section.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;
