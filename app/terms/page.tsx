import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { PublicNavbar } from "@/components/public-navbar";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <div className="legal-page">
      <PublicNavbar />
      <main>
        <span className="page-kicker">LEGAL</span>
        <h1>Terms</h1>
        <p className="legal-lead">
          Use RecallCode to learn, practice, and improve responsibly.
        </p>
        <section>
          <h2>Learning support</h2>
          <p>
            Execution and AI feedback can be incomplete or incorrect. Verify
            important results and use the product as a study aid.
          </p>
        </section>
        <section>
          <h2>Problem content</h2>
          <p>
            RecallCode stores public metadata and links to original problem
            sources. Their content remains subject to the source&apos;s terms.
          </p>
        </section>
        <section>
          <h2>Acceptable use</h2>
          <p>
            Do not misuse execution or AI endpoints, attempt unauthorized
            access, or interfere with service availability.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
