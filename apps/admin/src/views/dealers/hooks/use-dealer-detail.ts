"use client";

import { useDealer } from "@/src/hooks/use-dealers";

type DealerDetailOptions =
  | {
      mode: "create";
      dealerId?: never;
    }
  | {
      mode: "detail" | "edit";
      dealerId: string;
    };

export function useDealerDetail(options: DealerDetailOptions) {
  const isCreate = options.mode === "create";
  const dealerId = isCreate ? null : options.dealerId;
  const dealerQuery = useDealer(dealerId, { enabled: !isCreate });

  return {
    dealer: isCreate ? null : (dealerQuery.data ?? null),
    dealerQuery,
    isCreating: isCreate,
  };
}
