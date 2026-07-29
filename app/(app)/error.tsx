"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="page-shell">
      <div className="error-state">
        <AlertCircle size={24} />
        <h1>We couldn&apos;t load this view.</h1>
        <p>Check your connection and try once more.</p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
