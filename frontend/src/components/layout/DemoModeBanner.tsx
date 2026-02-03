import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import { AlertTriangle } from "lucide-react";

/**
 * Demo Mode Banner Component
 * Displays a warning banner when the current user is in demo mode
 */
export function DemoModeBanner() {
  const { isAuthenticated } = useAuth();
  // Only run the query when authenticated so we never hit the auth component for logged-out users
  const isDemoUser = useQuery(
    api.queries.users.checkIsDemoUser,
    isAuthenticated ? {} : "skip"
  );

  // Don't render if not demo user or still loading
  if (!isDemoUser) {
    return null;
  }

  return (
    <div className="bg-amber-500 text-amber-900 px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium">
      <AlertTriangle className="h-4 w-4" />
      <span>Demo Mode: Changes will not be saved to the database</span>
    </div>
  );
}
