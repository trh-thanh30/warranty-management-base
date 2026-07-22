"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit3, Trash2 } from "lucide-react";
import { z } from "zod";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsList,
  TabsTrigger,
  Textarea,
} from "@repo/ui";
import { PaginationControls } from "@/src/components/common/pagination-controls";
import { useCategories } from "../../categories/hooks/use-categories";
import type {
  ProductImportRowData,
  ProductImportRowError,
} from "@/src/services/products/products.types";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_STATUS_FILTERS,
} from "../products.constants";

export type EditableProductImportRow = {
  data: ProductImportRowData;
  errors: ProductImportRowError[];
  id: string;
  rowNumber: number;
};

type ImportPreviewFilter = "all" | "valid" | "invalid";

type ProductImportPreviewTableProps = {
  labels: {
    actions: string;
    allRows: string;
    brand: string;
    cancel: string;
    category: string;
    dynamicCategory: string;
    description: string;
    edit: string;
    editDescription: string;
    editTitle: string;
    imageUrl: string;
    importStatus: string;
    invalidRows: string;
    manufactureYear: string;
    model: string;
    name: string;
    next: string;
    noRows: string;
    pageSize: string;
    pagination: (values: {
      page: number;
      total: number;
      totalPages: number;
    }) => string;
    previous: string;
    productCode: string;
    ready: string;
    remove: string;
    row: string;
    saveChanges: string;
    serialNumber: string;
    status: string;
    validRows: string;
    warrantyDurationMonths: string;
    warrantyTerms: string;
    withErrors: string;
  };
  onEdit: (rowId: string, data: ProductImportRowData) => void;
  onRemove: (rowId: string) => void;
  rows: EditableProductImportRow[];
};

const INITIAL_IMPORT_PREVIEW_PAGE_SIZE = 10;

