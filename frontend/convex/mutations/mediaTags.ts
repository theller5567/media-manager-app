import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { isDemoUser } from "../lib/auth";
import { generateFakeMediaTag } from "../lib/demoUtils";

/**
 * Create a new MediaTag
 */
export const create = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user is DemoUser - return fake response without saving
    if (await isDemoUser(ctx)) {
      return generateFakeMediaTag(args);
    }
    
    // Validate name uniqueness (case-insensitive)
    const normalizedName = args.name.toLowerCase().trim();
    const existingTags = await ctx.db
      .query("mediaTags")
      .collect();
    
    const nameExists = existingTags.some(
      (tag) => tag.name.toLowerCase().trim() === normalizedName
    );
    
    if (nameExists) {
      throw new Error(`Tag with name "${args.name}" already exists`);
    }
    
    const mediaTagId = await ctx.db.insert("mediaTags", { 
      name: args.name.trim(),
    });
    return await ctx.db.get(mediaTagId);
  },
});

/**
 * Update an existing MediaTag
 */
export const update = mutation({
  args: {
    id: v.id("mediaTags"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const tag = await ctx.db.get(args.id);
    if (!tag) {
      throw new Error(`Tag with id "${args.id}" not found`);
    }
    
    // Check if user is DemoUser - return fake updated response without saving
    if (await isDemoUser(ctx)) {
      return {
        ...tag,
        name: args.name.trim(),
      };
    }
    
    // Validate name uniqueness (case-insensitive, excluding current tag)
    const normalizedName = args.name.toLowerCase().trim();
    const existingTags = await ctx.db
      .query("mediaTags")
      .collect();
    
    const nameExists = existingTags.some(
      (t) => t._id !== args.id && t.name.toLowerCase().trim() === normalizedName
    );
    
    if (nameExists) {
      throw new Error(`Tag with name "${args.name}" already exists`);
    }
    
    await ctx.db.patch(args.id, {
      name: args.name.trim(),
    });
    
    return await ctx.db.get(args.id);
  },
});

/**
 * Delete a MediaTag
 */
export const deleteTag = mutation({
  args: {
    id: v.id("mediaTags"),
  },
  handler: async (ctx, args) => {
    const tag = await ctx.db.get(args.id);
    if (!tag) {
      throw new Error(`Tag with id "${args.id}" not found`);
    }
    
    // Check if user is DemoUser - return success without deleting
    if (await isDemoUser(ctx)) {
      return { success: true };
    }
    
    await ctx.db.delete(args.id);
    return { success: true };
  },
});