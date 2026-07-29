"use client";

import {
  AlertCircle,
  CheckCircle2,
  LogOut,
  Save,
  ShieldCheck,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { updateProfileAction } from "@/actions/profile.actions";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function ProfileForm({
  email,
  emailVerified,
  fullName,
  username,
  bio,
  avatarUrl,
}: {
  email: string;
  emailVerified: boolean;
  fullName: string;
  username: string;
  bio: string;
  avatarUrl?: string | null;
}) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    const nextFullName = String(form.get("fullName") ?? "").trim();
    const nextUsername = String(form.get("username") ?? "").trim();
    const nextBio = String(form.get("bio") ?? "").trim();

    try {
      const result = await updateProfileAction({
        fullName: nextFullName,
        username: nextUsername,
        bio: nextBio,
      });
      if (!result.ok) throw new Error(result.error);
      setMessage({ type: "success", text: "Profile saved." });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Profile was not saved.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.assign("/");
  }

  return (
    <div className="profile-layout">
      <aside className="profile-summary">
        <div className="profile-avatar">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" />
          ) : (
            getInitials(fullName, email)
          )}
        </div>
        <h2>{fullName || email.split("@")[0]}</h2>
        <p>{email}</p>
        <div className="verified-pill">
          <ShieldCheck size={15} />
          {emailVerified ? "Email verified" : "Verification pending"}
        </div>
        <Button variant="secondary" onClick={signOut} type="button">
          <LogOut size={16} />
          Sign out
        </Button>
      </aside>

      <form className="profile-form" onSubmit={save}>
        <div>
          <span className="page-kicker">PERSONAL DETAILS</span>
          <h2>Your learner profile</h2>
          <p>Keep it concise. This appears only in your workspace.</p>
        </div>
        <label>
          <span>Full name</span>
          <input
            name="fullName"
            type="text"
            defaultValue={fullName}
            autoComplete="name"
            maxLength={80}
            placeholder="Alex Morgan"
          />
        </label>
        <label>
          <span>Username</span>
          <input
            name="username"
            type="text"
            defaultValue={username}
            autoComplete="username"
            minLength={3}
            maxLength={32}
            pattern="[a-zA-Z0-9_-]+"
            placeholder="alex_codes"
          />
          <small>Letters, numbers, underscores, and hyphens.</small>
        </label>
        <label>
          <span>Email</span>
          <input type="email" value={email} readOnly disabled />
          <small>Managed securely by Supabase Auth.</small>
        </label>
        <label>
          <span>Learning focus</span>
          <textarea
            name="bio"
            defaultValue={bio}
            maxLength={240}
            placeholder="Preparing for backend engineering interviews."
          />
        </label>
        {message ? (
          <div className={`form-message form-message-${message.type}`}>
            {message.type === "success" ? (
              <CheckCircle2 size={17} />
            ) : (
              <AlertCircle size={17} />
            )}
            {message.text}
          </div>
        ) : null}
        <Button type="submit" disabled={saving}>
          {saving ? <Spinner label="Saving profile" /> : <Save size={16} />}
          Save changes
        </Button>
      </form>
    </div>
  );
}
