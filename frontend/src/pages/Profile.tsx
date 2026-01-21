import { useState, useEffect, type ReactNode } from "react";
import {
  UserIcon,
  Upload,
  HardDrive,
  Calendar,
  Mail,
  Shield,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Header from "@/components/layout/Header";
import { gradientClasses } from "@/lib/gradients";
import { twMerge } from "tailwind-merge";
import { formatFileSize } from "@/lib/mediaUtils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import type { User } from "@/lib/rbac";
import Avatar from "@/components/ui/Avatar";

const Profile = () => {
  const { currentUser } = useAuth();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showGradientPicker, setShowGradientPicker] = useState(false);
  const [gradient, setGradient] = useState<string>(gradientClasses.Dusk);

  // Fetch user statistics and preferences
  const userStats = useQuery(api.queries.users.getUserStats);
  const userPreferences = useQuery(api.queries.users.getUserPreferences);
  
  // Mutation for updating profile
  const updateProfileMutation = useMutation(api.mutations.users.updateProfile);

  // Load gradient from preferences when available
  useEffect(() => {
    if (userPreferences?.gradient) {
      setGradient(userPreferences.gradient);
    }
  }, [userPreferences?.gradient]);

  // Format date helper
  const formatDate = (date: Date | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const gradientPicker = (): ReactNode => {
    return (
      <div className="flex flex-wrap gap-3 p-4 max-h-96 overflow-y-auto">
        {Object.keys(gradientClasses).map((grad: string) => {
          const gradientClass =
            gradientClasses[grad as keyof typeof gradientClasses];
          const isSelected =
            gradient === gradientClasses[grad as keyof typeof gradientClasses];
          return (
            <button
              key={grad}
              type="button"
              onClick={() => {
                setGradient(
                  gradientClasses[grad as keyof typeof gradientClasses]
                );
                setShowGradientPicker(false);
              }}
              className={twMerge(
                "flex flex-col items-center justify-center gap-2 w-20 h-20 rounded-lg border-2 transition-all hover:scale-105",
                isSelected
                  ? "border-cyan-500 ring-2 ring-cyan-500/50"
                  : "border-slate-700 hover:border-slate-600"
              )}
            >
              <div
                className={twMerge(
                  "w-12 h-12 rounded-full flex items-center justify-center",
                  gradientClass
                )}
              />
              <span className="text-xs text-slate-300 text-center leading-tight px-1">
                {grad}
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  const handleSave = async () => {
    if (currentUser) {
      try {
        await updateProfileMutation({
          gradient: gradient,
        });
        setShowEditProfile(false);
      } catch (error) {
        console.error("Failed to update profile:", error);
        // TODO: Show error toast/notification to user
      }
    }
  };

  return (
    <div className="relative flex flex-col gap-4 h-full flex-1 min-h-0">
      <Header
        title="Profile"
        description="View and manage your account information and preferences."
      >
        <button
          onClick={() => setShowEditProfile(!showEditProfile)}
          className="flex items-center gap-2 bg-cyan-500 text-white px-4 py-2 rounded-sm hover:bg-cyan-600 transition-colors cursor-pointer"
        >
          <UserIcon className="h-4 w-4" />
          {showEditProfile ? "View Profile" : "Edit Profile"}
        </button>
      </Header>

      {!showEditProfile ? (
        <div className="space-y-4 flex-1 min-h-0 overflow-y-auto">
          {/* Profile Header Card */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <div className="flex items-start gap-6">
              {currentUser ? (
                <Avatar user={currentUser} size="large" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                  <UserIcon className="h-12 w-12 text-slate-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-white mb-1">
                  {currentUser?.name || "Guest User"}
                </h2>
                <div className="flex items-center gap-2 text-slate-400 mb-4">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{currentUser?.email}</span>
                </div>
                {(currentUser as User | null)?.role && (
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-cyan-400" />
                    <span className="text-sm font-medium text-cyan-400 capitalize">
                      {(currentUser as User).role}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          {userStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-cyan-500/10 rounded-lg">
                    <Upload className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Total Uploads</p>
                    <p className="text-2xl font-bold text-white">
                      {userStats.uploadCount}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <HardDrive className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Storage Used</p>
                    <p className="text-2xl font-bold text-white">
                      {formatFileSize(userStats.totalFileSize)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Member Since</p>
                    <p className="text-lg font-bold text-white">
                      {formatDate(currentUser?.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Account Information */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              Account Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-400">
                  Email Verification
                </label>
                <p className="text-white mt-1">
                  {currentUser?.emailVerified ? (
                    <span className="inline-flex items-center gap-2 text-green-400">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-yellow-400">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                      Not Verified
                    </span>
                  )}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-400">
                  Account Created
                </label>
                <p className="text-white mt-1">
                  {formatDate(currentUser?.createdAt)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-400">
                  Last Updated
                </label>
                <p className="text-white mt-1">
                  {formatDate(currentUser?.updatedAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Media Type Breakdown */}
          {userStats &&
            userStats.mediaByType &&
            Object.keys(userStats.mediaByType).length > 0 && (
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Media by Type
                </h3>
                <div className="space-y-2">
                  {Object.entries(userStats.mediaByType).map(
                    ([type, count]) => (
                      <div
                        key={type}
                        className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0"
                      >
                        <span className="text-slate-300 capitalize">
                          {type}
                        </span>
                        <span className="text-white font-semibold">
                          {count}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
        </div>
      ) : (
        <div className="space-y-4 flex-1 min-h-0 overflow-y-auto">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <h2 className="text-2xl font-bold text-white mb-2">Edit Profile</h2>
            <p className="text-sm text-slate-400 mb-6">
              Update your personal information and preferences.
            </p>

            <div className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-4 pb-6 border-b border-slate-700">
                <div
                  className={twMerge(
                    "w-20 h-20 rounded-full flex items-center justify-center text-white text-xl font-semibold shrink-0",
                    gradient
                  )}
                >
                  {currentUser?.name
                    ?.split(" ")
                    .map((name) => name[0])
                    .join("")}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    Avatar Gradient
                  </h3>
                  <p className="text-sm text-slate-400 mb-3">
                    Choose a gradient color for your avatar
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowGradientPicker(true)}
                    className="bg-slate-700 text-white text-sm px-4 py-2 rounded-sm hover:bg-slate-600 transition-colors cursor-pointer border border-slate-600"
                  >
                    Change Gradient
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    defaultValue={currentUser?.name || ""}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue={currentUser?.email || ""}
                    placeholder="Enter your email"
                    disabled
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-sm text-slate-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Email cannot be changed
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter new password (leave blank to keep current)"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Leave blank if you don't want to change your password
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowEditProfile(false)}
                  className="px-6 py-2 bg-slate-700 text-white rounded-sm hover:bg-slate-600 transition-colors cursor-pointer border border-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  type="button"
                  className="px-6 py-2 bg-cyan-500 text-white rounded-sm hover:bg-cyan-600 transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gradient Picker Dialog */}
      <Dialog open={showGradientPicker} onOpenChange={setShowGradientPicker}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              Select Avatar Gradient
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Choose a gradient color scheme for your avatar
            </DialogDescription>
          </DialogHeader>
          {gradientPicker()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
