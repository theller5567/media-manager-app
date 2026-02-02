import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface CTAProps {
  title?: string;
  description?: string;
  primaryText?: string;
  primaryHref?: string;
  secondaryText?: string;
  secondaryHref?: string;
}

export function CTA({
  title = "Ready to Transform Your Media Management?",
  description = "Start your free trial today. No credit card required.",
  primaryText = "Start Free Trial",
  primaryHref = "/demo",
  secondaryText = "Schedule a Demo",
  secondaryHref = "/demo",
}: CTAProps) {
  return (
    <section className="py-20 px-4 bg-linear-to-b from-slate-900 to-slate-800 relative">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-r from-purple-500/5 via-indigo-500/5 to-cyan-500/5 pointer-events-none" />
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          {title}
        </h2>
        <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
          {description}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={primaryHref}
            className="inline-flex items-center justify-center gap-2 bg-linear-to-r from-purple-500 via-indigo-500 to-cyan-500 hover:from-purple-600 hover:via-indigo-600 hover:to-cyan-600 text-white font-semibold px-8 py-4 rounded-lg transition-all text-lg shadow-lg shadow-purple-500/25"
          >
            {primaryText}
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href={secondaryHref}
            className="inline-flex items-center justify-center bg-slate-700 hover:bg-slate-600 text-white font-semibold px-8 py-4 rounded-lg transition-colors text-lg"
          >
            {secondaryText}
          </Link>
        </div>
      </div>
    </section>
  );
}
