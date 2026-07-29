import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { PublicNavbar } from "@/components/public-navbar";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <div className="legal-page">
      <PublicNavbar />
      <main>
        <span className="page-kicker">LEGAL</span>
        <h1>Privacy</h1>
        <p className="legal-lead">
          RecallCode stores only the data needed to provide your learning
          workspace.
        </p>
        <section>
          <h2>Account data</h2>
          <p>
            Authentication and sessions are handled entirely by Supabase Auth.
            Profile data is protected by row-level security.
          </p>
        </section>
        <section>
          <h2>Learning data</h2>
          <p>
            Your submissions, feedback, flashcards, review history, and recall
            answers are stored in your Supabase project and scoped to your user
            account.
          </p>
        </section>
        <section>
          <h2>Service providers</h2>
          <p>
            Code may be sent to Piston for execution. Submitted code may be sent
            to Groq or Gemini to generate learning materials when configured.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