export function ProductImportPreviewTable({
  labels,
  onEdit,
  onRemove,
  rows,
}: ProductImportPreviewTableProps) {
  const [filter, setFilter] = useState<ImportPreviewFilter>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(INITIAL_IMPORT_PREVIEW_PAGE_SIZE);
  const [editingRow, setEditingRow] = useState<EditableProductImportRow | null>(
    null,
  );
  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        if (filter === "valid") return row.errors.length === 0;
        if (filter === "invalid") return row.errors.length > 0;
        return true;
      }),
    [filter, rows],
  );
  const totalPages = Math.max(Math.ceil(filteredRows.length / pageSize), 1);
  const safePage = Math.min(page, totalPages);
  const pagedRows = filteredRows.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  function updateFilter(nextFilter: string) {
    setFilter(nextFilter as ImportPreviewFilter);
    setPage(1);
  }

  function removeRow(rowId: string) {
    onRemove(rowId);
    if (pagedRows.length === 1 && safePage > 1) {
      setPage(safePage - 1);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
        <Tabs onValueChange={updateFilter} value={filter}>
          <TabsList className="grid h-auto w-full grid-cols-3 sm:w-auto">
            <TabsTrigger value="all">{labels.allRows}</TabsTrigger>
            <TabsTrigger value="valid">{labels.validRows}</TabsTrigger>
            <TabsTrigger value="invalid">{labels.invalidRows}</TabsTrigger>
          </TabsList>
        </Tabs>
        <span className="text-xs text-slate-500">
          {labels.pagination({
            page: safePage,
            total: filteredRows.length,
            totalPages,
          })}
        </span>
      </div>

      <div className="overflow-hidden rounded-md border border-slate-200">
        <div className="max-h-[27rem] overflow-auto">
          <Table className="min-w-[90rem] whitespace-nowrap">
            <TableHeader className="sticky top-0 z-10 bg-slate-50">
              <TableRow>
                <TableHead className="w-20 whitespace-nowrap">
                  {labels.row}
                </TableHead>
                <TableHead className="w-40 whitespace-nowrap">
                  {labels.productCode}
                </TableHead>
                <TableHead className="w-56 whitespace-nowrap">
                  {labels.name}
                </TableHead>
                <TableHead className="w-56 whitespace-nowrap">
                  {labels.imageUrl}
                </TableHead>
                <TableHead className="w-40 whitespace-nowrap">
                  {labels.category}
                </TableHead>
                <TableHead className="w-44 whitespace-nowrap">
                  {labels.serialNumber}
                </TableHead>
                <TableHead className="w-40 whitespace-nowrap">
                  {labels.status}
                </TableHead>
                <TableHead className="w-40 whitespace-nowrap">
                  {labels.warrantyDurationMonths}
                </TableHead>
                <TableHead className="w-[32rem] whitespace-nowrap">
                  {labels.importStatus}
                </TableHead>
                <TableHead className="w-28 whitespace-nowrap text-right">
                  {labels.actions}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedRows.length > 0 ? (
                pagedRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="whitespace-nowrap">
                      <span className="text-xs font-medium text-slate-500">
                        #{row.rowNumber}
                      </span>
                    </TableCell>
                    <PreviewCell value={row.data.productCode} />
                    <PreviewCell value={row.data.name} />
                    <PreviewCell value={row.data.imageUrl} />
                    <PreviewCell value={row.data.category} />
                    <PreviewCell value={row.data.serialNumber} />
                    <PreviewCell value={row.data.status} />
                    <PreviewCell value={row.data.warrantyDurationMonths} />
                    <TableCell className="w-[32rem] max-w-[32rem] whitespace-normal">
                      <ImportRowStatus
                        errors={row.errors}
                        readyLabel={labels.ready}
                        withErrorsLabel={labels.withErrors}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-1">
                        <Button
                          aria-label={labels.edit}
                          onClick={() => setEditingRow(row)}
                          size="icon"
                          type="button"
                          variant="ghost"
                        >
                          <Edit3 className="size-4" />
                        </Button>
                        <Button
                          aria-label={labels.remove}
                          onClick={() => removeRow(row.id)}
                          size="icon"
                          type="button"
                          variant="ghost"
                        >
                          <Trash2 className="size-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    className="h-24 text-center text-sm text-slate-500"
                    colSpan={10}
                  >
                    {labels.noRows}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <PaginationControls
        nextLabel={labels.next}
        onPageChange={setPage}
        onPageSizeChange={(nextPageSize) => {
          setPageSize(nextPageSize);
          setPage(1);
        }}
        page={safePage}
        pageSize={pageSize}
        pageSizeLabel={labels.pageSize}
        pageSizeOptions={[5, 10, 20, 50]}
        previousLabel={labels.previous}
        summary={labels.pagination({
          page: safePage,
          total: filteredRows.length,
          totalPages,
        })}
        totalPages={totalPages}
      />

      <ProductImportEditDialog
        labels={labels}
        onOpenChange={(open) => {
          if (!open) setEditingRow(null);
        }}
        onSave={(data) => {
          if (!editingRow) return;
          onEdit(editingRow.id, data);
          setEditingRow(null);
        }}
        open={Boolean(editingRow)}
        row={editingRow}
      />
    </div>
  );
}

function ProductImportEditDialog({
  labels,
  onOpenChange,
  onSave,
  open,
  row,
}: {
  labels: ProductImportPreviewTableProps["labels"];
  onOpenChange: (open: boolean) => void;
  onSave: (data: ProductImportRowData) => void;
  open: boolean;
  row: EditableProductImportRow | null;
}) {
  const categoriesQuery = useCategories(
    {
      isActive: "true",
      limit: 100,
      sortBy: "order",
      sortOrder: "asc",
      type: "PRODUCT",
    },
    { enabled: open },
  );
  const categories = categoriesQuery.data?.items ?? [];
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<ProductImportEditFormInput, unknown, ProductImportEditFormValues>(
    {
      resolver: zodResolver(productImportEditSchema),
      values: toImportEditFormValues(row?.data),
    },
  );

  function submit(values: ProductImportEditFormValues) {
    onSave(toImportRowData(values));
    reset(values);
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[calc(100vh-3rem)] w-[min(calc(100vw-2rem),56rem)] overflow-y-auto p-6">
        <div className="space-y-1">
          <DialogTitle className="text-lg font-semibold text-slate-950">
            {labels.editTitle}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            {labels.editDescription}
          </DialogDescription>
        </div>

        <form
          className="mt-5 space-y-5"
          noValidate
          onSubmit={handleSubmit(submit)}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              error={errors.productCode?.message}
              id="import-product-code"
              label={labels.productCode}
            >
              <Input id="import-product-code" {...register("productCode")} />
            </Field>
            <Field
              error={errors.name?.message}
              id="import-product-name"
              label={labels.name}
            >
              <Input id="import-product-name" {...register("name")} />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              error={errors.category?.message}
              id="import-product-category"
              label={labels.category}
            >
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="import-product-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field
              error={errors.categoryCode?.message}
              id="import-product-category-code"
              label={labels.dynamicCategory}
            >
              <Controller
                control={control}
                name="categoryCode"
                render={({ field }) => (
                  <NullableSelect
                    id="import-product-category-code"
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    {categories
                      .filter((category) => category.code)
                      .map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.code ?? ""}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                  </NullableSelect>
                )}
              />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <Field
              error={errors.brand?.message}
              id="import-product-brand"
              label={labels.brand}
            >
              <Input id="import-product-brand" {...register("brand")} />
            </Field>
            <Field
              error={errors.model?.message}
              id="import-product-model"
              label={labels.model}
            >
              <Input id="import-product-model" {...register("model")} />
            </Field>
            <Field
              error={errors.manufactureYear?.message}
              id="import-product-manufacture-year"
              label={labels.manufactureYear}
            >
              <Input
                id="import-product-manufacture-year"
                inputMode="numeric"
                type="number"
                {...register("manufactureYear")}
              />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              error={errors.serialNumber?.message}
              id="import-product-serial-number"
              label={labels.serialNumber}
            >
              <Input
                id="import-product-serial-number"
                {...register("serialNumber")}
              />
            </Field>
            <Field
              error={errors.status?.message}
              id="import-product-status"
              label={labels.status}
            >
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="import-product-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_STATUS_FILTERS.filter(
                        (status) => status !== "ALL",
                      ).map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              error={errors.imageUrl?.message}
              id="import-product-image-url"
              label={labels.imageUrl}
            >
              <Input id="import-product-image-url" {...register("imageUrl")} />
            </Field>
            <Field
              error={errors.warrantyDurationMonths?.message}
              id="import-product-warranty-duration"
              label={labels.warrantyDurationMonths}
            >
              <Input
                id="import-product-warranty-duration"
                inputMode="numeric"
                min={1}
                type="number"
                {...register("warrantyDurationMonths")}
              />
            </Field>
          </div>

          <Field
            error={errors.description?.message}
            id="import-product-description"
            label={labels.description}
          >
            <Textarea
              id="import-product-description"
              rows={4}
              {...register("description")}
            />
          </Field>

          <Field
            error={errors.warrantyTerms?.message}
            id="import-product-warranty-terms"
            label={labels.warrantyTerms}
          >
            <Textarea
              id="import-product-warranty-terms"
              rows={4}
              {...register("warrantyTerms")}
            />
          </Field>

          <div className="grid grid-cols-2 gap-2 border-t border-slate-200 pt-5 sm:flex sm:justify-end">
            <Button
              className="w-full sm:w-auto"
              onClick={() => onOpenChange(false)}
              type="button"
              variant="secondary"
            >
              {labels.cancel}
            </Button>
            <Button className="w-full sm:w-auto" type="submit">
              {labels.saveChanges}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const optionalText = z.string().trim();
const optionalInteger = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().int().min(1).max(120).optional(),
);
const optionalYear = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().int().min(1900).max(2100).optional(),
);

