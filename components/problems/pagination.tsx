import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

function pageUrl(
  page: number,
  params: Record<string, string | undefined>,
) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) search.set(key, value);
  });
  search.set("page", String(page));
  return `/problems?${search.toString()}`;
}

export function Pagination({
  page,
  pageCount,
  params,
}: {
  page: number;
  pageCount: number;
  params: Record<string, string | undefined>;
}) {
  if (pageCount <= 1) return null;

  return (
    <nav className="pagination" aria-label="Problems pagination">
      {page > 1 ? (
        <Link href={pageUrl(page - 1, params)} aria-label="Previous page">
          <ChevronLeft size={17} /> Previous
        </Link>
      ) : (
        <span aria-disabled="true">
          <ChevronLeft size={17} /> Previous
        </span>
      )}
      <strong>
        Page {page} of {pageCount}
      </strong>
      {page < pageCount ? (
        <Link href={pageUrl(page + 1, params)} aria-label="Next page">
          Next <ChevronRight size={17} />
        </Link>
      ) : (
        <span aria-disabled="true">
          Next <ChevronRight size={17} />
        </span>
      )}
    </nav>
  );
}
