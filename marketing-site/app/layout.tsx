import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StructuredData } from "@/components/StructuredData";
import { Analytics } from "@/components/Analytics";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://mediamanager.app"),
  title: {
    default: "Media Manager App - AI-Powered Media Management",
    template: "%s | Media Manager App",
  },
  description: "Organize, search, and collaborate on digital assets with custom metadata, AI assistance, and real-time updates. No folders, no chaos—just smart organization.",
  keywords: ["media management", "digital asset management", "DAM", "AI tagging", "media library", "workflow management"],
  authors: [{ name: "Media Manager" }],
  creator: "Media Manager",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Media Manager App - AI-Powered Media Management",
    description: "Organize, search, and collaborate on digital assets with custom metadata, AI assistance, and real-time updates.",
    siteName: "Media Manager App",
    images: [
      // OG image will be added when ready
      // {
      //   url: "/og-image.png",
      //   width: 1200,
      //   height: 630,
      //   alt: "Media Manager App",
      // },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Media Manager App - AI-Powered Media Management",
    description: "Organize, search, and collaborate on digital assets with custom metadata, AI assistance, and real-time updates.",
    // images: ["/og-image.png"], // Will be added when OG image is ready
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add Google Search Console verification when available
    // google: "your-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StructuredData />
        <Analytics />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
