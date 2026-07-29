import { SearchX } from "lucide-react";
import Link from "next/link";

export default function ProblemNotFound() {
  return (
    <div className="page-shell">
      <div className="error-state">
        <SearchX size={24} />
        <h1>Problem not found.</h1>
        <p>It may have moved or the seed has not been loaded yet.</p>
        <Link className="button button-primary button-md" href="/problems">
          Back to library
        </Link>
      </div>
    </div>
  );
}
