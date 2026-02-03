import { useAuth } from "@/hooks/useAuth";

/**
 * Derives isDemoUser and isAdmin from the client session (currentUser) and env vars.
 * Use this for UI only (Sidebar, DemoModeBanner, MediaDetail) so we never call
 * the Convex auth component in queries, which was causing "Server Error" after login.
 *
 * Server-side checks (mutations using requireRole) still run on Convex; this hook
 * only avoids the failing Convex auth queries for the UI.
 */
export function useRoleChecks(): { isDemoUser: boolean; isAdmin: boolean } {
  const { currentUser, isAuthenticated } = useAuth();

  if (!isAuthenticated || !currentUser) {
    return { isDemoUser: false, isAdmin: false };
  }

  const demoEmail = import.meta.env.VITE_DEMO_USER_EMAIL as string | undefined;
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL as string | undefined;
  const user = currentUser as { email?: string; role?: string };

  const isDemoUser =
    (demoEmail && user.email === demoEmail) || user.role === "demoUser";
  const isAdmin =
    (adminEmail && user.email === adminEmail) || user.role === "admin";

  return { isDemoUser: !!isDemoUser, isAdmin: !!isAdmin };
}
