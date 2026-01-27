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

/**
 * Get user preferences (gradient, etc.)
 */
export const getUserPreferences = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserHelper(ctx);
    if (!user) {
      return null;
    }
    
    const userId = user._id.toString();
    const preferences = await ctx.db
      .query("userPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    
    return preferences;
  },
});

/**
 * Get user statistics (upload count, etc.)
 */
export const getUserStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserHelper(ctx);
    if (!user) {
      return {
        uploadCount: 0,
        totalFileSize: 0,
        mediaByType: {},
      };
    }
    
    // Get all media uploaded by this user
    const userMedia = await ctx.db
      .query("media")
      .withIndex("by_uploadedBy", (q) => q.eq("uploadedBy", user._id.toString()))
      .collect();
    
    // Calculate statistics
    const uploadCount = userMedia.length;
    const totalFileSize = userMedia.reduce((sum, item) => sum + (item.fileSize || 0), 0);
    
    // Total storage limit (e.g., 1GB)
    const storageLimit = 1024 * 1024 * 1024; // 1GB in bytes
    
    // Count media by type and calculate storage by type
    const mediaByType: Record<string, number> = {};
    const storageByType: Record<string, number> = {};
    
    userMedia.forEach((item) => {
      // Count by type
      mediaByType[item.mediaType] = (mediaByType[item.mediaType] || 0) + 1;
      
      // Storage by type
      storageByType[item.mediaType] = (storageByType[item.mediaType] || 0) + (item.fileSize || 0);
    });
    
    return {
      uploadCount,
      totalFileSize,
      storageLimit,
      remainingStorage: Math.max(0, storageLimit - totalFileSize),
      mediaByType,
      storageByType,
    };
  },
});
