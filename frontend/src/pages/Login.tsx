import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Play } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { signIn, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      console.log("[Login] Attempting to sign in:", { email });
      const result = await signIn(email, password);
      console.log("[Login] Sign in result:", result);
      
      // Check if there's an error in the result (BetterAuth sometimes returns errors in result object)
      if (result && typeof result === 'object' && 'error' in result && result.error) {
        console.error("[Login] Sign in error in result:", result.error);
        const errorMessage = result.error?.message || JSON.stringify(result.error);
        setError(errorMessage);
        setIsSubmitting(false);
        return;
      }
      
      // Success - redirect to library
      console.log("[Login] Sign in successful, redirecting to library");
      navigate("/library");
    } catch (err) {
      console.error("[Login] Sign in exception:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to sign in. Please check your credentials.";
      console.error("[Login] Error message:", errorMessage);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setIsDemoLoading(true);

    // Get demo credentials from environment variables
    const demoEmail = import.meta.env.VITE_DEMO_USER_EMAIL;
    const demoPassword = import.meta.env.VITE_DEMO_USER_PASSWORD;

    if (!demoEmail || !demoPassword) {
      setError("Demo credentials are not configured. Please contact the administrator.");
      setIsDemoLoading(false);
      return;
    }

    try {
      console.log("[Login] Attempting demo login");
      const result = await signIn(demoEmail, demoPassword);
      console.log("[Login] Demo login result:", result);
      
      // Check if there's an error in the result
      if (result && typeof result === 'object' && 'error' in result && result.error) {
        console.error("[Login] Demo login error in result:", result.error);
        const errorMessage = result.error?.message || JSON.stringify(result.error);
        setError(`Demo login failed: ${errorMessage}`);
        setIsDemoLoading(false);
        return;
      }
      
      // Success - redirect to library
      console.log("[Login] Demo login successful, redirecting to library");
      navigate("/library");
    } catch (err) {
      console.error("[Login] Demo login exception:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to sign in to demo account. Please try again.";
      console.error("[Login] Demo login error message:", errorMessage);
      setError(`Demo login failed: ${errorMessage}`);
      setIsDemoLoading(false);
    }
  };

  const isLoading = authLoading || isSubmitting || isDemoLoading;

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-700">
          <h1 className="text-3xl font-bold text-white mb-2">Sign In</h1>
          <p className="text-slate-400 mb-6">Enter your credentials to access your media library</p>

          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
          
          <div className="mt-6 space-y-4">
            <p className="text-center text-sm text-slate-400">
              Don't have an account?{" "}
              <Link to="/signup" className="text-cyan-400 hover:text-cyan-300 font-medium">
                Sign up
              </Link>
            </p>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-600"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-800 px-2 text-slate-400">Or</span>
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="cursor-pointer w-full py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isDemoLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in to demo...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  To Demo app click here
                </>
              )}
            </button>
            <p className="text-xs text-center text-slate-500">
              Try the app without creating an account. Changes won't be saved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
