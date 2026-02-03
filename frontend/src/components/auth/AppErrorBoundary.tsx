import React from "react";
import { LogOut } from "lucide-react";

interface AppErrorBoundaryProps {
  children: React.ReactNode;
  onLogout: () => void | Promise<void>;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches errors (e.g. Convex auth query failures after login) and shows
 * a recovery UI with "Log out" so the user can get back to the sign-in page
 * instead of a blank white page.
 */
export class AppErrorBoundary extends React.Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { hasError: true, error };
  }

  handleLogout = async () => {
    await this.props.onLogout();
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-lg p-6 text-center">
            <h1 className="text-lg font-semibold text-white mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-slate-400 mb-4">
              This can happen when session validation fails between the app and
              the server. Try logging out and signing in again.
            </p>
            <button
              type="button"
              onClick={this.handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <LogOut className="h-4 w-4" />
              Log out and return to sign in
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
