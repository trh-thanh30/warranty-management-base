"use client";

import { useDebounce } from "@repo/hooks";
import type { WarrantyStatus } from "@repo/shared";
import { PERMISSIONS } from "@repo/shared/constants";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from "@repo/ui";
import { Search, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  useDealer,
  useDealerActivatedCustomers,
} from "@/src/hooks/use-dealers";
import { FormPageShell } from "@/src/components/common/form-page-shell";
import { PaginationControls } from "@repo/ui/pagination-controls";
import { SelectControl } from "@/src/components/common/select-control";
import { StatePanel } from "@/src/components/common/state-panel";
import { PermissionGuard } from "@/src/components/permission-guard";
import { DealerActivatedCustomersTable } from "./components/dealer-activated-customers-table";
import type { DealerActivatedCustomersWarrantyFilter } from "./dealer-activated-customers.types";

type Props = { dealerId: string };

export function DealerActivatedCustomersView({ dealerId }: Props) {
  const t = useTranslations("Dealers");
  const [search, setSearch] = useState("");
  const [status, setStatus] =
    useState<DealerActivatedCustomersWarrantyFilter>("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const debouncedSearch = useDebounce(search.trim(), 300);
  const dealerQuery = useDealer(dealerId);
  const customersQuery = useDealerActivatedCustomers(dealerId, {
    limit: pageSize,
    page,
    search: debouncedSearch || undefined,
    warrantyStatus: status === "ALL" ? undefined : (status as WarrantyStatus),
  });
  const data = customersQuery.data;
  const hasFilters = Boolean(search.trim()) || status !== "ALL";

  return (
    <PermissionGuard permissions={[PERMISSIONS.DEALER_VIEW]}>
      <FormPageShell
        backHref="/dealers"
        backLabel={t("backToDealer")}
        description={
          dealerQuery.data
            ? t("activatedCustomersDescription")
            : t("activatedCustomersDescription")
        }
        eyebrow={t("eyebrow")}
        maxWidthClassName="max-w-7xl"
        title={
          dealerQuery.data
            ? `${t("activatedCustomersTitle")} - ${dealerQuery.data.name}`
            : t("activatedCustomersTitle")
        }
      >
        <Card>
          <CardHeader className="gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <CardTitle>{t("activatedCustomersDirectoryTitle")}</CardTitle>
              <CardDescription className="mt-1.5">
                {t("activatedCustomersDirectoryDescription")}
              </CardDescription>
            </div>
            <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-auto xl:grid-cols-[24rem_14rem]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  aria-label={t("activatedCustomersSearchLabel")}
                  className="pl-9"
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder={t("activatedCustomersSearchPlaceholder")}
                  value={search}
                />
              </div>
              <SelectControl
                aria-label={t("activatedCustomersWarrantyStatusFilter")}
                onValueChange={(value) => {
                  setStatus(value as DealerActivatedCustomersWarrantyFilter);
                  setPage(1);
                }}
                options={[
                  { label: t("allWarrantyStatuses"), value: "ALL" },
                  ...(["ACTIVE", "EXPIRED", "VOIDED"] as WarrantyStatus[]).map(
                    (value) => ({
                      label: t(`warrantyStatuses.${value}`),
                      value,
                    }),
                  ),
                ]}
                value={status}
              />
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            {dealerQuery.isError || customersQuery.isError ? (
              <StatePanel
                action={
                  <Button
                    onClick={() => {
                      void dealerQuery.refetch();
                      void customersQuery.refetch();
                    }}
                    variant="secondary"
                  >
                    {t("tryAgain")}
                  </Button>
                }
                description={t("activatedCustomersLoadErrorDescription")}
                icon={Users}
                title={t("activatedCustomersLoadErrorTitle")}
              />
            ) : customersQuery.isLoading ? (
              <div className="flex min-h-48 items-center justify-center text-sm text-slate-500">
                {t("activatedCustomersLoading")}
              </div>
            ) : data && data.items.length > 0 ? (
              <>
                <DealerActivatedCustomersTable items={data.items} />
                <PaginationControls
                  nextLabel={t("next")}
                  onPageChange={setPage}
                  onPageSizeChange={(value) => {
                    setPageSize(value);
                    setPage(1);
                  }}
                  page={data.meta.page}
                  pageSize={pageSize}
                  pageSizeLabel={t("pageSize")}
                  previousLabel={t("previous")}
                  summary={t("activatedCustomersPagination", {
                    page: data.meta.page,
                    total: data.meta.total,
                    totalPages: Math.max(data.meta.totalPages, 1),
                  })}
                  totalPages={data.meta.totalPages}
                />
              </>
            ) : (
              <StatePanel
                action={
                  hasFilters ? (
                    <Button
                      onClick={() => {
                        setSearch("");
                        setStatus("ALL");
                        setPage(1);
                      }}
                      variant="secondary"
                    >
                      {t("clearFilters")}
                    </Button>
                  ) : undefined
                }
                description={
                  hasFilters
                    ? t("activatedCustomersEmptyFilteredDescription")
                    : t("activatedCustomersEmptyDescription")
                }
                icon={Users}
                title={
                  hasFilters
                    ? t("activatedCustomersEmptyFilteredTitle")
                    : t("activatedCustomersEmptyTitle")
                }
              />
            )}
          </CardContent>
        </Card>
      </FormPageShell>
    </PermissionGuard>
  );
}
