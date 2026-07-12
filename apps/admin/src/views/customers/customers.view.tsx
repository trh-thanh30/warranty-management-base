"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { PERMISSIONS } from "@repo/shared/constants";
import { Button } from "@repo/ui";
import { PageHeader } from "@/src/components/common/page-header";
import { PermissionGuard } from "@/src/components/permission-guard";
import { Link } from "@/src/i18n/navigation";
import { CustomersDirectoryCard } from "./components/customers-directory-card";
import { useCustomersDirectory } from "./hooks/use-customers-directory";

export function CustomersView() {
  const t = useTranslations("Customers");
  const {
    canCreateCustomers,
    customersQuery,
    pageSize,
    search,
    setPage,
    setPageSize,
    sortBy,
    sortOrder,
    toggleSort,
    updateSearch,
  } = useCustomersDirectory();

  return (
    <PermissionGuard permissions={[PERMISSIONS.CUSTOMER_VIEW]}>
      <div className="space-y-6">
        <PageHeader
          actions={
            canCreateCustomers ? (
              <Button asChild>
                <Link href="/customers/create">
                  <Plus className="size-4" />
                  {t("create")}
                </Link>
              </Button>
            ) : null
          }
          description={t("description")}
          eyebrow={t("eyebrow")}
          title={t("title")}
        />

        <CustomersDirectoryCard
          canCreate={canCreateCustomers}
          data={customersQuery.data}
          isError={customersQuery.isError}
          isLoading={customersQuery.isLoading}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          onRetry={() => {
            void customersQuery.refetch();
          }}
          onSearchChange={updateSearch}
          onSortChange={toggleSort}
          pageSize={pageSize}
          search={search}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
      </div>
    </PermissionGuard>
  );
}
