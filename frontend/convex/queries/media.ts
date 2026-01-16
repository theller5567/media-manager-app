import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Get all media items
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
