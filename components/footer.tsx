import Link from "next/link";
import { BrandLogo } from "./brand-logo";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <BrandLogo className="footer-logo" />
        <p>© {new Date().getFullYear()} RecallCode.</p>
        <nav aria-label="Footer navigation">
          <a
            href="https://github.com/"
            target="_blank"
            rel="noreferrer"
            aria-label="RecallCode on GitHub"
          >
            GitHub
          </a>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
      </div>
    </footer>
  );
}
