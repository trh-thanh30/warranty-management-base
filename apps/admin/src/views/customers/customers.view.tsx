"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { PERMISSIONS } from "@repo/shared/constants";
import { Button } from "@repo/ui";
import { PageHeader } from "@/src/components/common/page-header";
import { PermissionGuard } from "@/src/components/permission-guard";
import { Link } from "@/src/i18n/navigation";
import { CustomersDirectoryCard } from "./components/customers-directory-card";
import { useCustomersDirectory } from "./use-customers-directory";

export function CustomersView() {
  const t = useTranslations("Customers");
  const {
    canCreateCustomers,
    customersQuery,
    openCreate,
    openEdit,
    search,
    setPage,
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
          onCreate={openCreate}
          onEdit={openEdit}
          onPageChange={setPage}
          onRetry={() => {
            void customersQuery.refetch();
          }}
          onSearchChange={updateSearch}
          search={search}
        />
      </div>
    </PermissionGuard>
  );
}
