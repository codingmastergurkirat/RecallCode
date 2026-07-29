"use client";

import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type Mode = "login" | "signup" | "forgot" | "reset";

const copy: Record<
  Mode,
  { title: string; subtitle: string; button: string }
> = {
  login: {
    title: "Welcome back",
    subtitle: "Continue building durable problem-solving skills.",
    button: "Sign in",
  },
  signup: {
    title: "Start your recall loop",
    subtitle: "Create an account and make every solve count.",
    button: "Create account",
  },
  forgot: {
    title: "Reset your password",
    subtitle: "We’ll send a secure reset link to your inbox.",
    button: "Send reset link",
  },
  reset: {
    title: "Choose a new password",
    subtitle: "Use at least eight characters.",
    button: "Update password",
  },
};

export function AuthForm({
  mode,
  nextPath = "/dashboard",
  initialError,
}: {
  mode: Mode;
  nextPath?: string;
  initialError?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(
    initialError ? { type: "error", text: initialError } : null,
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    const form = new FormData(event.currentTarget);

    try {
      const supabase = createClient();
      const email = String(form.get("email") ?? "").trim();
      const password = String(form.get("password") ?? "");

      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        window.location.assign(nextPath);
      }

      if (mode === "signup") {
        const fullName = String(form.get("fullName") ?? "").trim();
        const confirmPassword = String(form.get("confirmPassword") ?? "");
        if (password.length < 8) {
          throw new Error("Password must be at least 8 characters.");
        }
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        if (data.session) {
          window.location.assign("/dashboard");
        } else {
          setMessage({
            type: "success",
            text: "Check your inbox to verify your email.",
          });
        }
      }

      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        });
        if (error) throw error;
        setMessage({
          type: "success",
          text: "If an account exists, a reset link is on its way.",
        });
      }

      if (mode === "reset") {
        const confirmPassword = String(form.get("confirmPassword") ?? "");
        if (password.length < 8) {
          throw new Error("Password must be at least 8 characters.");
        }
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setMessage({
          type: "success",
          text: "Password updated. Redirecting to your dashboard…",
        });
        window.setTimeout(() => window.location.assign("/dashboard"), 900);
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    setMessage(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
            nextPath,
          )}`,
        },
      });
      if (error) throw error;
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Google sign-in failed.",
      });
      setLoading(false);
    }
  }

  const isPasswordForm = mode !== "forgot";
  const hasOAuth = mode === "login" || mode === "signup";

  return (
    <div className="auth-panel">
      <div className="auth-heading">
        <h1>{copy[mode].title}</h1>
        <p>{copy[mode].subtitle}</p>
      </div>

      {hasOAuth ? (
        <>
          <Button
            variant="secondary"
            className="google-button"
            onClick={handleGoogle}
            disabled={loading}
            type="button"
          >
            <span aria-hidden="true" className="google-g">
              G
            </span>
            Continue with Google
          </Button>
          <div className="auth-divider">
            <span>or continue with email</span>
          </div>
        </>
      ) : null}

      <form onSubmit={handleSubmit} className="auth-form">
        {mode === "signup" ? (
          <label>
            <span>Full name</span>
            <input
              name="fullName"
              type="text"
              autoComplete="name"
              placeholder="Alex Morgan"
              required
            />
          </label>
        ) : null}
        {mode !== "reset" ? (
          <label>
            <span>Email</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
          </label>
        ) : null}
        {isPasswordForm ? (
          <label>
            <span>Password</span>
            <div className="password-input">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                placeholder="••••••••"
                minLength={mode === "login" ? undefined : 8}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
        ) : null}
        {mode === "signup" || mode === "reset" ? (
          <label>
            <span>Confirm password</span>
            <input
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              minLength={8}
              required
            />
          </label>
        ) : null}

        {mode === "login" ? (
          <div className="forgot-row">
            <Link href="/forgot-password">Forgot password?</Link>
          </div>
        ) : null}

        {message ? (
          <div className={`form-message form-message-${message.type}`}>
            {message.type === "error" ? (
              <AlertCircle size={17} />
            ) : (
              <CheckCircle2 size={17} />
            )}
            <span>{message.text}</span>
          </div>
        ) : null}

        <Button type="submit" size="lg" disabled={loading}>
          {loading ? <Spinner label={copy[mode].button} /> : null}
          {copy[mode].button}
        </Button>
      </form>

      {mode === "login" ? (
        <p className="auth-switch">
          New to RecallCode? <Link href="/signup">Create an account</Link>
        </p>
      ) : null}
      {mode === "signup" ? (
        <p className="auth-switch">
          Already learning? <Link href="/login">Sign in</Link>
        </p>
      ) : null}
      {mode === "forgot" ? (
        <p className="auth-switch">
          Remembered it? <Link href="/login">Back to sign in</Link>
        </p>
      ) : null}
    </div>
  );
}
