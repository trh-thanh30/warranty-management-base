"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useDebounce } from "@repo/hooks";
import type {
  CategoryResponse,
  ListProductsQuery,
  ProductResponse,
  ProductSortBy,
} from "@repo/shared";
import { PERMISSIONS } from "@repo/shared/constants";
import { useAuth } from "@/src/app/providers/auth-provider";
import { usePermissions } from "@/src/hooks/use-permissions";
import { useTableControls } from "@/src/hooks/use-table-controls";
import { useToast } from "@/src/hooks/use-toast";
import { productsService } from "@/src/services/products/products.service";
import type {
  ProductImportRowData,
  ProductImportRowError,
} from "@/src/services/products/create-products.service";
import type { ExcelImportMode } from "@/src/components/common/excel-import-dialog";
import { useCategories } from "../../categories/hooks/use-categories";
import type { EditableProductImportRow } from "../components/product-import-preview-table";
import {
  type ProductCategoryFilter,
  type ProductStatusFilter,
  type WarrantyStatusFilter,
} from "../products.types";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_STATUS_FILTERS,
} from "../products.constants";
import {
  useConfirmProductImport,
  useDeleteProduct,
  usePreviewProductImport,
  useProducts,
} from "./use-products";

const PRODUCTS_PAGE_SIZE = 10;

type ProductDirectoryFilters = {
  category: ProductCategoryFilter;
  categoryId: string;
  status: ProductStatusFilter;
  warrantyStatus: WarrantyStatusFilter;
};

const INITIAL_PRODUCT_DIRECTORY_FILTERS = {
  category: "ALL",
  categoryId: "ALL",
  status: "ALL",
  warrantyStatus: "ALL",
} satisfies ProductDirectoryFilters;

