import { authComponent } from "../auth";
import type { QueryCtx, MutationCtx } from "../_generated/server";

/**
 * Require authentication - throws error if user is not authenticated
 */
export async function requireAuth(ctx: QueryCtx | MutationCtx) {
  const user = await authComponent.getAuthUser(ctx);
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}

/**
 * Require a specific role - throws error if user doesn't have the role
 */
export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  role: "user" | "admin" | "demoUser"
) {
  const user = await requireAuth(ctx);
  
  // For now, we'll check if user is admin by checking their email or a custom field
  // BetterAuth doesn't have built-in roles, so we'll need to extend the user model
  // For initial implementation, we'll use a simple check - can be enhanced later
  const isAdmin = user.email === process.env.ADMIN_EMAIL || 
                  (user as any).role === "admin";
  
  if (role === "admin" && !isAdmin) {
    throw new Error("Admin access required");
  }
  
  return user;
}

/**
 * Get current authenticated user (returns null if not authenticated)
 */
export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  try {
    return await authComponent.getAuthUser(ctx);
  } catch {
    return null;
  }
}

/**
 * Check if current user is admin
 */
export async function isAdmin(ctx: QueryCtx | MutationCtx): Promise<boolean> {
  const user = await getCurrentUser(ctx);
  if (!user) return false;
  
  // Check admin status - can be enhanced with proper role system
  return user.email === process.env.ADMIN_EMAIL || 
         (user as any).role === "admin";
}

/**
 * Check if current user is DemoUser
 * DemoUser can use all UI features but mutations won't persist to database
 */
export async function isDemoUser(ctx: QueryCtx | MutationCtx): Promise<boolean> {
  const user = await getCurrentUser(ctx);
  if (!user) return false;
  
  // Check DemoUser status via environment variable OR user role field
  return user.email === process.env.DEMO_USER_EMAIL || 
         (user as any).role === "demoUser";
}