const productImportEditSchema = z.object({
  brand: optionalText.max(80),
  category: z.enum(["CAR", "ACCESSORY", "SPARE_PART", "SERVICE_PACKAGE"]),
  categoryCode: optionalText.max(80),
  description: optionalText.max(5000),
  imageUrl: optionalText.max(1000),
  manufactureYear: optionalYear,
  model: optionalText.max(80),
  name: optionalText.min(2).max(160),
  productCode: optionalText.max(64),
  serialNumber: optionalText.max(64),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  warrantyDurationMonths: optionalInteger,
  warrantyTerms: optionalText.max(2000),
});

type ProductImportEditFormValues = z.output<typeof productImportEditSchema>;
type ProductImportEditFormInput = z.input<typeof productImportEditSchema>;

function toImportEditFormValues(
  data: ProductImportRowData | undefined,
): ProductImportEditFormValues {
  return {
    brand: data?.brand ?? "",
    category: normalizeCategory(data?.category),
    categoryCode: data?.categoryCode ?? "",
    description: data?.description ?? "",
    imageUrl: data?.imageUrl ?? "",
    manufactureYear: data?.manufactureYear ?? undefined,
    model: data?.model ?? "",
    name: data?.name ?? "",
    productCode: data?.productCode ?? "",
    serialNumber: data?.serialNumber ?? "",
    status: normalizeStatus(data?.status),
    warrantyDurationMonths: data?.warrantyDurationMonths ?? undefined,
    warrantyTerms: data?.warrantyTerms ?? "",
  };
}

