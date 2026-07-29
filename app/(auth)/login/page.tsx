import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const nextPath = next?.startsWith("/") && !next.startsWith("//")
    ? next
    : "/dashboard";
  return (
    <AuthForm
      mode="login"
      nextPath={nextPath}
      initialError={error?.slice(0, 180)}
    />
  );
}
