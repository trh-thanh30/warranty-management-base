"use client";

import type { CSSProperties } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button, Input, Label } from "@repo/ui";
import type { useProductForm } from "../hooks/use-product-form";

type ProductFormController = ReturnType<typeof useProductForm>;

type SortableProductSpecificationRowProps = {
  disabled: boolean;
  fieldId: string;
  index: number;
  keyError?: string;
  onRemove: ProductFormController["removeSpecification"];
  register: ProductFormController["register"];
  sortingDisabled: boolean;
  valueError?: string;
};

export function SortableProductSpecificationRow({
  disabled,
  fieldId,
  index,
  keyError,
  onRemove,
  register,
  sortingDisabled,
  valueError,
}: SortableProductSpecificationRowProps) {
  const t = useTranslations("Products");
  const {
    attributes,
    isDragging,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: fieldId, disabled: sortingDisabled });
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const keyId = `product-specification-${fieldId}-key`;
  const valueId = `product-specification-${fieldId}-value`;

  return (
    <div
      className={`grid min-w-0 grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] gap-x-2 gap-y-3 rounded-md border bg-slate-50/70 p-3 motion-reduce:!transition-none sm:grid-cols-[2.75rem_minmax(0,1fr)_minmax(0,1fr)_2.75rem] sm:items-start sm:gap-3 dark:bg-slate-900/40 ${
        isDragging
          ? "relative z-10 border-slate-400 opacity-90 shadow-lg dark:border-slate-600"
          : "border-slate-200 dark:border-slate-800"
      }`}
      ref={setNodeRef}
      style={style}
    >
      <Button
        {...attributes}
        {...listeners}
        aria-label={t("moveSpecification", { index: index + 1 })}
        className="col-start-1 row-start-1 size-11 cursor-grab touch-none justify-self-start text-slate-500 active:cursor-grabbing disabled:cursor-not-allowed dark:text-slate-400"
        disabled={sortingDisabled}
        ref={setActivatorNodeRef}
        title={t("moveSpecification", { index: index + 1 })}
        type="button"
        variant="ghost"
      >
        <GripVertical aria-hidden="true" className="size-4" />
      </Button>

      <div className="col-span-3 col-start-1 row-start-2 min-w-0 space-y-2 sm:col-span-1 sm:col-start-2 sm:row-start-1">
        <Label
          className="text-xs text-slate-500 sm:sr-only dark:text-slate-400"
          htmlFor={keyId}
        >
          {t("specificationKey")}
        </Label>
        <Input
          aria-invalid={Boolean(keyError)}
          disabled={disabled}
          id={keyId}
          placeholder={t("specificationKeyPlaceholder")}
          {...register(`specifications.${index}.key`)}
        />
        {keyError ? (
          <p className="text-sm text-red-600 dark:text-red-400">{keyError}</p>
        ) : null}
      </div>

      <div className="col-span-3 col-start-1 row-start-3 min-w-0 space-y-2 sm:col-span-1 sm:col-start-3 sm:row-start-1">
        <Label
          className="text-xs text-slate-500 sm:sr-only dark:text-slate-400"
          htmlFor={valueId}
        >
          {t("specificationValue")}
        </Label>
        <Input
          aria-invalid={Boolean(valueError)}
          disabled={disabled}
          id={valueId}
          placeholder={t("specificationValuePlaceholder")}
          {...register(`specifications.${index}.value`)}
        />
        {valueError ? (
          <p className="text-sm text-red-600 dark:text-red-400">{valueError}</p>
        ) : null}
      </div>

      <Button
        aria-label={t("removeSpecification", { index: index + 1 })}
        className="col-start-3 row-start-1 size-11 justify-self-end text-red-600 hover:text-red-700 sm:col-start-4 dark:text-red-400 dark:hover:text-red-300"
        disabled={disabled}
        onClick={() => onRemove(index)}
        title={t("removeSpecification", { index: index + 1 })}
        type="button"
        variant="ghost"
      >
        <Trash2 aria-hidden="true" className="size-4" />
      </Button>
    </div>
  );
}
