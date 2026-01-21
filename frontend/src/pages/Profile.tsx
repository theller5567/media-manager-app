import { UserIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Avatar from "@/components/ui/Avatar";
import Header from "@/components/layout/Header";
const Profile = () => {
  const { currentUser } = useAuth();

  return (
    <div className="relative flex flex-col gap-4 h-full flex-1 min-h-0">
      <Header
        title="Profile"
        description="Update your personal information and preferences."
      >
        <button className="flex items-center gap-2 bg-cyan-500 text-white px-4 py-2 rounded-sm hover:bg-cyan-600 transition-colors cursor-pointer">
          <UserIcon className="h-4 w-4" />
          Edit Profile
        </button>
      </Header>
      <div className="flex bg-slate-800 p-4 gap-4 rounded-sm flex-1 min-h-0">
        <div className="flex flex-col items-center justify-center flex-1 min-h-0 m-4 gap-4">
          {currentUser ? (
            <Avatar user={currentUser} size="large" />
          ) : (
            <UserIcon className="h-16 w-16 text-slate-400" />
          )}
          <h2 className="text-2xl font-bold text-white shrink-0">
            {currentUser?.name}
          </h2>
          <p className="text-sm text-slate-400">{currentUser?.email}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
