import { query } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentUser, isAdmin } from "../lib/auth";

/**
 * Get all media items
 * Users see all media, but can filter by uploadedBy in the UI
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("media").order("desc").collect();
  },
});

/**
 * Get a single media item by ID
 */
export const getById = query({
  args: { id: v.id("media") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Get media items uploaded by a specific user
 */
export const getByUserId = query({
  args: { userId: v.string() }, // BetterAuth user ID (component table ID as string)
  handler: async (ctx, args) => {
    return await ctx.db
      .query("media")
      .withIndex("by_uploadedBy", (q) => q.eq("uploadedBy", args.userId as any))
      .order("desc")
      .collect();
  },
});

/**
 * Get current user's uploaded media
 */
export const getMyUploads = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }
    
    return await ctx.db
      .query("media")
      .withIndex("by_uploadedBy", (q) => q.eq("uploadedBy", user._id.toString()))
      .order("desc")
      .collect();
  },
});

/**
 * Search media by title using search index
 */
export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    if (!args.query.trim()) {
      return await ctx.db.query("media").order("desc").collect();
    }
    
    return await ctx.db
      .query("media")
      .withSearchIndex("search_title", (q) => q.search("title", args.query))
      .collect();
  },
});
