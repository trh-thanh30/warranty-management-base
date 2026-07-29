type ProductSearchResultProps = {
  disabledReason?: string | null;
  ownerName?: string | null;
  productCode: string;
  productName: string;
  serialNumber: string | null;
  statusLabel: string;
  warrantyCode: string | null;
};

export function ProductSearchResult({
  disabledReason,
  ownerName,
  productCode,
  productName,
  serialNumber,
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
      </span>
      <span className="grid min-w-0 gap-1 text-xs text-slate-500 dark:text-slate-400 sm:grid-cols-2">
        <span className="truncate">
          {productCode} • {warrantyCode ?? "-"}
        </span>
        <span className="truncate">
          {serialNumber ?? "-"} • {ownerName ?? "-"}
        </span>
      </span>
      {disabledReason ? (
        <span className="text-xs font-medium text-red-600 dark:text-red-400">
          {disabledReason}
        </span>
      ) : null}
    </span>
  );
}
