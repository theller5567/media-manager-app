import { authClient } from "@/lib/auth";

export function useAuth() {
  const { data: session, isPending } = authClient.useSession();

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

  const updateUser = async (data: { name?: string; image?: string | null }) => {
    try {
      const result = await authClient.updateUser(data);
      return result;
    } catch (err) {
      throw err;
    }
  };

  const changePassword = async (data: {
    currentPassword: string;
    newPassword: string;
    revokeOtherSessions?: boolean;
  }) => {
    try {
      const result = await authClient.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        revokeOtherSessions: data.revokeOtherSessions ?? false,
      });
      return result;
    } catch (err) {
      throw err;
    }
  };

  return {
    currentUser: user,
    isLoading,
    isAuthenticated,
    signIn,
    signOut,
    updateUser,
    changePassword,
  };
}
