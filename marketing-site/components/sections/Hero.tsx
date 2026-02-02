import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { Carousel } from "../ui/Carousel";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20 bg-linear-to-b from-slate-900 via-slate-800 to-slate-900 pt-24">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-bold bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent leading-tight">
          AI-Powered Media Management
          <br />
          <span className="bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            That Fits Your Workflow
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
          Organize, search, and collaborate on digital assets with custom metadata, AI assistance, and real-time updates. 
          No folders, no chaos—just smart organization.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-8 py-4 rounded-lg transition-colors text-lg"
          >
            Start Free Trial
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="#demo"
            className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold px-8 py-4 rounded-lg transition-colors text-lg"
          >
            <Play className="h-5 w-5" />
            Watch Demo Video
          </Link>
        </div>
        <div className="mt-16 relative">
          <div className="aspect-video bg-slate-800 rounded-lg border border-slate-700 shadow-2xl overflow-hidden">
            <Carousel
              images={[
                {
                  src: "/media_libraryS.png",
                  alt: "Media Library Dashboard",
                },
                {
                  src: "/media_libraryS2.png",
                  alt: "Media Library Features",
                },
                {
                  src: "/media_libraryS3.png",
                  alt: "Media Library Collaboration",
                },
                {
                  src: "/media_libraryS4.png",
                  alt: "Media Library Collaboration",
                },
              ]}
              autoPlay={true}
              interval={4000}
              showControls={true}
              showDots={true}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
