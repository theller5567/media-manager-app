import Link from "next/link";
import { AlertCircle, CheckCircle2, Clock, ArrowRight } from "lucide-react";

export function ProblemSolution() {
  return (
    <section className="py-20 px-4 bg-slate-900 relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-r from-purple-500/5 via-indigo-500/5 to-cyan-500/5 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Problem Column */}
          <div className="bg-slate-800/50 p-8 rounded-lg border border-red-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">The Problem</h3>
            </div>
            <ul className="space-y-4 text-slate-300">
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">•</span>
                <span>Media scattered across folders, drives, and cloud storage</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">•</span>
                <span>Hours wasted searching for the right file</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">•</span>
                <span>Inconsistent metadata and missing information</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">•</span>
                <span>Team collaboration bottlenecks and version chaos</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">•</span>
                <span>No way to find assets by meaning or context</span>
              </li>
            </ul>
          </div>

          {/* Solution Column */}
          <div className="bg-slate-800/50 p-8 rounded-lg border border-cyan-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">The Solution</h3>
            </div>
            <ul className="space-y-4 text-slate-300">
              <li className="flex items-start gap-3">
                <span className="text-cyan-400 mt-1">✓</span>
                <span>Centralized media library with AI-powered organization</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan-400 mt-1">✓</span>
                <span>Semantic search that understands context and meaning</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan-400 mt-1">✓</span>
                <span>Custom metadata fields tailored to your workflow</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan-400 mt-1">✓</span>
                <span>Real-time collaboration with instant updates</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan-400 mt-1">✓</span>
                <span>Find assets by concept, not just keywords</span>
              </li>
            </ul>
          </div>

          {/* Urgency Column */}
          <div className="bg-linear-to-br from-purple-500/10 via-indigo-500/10 to-cyan-500/10 p-8 rounded-lg border border-purple-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">Why Act Now</h3>
            </div>
            <div className="space-y-4 mb-6">
              <div className="bg-slate-900/50 p-4 rounded-lg border border-purple-500/20">
                <p className="text-sm font-semibold text-purple-400 mb-2">Limited Time</p>
                <p className="text-white font-bold text-lg">14-Day Free Trial</p>
                <p className="text-slate-400 text-sm mt-1">No credit card required</p>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-lg border border-indigo-500/20">
                <p className="text-sm font-semibold text-indigo-400 mb-2">Early Adopter Bonus</p>
                <p className="text-white font-bold text-lg">20% Off First Year</p>
                <p className="text-slate-400 text-sm mt-1">For the first 100 customers</p>
              </div>
            </div>
            <Link
              href="/demo"
              className="inline-flex items-center justify-center gap-2 w-full bg-linear-to-r from-purple-500 via-indigo-500 to-cyan-500 hover:from-purple-600 hover:via-indigo-600 hover:to-cyan-600 text-white font-semibold px-6 py-4 rounded-lg transition-all shadow-lg shadow-purple-500/25"
            >
              Start Free Trial Now
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
