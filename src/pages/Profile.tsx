import { Loader2 } from 'lucide-react';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { UserInfo } from '@/components/profile/UserInfo';
import { ProfileForm } from '@/components/profile/forms/ProfileForm';
import { PasswordForm } from '@/components/profile/forms/PasswordForm';
import { DangerZone } from '@/components/profile/DangerZone';
import { useProfile } from '@/hooks/use-profile';
import { useProtectedRoute } from '@/hooks/use-protected-route';

export default function Profile() {
  const { isLoading: authLoading } = useProtectedRoute();

  const {
    user,
    profileData,
    loading,
    updateProfile,
    updatePassword,
    deleteAccount
  } = useProfile();

  if (authLoading || loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <p>Unable to load user profile</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container max-w-6xl mx-auto p-6 space-y-8">
        <ProfileHeader
          title="Profile Settings"
          description="Manage your account details"
        />

        <div className="grid gap-6 md:grid-cols-[1fr,2fr]">
          <div className="space-y-6">
            <UserInfo user={user} />
            <DangerZone onDelete={deleteAccount} />
          </div>

          <div className="space-y-6">
            <ProfileForm
              profileData={profileData}
              onSubmit={updateProfile}
            />
            <PasswordForm onSubmit={updatePassword} />
          </div>
        </div>
      </div>
    </div>
  );
}
