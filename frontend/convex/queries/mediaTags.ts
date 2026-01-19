import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Get all MediaTags, ordered by name
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const mediaTags = await ctx.db
      .query("mediaTags")
      .order("asc")
      .collect();
    
    return mediaTags;
  },
});

/**
 * Get usage counts for all tags
 * Returns a record mapping tag ID to usage count
 */
export const getUsageCounts = query({
  args: {},
  handler: async (ctx) => {
    // Get all tags
    const tags = await ctx.db
      .query("mediaTags")
      .collect();
    
    // Get all media items
    const mediaItems = await ctx.db
      .query("media")
      .collect();
    
    // Count usage for each tag (case-insensitive matching)
    const counts: Record<string, number> = {};
    
    tags.forEach((tag) => {
      const normalizedTagName = tag.name.toLowerCase().trim();
      const count = mediaItems.filter((item) => {
        return item.tags.some(
          (mediaTag) => mediaTag.toLowerCase().trim() === normalizedTagName
        );
      }).length;
      counts[tag._id] = count;
    });
    
    return counts;
  },
});

/**
 * Get media items that use a specific tag
 */
export const getMediaByTag = query({
  args: {
    tagId: v.id("mediaTags"),
  },
  handler: async (ctx, args) => {
    const tag = await ctx.db.get(args.tagId);
    if (!tag) {
      return [];
    }
    
    const normalizedTagName = tag.name.toLowerCase().trim();
    
    // Get all media items and filter by tag
    const allMedia = await ctx.db
      .query("media")
      .collect();
    
    return allMedia.filter((item) => {
      return item.tags.some(
        (mediaTag) => mediaTag.toLowerCase().trim() === normalizedTagName
      );
    });
  },
});

/**
 * Get all tags with their usage counts included
 */
export const getAllWithUsage = query({
  args: {},
  handler: async (ctx) => {
    // Get all tags
    const tags = await ctx.db
      .query("mediaTags")
      .order("asc")
      .collect();
    
    // Get all media items
    const mediaItems = await ctx.db
      .query("media")
      .collect();
    
    // Return tags with usage counts
    return tags.map((tag) => {
      const normalizedTagName = tag.name.toLowerCase().trim();
      const usageCount = mediaItems.filter((item) => {
        return item.tags.some(
          (mediaTag) => mediaTag.toLowerCase().trim() === normalizedTagName
        );
      }).length;
      
      return {
        ...tag,
        usageCount,
      };
    });
  },
});