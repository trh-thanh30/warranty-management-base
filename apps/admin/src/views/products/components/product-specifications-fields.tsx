"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@repo/ui";
import type { useProductForm } from "../hooks/use-product-form";
import { resolveSpecificationMove } from "../products.utils";
import { SortableProductSpecificationRow } from "./sortable-product-specification-row";

type ProductFormController = ReturnType<typeof useProductForm>;

type ProductSpecificationsFieldsProps = {
  disabled: boolean;
  errors: ProductFormController["errors"];
  fields: ProductFormController["specificationFields"];
  onAdd: ProductFormController["appendSpecification"];
  onMove: ProductFormController["moveSpecification"];
  onRemove: ProductFormController["removeSpecification"];
  register: ProductFormController["register"];
};

export function ProductSpecificationsFields({
  disabled,
  errors,
  fields,
  onAdd,
  onMove,
  onRemove,
  register,
}: ProductSpecificationsFieldsProps) {
  const t = useTranslations("Products");
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const sortingDisabled = disabled || fields.length < 2;

  function handleDragEnd({ active, over }: DragEndEvent) {
    const move = resolveSpecificationMove(
      fields,
      String(active.id),
      over ? String(over.id) : undefined,
    );
    if (move) onMove(move.from, move.to);
  }

  return (
    <section className="space-y-4 rounded-md border border-slate-200 p-3 sm:p-4 dark:border-slate-800">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-medium text-slate-950 dark:text-slate-50">
            {t("specificationsTitle")}
          </h2>
          <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">
            {t("specificationsDescription")}
          </p>
        </div>
        <Button
          className="w-full shrink-0 sm:w-auto"
          disabled={disabled}
          onClick={() => onAdd({ key: "", value: "" })}
          type="button"
          variant="secondary"
        >
          <Plus aria-hidden="true" className="size-4" />
          {t("addSpecification")}
        </Button>
      </div>

      {fields.length > 0 ? (
        <DndContext
          accessibility={{
            screenReaderInstructions: {
              draggable: t("sortSpecificationInstructions"),
            },
          }}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          sensors={sensors}
        >
          <div className="space-y-3">
            <div
              aria-hidden="true"
              className="hidden grid-cols-[2.75rem_minmax(0,1fr)_minmax(0,1fr)_2.75rem] gap-3 px-3 text-xs font-medium uppercase tracking-wide text-slate-500 sm:grid dark:text-slate-400"
            >
              <span />
              <span>{t("specificationKey")}</span>
              <span>{t("specificationValue")}</span>
              <span />
            </div>

            <SortableContext
              items={fields.map((field) => field.id)}
              strategy={verticalListSortingStrategy}
            >
              {fields.map((field, index) => (
                <SortableProductSpecificationRow
                  disabled={disabled}
                  fieldId={field.id}
                  index={index}
                  key={field.id}
                  keyError={formatSpecificationError(
                    errors.specifications?.[index]?.key?.message,
                    t,
                  )}
                  onRemove={onRemove}
                  register={register}
                  sortingDisabled={sortingDisabled}
                  valueError={formatSpecificationError(
                    errors.specifications?.[index]?.value?.message,
                    t,
                  )}
                />
              ))}
            </SortableContext>
          </div>
        </DndContext>
      ) : (
        <div
          aria-live="polite"
          className="rounded-md border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400"
        >
          {t("noSpecifications")}
        </div>
      )}
    </section>
  );
}

function formatSpecificationError(
  message: string | undefined,
  t: (key: string) => string,
) {
  if (!message) return undefined;

  const translationKeys = new Set([
    "specificationKeyDuplicate",
    "specificationKeyLength",
    "specificationKeyRequired",
    "specificationValueLength",
    "specificationValueRequired",
  ]);

  return translationKeys.has(message) ? t(message) : message;
}
