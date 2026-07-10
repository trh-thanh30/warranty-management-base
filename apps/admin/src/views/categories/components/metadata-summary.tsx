import type { CategoryResponse } from "@repo/shared";
import { getCategoryMetadataSummary } from "../categories.utils";

type MetadataSummaryProps = {
  metadata: CategoryResponse["metadata"];
};

export function MetadataSummary({ metadata }: MetadataSummaryProps) {
  const summary = getCategoryMetadataSummary(metadata);

  if (!summary) {
    return <span className="text-slate-400">-</span>;
  }

  return (
    <span className="line-clamp-2 max-w-[18rem] text-xs text-slate-500 dark:text-slate-400">
      {summary}
    </span>
  );
}
