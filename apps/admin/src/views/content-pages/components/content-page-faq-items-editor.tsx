"use client";

import { useState } from "react";
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
  arrayMove,
  sortableKeyboardCoordinates,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Controller, useFieldArray, type UseFormReturn } from "react-hook-form";
import {
  ChevronDown,
  GripVertical,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button, Input, Label, Switch } from "@repo/ui";
import { RichTextEditor } from "@/src/components/common/rich-text-editor";
import { ConfirmActionDialog } from "@/src/components/common/confirm-action-dialog";
import { useToast } from "@/src/hooks/use-toast";
import type { ContentPageFormValues } from "../content-pages.types";
import {
  useParseContentDocument,
  useDeleteContentPageFaqItem,
  useReorderContentPageFaqItems,
  useSaveContentPageFaqItem,
} from "../hooks/use-content-pages";

type FaqField = ContentPageFormValues["faqItems"][number] & {
  fieldKey: string;
};

export function ContentPageFaqItemsEditor({
  form,
  pageId,
}: {
  form: UseFormReturn<ContentPageFormValues>;
  pageId: string | null;
}) {
  const t = useTranslations("ContentPages");
  const toast = useToast();
  const parseDocument = useParseContentDocument();
  const reorderFaqItems = useReorderContentPageFaqItems(pageId);
  const saveFaqItem = useSaveContentPageFaqItem(pageId);
  const deleteFaqItem = useDeleteContentPageFaqItem(pageId);
  const [savingIndex, setSavingIndex] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    fieldKey: string;
    itemId?: string;
    question: string;
  } | null>(null);
  const { fields, append, move, remove, update } = useFieldArray({
    control: form.control,
    keyName: "fieldKey",
    name: "faqItems",
  });
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  async function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;

    const oldIndex = fields.findIndex((field) => field.fieldKey === active.id);
    const newIndex = fields.findIndex((field) => field.fieldKey === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const reorderedFields = arrayMove(fields, oldIndex, newIndex);
    move(oldIndex, newIndex);

    const persistedIds = reorderedFields
      .map((field) => field.id)
      .filter((id): id is string => Boolean(id));
    if (!pageId || persistedIds.length !== reorderedFields.length) return;

    try {
      await reorderFaqItems.mutateAsync(persistedIds);
      toast.success(t("faqReorderSuccess"));
    } catch {
      move(newIndex, oldIndex);
      toast.error(t("faqReorderError"));
    }
  }

  async function handleSave(index: number) {
    if (!pageId) {
      toast.info(t("faqSavePageFirst"));
      return;
    }

    const isValid = await form.trigger([
      `faqItems.${index}.question`,
      `faqItems.${index}.answer`,
    ]);
    if (!isValid) return;

    const item = form.getValues(`faqItems.${index}`);
    setSavingIndex(index);
    try {
      const savedItem = await saveFaqItem.mutateAsync({
        body: {
          answer: item.answer,
          isActive: item.isActive,
          question: item.question,
        },
        itemId: item.id,
      });
      update(index, {
        answer: savedItem.answer,
        id: savedItem.id,
        isActive: savedItem.isActive,
        question: savedItem.question,
      });
      toast.success(t(item.id ? "faqUpdated" : "faqCreated"));
    } catch {
      toast.error(t("faqSaveError"));
    } finally {
      setSavingIndex(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const index = fields.findIndex(
      (field) => field.fieldKey === deleteTarget.fieldKey,
    );
    if (index < 0) {
      setDeleteTarget(null);
      return;
    }

    try {
      if (deleteTarget.itemId) {
        if (!pageId) {
          toast.error(t("faqDeleteError"));
          return;
        }
        await deleteFaqItem.mutateAsync(deleteTarget.itemId);
      }
      remove(index);
      setDeleteTarget(null);
      toast.success(
        t(deleteTarget.itemId ? "faqDeleted" : "faqRemovedUnsaved"),
      );
    } catch {
      toast.error(t("faqDeleteError"));
    }
  }

  return (
    <div className="space-y-4" id="content-page-faq-items">
      <div className="flex flex-col gap-3 rounded-lg border border-blue-200 bg-blue-50/70 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-blue-900 dark:bg-blue-950/30">
        <div>
          <p className="font-medium text-slate-900 dark:text-slate-100">
            {t("faqEditorTitle")}
          </p>
          <p className="mt-1 text-sm leading-5 text-slate-600 dark:text-slate-400">
            {t("faqEditorDescription")}
          </p>
        </div>
        <Button
          className="h-10 shrink-0"
          onClick={() => append({ answer: "", isActive: true, question: "" })}
          type="button"
        >
          <Plus aria-hidden="true" className="size-4" />
          {t("faqAddItem")}
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 px-6 py-10 text-center dark:border-slate-700">
          <p className="font-medium text-slate-800 dark:text-slate-200">
            {t("faqEmptyTitle")}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {t("faqEmptyDescription")}
          </p>
        </div>
      ) : null}

      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={(event) => void handleDragEnd(event)}
        sensors={sensors}
      >
        <SortableContext
          items={fields.map((field) => field.fieldKey)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {fields.map((field, index) => (
              <SortableFaqItem
                disabled={reorderFaqItems.isPending}
                field={field}
                form={form}
                index={index}
                key={field.fieldKey}
                isSaving={savingIndex === index}
                onRemove={() =>
                  setDeleteTarget({
                    fieldKey: field.fieldKey,
                    itemId: field.id,
                    question: form.getValues(`faqItems.${index}.question`),
                  })
                }
                onSave={() => void handleSave(index)}
                parseDocument={parseDocument.mutateAsync}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <ConfirmActionDialog
        cancelLabel={t("cancel")}
        confirmLabel={t("faqDeleteConfirm")}
        description={t("faqDeleteDescription", {
          question: deleteTarget?.question || t("faqItemUntitled"),
        })}
        isLoading={deleteFaqItem.isPending}
        onConfirm={() => void handleDelete()}
        onOpenChange={(open) => {
          if (!open && !deleteFaqItem.isPending) setDeleteTarget(null);
        }}
        open={Boolean(deleteTarget)}
        title={t("faqDeleteTitle")}
        variant="destructive"
      />
    </div>
  );
}

function SortableFaqItem({
  disabled,
  field,
  form,
  index,
  isSaving,
  onRemove,
  onSave,
  parseDocument,
}: {
  disabled: boolean;
  field: FaqField;
  form: UseFormReturn<ContentPageFormValues>;
  index: number;
  isSaving: boolean;
  onRemove: () => void;
  onSave: () => void;
  parseDocument: (file: File) => Promise<{ content: string }>;
}) {
  const t = useTranslations("ContentPages");
  const [isExpanded, setIsExpanded] = useState(true);
  const contentId = `faq-item-${field.fieldKey}-content`;
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ disabled, id: field.fieldKey });
  const question = form.watch(`faqItems.${index}.question`).trim();
  const heading = question
    ? t("faqItemHeading", { number: index + 1, question })
    : t("faqItemNumber", { number: index + 1 });
  const questionError = form.formState.errors.faqItems?.[index]?.question;
  const answerError = form.formState.errors.faqItems?.[index]?.answer;

  return (
    <section
      className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow dark:border-slate-800 dark:bg-slate-950 ${
        isDragging ? "relative z-20 shadow-xl ring-2 ring-blue-500/30" : ""
      }`}
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <header className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900/70">
        <button
          aria-label={t("faqDragHandle")}
          className="inline-flex size-9 touch-none cursor-grab items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          disabled={disabled}
          type="button"
          {...attributes}
          {...listeners}
        >
          <GripVertical aria-hidden="true" className="size-5" />
        </button>
        <span
          className="line-clamp-2 min-w-0 flex-1 text-sm font-semibold leading-5 text-slate-700 dark:text-slate-200"
          title={heading}
        >
          {heading}
        </span>
        <Controller
          control={form.control}
          name={`faqItems.${index}.isActive`}
          render={({ field: activeField }) => (
            <div className="flex items-center gap-2">
              <Label
                className="text-xs text-slate-600 dark:text-slate-400"
                htmlFor={`faq-item-${index}-active`}
              >
                {t("faqActive")}
              </Label>
              <Switch
                checked={activeField.value}
                id={`faq-item-${index}-active`}
                onCheckedChange={activeField.onChange}
              />
            </div>
          )}
        />
        <Button
          aria-controls={contentId}
          aria-expanded={isExpanded}
          aria-label={t(isExpanded ? "faqCollapseItem" : "faqExpandItem")}
          onClick={() => setIsExpanded((current) => !current)}
          size="icon"
          type="button"
          variant="ghost"
        >
          <ChevronDown
            aria-hidden="true"
            className={`size-4 transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </Button>
        <Button
          aria-label={t("faqRemoveItem")}
          className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40"
          onClick={onRemove}
          size="icon"
          type="button"
          variant="ghost"
        >
          <Trash2 aria-hidden="true" className="size-4" />
        </Button>
      </header>

      <div className="space-y-4 p-4" hidden={!isExpanded} id={contentId}>
        <div className="space-y-1.5">
          <Label htmlFor={`faq-item-${index}-question`}>
            {t("faqQuestionLabel")}
          </Label>
          <Input
            aria-invalid={Boolean(questionError)}
            id={`faq-item-${index}-question`}
            placeholder={t("faqQuestionPlaceholder")}
            {...form.register(`faqItems.${index}.question`)}
          />
          {questionError?.message ? (
            <p className="text-sm text-red-600">{t(questionError.message)}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label>{t("faqAnswerLabel")}</Label>
          <Controller
            control={form.control}
            name={`faqItems.${index}.answer`}
            render={({ field: answerField }) => (
              <RichTextEditor
                disabled={form.formState.isSubmitting}
                maxLength={10_000}
                onChange={answerField.onChange}
                onImportDocument={async (file) => {
                  const result = await parseDocument(file);
                  return result.content;
                }}
                value={answerField.value}
              />
            )}
          />
          {answerError?.message ? (
            <p className="text-sm text-red-600">{t(answerError.message)}</p>
          ) : null}
        </div>
        <div className="flex justify-end border-t border-slate-200 pt-4 dark:border-slate-800">
          <Button
            className="h-10"
            disabled={isSaving}
            onClick={onSave}
            type="button"
          >
            {isSaving ? (
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              <Save aria-hidden="true" className="size-4" />
            )}
            {t("faqSaveItem")}
          </Button>
        </div>
      </div>
    </section>
  );
}
