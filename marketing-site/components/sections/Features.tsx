import { 
  Sparkles, 
  Layers, 
  Search, 
  Users, 
  Video, 
  Shield 
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI Auto-Tagging",
    description: "Never manually tag again. Our AI automatically analyzes and tags your media, saving hours of work.",
  },
  {
    icon: Layers,
    title: "Custom Media Types",
    description: "Build metadata that matches your workflow. Create custom fields and validation rules for your specific needs.",
  },
  {
    icon: Search,
    title: "Semantic Search",
    description: "Find media by meaning, not just keywords. Search for concepts and ideas, not just file names.",
  },
  {
    icon: Users,
    title: "Real-Time Collaboration",
    description: "See updates instantly across your team. No refresh needed—changes appear in real-time.",
  },
  {
    icon: Video,
    title: "Video Thumbnail Control",
    description: "Frame-accurate thumbnail selection. Choose the perfect frame to represent your videos.",
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    description: "Enterprise-grade security and permissions. Control who can view, edit, or manage your media.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 px-4 bg-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Everything You Need to Manage Media
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Powerful features designed to make media management effortless and intelligent.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-transparent hover:bg-linear-to-r hover:from-purple-500/10 hover:via-indigo-500/10 hover:to-cyan-500/10 transition-all relative group"
              >
                <div className="absolute inset-0 rounded-lg bg-linear-to-r from-purple-500/0 via-indigo-500/0 to-cyan-500/0 group-hover:from-purple-500/5 group-hover:via-indigo-500/5 group-hover:to-cyan-500/5 transition-all duration-300 pointer-events-none" />
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-linear-to-r from-purple-500/20 via-indigo-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:from-purple-500/30 group-hover:via-indigo-500/30 group-hover:to-cyan-500/30 transition-all">
                    <Icon className="h-6 w-6 text-white bg-linear-to-r from-purple-400 via-indigo-400 to-cyan-400 bg-clip-text" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
