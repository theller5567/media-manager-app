import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { requireAuth, requireRole } from "../lib/auth";

/**
 * Update user profile (name, avatar, etc.)
 * Users can only update their own profile
 */
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    gradient: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.union(v.string(), v.null())),
    // Add other profile fields as needed
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const userId = user._id.toString();
    
    // Find existing preferences or create new
    const existingPrefs = await ctx.db
      .query("userPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    
    if (existingPrefs) {
      // Update existing preferences
      const updates: any = {};
      if (args.gradient !== undefined) {
        updates.gradient = args.gradient;
      }
      // Note: name, email, image are managed by BetterAuth
      // We only store custom preferences here
      
      await ctx.db.patch(existingPrefs._id, updates);
      return { success: true, userId: user._id };
    } else {
      // Create new preferences
      await ctx.db.insert("userPreferences", {
        userId,
        gradient: args.gradient,
      });
      return { success: true, userId: user._id };
    }
  },
});

/**
 * Update user role (admin only)
 */
export const updateRole = mutation({
  args: {
    userId: v.string(),
    role: v.union(v.literal("user"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    // Require admin role
    await requireRole(ctx, "admin");
    
    // Note: BetterAuth doesn't have built-in role management
    // This would need to be implemented via custom user extension or separate roles table
    // This is a placeholder for future implementation
    
    return { success: true, userId: args.userId, role: args.role };
  },
});
