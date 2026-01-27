import { useState } from 'react';
import { 
  FileText, 
  Upload, 
  HardDrive, 
  Plus, 
  Image as ImageIcon, 
  Film, 
  File, 
  FileAudio,
  ArrowRight,
  Clock,
  FileIcon,
} from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import Header from '@/components/layout/Header';
import { StatCard } from '@/components/ui/StatCard';
import { formatFileSize } from '@/lib/mediaUtils';
import { Link } from 'react-router-dom';
import LazyImage from '@/components/ui/LazyImage';
import { MediaUpload } from '@/components/media/MediaUpload';

const Dashboard = () => {
  const userStats = useQuery(api.queries.users.getUserStats);
  const recentMedia = useQuery(api.queries.media.list);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const stats = [
    {
      title: "Total Files",
      value: userStats?.uploadCount ?? 0,
      icon: FileText,
      description: "All media items",
      iconClassName: "bg-slate-900 border-slate-700",
    },
    {
      title: "Storage Used",
      value: formatFileSize(userStats?.totalFileSize ?? 0),
      icon: HardDrive,
      description: `Of ${formatFileSize(userStats?.storageLimit ?? 1024 * 1024 * 1024)} total`,
      progress: {
        value: ((userStats?.totalFileSize ?? 0) / (userStats?.storageLimit ?? 1024 * 1024 * 1024)) * 100,
        color: "bg-cyan-500"
      },
      iconClassName: "bg-slate-900 border-slate-700",
    },
    {
      title: "Available Space",
      value: formatFileSize(userStats?.remainingStorage ?? 1024 * 1024 * 1024),
      icon: Plus,
      description: "Remaining storage",
      iconClassName: "bg-slate-900 border-slate-700",
    }
  ];

  const getMediaIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'image': return <ImageIcon className="w-4 h-4" />;
      case 'video': return <Film className="w-4 h-4" />;
      case 'audio': return <FileAudio className="w-4 h-4" />;
      case 'document': return <FileIcon className="w-4 h-4" />;
      default: return <File className="w-4 h-4" />;
    }
  };


  return (
    <div className="relative flex flex-col gap-6 h-full flex-1 min-h-0 overflow-y-auto pb-10">
      <Header 
        title="Dashboard" 
        description="Welcome back to your media manager."
      >
        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-2 bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
        >
          <Upload className="h-4 w-4" />
          Upload Media
        </button>
      </Header>

      <div className=" space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Storage Breakdown */}
          <div className="lg:col-span-1 bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 mb-6 flex items-center gap-2 uppercase tracking-wider">
              <HardDrive className="w-5 h-5 text-cyan-400" />
              Storage Breakdown
            </h3>
            
            <div className="space-y-5">
              {userStats?.storageByType && Object.keys(userStats.storageByType).length > 0 ? (
                Object.entries(userStats.storageByType).map(([type, size]) => (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-slate-300 capitalize">
                        {getMediaIcon(type)}
                        <span>{type}s</span>
                      </div>
                      <span className="font-semibold text-white">{formatFileSize(size)}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                        style={{ width: `${(size / (userStats.totalFileSize || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-slate-500 italic">
                  No data to display
                </div>
              )}
            </div>
          </div>

          {/* Recent Uploads */}
          <div className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-400 flex items-center gap-2 uppercase tracking-wider">
                <Clock className="w-5 h-5 text-cyan-400" />
                Recent Uploads
              </h3>
              <Link 
                to="/library" 
                className="text-sm font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                View Library
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="flex-1">
              {recentMedia && recentMedia.length > 0 ? (
                <div className="divide-y divide-slate-700">
                  {recentMedia.slice(0, 5).map((item) => (
                    <Link 
                      key={item._id} 
                      to={`/media/${item._id}`}
                      className="flex items-center gap-4 p-4 hover:bg-slate-700/50 transition-colors group"
                    >
                      <div className="w-12 h-12 rounded-lg bg-slate-900 overflow-hidden shrink-0 border border-slate-700">
                        {item.thumbnail ? (
                          <LazyImage 
                            src={item.thumbnail} 
                            alt={item.title} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500">
                            {getMediaIcon(item.mediaType)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white truncate group-hover:text-cyan-400 transition-colors">{item.title}</h4>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                          <span className="capitalize">{item.mediaType}</span>
                          <span>•</span>
                          <span>{formatFileSize(item.fileSize || 0)}</span>
                          <span>•</span>
                          <span>{new Date(item._creationTime).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center text-slate-500 flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 opacity-20" />
                  <p>Your media library is empty.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => setIsUploadOpen(true)}
            className="flex flex-col items-center justify-center p-6 bg-cyan-500/10 border border-cyan-500/20 rounded-xl hover:bg-cyan-500/20 transition-colors gap-3 group"
          >
            <div className="p-3 rounded-full bg-slate-900 text-cyan-400 border border-slate-700 shadow-sm group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6" />
            </div>
            <span className="font-bold text-cyan-100 uppercase tracking-wider text-sm">Upload Media</span>
          </button>

          <Link 
            to="/library"
            className="flex flex-col items-center justify-center p-6 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors gap-3 group"
          >
            <div className="p-3 rounded-full bg-slate-900 text-slate-400 border border-slate-700 shadow-sm group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <span className="font-bold text-slate-300 uppercase tracking-wider text-sm">Library</span>
          </Link>

          <Link 
            to="/tag-management"
            className="flex flex-col items-center justify-center p-6 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors gap-3 group"
          >
            <div className="p-3 rounded-full bg-slate-900 text-slate-400 border border-slate-700 shadow-sm group-hover:scale-110 transition-transform">
              <Tags className="w-6 h-6" />
            </div>
            <span className="font-bold text-slate-300 uppercase tracking-wider text-sm">Manage Tags</span>
          </Link>

          <Link 
            to="/settings"
            className="flex flex-col items-center justify-center p-6 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors gap-3 group"
          >
            <div className="p-3 rounded-full bg-slate-900 text-slate-400 border border-slate-700 shadow-sm group-hover:scale-110 transition-transform">
              <SettingsIcon className="w-6 h-6" />
            </div>
            <span className="font-bold text-slate-300 uppercase tracking-wider text-sm">Settings</span>
          </Link>
        </div> */}
      </div>

      <MediaUpload open={isUploadOpen} onOpenChange={setIsUploadOpen} />
    </div>
  );
};

export default Dashboard;