export function useProductsDirectory() {
  const t = useTranslations("Products");
  const toast = useToast();
  const { user: currentUser } = useAuth();
  const { hasPermission } = usePermissions();
  const {
    filterHandlers,
    filters,
    page,
    pageSize,
    search,
    setFilters,
    setPage,
    setPageSize,
    setSearch,
    sortBy,
    sortOrder,
    toggleSort,
  } = useTableControls<ProductDirectoryFilters, ProductSortBy>({
    initialFilters: INITIAL_PRODUCT_DIRECTORY_FILTERS,
    initialPageSize: PRODUCTS_PAGE_SIZE,
    initialSortBy: "createdAt",
    initialSortOrder: "desc",
  });
  const [productToDelete, setProductToDelete] =
    useState<ProductResponse | null>(null);
  const [isImportDialogOpen, setImportDialogOpen] = useState(false);
  const [importMode, setImportMode] = useState<ExcelImportMode>("upsert");
  const [importRows, setImportRows] = useState<EditableProductImportRow[]>([]);
  const debouncedSearch = useDebounce(search.trim(), 300);
  const canViewProducts = hasPermission(PERMISSIONS.PRODUCT_VIEW);
  const canCreateProducts = hasPermission(PERMISSIONS.PRODUCT_CREATE);
  const productsQuery = useProducts(
    {
      category: filters.category === "ALL" ? undefined : filters.category,
      categoryId: filters.categoryId === "ALL" ? undefined : filters.categoryId,
      limit: pageSize,
      page,
      search: debouncedSearch || undefined,
      sortBy,
      sortOrder,
      status: filters.status === "ALL" ? undefined : filters.status,
      warrantyStatus:
        filters.warrantyStatus === "ALL" ? undefined : filters.warrantyStatus,
    },
    {
      enabled: Boolean(currentUser) && canViewProducts,
    },
  );
  const categoriesQuery = useCategories(
    {
      isActive: "true",
      limit: 100,
      sortBy: "order",
      sortOrder: "asc",
      type: "PRODUCT",
    },
    { enabled: Boolean(currentUser) && canViewProducts },
  );
  const deleteProduct = useDeleteProduct();
  const previewProductImport = usePreviewProductImport();
  const confirmProductImport = useConfirmProductImport();

  function clearFilters() {
    setSearch("");
    setFilters(INITIAL_PRODUCT_DIRECTORY_FILTERS);
    setPage(1);
  }

  function openDelete(product: ProductResponse) {
    setProductToDelete(product);
  }

  function closeDelete() {
    setProductToDelete(null);
  }

  async function confirmDelete() {
    if (!productToDelete) return;

    try {
      await deleteProduct.mutateAsync(productToDelete.id);
      toast.success(t("deleted"));
      closeDelete();
    } catch {
      toast.error(t("deleteError"));
    }
  }

  async function downloadImportTemplate() {
    try {
      const blob = await productsService.downloadImportTemplate();
      downloadBlob(blob, "product-import-template.xlsx");
      toast.success(t("excel.templateDownloaded"));
    } catch {
      toast.error(t("excel.templateDownloadError"));
    }
  }

  async function exportProducts() {
    try {
      const blob = await productsService.exportProducts(getExportQuery());
      downloadBlob(
        blob,
        `products-${new Date().toISOString().slice(0, 10)}.xlsx`,
      );
      toast.success(t("excel.exported"));
    } catch {
      toast.error(t("excel.exportError"));
    }
  }

  async function previewImport(file: File, mode: ExcelImportMode) {
    try {
      const result = await previewProductImport.mutateAsync(file);
      setImportMode(mode);
      setImportRows(
        result.rows.map((row, index) =>
          normalizePreviewRow({
            data: row.data,
            errors: row.errors,
            id: `${row.rowNumber}-${index}`,
            rowNumber: row.rowNumber,
          }),
        ),
      );
      const message =
        result.invalidRows > 0
          ? t("excel.importPreviewHasErrors", {
              invalid: result.invalidRows,
              total: result.totalRows,
              valid: result.validRows,
            })
          : t("excel.importPreviewSuccess", {
              total: result.totalRows,
              valid: result.validRows,
            });

      if (result.invalidRows > 0 || mode === "replace") {
        toast.info(message);
      } else {
        toast.success(message);
      }
    } catch {
      toast.error(t("excel.importPreviewError"));
    }
  }

  function updateImportRowData(rowId: string, data: ProductImportRowData) {
    setImportRows((currentRows) =>
      validateImportRows(
        currentRows.map((row) =>
          row.id === rowId
            ? {
                ...row,
                data,
              }
            : row,
        ),
      ),
    );
  }

  function removeImportRow(rowId: string) {
    setImportRows((currentRows) =>
      validateImportRows(currentRows.filter((row) => row.id !== rowId)),
    );
  }

  function resetImportPreview() {
    setImportRows([]);
    setImportMode("upsert");
  }

  async function confirmImport() {
    const validatedRows = validateImportRows(importRows);
    setImportRows(validatedRows);

    if (validatedRows.some((row) => row.errors.length > 0)) {
      toast.error(t("excel.fixErrorsBeforeImport"));
      return;
    }

    try {
      const result = await confirmProductImport.mutateAsync({
        mode: importMode,
        rows: validatedRows.map((row) => row.data),
      });

      if (result.errors.length > 0) {
        setImportRows((currentRows) =>
          currentRows.map((row, index) => ({
            ...row,
            errors: result.errors.filter(
              (error) => error.rowNumber === index + 1,
            ),
          })),
        );
        toast.error(t("excel.confirmHasErrors"));
        return;
      }

      toast.success(
        t("excel.confirmSuccess", {
          created: result.created,
          deactivated: result.deactivated,
          updated: result.updated,
        }),
      );
      resetImportPreview();
      setImportDialogOpen(false);
      void productsQuery.refetch();
    } catch {
      toast.error(t("excel.confirmError"));
    }
  }

  function getExportQuery(): ListProductsQuery {
    return {
      category: filters.category === "ALL" ? undefined : filters.category,
      categoryId: filters.categoryId === "ALL" ? undefined : filters.categoryId,
      search: debouncedSearch || undefined,
      sortBy,
      sortOrder,
      status: filters.status === "ALL" ? undefined : filters.status,
      warrantyStatus:
        filters.warrantyStatus === "ALL" ? undefined : filters.warrantyStatus,
    };
  }

  return {
    canCreateProducts,
    categories: categoriesQuery.data?.items ?? ([] as CategoryResponse[]),
    categoriesQuery,
    clearFilters,
    closeDelete,
    confirmDelete,
    filters,
    isDeleting: deleteProduct.isPending,
    isImportDialogOpen,
    importMode,
    importRows,
    importSummary: getImportSummary(importRows),
    isImportConfirming: confirmProductImport.isPending,
    isImportPreviewing: previewProductImport.isPending,
    openDelete,
    openImportDialog: () => setImportDialogOpen(true),
    pageSize,
    productToDelete,
    productsQuery,
    search,
    setPage,
    setPageSize,
    sortBy,
    sortOrder,
    closeImportDialog: () => {
      setImportDialogOpen(false);
      resetImportPreview();
    },
    confirmImport,
    downloadImportTemplate,
    exportProducts,
    previewImport,
    removeImportRow,
    resetImportPreview,
    toggleSort,
    updateCategory: filterHandlers.category,
    updateCategoryId: filterHandlers.categoryId,
    updateSearch: setSearch,
    updateStatus: filterHandlers.status,
    updateWarrantyStatus: filterHandlers.warrantyStatus,
    updateImportRowData,
  };
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function normalizePreviewRow(row: {
  data: Partial<ProductImportRowData>;
  errors: ProductImportRowError[];
  id: string;
  rowNumber: number;
}): EditableProductImportRow {
  const normalizedRow: EditableProductImportRow = {
    ...row,
    data: {
      brand: row.data.brand ?? null,
      category: row.data.category ?? "",
      categoryCode: row.data.categoryCode ?? null,
      description: row.data.description ?? null,
      imageUrl: row.data.imageUrl ?? null,
      manufactureYear: row.data.manufactureYear ?? null,
      model: row.data.model ?? null,
      name: row.data.name ?? "",
      productCode: row.data.productCode ?? null,
      serialNumber: row.data.serialNumber ?? null,
      status: row.data.status ?? "",
      warrantyDurationMonths: row.data.warrantyDurationMonths ?? null,
      warrantyTerms: row.data.warrantyTerms ?? null,
    },
  };

  return validateImportRows([normalizedRow])[0] ?? normalizedRow;
}

function validateImportRows(rows: EditableProductImportRow[]) {
  const productCodeCounts = new Map<string, number>();
  const serialNumberCounts = new Map<string, number>();

  rows.forEach((row) => {
    const productCode = row.data.productCode?.trim();
    const serialNumber = row.data.serialNumber?.trim();

    if (productCode) {
      productCodeCounts.set(
        productCode,
        (productCodeCounts.get(productCode) ?? 0) + 1,
      );
    }

    if (serialNumber) {
      serialNumberCounts.set(
        serialNumber,
        (serialNumberCounts.get(serialNumber) ?? 0) + 1,
      );
    }
  });

  return rows.map((row) => {
    const errors: ProductImportRowError[] = [];
    const productCode = row.data.productCode?.trim();
    const serialNumber = row.data.serialNumber?.trim();
    const duration = row.data.warrantyDurationMonths;

    if (!row.data.name.trim()) {
      errors.push({
        field: "name",
        message: "Nhập tên sản phẩm.",
        rowNumber: row.rowNumber,
      });
    }

    if (!PRODUCT_CATEGORIES.includes(row.data.category as never)) {
      errors.push({
        field: "category",
        message: "Chọn danh mục legacy hợp lệ.",
        rowNumber: row.rowNumber,
      });
    }

    if (
      !PRODUCT_STATUS_FILTERS.filter((status) => status !== "ALL").includes(
        row.data.status as never,
      )
    ) {
      errors.push({
        field: "status",
        message: "Chọn trạng thái sản phẩm hợp lệ.",
        rowNumber: row.rowNumber,
      });
    }

    if (productCode && (productCodeCounts.get(productCode) ?? 0) > 1) {
      errors.push({
        field: "productCode",
        message: "Mã sản phẩm bị trùng trong bảng preview.",
        rowNumber: row.rowNumber,
      });
    }

    if (serialNumber && (serialNumberCounts.get(serialNumber) ?? 0) > 1) {
      errors.push({
        field: "serialNumber",
        message: "Số serial bị trùng trong bảng preview.",
        rowNumber: row.rowNumber,
      });
    }

    if (duration !== null && (!Number.isInteger(duration) || duration < 1)) {
      errors.push({
        field: "warrantyDurationMonths",
        message: "Thời hạn bảo hành phải là số nguyên dương.",
        rowNumber: row.rowNumber,
      });
    }

    return {
      ...row,
      errors,
    };
  });
}

function getImportSummary(rows: EditableProductImportRow[]) {
  const invalidRows = rows.filter((row) => row.errors.length > 0).length;

  return {
    invalidRows,
    totalRows: rows.length,
    validRows: rows.length - invalidRows,
  };
}
