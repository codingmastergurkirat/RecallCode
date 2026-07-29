import Link from "next/link";
import { BrandLogo } from "./brand-logo";
import { ThemeToggle } from "./theme-toggle";

export function PublicNavbar() {
  return (
    <header className="public-nav">
      <div className="nav-container">
        <BrandLogo />
        <nav aria-label="Primary navigation" className="public-nav-links">
          <Link href="/#how-it-works">How it works</Link>
          <Link href="/#patterns">Patterns</Link>
        </nav>
        <div className="nav-actions">
          <ThemeToggle />
          <Link className="button button-ghost button-sm nav-login" href="/login">
            Sign in
          </Link>
          <Link className="button button-primary button-sm" href="/signup">
            Start learning
          </Link>
        </div>
      </div>
    </header>
  );
}
