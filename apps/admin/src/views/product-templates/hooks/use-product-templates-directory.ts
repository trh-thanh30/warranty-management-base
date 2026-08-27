"use client";

import { useState } from "react";
import { useDebounce } from "@repo/hooks";
import type { ProductTemplateSummary } from "@repo/shared";
import { PERMISSIONS } from "@repo/shared/constants";
import {
  useDeactivateProductTemplate,
  useProductTemplates,
} from "@/src/hooks/use-product-templates";
import { usePermissions } from "@/src/hooks/use-permissions";
import { useToast } from "@/src/hooks/use-toast";
import { useTranslations } from "next-intl";

export type TemplateStatusFilter = "ALL" | "ACTIVE" | "INACTIVE";
export type TemplatePublicationFilter = "ALL" | "PUBLISHED" | "HIDDEN";

export function useProductTemplatesDirectory() {
  const t = useTranslations("ProductTemplates");
  const toast = useToast();
  const { hasPermission } = usePermissions();
  const [search, setSearch] = useState("");
  const [publication, setPublication] =
    useState<TemplatePublicationFilter>("ALL");
  const [status, setStatus] = useState<TemplateStatusFilter>("ACTIVE");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [templateToDeactivate, setTemplateToDeactivate] =
    useState<ProductTemplateSummary | null>(null);
  const debouncedSearch = useDebounce(search.trim(), 300);
  const templatesQuery = useProductTemplates({
    page,
    limit: pageSize,
    search: debouncedSearch || undefined,
    isActive: status === "ALL" ? "all" : status === "ACTIVE",
    isPublished:
      publication === "ALL" ? undefined : publication === "PUBLISHED",
    sortBy: "name",
    sortOrder: "asc",
  });
  const deactivate = useDeactivateProductTemplate();

  async function confirmDeactivate() {
    if (!templateToDeactivate) return;
    try {
      await deactivate.mutateAsync(templateToDeactivate.id);
      toast.success(t("deactivated"));
      setTemplateToDeactivate(null);
    } catch {
      toast.error(t("deactivateError"));
    }
  }

  return {
    canCreate: hasPermission(PERMISSIONS.PRODUCT_TEMPLATE_CREATE),
    confirmDeactivate,
    isDeactivating: deactivate.isPending,
    page,
    pageSize,
    publication,
    search,
    setPage,
    setPageSize: (value: number) => {
      setPageSize(value);
      setPage(1);
    },
    setSearch: (value: string) => {
      setSearch(value);
      setPage(1);
    },
    setPublication: (value: TemplatePublicationFilter) => {
      setPublication(value);
      setPage(1);
    },
    setStatus: (value: TemplateStatusFilter) => {
      setStatus(value);
      setPage(1);
    },
    status,
    templateToDeactivate,
    templatesQuery,
    openDeactivate: setTemplateToDeactivate,
    closeDeactivate: () => setTemplateToDeactivate(null),
  };
}
