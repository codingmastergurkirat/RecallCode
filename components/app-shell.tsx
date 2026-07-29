"use client";

import {
  BookOpenCheck,
  BrainCircuit,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandLogo } from "./brand-logo";
import { ThemeToggle } from "./theme-toggle";
import { createClient } from "@/lib/supabase/client";
import { cn, getInitials } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/problems", label: "Problems", icon: BookOpenCheck },
  { href: "/flashcards", label: "Flashcards", icon: CreditCard },
  { href: "/reviews", label: "Reviews", icon: BrainCircuit },
  { href: "/profile", label: "Profile", icon: UserRound },
];

export function AppShell({
  children,
  name,
  email,
  avatarUrl,
}: {
  children: React.ReactNode;
  name?: string | null;
  email: string;
  avatarUrl?: string | null;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const displayName = name?.trim() || email.split("@")[0];

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.assign("/");
  }

  return (
    <div className="app-root">
      <header className="app-nav">
        <div className="app-nav-inner">
          <BrandLogo href="/dashboard" />
          <nav aria-label="Application navigation" className="app-nav-links">
            {navigation.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(active && "active")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="app-nav-actions">
            <ThemeToggle />
            <Link
              href="/profile"
              className="nav-avatar"
              aria-label={`${displayName}'s profile`}
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" />
              ) : (
                getInitials(displayName, email)
              )}
            </Link>
            <button
              className="icon-button mobile-menu-button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation"
              type="button"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {menuOpen ? (
        <div className="mobile-nav-backdrop" onClick={() => setMenuOpen(false)}>
          <aside
            className="mobile-nav"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mobile-nav-top">
              <BrandLogo href="/dashboard" />
              <button
                className="icon-button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close navigation"
                type="button"
              >
                <X size={20} />
              </button>
            </div>
            <nav aria-label="Mobile application navigation">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(active && "active")}
                    onClick={() => setMenuOpen(false)}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <button className="mobile-signout" type="button" onClick={signOut}>
              <LogOut size={18} />
              Sign out
            </button>
          </aside>
        </div>
      ) : null}

      <main className="app-main">{children}</main>
    </div>
  );
}
