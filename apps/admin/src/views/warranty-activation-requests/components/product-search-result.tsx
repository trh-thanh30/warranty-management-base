type ProductSearchResultProps = {
  activationCodeSummary?: string;
  activationCodeCounts?: Partial<
    Record<
      | "AVAILABLE"
      | "ACTIVATED"
      | "EXPIRED"
      | "REVOKED"
      | "REPLACED"
      | "PENDING_APPROVAL",
      number
    >
  >;
  disabledReason?: string | null;
  productCode: string;
  productName: string;
  statusLabel: string;
  warrantyCode: string | null;
};

export function ProductSearchResult({
  activationCodeCounts,
  activationCodeSummary,
  disabledReason,
  productCode,
  productName,
  statusLabel,
  warrantyCode,
}: ProductSearchResultProps) {
  return (
    <span className="flex min-w-0 flex-1 flex-col gap-1">
      <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
        <span className="min-w-0 truncate font-medium">{productName}</span>
        <span className="shrink-0 rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-900 dark:text-slate-300">
          {statusLabel}
        </span>
        {activationCodeSummary ? (
          <span
            className={
              activationCodeCounts?.AVAILABLE
                ? "shrink-0 rounded bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                : "shrink-0 rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-900 dark:text-slate-300"
            }
          >
            {activationCodeSummary}
          </span>
        ) : null}
      </span>
      <span className="min-w-0 truncate text-xs text-slate-500 dark:text-slate-400">
        {productCode} • {warrantyCode ?? "-"}
      </span>
      {disabledReason ? (
        <span className="text-xs font-medium text-red-600 dark:text-red-400">
          {disabledReason}
        </span>
      ) : null}
    </span>
  );
}
