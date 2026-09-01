"use client";

import { SearchDropdown } from "@/src/components/common";
import { PageHeader } from "@/src/components/common/page-header";
import { SelectControl } from "@/src/components/common/select-control";
import { StatePanel } from "@/src/components/common/state-panel";
import { PermissionGuard } from "@/src/components/permission-guard";
import { useToast } from "@/src/hooks/use-toast";
import { usePermissions } from "@/src/hooks/use-permissions";
import { useDebounce } from "@repo/hooks";
import type { ProductResponse } from "@repo/shared";
import { PERMISSIONS } from "@repo/shared/constants";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Skeleton,
} from "@repo/ui";
import { PaginationControls } from "@repo/ui/pagination-controls";
import { AlertCircle, KeyRound, Plus, Settings2 } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useInfiniteProducts } from "../products/hooks/use-products";
import { ACTIVATION_CODE_BATCH_STATUSES } from "./activation-code-batches.constants";
import { ActivationCodeBatchesTable } from "./components/activation-code-batches-table";
import { useActivationCodeBatches } from "./hooks/use-activation-code-batches";

export function ActivationCodeBatchesView() {
  const t = useTranslations("ActivationCodeBatches");
  const directory = useActivationCodeBatches();
  const toast = useToast();
  const { hasPermission } = usePermissions();
  const canConfigurePolicy = hasPermission(PERMISSIONS.SYSTEM_CONFIG_VIEW);
  const [productSearch, setProductSearch] = useState("");
  const debouncedProductSearch = useDebounce(productSearch.trim(), 300);
  const productsQuery = useInfiniteProducts(
    {
      limit: 20,
      search: debouncedProductSearch || undefined,
      status: "ACTIVE",
    },
    { enabled: directory.isCreateOpen },
  );
  const products = useMemo(
    () =>
      Array.from(
        new Map(
          (productsQuery.data?.pages ?? [])
            .flatMap((page) => page.items)
            .map((product) => [product.id, product]),
        ).values(),
      ),
    [productsQuery.data?.pages],
  );
  const data = directory.query.data;

  return (
    <PermissionGuard permissions={[PERMISSIONS.ACTIVATION_CODE_BATCH_VIEW]}>
      <div className="space-y-6">
        <PageHeader
          actions={
            <div className="flex flex-wrap items-center justify-end gap-2">
              {canConfigurePolicy ? (
                <Button asChild size="md" variant="outline">
                  <Link href="/settings?tab=activation-code-policy">
                    <Settings2 className="size-4" />
                    {t("settings")}
                  </Link>
                </Button>
              ) : null}
              {directory.canCreate ? (
                <Button size="md" onClick={() => directory.setCreateOpen(true)}>
                  <Plus className="size-4" />
                  {t("create")}
                </Button>
              ) : null}
            </div>
          }
          description={t("description")}
          eyebrow={t("eyebrow")}
          title={t("title")}
        />
        {directory.isCreateOpen ? (
          <Card>
            <CardHeader>
              <CardTitle>{t("createTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_10rem_auto] sm:items-end"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!directory.selectedProductId) return;
                  void directory.createMutation
                    .mutateAsync()
                    .then(() => toast.success(t("created")))
                    .catch(() => toast.error(t("createError")));
                }}
              >
                <div className="space-y-2 text-sm font-medium">
                  {t("productLabel")}
                  <SearchDropdown
                    emptyLabel={t("productEmpty")}
                    errorLabel={t("productError")}
                    getItemKey={(product) => product.id}
                    id="activation-batch-product"
                    isError={productsQuery.isError}
                    isLoading={productsQuery.isFetching}
                    items={products}
                    loadingLabel={
                      productsQuery.isFetchingNextPage
                        ? t("productLoadingMore")
                        : t("productLoading")
                    }
                    onItemSelect={(product) => {
                      directory.setSelectedProductId(product.id);
                      setProductSearch("");
                    }}
                    onRetry={() => void productsQuery.refetch()}
                    onReachEnd={() => {
                      if (
                        productsQuery.hasNextPage &&
                        !productsQuery.isFetchingNextPage
                      ) {
                        void productsQuery.fetchNextPage();
                      }
                    }}
                    onSearchChange={(value) => {
                      if (directory.selectedProductId) {
                        directory.setSelectedProductId("");
                      }
                      setProductSearch(value);
                    }}
                    placeholder={t("productPlaceholder")}
                    renderItem={(product: ProductResponse) => (
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {product.productCode}
                        </p>
                      </div>
                    )}
                    retryLabel={t("retry")}
                    searchValue={productSearch}
                    selectedLabel={
                      directory.selectedProductId
                        ? products.find(
                            (product) =>
                              product.id === directory.selectedProductId,
                          )?.name
                        : undefined
                    }
                  />
                </div>
                <label className="space-y-2 text-sm font-medium">
                  {t("quantityLabel")}
                  <Input
                    inputMode="numeric"
                    max={1000}
                    min={50}
                    onChange={(event) =>
                      directory.setQuantity(event.target.value)
                    }
                    type="number"
                    value={directory.quantity}
                  />
                </label>
                <div className="flex h-10 items-stretch gap-2">
                  <Button
                    className="h-10"
                    disabled={
                      !directory.selectedProductId ||
                      directory.createMutation.isPending
                    }
                    type="submit"
                  >
                    {t("createSubmit")}
                  </Button>
                  <Button
                    className="h-10"
                    onClick={() => directory.setCreateOpen(false)}
                    type="button"
                    variant="secondary"
                  >
                    {t("cancel")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : null}
        <Card>
          <CardHeader className="gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <CardTitle>{t("directoryTitle")}</CardTitle>
              <CardDescription className="mt-1.5">
                {t("directoryDescription")}
              </CardDescription>
            </div>
            <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-auto xl:grid-cols-[22rem_13rem]">
              <Input
                aria-label={t("searchLabel")}
                onChange={(event) => directory.setSearch(event.target.value)}
                placeholder={t("searchPlaceholder")}
                value={directory.search}
              />
              <SelectControl
                aria-label={t("statusLabel")}
                onValueChange={(value) =>
                  directory.setStatus(value as typeof directory.status)
                }
                options={[
                  { label: t("allStatuses"), value: "" },
                  ...ACTIVATION_CODE_BATCH_STATUSES.map((value) => ({
                    label: t(`statuses.${value}`),
                    value,
                  })),
                ]}
                value={directory.status}
              />
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            {directory.query.isPending ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }, (_, index) => (
                  <Skeleton className="h-14 w-full" key={index} />
                ))}
              </div>
            ) : directory.query.isError ? (
              <StatePanel
                description={t("errorDescription")}
                action={
                  <Button
                    onClick={() => void directory.query.refetch()}
                    size="sm"
                  >
                    {t("retry")}
                  </Button>
                }
                icon={AlertCircle}
                title={t("retry")}
              />
            ) : data?.items.length ? (
              <>
                <ActivationCodeBatchesTable
                  canRevoke={directory.canRevoke}
                  items={data.items}
                  onRevoke={(batch) => {
                    if (
                      !window.confirm(
                        t("revokeConfirm", { batch: batch.batchCode }),
                      )
                    ) {
                      return;
                    }
                    void directory.revokeMutation
                      .mutateAsync(batch.id)
                      .then(() => toast.success(t("revoked")))
                      .catch(() => toast.error(t("revokeError")));
                  }}
                />
                <PaginationControls
                  nextLabel={t("next")}
                  onPageChange={directory.setPage}
                  page={data.meta.page}
                  pageSize={data.meta.limit}
                  previousLabel={t("previous")}
                  summary={t("summary", { total: data.meta.total })}
                  totalPages={data.meta.totalPages}
                  variant="compact"
                />
              </>
            ) : (
              <StatePanel
                description={t("emptyDescription")}
                icon={KeyRound}
                title={t("emptyTitle")}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
}
