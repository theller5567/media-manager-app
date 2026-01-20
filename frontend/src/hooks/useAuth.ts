import { authClient } from "@/lib/auth";

export function useAuth() {
  const { data: session, isPending, error } = authClient.useSession();

  // BetterAuth's useSession returns both session and user data
  // The user is nested in session.user
  const user = session?.user || null;
  const isLoading = isPending;
  const isAuthenticated = !!session && !!user;

  const signIn = async (email: string, password: string) => {
    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });
      return result;
    } catch (err) {
      throw err;
    }
  };

  const signOut = async () => {
    await authClient.signOut();
  };

  return {
    currentUser: user,
    isLoading,
    isAuthenticated,
    signIn,
    signOut,
  };
}
