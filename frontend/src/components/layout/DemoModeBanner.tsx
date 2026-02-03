import { useRoleChecks } from "@/hooks/useRoleChecks";
import { AlertTriangle } from "lucide-react";

/**
 * Demo Mode Banner Component
 * Displays a warning banner when the current user is in demo mode.
 * Uses client-side session (useRoleChecks) so we never call the Convex auth component.
 */
export function DemoModeBanner() {
  const { isDemoUser } = useRoleChecks();

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
