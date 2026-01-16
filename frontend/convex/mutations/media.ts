import { mutation, internalMutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * Create a new media item
 */
export const create = mutation({
  args: {
    cloudinaryPublicId: v.string(),
    cloudinarySecureUrl: v.string(),
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
    title: v.string(),
    description: v.optional(v.string()),
    altText: v.optional(v.string()),
    fileSize: v.number(),
    format: v.string(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    duration: v.optional(v.number()),
    tags: v.array(v.string()),
    relatedFiles: v.optional(v.array(v.string())),
    customMetadata: v.optional(v.any()),
    aiGenerated: v.optional(v.boolean()),
    dateModified: v.number(),
    isMockData: v.optional(v.boolean()),
    mockSourceId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const mediaId = await ctx.db.insert("media", {
      cloudinaryPublicId: args.cloudinaryPublicId,
      cloudinarySecureUrl: args.cloudinarySecureUrl,
      filename: args.filename,
      thumbnail: args.thumbnail,
      mediaType: args.mediaType,
      customMediaTypeId: args.customMediaTypeId,
      title: args.title,
      description: args.description,
      altText: args.altText,
      fileSize: args.fileSize,
      format: args.format,
      width: args.width,
      height: args.height,
      duration: args.duration,
      tags: args.tags,
      relatedFiles: args.relatedFiles,
      customMetadata: args.customMetadata,
      aiGenerated: args.aiGenerated,
      dateModified: args.dateModified,
      isMockData: args.isMockData ?? false,
      mockSourceId: args.mockSourceId,
    });
    
    return await ctx.db.get(mediaId);
  },
});

/**
 * Update an existing media item
 */
export const update = mutation({
  args: {
    id: v.id("media"),
    updates: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      altText: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      relatedFiles: v.optional(v.array(v.string())),
      customMetadata: v.optional(v.any()),
      dateModified: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const { id, updates } = args;
    
    // Only update fields that are provided
    const patch: any = {};
    if (updates.title !== undefined) patch.title = updates.title;
    if (updates.description !== undefined) patch.description = updates.description;
    if (updates.altText !== undefined) patch.altText = updates.altText;
    if (updates.tags !== undefined) patch.tags = updates.tags;
    if (updates.relatedFiles !== undefined) patch.relatedFiles = updates.relatedFiles;
    if (updates.customMetadata !== undefined) patch.customMetadata = updates.customMetadata;
    if (updates.dateModified !== undefined) patch.dateModified = updates.dateModified;
    
    await ctx.db.patch(id, patch);
    return await ctx.db.get(id);
  },
});

/**
 * Delete a media item
 */
export const deleteMedia = mutation({
  args: { id: v.id("media") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

/**
 * Internal mutation for creating media (used by actions like migration)
 */
export const createInternal = internalMutation({
  args: {
    cloudinaryPublicId: v.string(),
    cloudinarySecureUrl: v.string(),
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
    title: v.string(),
    description: v.optional(v.string()),
    altText: v.optional(v.string()),
    fileSize: v.number(),
    format: v.string(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    duration: v.optional(v.number()),
    tags: v.array(v.string()),
    relatedFiles: v.optional(v.array(v.string())),
    customMetadata: v.optional(v.any()),
    aiGenerated: v.optional(v.boolean()),
    dateModified: v.number(),
    isMockData: v.optional(v.boolean()),
    mockSourceId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const mediaId = await ctx.db.insert("media", {
      cloudinaryPublicId: args.cloudinaryPublicId,
      cloudinarySecureUrl: args.cloudinarySecureUrl,
      filename: args.filename,
      thumbnail: args.thumbnail,
      mediaType: args.mediaType,
      customMediaTypeId: args.customMediaTypeId,
      title: args.title,
      description: args.description,
      altText: args.altText,
      fileSize: args.fileSize,
      format: args.format,
      width: args.width,
      height: args.height,
      duration: args.duration,
      tags: args.tags,
      relatedFiles: args.relatedFiles,
      customMetadata: args.customMetadata,
      aiGenerated: args.aiGenerated,
      dateModified: args.dateModified,
      isMockData: args.isMockData ?? false,
      mockSourceId: args.mockSourceId,
    });
    
    return mediaId;
  },
});
