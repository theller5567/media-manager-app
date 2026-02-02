import { Upload, Settings, Search } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload",
    description: "Drag & drop files with automatic AI analysis. Our system instantly recognizes and categorizes your media.",
  },
  {
    number: "02",
    icon: Settings,
    title: "Organize",
    description: "Custom metadata fields match your business needs. Create Media Types that enforce the exact information you require.",
  },
  {
    number: "03",
    icon: Search,
    title: "Discover",
    description: "Semantic search finds what you need instantly. Search by meaning, not just keywords, and find assets you forgot you had.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 px-4 bg-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Three simple steps to transform your media management workflow.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-cyan-500 to-transparent -z-10" />
                )}
                <div className="bg-slate-900 p-8 rounded-lg border border-slate-700 h-full">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                      <Icon className="h-8 w-8 text-cyan-400" />
                    </div>
                    <span className="text-4xl font-bold text-slate-600">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    {step.description}
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
