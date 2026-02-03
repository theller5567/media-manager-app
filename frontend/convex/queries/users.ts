import { query } from "../_generated/server";
import { v } from "convex/values";
import { authComponent } from "../auth";
import { components } from "../_generated/api";
import { requireRole, getCurrentUser as getCurrentUserHelper, isAdmin as isAdminHelper, isDemoUser as isDemoUserHelper } from "../lib/auth";

/**
 * Get current authenticated user's profile.
 * Returns null on any error so the app never crashes when auth is unavailable.
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    try {
      return await authComponent.getAuthUser(ctx);
    } catch {
      return null;
    }
  },
});

/**
 * Check if current user is admin.
 * Returns false on any error so the app never crashes when auth is unavailable.
 */
export const checkIsAdmin = query({
  args: {},
  handler: async (ctx) => {
    try {
      return await isAdminHelper(ctx);
    } catch {
      return false;
    }
  },
});

/**
 * Check if current user is DemoUser.
 * Returns false on any error (e.g. unauthenticated, auth component config issue) so the app never crashes.
 */
export const checkIsDemoUser = query({
  args: {},
  handler: async (ctx) => {
    try {
      return await isDemoUserHelper(ctx);
    } catch {
      return false;
    }
  },
});

/**
 * Get user by ID
 * Allows any authenticated user to view basic user info (for display purposes like "Uploaded By")
 */
export const getUserById = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Require authentication (but not admin)
    const currentUser = await getCurrentUserHelper(ctx);
    if (!currentUser) {
      throw new Error("Authentication required");
    }
    
    // Use BetterAuth component's findOne to query the user table
    // This allows any authenticated user to view user info for display purposes
    try {
      const user = await ctx.runQuery(
        components.betterAuth.adapter.findOne,
        {
          model: "user",
          where: [
            {
              field: "_id",
              operator: "eq",
              value: args.userId,
            },
          ],
        }
      );
      return user;
    } catch (error) {
      // If user not found or error, return null gracefully
      // Frontend will handle null case (e.g., show "Unknown User" or hide the field)
      return null;
    }
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
