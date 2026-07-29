import { AppShell } from "@/components/app-shell";
import { getCurrentProfile, requireUser } from "@/services/auth.service";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, profile] = await Promise.all([
    requireUser(),
    getCurrentProfile(),
  ]);

  return (
    <AppShell
      name={profile?.full_name ?? user.user_metadata.full_name}
      email={user.email ?? "learner@recallcode.app"}
      avatarUrl={profile?.avatar_url ?? user.user_metadata.avatar_url}
    >
      {children}
    </AppShell>
  );
}
