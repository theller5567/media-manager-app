import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  media: defineTable({
    // Cloudinary fields
    cloudinaryPublicId: v.string(),
    cloudinarySecureUrl: v.string(),
    
    // File metadata
    filename: v.string(),
    thumbnail: v.string(),
    mediaType: v.union(
      v.literal("image"),
      v.literal("video"),
      v.literal("audio"),
      v.literal("document"),
      v.literal("other")
    ),
    customMediaTypeId: v.optional(v.string()),
    
    // Content metadata
    title: v.string(),
    description: v.optional(v.string()),
    altText: v.optional(v.string()),
    
    // Technical metadata
    fileSize: v.number(),
    format: v.string(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    duration: v.optional(v.number()),
    
    // Organization
    tags: v.array(v.string()),
    relatedFiles: v.optional(v.array(v.string())),
    customMetadata: v.optional(v.any()),
    
    // AI metadata
    aiGenerated: v.optional(v.boolean()),
    
    // Timestamps
    dateModified: v.number(),
    
    // Mock data identification (for cleanup before production)
    isMockData: v.boolean(),
    mockSourceId: v.optional(v.string()),
  })
    .index("by_mediaType", ["mediaType"])
    .index("by_customMediaTypeId", ["customMediaTypeId"])
    .index("by_dateModified", ["dateModified"])
    .searchIndex("search_title", {
      searchField: "title",
    }),
});
