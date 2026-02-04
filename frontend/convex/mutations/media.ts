import { mutation, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { requireAuth, isAdmin, isDemoUser } from "../lib/auth";
import { generateFakeMedia } from "../lib/demoUtils";

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
    // Require authentication
    const user = await requireAuth(ctx);
    
    // Check if user is DemoUser - return fake response without saving
    const userId = user._id.toString();
    const userEmail = (user as any).email as string | undefined;
    const userName = (user as any).name as string | undefined;
    
    if (await isDemoUser(ctx)) {
      return generateFakeMedia({
        ...args,
        uploadedBy: userId,
        uploadedByEmail: userEmail,
        uploadedByName: userName,
        isMockData: args.isMockData ?? false,
      });
    }
    
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
      uploadedBy: userId, // Track who uploaded this media (BetterAuth user ID as string)
      uploadedByEmail: userEmail,
      uploadedByName: userName,
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
      thumbnail: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    // Require authentication
    const user = await requireAuth(ctx);
    
    // Get the media item to check ownership
    const media = await ctx.db.get(args.id);
    if (!media) {
      throw new Error("Media not found");
    }
    
    // Check if user is DemoUser - return fake updated response without saving
    if (await isDemoUser(ctx)) {
      return {
        ...media,
        ...args.updates,
        dateModified: args.updates.dateModified ?? media.dateModified,
      };
    }
    
    // Check authorization: user can only edit their own media OR be admin
    const userIsAdmin = await isAdmin(ctx);
    const isOwner = media.uploadedBy === user._id.toString();
    
    if (!isOwner && !userIsAdmin) {
      throw new Error("You can only edit your own media");
    }
    
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
    if (updates.thumbnail !== undefined) patch.thumbnail = updates.thumbnail;
    
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
    // Require authentication
    const user = await requireAuth(ctx);
    
    // Get the media item to check ownership
    const media = await ctx.db.get(args.id);
    if (!media) {
      throw new Error("Media not found");
    }
    
    // Check if user is DemoUser - return success without deleting
    if (await isDemoUser(ctx)) {
      return { success: true };
    }
    
    // Check authorization: user can only delete their own media OR be admin
    const userIsAdmin = await isAdmin(ctx);
    const isOwner = media.uploadedBy === user._id.toString();
    
    if (!isOwner && !userIsAdmin) {
      throw new Error("You can only delete your own media");
    }
    
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
    uploadedBy: v.optional(v.string()), // BetterAuth user ID (component table ID as string)
    uploadedByEmail: v.optional(v.string()),
    uploadedByName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const insertData: any = {
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
    };
    if (args.uploadedBy) {
      insertData.uploadedBy = args.uploadedBy as any; // Cast string to BetterAuth user ID type
    }
    if (args.uploadedByEmail) {
      insertData.uploadedByEmail = args.uploadedByEmail;
    }
    if (args.uploadedByName) {
      insertData.uploadedByName = args.uploadedByName;
    }
    const mediaId = await ctx.db.insert("media", insertData);
    
    return mediaId;
  },
});

/**
 * Internal mutation to set uploadedBy for existing media
 */
export const setUploadedByForMedia = internalMutation({
  args: {
    userId: v.string(), // BetterAuth user ID (component table ID as string)
  },
  handler: async (ctx, args) => {
    // Get all media
    const allMedia = await ctx.db
      .query("media")
      .collect();
    
    // Filter to only media without uploadedBy
    const mediaWithoutUploader = allMedia.filter((m) => !m.uploadedBy);
    
    let updated = 0;
    for (const media of mediaWithoutUploader) {
      await ctx.db.patch(media._id, {
        uploadedBy: args.userId as any, // Cast string to BetterAuth user ID type
      });
      updated++;
    }
    
    return { updated };
  },
});
