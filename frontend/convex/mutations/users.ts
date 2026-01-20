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
    // Add other profile fields as needed
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    
    // Note: BetterAuth manages user data in component tables
    // Profile updates would need to go through BetterAuth API
    // This is a placeholder for future implementation
    
    return { success: true, userId: user._id };
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
