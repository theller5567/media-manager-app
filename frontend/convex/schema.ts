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
  mediaTypes: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    color: v.string(),
    allowedFormats: v.array(v.string()),
    fields: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        label: v.string(),
        type: v.union(
          v.literal("text"),
          v.literal("number"),
          v.literal("date"),
          v.literal("select"),
          v.literal("boolean"),
          v.literal("url")
        ),
        required: v.boolean(),
        options: v.optional(v.array(v.string())),
        validationRegex: v.optional(v.string()),
        placeholder: v.optional(v.string()),
      })
    ),
    defaultTags: v.array(v.string()),
  })
    .index("by_name", ["name"])
});

