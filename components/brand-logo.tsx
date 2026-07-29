import Link from "next/link";
import { cn } from "@/lib/utils";

export function BrandLogo({
  href = "/",
  className,
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("brand-logo", className)}
      aria-label="RecallCode home"
    >
      <span className="brand-mark" aria-hidden="true">
        R/
      </span>
      <span>
        Recall<span>Code</span>
      </span>
    </Link>
  );
}
