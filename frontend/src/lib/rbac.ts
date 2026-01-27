import type { Id } from "../../convex/_generated/dataModel";

// User type from BetterAuth (matches BetterAuth's actual return type)
export type User = {
  id: string;
  name: string | null;
  email: string;
  emailVerified: boolean;
  createdAt: Date; // BetterAuth returns Date objects
  updatedAt: Date; // BetterAuth returns Date objects
  image?: string | null;
  userId?: string | null;
  role?: "user" | "admin";
  [key: string]: any; // Allow additional properties from BetterAuth
};

// Media type (simplified for RBAC checks)
export type Media = {
  _id: Id<"media">;
  uploadedBy?: string; // BetterAuth component table ID stored as string
  [key: string]: any;
};

/**
 * Check if user has a specific role
 * Note: BetterAuth doesn't have built-in roles, so this checks the optional role field
 * For now, all users default to "user" unless role is explicitly set
 */
export function hasRole(
  user: User | null,
  role: "user" | "admin"
): boolean {
  if (!user) return false;
  
  // Default to "user" if role is not set
  const userRole = user.role || "user";
  return userRole === role;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(
  user: User | null,
  roles: string[]
): boolean {
  if (!user) return false;
  const userRole = user.role || "user";
  return roles.includes(userRole);
}

/**
 * Check if user can edit a specific media item
 */
export function canEditMedia(user: User | null, media: Media): boolean {
  if (!user) return false;
  
  // Admin can edit any media (if role is set to admin)
  if (hasRole(user, "admin")) return true;
  
  // User can only edit their own media
  if (!media.uploadedBy) return false;
  return media.uploadedBy === user.id;
}

/**
 * Check if user can delete a specific media item
 */
export function canDeleteMedia(user: User | null, media: Media): boolean {
  if (!user) return false;
  
  // Admin can delete any media (if role is set to admin)
  if (hasRole(user, "admin")) return true;
  
  // User can only delete their own media
  if (!media.uploadedBy) return false;
  return media.uploadedBy === user.id;
}

/**
 * Check if user is an admin
 * Note: This checks the optional role field. For proper admin checking,
 * use the checkIsAdmin query which checks server-side admin status.
 */
export function isAdmin(user: User | null): boolean {
  return hasRole(user, "admin");
}
