import { query } from "../_generated/server";
import { v } from "convex/values";
import { authComponent } from "../auth";
import { requireRole, getCurrentUser as getCurrentUserHelper, isAdmin as isAdminHelper } from "../lib/auth";

/**
 * Get current authenticated user's profile
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return await authComponent.getAuthUser(ctx);
  },
});

/**
 * Check if current user is admin
 */
export const checkIsAdmin = query({
  args: {},
  handler: async (ctx) => {
    return await isAdminHelper(ctx);
  },
});

/**
 * Get user by ID (admin only)
 */
export const getUserById = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Require admin role
    await requireRole(ctx, "admin");
    
    // Get user from BetterAuth component
    // Note: BetterAuth doesn't expose a direct getUserById, so we'll need to query the component table
    // For now, we'll use getAuthUser if it's the current user, or require admin access
    const currentUser = await getCurrentUserHelper(ctx);
    if (currentUser?._id === args.userId) {
      return currentUser;
    }
    
    // Admin can query any user - this would need BetterAuth API support
    // For now, return current user or null
    return currentUser;
  },
});

/**
 * List all users (admin only)
 */
export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    // Require admin role
    await requireRole(ctx, "admin");
    
    // BetterAuth component manages users, so we'd need to query the component table
    // This is a placeholder - actual implementation depends on BetterAuth API
    // For now, return empty array
    return [];
  },
});
