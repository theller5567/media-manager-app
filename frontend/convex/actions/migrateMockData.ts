"use node";

import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";

type MigrationResult = {
  success: boolean;
  migrated: number;
  results: Array<{ originalId: string; convexId: string }>;
};

/**
 * One-time migration action to import all mock media data into Convex
 * 
 * Run this via Convex dashboard Functions tab or CLI:
 * npx convex run actions/migrateMockData:migrate
 * 
 * After migration, mock data will be marked with isMockData: true
 * for easy identification and removal before production.
 */
export const migrate = action({
  args: {},
  handler: async (ctx): Promise<MigrationResult> => {
    const mockData: Array<{
      id: string;
      filename: string;
      thumbnail: string;
      mediaType: "image" | "video" | "audio" | "document" | "other";
      customMediaTypeId?: string;
      title: string;
      description?: string;
      altText?: string;
      fileSize: number;
      tags: string[];
      relatedFiles?: string[];
      customMetadata?: Record<string, any>;
      aiGenerated?: boolean;
      dateModified: Date;
    }> = [
      {
        id: "1",
        filename: "hero-banner.jpg",
        thumbnail: "https://picsum.photos/seed/hero/200/150",
        mediaType: "image",
        title: "Hero Banner",
        description: "Hero banner image for website homepage",
        altText: "Hero banner",
        fileSize: 2457600, // 2.4 MB
        tags: ["hero", "banner", "website"],
        dateModified: new Date("2024-01-15T10:30:00Z"),
      },
      {
        id: "2",
        filename: "product-demo.mp4",
        thumbnail: "https://picsum.photos/seed/demo/200/150",
        mediaType: "video",
        title: "Product Demo Video",
        description: "Product demonstration video showcasing key features",
        altText: "Product demo video",
        fileSize: 52428800, // 50 MB
        tags: ["product", "demo", "marketing"],
        dateModified: new Date("2024-01-14T14:20:00Z"),
      },
      {
        id: "3",
        filename: "background-music.mp3",
        thumbnail: "",
        mediaType: "audio",
        title: "Background Music",
        description: "Background music track for video productions",
        altText: "Background music",
        fileSize: 5242880, // 5 MB
        tags: ["music", "background", "audio"],
        dateModified: new Date("2024-01-13T09:15:00Z"),
      },
      {
        id: "4",
        filename: "user-manual.pdf",
        thumbnail: "",
        mediaType: "document",
        title: "User Manual",
        description: "User manual document with product instructions",
        altText: "User manual",
        fileSize: 1572864, // 1.5 MB
        tags: ["manual", "documentation", "pdf"],
        dateModified: new Date("2024-01-12T16:45:00Z"),
      },
      {
        id: "5",
        filename: "logo-transparent.png",
        thumbnail: "https://picsum.photos/seed/logo/200/150",
        mediaType: "image",
        title: "Logo Transparent",
        description: "Transparent logo image for branding",
        altText: "Logo transparent",
        fileSize: 512000, // 500 KB
        tags: ["logo", "transparent", "brand"],
        dateModified: new Date("2024-01-11T11:00:00Z"),
      },
      {
        id: "6",
        filename: "tutorial-video.webm",
        thumbnail: "https://picsum.photos/seed/tutorial/200/150",
        mediaType: "video",
        title: "Tutorial Video",
        description: "Tutorial video demonstrating how-to instructions",
        altText: "Tutorial video",
        fileSize: 104857600, // 100 MB
        tags: ["tutorial", "video", "how-to"],
        dateModified: new Date("2024-01-10T08:30:00Z"),
      },
      {
        id: "7",
        filename: "presentation-slides.pptx",
        thumbnail: "",
        mediaType: "document",
        title: "Presentation Slides",
        description: "Presentation slides document for business meetings",
        altText: "Presentation slides",
        fileSize: 2097152, // 2 MB
        tags: ["presentation", "slides", "business"],
        dateModified: new Date("2024-01-09T13:20:00Z"),
      },
      {
        id: "8",
        filename: "ambient-sound.wav",
        thumbnail: "",
        mediaType: "audio",
        title: "Ambient Sound",
        description: "Ambient sound audio file for background atmosphere",
        altText: "Ambient sound",
        fileSize: 10485760, // 10 MB
        tags: ["ambient", "sound", "audio"],
        dateModified: new Date("2024-01-08T17:45:00Z"),
      },
      {
        id: "9",
        filename: "infographic.svg",
        thumbnail: "https://picsum.photos/seed/infographic/200/150",
        mediaType: "image",
        title: "Infographic",
        description: "Infographic image displaying data visualization",
        altText: "Infographic",
        fileSize: 102400, // 100 KB
        tags: ["infographic", "svg", "data"],
        dateModified: new Date("2024-01-07T12:15:00Z"),
      },
      {
        id: "10",
        filename: "newsletter-template.html",
        thumbnail: "",
        mediaType: "document",
        title: "Newsletter Template",
        description: "Newsletter template HTML file for email campaigns",
        altText: "Newsletter template",
        fileSize: 51200, // 50 KB
        tags: ["newsletter", "template", "html", "email"],
        dateModified: new Date("2024-01-06T15:30:00Z"),
      },
      {
        id: "11",
        filename: "team-photo.jpg",
        thumbnail: "https://picsum.photos/seed/team/200/150",
        mediaType: "image",
        title: "Team Photo",
        description: "Team photo image showing company members",
        altText: "Team photo",
        fileSize: 3145728, // 3 MB
        tags: ["team", "photo", "people", "company"],
        dateModified: new Date("2024-01-05T10:00:00Z"),
      },
      {
        id: "12",
        filename: "podcast-episode.mp3",
        thumbnail: "",
        mediaType: "audio",
        title: "Podcast Episode",
        description: "Podcast episode audio recording",
        altText: "Podcast episode",
        fileSize: 104857600, // 100 MB
        tags: ["podcast", "audio", "episode", "content"],
        dateModified: new Date("2024-01-04T14:20:00Z"),
      },
      {
        id: "13",
        filename: "landscape-photo-1.jpg",
        thumbnail: "https://picsum.photos/seed/landscape1/200/150",
        mediaType: "image",
        title: "Landscape Photo 1",
        description: "Landscape photography image of natural scenery",
        altText: "Landscape photo 1",
        fileSize: 3145728, // 3 MB
        tags: ["landscape", "nature", "photography"],
        dateModified: new Date("2024-01-03T11:30:00Z"),
      },
      {
        id: "14",
        filename: "corporate-video.mp4",
        thumbnail: "https://picsum.photos/seed/corporate/200/150",
        mediaType: "video",
        title: "Corporate Video",
        description: "Corporate video showcasing business operations",
        altText: "Corporate video",
        fileSize: 78643200, // 75 MB
        tags: ["corporate", "business", "video"],
        dateModified: new Date("2024-01-02T09:15:00Z"),
      },
      {
        id: "15",
        filename: "jingle-music.mp3",
        thumbnail: "",
        mediaType: "audio",
        title: "Jingle Music",
        description: "Jingle music track for advertising campaigns",
        altText: "Jingle music",
        fileSize: 2097152, // 2 MB
        tags: ["jingle", "music", "advertising"],
        dateModified: new Date("2024-01-01T16:00:00Z"),
      },
      {
        id: "16",
        filename: "contract-template.docx",
        thumbnail: "",
        mediaType: "document",
        title: "Contract Template",
        description: "Contract template document for legal agreements",
        altText: "Contract template",
        fileSize: 262144, // 256 KB
        tags: ["contract", "template", "legal"],
        dateModified: new Date("2023-12-31T13:45:00Z"),
      },
      {
        id: "17",
        filename: "portrait-photo.jpg",
        thumbnail: "https://picsum.photos/seed/portrait/200/150",
        mediaType: "image",
        title: "Portrait Photo",
        description: "Portrait photography image of a person",
        altText: "Portrait photo",
        fileSize: 2097152, // 2 MB
        tags: ["portrait", "people", "photography"],
        dateModified: new Date("2023-12-30T10:20:00Z"),
      },
      {
        id: "18",
        filename: "product-showcase.mp4",
        thumbnail: "https://picsum.photos/seed/showcase/200/150",
        mediaType: "video",
        title: "Product Showcase",
        description: "Product showcase video highlighting features",
        altText: "Product showcase",
        fileSize: 94371840, // 90 MB
        tags: ["product", "showcase", "marketing"],
        dateModified: new Date("2023-12-29T14:30:00Z"),
      },
      {
        id: "19",
        filename: "background-track.mp3",
        thumbnail: "",
        mediaType: "audio",
        title: "Background Track",
        description: "Background music track for video editing",
        altText: "Background track",
        fileSize: 6291456, // 6 MB
        tags: ["background", "music", "track"],
        dateModified: new Date("2023-12-28T08:15:00Z"),
      },
      {
        id: "20",
        filename: "invoice-template.pdf",
        thumbnail: "",
        mediaType: "document",
        title: "Invoice Template",
        description: "Invoice template PDF for business billing",
        altText: "Invoice template",
        fileSize: 131072, // 128 KB
        tags: ["invoice", "template", "business"],
        dateModified: new Date("2023-12-27T15:00:00Z"),
      },
      {
        id: "21",
        filename: "banner-ad.jpg",
        thumbnail: "https://picsum.photos/seed/banner/200/150",
        mediaType: "image",
        title: "Banner Ad",
        description: "Banner advertisement image for marketing campaigns",
        altText: "Banner ad",
        fileSize: 1572864, // 1.5 MB
        tags: ["banner", "ad", "advertising"],
        dateModified: new Date("2023-12-26T12:00:00Z"),
      },
      {
        id: "22",
        filename: "training-video.mp4",
        thumbnail: "https://picsum.photos/seed/training/200/150",
        mediaType: "video",
        title: "Training Video",
        description: "Training video for employee education",
        altText: "Training video",
        fileSize: 125829120, // 120 MB
        tags: ["training", "video", "education"],
        dateModified: new Date("2023-12-25T09:30:00Z"),
      },
      {
        id: "23",
        filename: "sound-effect.wav",
        thumbnail: "",
        mediaType: "audio",
        title: "Sound Effect",
        description: "Sound effect audio file for multimedia projects",
        altText: "Sound effect",
        fileSize: 524288, // 512 KB
        tags: ["sound", "effect", "audio"],
        dateModified: new Date("2023-12-24T11:45:00Z"),
      },
      {
        id: "24",
        filename: "report-2023.pdf",
        thumbnail: "",
        mediaType: "document",
        title: "Report 2023",
        description: "Annual report document for 2023",
        altText: "Report 2023",
        fileSize: 3145728, // 3 MB
        tags: ["report", "2023", "annual"],
        dateModified: new Date("2023-12-23T16:20:00Z"),
      },
      {
        id: "25",
        filename: "gallery-image-1.jpg",
        thumbnail: "https://picsum.photos/seed/gallery1/200/150",
        mediaType: "image",
        title: "Gallery Image 1",
        description: "Gallery image from photo collection",
        altText: "Gallery image 1",
        fileSize: 3670016, // 3.5 MB
        tags: ["gallery", "image", "collection"],
        dateModified: new Date("2023-12-22T10:10:00Z"),
      },
      {
        id: "26",
        filename: "gallery-image-2.jpg",
        thumbnail: "https://picsum.photos/seed/gallery2/200/150",
        mediaType: "image",
        title: "Gallery Image 2",
        description: "Gallery image from photo collection",
        altText: "Gallery image 2",
        fileSize: 4194304, // 4 MB
        tags: ["gallery", "image", "collection"],
        dateModified: new Date("2023-12-21T14:25:00Z"),
      },
      {
        id: "27",
        filename: "gallery-image-3.jpg",
        thumbnail: "https://picsum.photos/seed/gallery3/200/150",
        mediaType: "image",
        title: "Gallery Image 3",
        description: "Gallery image from photo collection",
        altText: "Gallery image 3",
        fileSize: 2621440, // 2.5 MB
        tags: ["gallery", "image", "collection"],
        dateModified: new Date("2023-12-20T08:50:00Z"),
      },
      {
        id: "28",
        filename: "promo-video.mp4",
        thumbnail: "https://picsum.photos/seed/promo/200/150",
        mediaType: "video",
        title: "Promo Video",
        description: "Promotional video for marketing campaigns",
        altText: "Promo video",
        fileSize: 67108864, // 64 MB
        tags: ["promo", "video", "marketing"],
        dateModified: new Date("2023-12-19T13:15:00Z"),
      },
      {
        id: "29",
        filename: "voiceover.mp3",
        thumbnail: "",
        mediaType: "audio",
        title: "Voiceover",
        description: "Voiceover narration audio track",
        altText: "Voiceover",
        fileSize: 3145728, // 3 MB
        tags: ["voiceover", "narration", "audio"],
        dateModified: new Date("2023-12-18T15:40:00Z"),
      },
      {
        id: "30",
        filename: "spreadsheet-data.xlsx",
        thumbnail: "",
        mediaType: "document",
        title: "Spreadsheet Data",
        description: "Spreadsheet data file in Excel format",
        altText: "Spreadsheet data",
        fileSize: 524288, // 512 KB
        tags: ["spreadsheet", "data", "excel"],
        dateModified: new Date("2023-12-17T11:20:00Z"),
      },
      {
        id: "31",
        filename: "icon-set.png",
        thumbnail: "https://picsum.photos/seed/icons/200/150",
        mediaType: "image",
        title: "Icon Set",
        description: "Icon set image collection for design projects",
        altText: "Icon set",
        fileSize: 204800, // 200 KB
        tags: ["icon", "set", "design"],
        dateModified: new Date("2023-12-16T09:00:00Z"),
      },
      {
        id: "32",
        filename: "event-highlight.mp4",
        thumbnail: "https://picsum.photos/seed/event/200/150",
        mediaType: "video",
        title: "Event Highlight",
        description: "Event highlight video showcasing key moments",
        altText: "Event highlight",
        fileSize: 104857600, // 100 MB
        tags: ["event", "highlight", "video"],
        dateModified: new Date("2023-12-15T17:30:00Z"),
      },
      {
        id: "33",
        filename: "ambient-track-2.mp3",
        thumbnail: "",
        mediaType: "audio",
        title: "Ambient Track 2",
        description: "Ambient music track for background audio",
        altText: "Ambient track 2",
        fileSize: 8388608, // 8 MB
        tags: ["ambient", "track", "music"],
        dateModified: new Date("2023-12-14T12:10:00Z"),
      },
      {
        id: "34",
        filename: "meeting-notes.docx",
        thumbnail: "",
        mediaType: "document",
        title: "Meeting Notes",
        description: "Meeting notes document from business meetings",
        altText: "Meeting notes",
        fileSize: 65536, // 64 KB
        tags: ["meeting", "notes", "document"],
        dateModified: new Date("2023-12-13T14:00:00Z"),
      },
      {
        id: "35",
        filename: "screenshot-1.png",
        thumbnail: "https://picsum.photos/seed/screenshot1/200/150",
        mediaType: "image",
        title: "Screenshot 1",
        description: "Screenshot image for documentation purposes",
        altText: "Screenshot 1",
        fileSize: 1048576, // 1 MB
        tags: ["screenshot", "documentation"],
        dateModified: new Date("2023-12-12T10:30:00Z"),
      },
      {
        id: "36",
        filename: "screenshot-2.png",
        thumbnail: "https://picsum.photos/seed/screenshot2/200/150",
        mediaType: "image",
        title: "Screenshot 2",
        description: "Screenshot image for documentation purposes",
        altText: "Screenshot 2",
        fileSize: 1310720, // 1.25 MB
        tags: ["screenshot", "documentation"],
        dateModified: new Date("2023-12-11T08:45:00Z"),
      },
      {
        id: "37",
        filename: "webinar-recording.mp4",
        thumbnail: "https://picsum.photos/seed/webinar/200/150",
        mediaType: "video",
        customMediaTypeId: "2",
        title: "Webinar Recording",
        description: "Recorded webinar session video for education",
        altText: "Webinar recording",
        fileSize: 157286400, // 150 MB
        tags: ["webinar", "recording", "education"],
        customMetadata: {
          speakerName: "Jane Smith",
          webinarDate: "2023-12-10",
          quality: "HD",
          ctaLink: "https://example.com/webinar",
        },
        dateModified: new Date("2023-12-10T16:20:00Z"),
      },
      {
        id: "38",
        filename: "intro-music.mp3",
        thumbnail: "",
        mediaType: "audio",
        title: "Intro Music",
        description: "Intro music track for video introductions",
        altText: "Intro music",
        fileSize: 1572864, // 1.5 MB
        tags: ["intro", "music", "audio"],
        dateModified: new Date("2023-12-09T11:15:00Z"),
      },
      {
        id: "39",
        filename: "policy-document.pdf",
        thumbnail: "",
        mediaType: "document",
        title: "Policy Document",
        description: "Policy document PDF with legal information",
        altText: "Policy document",
        fileSize: 2097152, // 2 MB
        tags: ["policy", "document", "legal"],
        dateModified: new Date("2023-12-08T13:50:00Z"),
      },
      {
        id: "40",
        filename: "product-image-1.jpg",
        thumbnail: "https://picsum.photos/seed/product1/200/150",
        mediaType: "image",
        customMediaTypeId: "1",
        title: "Product Image 1",
        description: "Product image for e-commerce catalog",
        altText: "Product image 1",
        fileSize: 1835008, // 1.75 MB
        tags: ["product", "image", "catalog"],
        customMetadata: {
          sku: "PROD1234",
          productCategory: "Clothing",
          photographer: "John Doe",
          shootDate: "2023-12-07",
        },
        dateModified: new Date("2023-12-07T09:25:00Z"),
      },
      {
        id: "41",
        filename: "product-image-2.jpg",
        thumbnail: "https://picsum.photos/seed/product2/200/150",
        mediaType: "image",
        customMediaTypeId: "1",
        title: "Product Image 2",
        description: "Product image for e-commerce catalog",
        altText: "Product image 2",
        fileSize: 2097152, // 2 MB
        tags: ["product", "image", "catalog"],
        customMetadata: {
          sku: "PROD5678",
          productCategory: "Electronics",
          photographer: "Sarah Johnson",
          shootDate: "2023-12-06",
        },
        dateModified: new Date("2023-12-06T15:10:00Z"),
      },
      {
        id: "42",
        filename: "product-image-3.jpg",
        thumbnail: "https://picsum.photos/seed/product3/200/150",
        mediaType: "image",
        customMediaTypeId: "1",
        title: "Product Image 3",
        description: "Product image for e-commerce catalog",
        altText: "Product image 3",
        fileSize: 1572864, // 1.5 MB
        tags: ["product", "image", "catalog"],
        customMetadata: {
          sku: "PROD9012",
          productCategory: "Home",
          photographer: "Mike Wilson",
          shootDate: "2023-12-05",
        },
        dateModified: new Date("2023-12-05T10:40:00Z"),
      },
      {
        id: "43",
        filename: "testimonial-video.mp4",
        thumbnail: "https://picsum.photos/seed/testimonial/200/150",
        mediaType: "video",
        title: "Testimonial Video",
        description: "Customer testimonial video",
        altText: "Testimonial video",
        fileSize: 52428800, // 50 MB
        tags: ["testimonial", "video", "customer"],
        dateModified: new Date("2023-12-04T12:30:00Z"),
      },
      {
        id: "44",
        filename: "outro-music.mp3",
        thumbnail: "",
        mediaType: "audio",
        title: "Outro Music",
        description: "Outro music track for video endings",
        altText: "Outro music",
        fileSize: 2097152, // 2 MB
        tags: ["outro", "music", "audio"],
        dateModified: new Date("2023-12-03T14:20:00Z"),
      },
      {
        id: "45",
        filename: "faq-document.pdf",
        thumbnail: "",
        mediaType: "document",
        title: "Faq Document",
        description: "FAQ document with frequently asked questions",
        altText: "FAQ document",
        fileSize: 393216, // 384 KB
        tags: ["faq", "document", "help"],
        dateModified: new Date("2023-12-02T11:00:00Z"),
      },
      {
        id: "46",
        filename: "social-media-post.jpg",
        thumbnail: "https://picsum.photos/seed/social/200/150",
        mediaType: "image",
        title: "Social Media Post",
        description: "Social media post image for marketing",
        altText: "Social media post",
        fileSize: 786432, // 768 KB
        tags: ["social", "media", "post"],
        dateModified: new Date("2023-12-01T09:15:00Z"),
      },
      {
        id: "47",
        filename: "brand-video.mp4",
        thumbnail: "https://picsum.photos/seed/brand/200/150",
        mediaType: "video",
        title: "Brand Video",
        description: "Brand video showcasing company identity",
        altText: "Brand video",
        fileSize: 83886080, // 80 MB
        tags: ["brand", "video", "marketing"],
        dateModified: new Date("2023-11-30T16:45:00Z"),
      },
      {
        id: "48",
        filename: "notification-sound.mp3",
        thumbnail: "",
        mediaType: "audio",
        title: "Notification Sound",
        description: "Notification sound effect for alerts",
        altText: "Notification sound",
        fileSize: 65536, // 64 KB
        tags: ["notification", "sound", "audio"],
        dateModified: new Date("2023-11-29T08:30:00Z"),
      },
      {
        id: "49",
        filename: "style-guide.pdf",
        thumbnail: "",
        mediaType: "document",
        title: "Style Guide",
        description: "Style guide document for design standards",
        altText: "Style guide",
        fileSize: 3670016, // 3.5 MB
        tags: ["style", "guide", "design"],
        dateModified: new Date("2023-11-28T13:25:00Z"),
      },
      {
        id: "50",
        filename: "hero-image-2.jpg",
        thumbnail: "https://picsum.photos/seed/hero2/200/150",
        mediaType: "image",
        title: "Hero Image 2",
        description: "Hero image for website homepage",
        altText: "Hero image 2",
        fileSize: 4194304, // 4 MB
        tags: ["hero", "image", "website"],
        dateModified: new Date("2023-11-27T10:50:00Z"),
      },
      {
        id: "51",
        filename: "demo-reel.mp4",
        thumbnail: "https://picsum.photos/seed/demo/200/150",
        mediaType: "video",
        title: "Demo Reel",
        description: "Demo reel video showcasing portfolio work",
        altText: "Demo reel",
        fileSize: 115343360, // 110 MB
        tags: ["demo", "reel", "portfolio"],
        dateModified: new Date("2023-11-26T15:20:00Z"),
      },
      {
        id: "52",
        filename: "background-music-2.mp3",
        thumbnail: "",
        mediaType: "audio",
        title: "Background Music 2",
        description: "Background music track for video productions",
        altText: "Background music 2",
        fileSize: 4194304, // 4 MB
        tags: ["background", "music", "track"],
        dateModified: new Date("2023-11-25T11:40:00Z"),
      },
      {
        id: "53",
        filename: "terms-of-service.pdf",
        thumbnail: "",
        mediaType: "document",
        title: "Terms Of Service",
        description: "Terms of service document with legal information",
        altText: "Terms of service",
        fileSize: 1572864, // 1.5 MB
        tags: ["terms", "service", "legal"],
        dateModified: new Date("2023-11-24T14:10:00Z"),
      },
      {
        id: "54",
        filename: "feature-image.jpg",
        thumbnail: "https://picsum.photos/seed/feature/200/150",
        mediaType: "image",
        title: "Feature Image",
        description: "Feature image for content display",
        altText: "Feature image",
        fileSize: 2621440, // 2.5 MB
        tags: ["feature", "image", "content"],
        dateModified: new Date("2023-11-23T09:00:00Z"),
      },
    ];
    
    const results = [];
    
    for (const item of mockData) {
      // Convert Date to timestamp
      const dateModified = item.dateModified instanceof Date 
        ? item.dateModified.getTime() 
        : new Date(item.dateModified).getTime();
      
      // Extract format from filename
      const format = item.filename.split('.').pop() || 'unknown';
      
      // Determine dimensions/duration from mediaType
      const width = item.mediaType === 'image' || item.mediaType === 'video' ? 1920 : undefined;
      const height = item.mediaType === 'image' || item.mediaType === 'video' ? 1080 : undefined;
      const duration = (item.mediaType === 'video' || item.mediaType === 'audio') ? 60 : undefined;
      
      // Generate a mock Cloudinary public ID (since mock data uses picsum.photos)
      const cloudinaryPublicId = `mock_${item.id}`;
      const cloudinarySecureUrl = item.thumbnail || '';
      
      const mediaId: Id<"media"> = await ctx.runMutation(internal.mutations.media.createInternal, {
        cloudinaryPublicId,
        cloudinarySecureUrl,
        filename: item.filename,
        thumbnail: item.thumbnail || '',
        mediaType: item.mediaType as "image" | "video" | "audio" | "document" | "other",
        customMediaTypeId: item.customMediaTypeId,
        title: item.title,
        description: item.description,
        altText: item.altText,
        fileSize: item.fileSize,
        format,
        width,
        height,
        duration,
        tags: item.tags || [],
        relatedFiles: item.relatedFiles,
        customMetadata: item.customMetadata,
        aiGenerated: item.aiGenerated,
        dateModified,
        isMockData: true,
        mockSourceId: item.id,
      });
      
      results.push({ originalId: item.id, convexId: mediaId });
    }
    
    return {
      success: true,
      migrated: results.length,
      results,
    };
  },
});