function toImportRowData(
  values: ProductImportEditFormValues,
): ProductImportRowData {
  return {
    brand: toNullableValue(values.brand),
    category: values.category,
    categoryCode: toNullableValue(values.categoryCode),
    description: toNullableValue(values.description),
    imageUrl: toNullableValue(values.imageUrl),
    manufactureYear: values.manufactureYear ?? null,
    model: toNullableValue(values.model),
    name: values.name,
    productCode: toNullableValue(values.productCode),
    serialNumber: toNullableValue(values.serialNumber),
    status: values.status,
    warrantyDurationMonths: values.warrantyDurationMonths ?? null,
    warrantyTerms: toNullableValue(values.warrantyTerms),
  };
}

function normalizeCategory(value: string | undefined) {
  return PRODUCT_CATEGORIES.includes(value as never)
    ? (value as ProductImportEditFormValues["category"])
    : "CAR";
}

function normalizeStatus(value: string | undefined) {
  return value === "INACTIVE" ? "INACTIVE" : "ACTIVE";
}

function toNullableValue(value: string | null | undefined) {
  return value?.trim() || null;
}

function PreviewCell({ value }: { value: number | string | null }) {
  const displayValue = value ?? "-";

  return (
    <TableCell className="whitespace-nowrap">
      <span
        className="block max-w-56 truncate whitespace-nowrap text-sm text-slate-700"
        title={String(displayValue)}
      >
        {displayValue}
      </span>
    </TableCell>
  );
}

function ImportRowStatus({
  errors,
  readyLabel,
  withErrorsLabel,
}: {
  errors: ProductImportRowError[];
  readyLabel: string;
  withErrorsLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 whitespace-normal">
      <Badge
        className="shrink-0 whitespace-nowrap"
        variant={errors.length > 0 ? "destructive" : "success"}
      >
        {errors.length > 0 ? withErrorsLabel : readyLabel}
      </Badge>
      {errors.map((error, index) => {
        const message = error.field
          ? `${error.field}: ${error.message}`
          : error.message;

        return (
          <span
            className="inline-flex shrink-0 items-center gap-1"
            key={`${error.field}-${error.message}-${index}`}
          >
            <Badge
              className="whitespace-nowrap"
              title={message}
              variant="destructive"
            >
              {message}
            </Badge>
          </span>
        );
      })}
    </div>
  );
}

function Field({
  children,
  error,
  id,
  label,
}: {
  children: ReactNode;
  error?: string;
  id: string;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

function NullableSelect({
  children,
  id,
  onValueChange,
  value,
}: {
  children: ReactNode;
  id: string;
  onValueChange: (value: string) => void;
  value?: string;
}) {
  return (
    <Select
      onValueChange={(nextValue) =>
        onValueChange(nextValue === SELECT_EMPTY_VALUE ? "" : nextValue)
      }
      value={value || SELECT_EMPTY_VALUE}
    >
      <SelectTrigger id={id}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={SELECT_EMPTY_VALUE}>-</SelectItem>
        {children}
      </SelectContent>
    </Select>
  );
}

const SELECT_EMPTY_VALUE = "__empty__";
