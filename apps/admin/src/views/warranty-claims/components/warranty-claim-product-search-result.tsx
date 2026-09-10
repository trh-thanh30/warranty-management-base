import type { ProductResponse } from "@repo/shared";

type WarrantyClaimProductSearchResultProps = {
  product: ProductResponse;
  productStatus: string;
  warrantyStatus: string;
};

export function WarrantyClaimProductSearchResult({
  product,
  productStatus,
  warrantyStatus,
}: WarrantyClaimProductSearchResultProps) {
  return (
    <span className="flex min-w-0 flex-1 flex-col gap-1.5">
      <span className="flex min-w-0 flex-wrap items-center gap-2">
        <span className="min-w-0 font-medium text-slate-950 dark:text-slate-50">
          {product.name}
        </span>
        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-900 dark:text-slate-300">
          {productStatus}
        </span>
        <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
          {warrantyStatus}
        </span>
      </span>
      <span className="grid min-w-0 gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 sm:grid-cols-2">
        <span className="truncate">
          {product.productCode} · {product.warrantyCode ?? "-"}
        </span>
        <span className="truncate">
          {product.warranty?.serialNumber ?? "-"} ·{" "}
          {product.owner?.fullName ?? "-"}
        </span>
        <span className="truncate sm:col-span-2">
          {[product.categoryRef?.name, product.brand, product.model]
            .filter(Boolean)
            .join(" · ") || "-"}
        </span>
      </span>
    </span>
  );
}
