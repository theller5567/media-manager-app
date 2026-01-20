"use node";

import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import { authComponent } from "../auth";

type MigrationResult = {
  success: boolean;
  message: string;
  userId: string;
  updated: number;
};

/**
 * Migration action to set uploadedBy for existing media
 * Run this once after implementing authorization
 * 
 * Usage: npx convex run actions/migrateAuth:migrate
 */
export const migrate = action({
  args: {},
  handler: async (ctx): Promise<MigrationResult> => {
    // Get current authenticated user
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("Must be authenticated to run migration");
    }
    
    // Set uploadedBy for all existing media without an uploader to current user
    const result: { updated: number } = await ctx.runMutation(internal.mutations.media.setUploadedByForMedia, {
      userId: user._id.toString(), // Convert ID to string for schema compatibility
    });
    
    return {
      success: true,
      message: `Set uploadedBy for ${result.updated} media items to user ${user.email}`,
      userId: user._id.toString(), // Convert ID to string for schema compatibility
      updated: result.updated,
    };
  },
});
