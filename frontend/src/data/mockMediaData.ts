import type { MediaItem } from "@/lib/mediaUtils";

export const mockMediaData: MediaItem[] = [
  {
    id: "1",
    filename: "hero-banner.jpg",
    thumbnail: "https://picsum.photos/seed/hero/200/150",
    mediaType: "image",
    fileSize: 2457600, // 2.4 MB
    tags: ["hero", "banner", "website"],
    dateModified: new Date("2024-01-15T10:30:00Z"),
  },
  {
    id: "2",
    filename: "product-demo.mp4",
    thumbnail: "https://picsum.photos/seed/demo/200/150",
    mediaType: "video",
    fileSize: 52428800, // 50 MB
    tags: ["product", "demo", "marketing"],
    dateModified: new Date("2024-01-14T14:20:00Z"),
  },
  {
    id: "3",
    filename: "background-music.mp3",
    thumbnail: "",
    mediaType: "audio",
    fileSize: 5242880, // 5 MB
    tags: ["music", "background", "audio"],
    dateModified: new Date("2024-01-13T09:15:00Z"),
  },
  {
    id: "4",
    filename: "user-manual.pdf",
    thumbnail: "",
    mediaType: "document",
    fileSize: 1572864, // 1.5 MB
    tags: ["manual", "documentation", "pdf"],
    dateModified: new Date("2024-01-12T16:45:00Z"),
  },
  {
    id: "5",
    filename: "logo-transparent.png",
    thumbnail: "https://picsum.photos/seed/logo/200/150",
    mediaType: "image",
    fileSize: 512000, // 500 KB
    tags: ["logo", "transparent", "brand"],
    dateModified: new Date("2024-01-11T11:00:00Z"),
  },
  {
    id: "6",
    filename: "tutorial-video.webm",
    thumbnail: "https://picsum.photos/seed/tutorial/200/150",
    mediaType: "video",
    fileSize: 104857600, // 100 MB
    tags: ["tutorial", "video", "how-to"],
    dateModified: new Date("2024-01-10T08:30:00Z"),
  },
  {
    id: "7",
    filename: "presentation-slides.pptx",
    thumbnail: "",
    mediaType: "document",
    fileSize: 2097152, // 2 MB
    tags: ["presentation", "slides", "business"],
    dateModified: new Date("2024-01-09T13:20:00Z"),
  },
  {
    id: "8",
    filename: "ambient-sound.wav",
    thumbnail: "",
    mediaType: "audio",
    fileSize: 10485760, // 10 MB
    tags: ["ambient", "sound", "audio"],
    dateModified: new Date("2024-01-08T17:45:00Z"),
  },
  {
    id: "9",
    filename: "infographic.svg",
    thumbnail: "https://picsum.photos/seed/infographic/200/150",
    mediaType: "image",
    fileSize: 102400, // 100 KB
    tags: ["infographic", "svg", "data"],
    dateModified: new Date("2024-01-07T12:15:00Z"),
  },
  {
    id: "10",
    filename: "newsletter-template.html",
    thumbnail: "",
    mediaType: "document",
    fileSize: 51200, // 50 KB
    tags: ["newsletter", "template", "html", "email"],
    dateModified: new Date("2024-01-06T15:30:00Z"),
  },
  {
    id: "11",
    filename: "team-photo.jpg",
    thumbnail: "https://picsum.photos/seed/team/200/150",
    mediaType: "image",
    fileSize: 3145728, // 3 MB
    tags: ["team", "photo", "people", "company"],
    dateModified: new Date("2024-01-05T10:00:00Z"),
  },
  {
    id: "12",
    filename: "podcast-episode.mp3",
    thumbnail: "",
    mediaType: "audio",
    fileSize: 104857600, // 100 MB
    tags: ["podcast", "audio", "episode", "content"],
    dateModified: new Date("2024-01-04T14:20:00Z"),
  },
];