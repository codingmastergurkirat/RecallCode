import type { Metadata } from "next";
import { ProfileForm } from "@/components/profile/profile-form";
import { getCurrentProfile, requireUser } from "@/services/auth.service";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const [user, profile] = await Promise.all([
    requireUser(),
    getCurrentProfile(),
  ]);

  return (
    <div className="page-shell profile-page">
      <header className="page-header">
        <div>
          <span className="page-kicker">ACCOUNT</span>
          <h1>Profile</h1>
          <p>Your identity and learning focus.</p>
        </div>
      </header>
      <ProfileForm
        email={user.email ?? ""}
        emailVerified={Boolean(user.email_confirmed_at)}
        fullName={profile?.full_name ?? user.user_metadata.full_name ?? ""}
        username={profile?.username ?? ""}
        bio={profile?.bio ?? ""}
        avatarUrl={profile?.avatar_url ?? user.user_metadata.avatar_url}
      />
    </div>
  );
}
