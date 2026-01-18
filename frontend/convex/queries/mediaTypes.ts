import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Get all MediaTypes, ordered by name
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const mediaTypes = await ctx.db
      .query("mediaTypes")
      .order("asc")
      .collect();
    
    // Return numbers (not Date objects) - Convex queries can't return Date objects
    // Frontend will convert these to Date objects client-side
    return mediaTypes.map((mt) => ({
      ...mt,
      createdAt: mt._creationTime,
      updatedAt: mt._creationTime,
    }));
  },
});

/**
 * Get a single MediaType by ID
 */
export const getById = query({
  args: { id: v.id("mediaTypes") },
  handler: async (ctx, args) => {
    const mediaType = await ctx.db.get(args.id);
    if (!mediaType) {
      return null;
    }
    
    // Return numbers (not Date objects) - Convex queries can't return Date objects
    // Frontend will convert these to Date objects client-side
    return {
      ...mediaType,
      createdAt: mediaType._creationTime,
      updatedAt: mediaType._creationTime,
    };
  },
});

/**
 * Get MediaType by name (case-insensitive)
 */
export const getByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const normalizedName = args.name.toLowerCase().trim();
    const mediaTypes = await ctx.db
      .query("mediaTypes")
      .collect();
    
    const mediaType = mediaTypes.find(
      (mt) => mt.name.toLowerCase() === normalizedName
    );
    
    if (!mediaType) {
      return null;
    }
    
    // Return numbers (not Date objects) - Convex queries can't return Date objects
    // Frontend will convert these to Date objects client-side
    return {
      ...mediaType,
      createdAt: mediaType._creationTime,
      updatedAt: mediaType._creationTime,
    };
  },
});

/**
 * Count media items using a specific MediaType
 */
export const getUsageCount = query({
  args: { id: v.id("mediaTypes") },
  handler: async (ctx, args) => {
    // Convert Convex ID to string for comparison with customMediaTypeId
    const mediaTypeIdString = args.id;
    const mediaItems = await ctx.db
      .query("media")
      .withIndex("by_customMediaTypeId", (q) =>
        q.eq("customMediaTypeId", mediaTypeIdString)
      )
      .collect();
    
    return mediaItems.length;
  },
});

/**
 * Get usage counts for all MediaTypes
 */
export const getAllUsageCounts = query({
  args: {},
  handler: async (ctx) => {
    // Get all media items with customMediaTypeId
    const mediaItems = await ctx.db
      .query("media")
      .collect();
    
    // Group by customMediaTypeId and count
    const counts: Record<string, number> = {};
    mediaItems.forEach((item) => {
      if (item.customMediaTypeId) {
        counts[item.customMediaTypeId] = (counts[item.customMediaTypeId] || 0) + 1;
      }
    });
    
    return counts;
  },
});
