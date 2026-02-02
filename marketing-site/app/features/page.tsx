import { Features } from "@/components/sections/Features";
import { CTA } from "@/components/sections/CTA";
import { 
  Sparkles, 
  Layers, 
  Search, 
  Users, 
  Video, 
  Shield,
  Zap,
  Globe,
  Lock,
  BarChart3,
  FileText,
  ImageIcon
} from "lucide-react";

const allFeatures = [
  {
    category: "AI & Automation",
    features: [
      {
        icon: Sparkles,
        title: "AI Auto-Tagging",
        description: "Automatically generate tags, descriptions, and metadata using advanced AI.",
      },
      {
        icon: Search,
        title: "Semantic Search",
        description: "Find media by meaning and context, not just keywords.",
      },
      {
        icon: Zap,
        title: "Smart Suggestions",
        description: "AI-powered recommendations for tags and metadata.",
      },
    ],
  },
  {
    category: "Organization",
    features: [
      {
        icon: Layers,
        title: "Custom Media Types",
        description: "Create custom metadata schemas that match your workflow.",
      },
      {
        icon: FileText,
        title: "Flexible Metadata",
        description: "Add any custom fields you need: text, numbers, dates, dropdowns, and more.",
      },
      {
        icon: BarChart3,
        title: "Advanced Filtering",
        description: "Filter and sort by any metadata field with powerful query builders.",
      },
    ],
  },
  {
    category: "Collaboration",
    features: [
      {
        icon: Users,
        title: "Real-Time Updates",
        description: "See changes instantly across your team without refreshing.",
      },
      {
        icon: Shield,
        title: "Role-Based Access",
        description: "Control who can view, edit, or manage your media.",
      },
      {
        icon: Lock,
        title: "Secure Sharing",
        description: "Share media with external partners securely.",
      },
    ],
  },
  {
    category: "Media Management",
    features: [
      {
        icon: Video,
        title: "Video Thumbnail Control",
        description: "Select frame-accurate thumbnails for your videos.",
      },
      {
        icon: ImageIcon,
        title: "Image Optimization",
        description: "Automatic image optimization and multiple format support.",
      },
      {
        icon: Globe,
        title: "Cloud Storage",
        description: "Secure cloud storage with automatic backups and versioning.",
      },
    ],
  },
];

export const metadata = {
  title: "Features",
  description: "Discover all the powerful features that make Media Manager the best choice for your team.",
};

export default function FeaturesPage() {
  return (
    <main className="min-h-screen pt-16">
      <div className="py-20 px-4 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Powerful Features for Modern Teams
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Everything you need to organize, search, and collaborate on your digital assets.
            </p>
          </div>
          
          {allFeatures.map((category) => (
            <div key={category.category} className="mb-16">
              <h2 className="text-3xl font-bold text-white mb-8">{category.category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={feature.title}
                      className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-cyan-500 transition-colors"
                    >
                      <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-4">
                        <Icon className="h-6 w-6 text-cyan-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-slate-400 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Features />
      <CTA />
    </main>
  );
}
