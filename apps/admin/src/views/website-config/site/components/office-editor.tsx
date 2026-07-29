"use client";

import { closestCenter, DndContext, type DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { WebsiteLocale, WebsiteOffice } from "@repo/shared";
import { Button, Card, CardContent, Input, Switch, Textarea } from "@repo/ui";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { FormField } from "@/src/components/common/form-field";
import { FormSection } from "@/src/components/common/form-section";
import { SortableConfigItem } from "../sortable-config-item";
import { useConfigDndSensors } from "../use-config-dnd-sensors";
import type { SiteDraft, SiteDraftUpdater } from "../website-site-config.types";
import { reorderById } from "../website-site-config.utils";

export function OfficeEditor({
  disabled,
  form,
  locale,
  onChange,
}: {
  disabled: boolean;
  form: SiteDraft;
  locale: WebsiteLocale;
  onChange: SiteDraftUpdater;
}) {
  const t = useTranslations("WebsiteConfig");
  const sensors = useConfigDndSensors();
  const [collapsedOfficeIds, setCollapsedOfficeIds] = useState<Set<string>>(
    () => new Set(),
  );
  const updateOffices = (offices: WebsiteOffice[]) =>
    onChange((current) => ({ ...current, offices }));
  const sortingDisabled = disabled || form.offices.length < 2;

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    updateOffices(
      reorderById(form.offices, String(active.id), String(over.id)),
    );
  }

  return (
    <FormSection
      description={t("site.addressOfficesDescription")}
      title={t("site.addressOffices")}
    >
      <Button
        disabled={disabled}
        onClick={() =>
          updateOffices([
            ...form.offices,
            {
              id: crypto.randomUUID(),
              isActive: true,
              isHeadquarters: false,
              phone: null,
              sortOrder: form.offices.length,
              translations: [
                { address: "", label: "", locale: "vi" },
                { address: "", label: "", locale: "en" },
              ],
            },
          ])
        }
        type="button"
        variant="outline"
      >
        <Plus aria-hidden="true" className="size-4" />
        {t("site.addOffice")}
      </Button>
      <DndContext
        accessibility={{
          screenReaderInstructions: {
            draggable: t("site.sortOfficeInstructions"),
          },
        }}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <SortableContext
          items={form.offices.map((office) => office.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {form.offices.map((office, index) => {
              const translation = office.translations.find(
                (item) => item.locale === locale,
              );
              const isCollapsed = collapsedOfficeIds.has(office.id);
              const contentId = `website-office-content-${office.id}`;
              const officeLabel =
                translation?.label ||
                t("site.officeFallback", { index: index + 1 });

              return (
                <SortableConfigItem
                  disabled={sortingDisabled}
                  id={office.id}
                  key={office.id}
                  label={t("site.moveOffice", { index: index + 1 })}
                >
                  <Card>
                    <CardContent className="p-0">
                      <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
                        <div className="flex items-center gap-3">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                            {index + 1}
                          </span>
                          <div className="flex min-w-0 flex-wrap items-center gap-2">
                            <p className="truncate font-medium text-slate-900 dark:text-slate-100">
                              {officeLabel}
                            </p>
                            {office.isHeadquarters ? (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                                {t("site.headquartersBadge")}
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-2">
                          <label className="flex min-h-10 items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <Switch
                              checked={office.isHeadquarters}
                              disabled={disabled}
                              onCheckedChange={(checked) =>
                                updateOffices(
                                  form.offices.map((item) => {
                                    if (!checked) {
                                      return item.id === office.id
                                        ? { ...item, isHeadquarters: false }
                                        : item;
                                    }

                                    return {
                                      ...item,
                                      isActive:
                                        item.id === office.id
                                          ? true
                                          : item.isActive,
                                      isHeadquarters: item.id === office.id,
                                    };
                                  }),
                                )
                              }
                            />
                            {t("site.headquarters")}
                          </label>
                          <label className="flex min-h-10 items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <Switch
                              checked={office.isActive}
                              disabled={disabled}
                              onCheckedChange={(checked) =>
                                updateOffices(
                                  form.offices.map((item) =>
                                    item.id === office.id
                                      ? {
                                          ...item,
                                          isActive: checked,
                                          isHeadquarters: checked
                                            ? item.isHeadquarters
                                            : false,
                                        }
                                      : item,
                                  ),
                                )
                              }
                            />
                            {t("site.active")}
                          </label>
                          <Button
                            aria-controls={contentId}
                            aria-expanded={!isCollapsed}
                            aria-label={
                              isCollapsed
                                ? t("site.expandOffice", {
                                    office: officeLabel,
                                  })
                                : t("site.collapseOffice", {
                                    office: officeLabel,
                                  })
                            }
                            className="size-10"
                            onClick={() =>
                              setCollapsedOfficeIds((current) => {
                                const next = new Set(current);
                                if (isCollapsed) next.delete(office.id);
                                else next.add(office.id);
                                return next;
                              })
                            }
                            size="icon"
                            title={
                              isCollapsed
                                ? t("site.expandOffice", {
                                    office: officeLabel,
                                  })
                                : t("site.collapseOffice", {
                                    office: officeLabel,
                                  })
                            }
                            type="button"
                            variant="ghost"
                          >
                            {isCollapsed ? (
                              <ChevronDown
                                aria-hidden="true"
                                className="size-4"
                              />
                            ) : (
                              <ChevronUp
                                aria-hidden="true"
                                className="size-4"
                              />
                            )}
                          </Button>
                          <Button
                            aria-label={t("actions.remove")}
                            className="bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600"
                            disabled={disabled}
                            onClick={() =>
                              updateOffices(
                                form.offices.filter(
                                  (item) => item.id !== office.id,
                                ),
                              )
                            }
                            size="icon"
                            type="button"
                            variant="ghost"
                          >
                            <Trash2 aria-hidden="true" className="size-4" />
                          </Button>
                        </div>
                      </div>
                      <div
                        className="grid gap-5 p-4 lg:grid-cols-2"
                        hidden={isCollapsed}
                        id={contentId}
                      >
                        <FormField
                          htmlFor={`website-office-label-${office.id}-${locale}`}
                          label={t("site.officeLabel")}
                        >
                          <Input
                            disabled={disabled}
                            id={`website-office-label-${office.id}-${locale}`}
                            onChange={(event) =>
                              updateOffices(
                                form.offices.map((item) =>
                                  item.id === office.id
                                    ? {
                                        ...item,
                                        translations: item.translations.map(
                                          (text) =>
                                            text.locale === locale
                                              ? {
                                                  ...text,
                                                  label: event.target.value,
                                                }
                                              : text,
                                        ),
                                      }
                                    : item,
                                ),
                              )
                            }
                            placeholder={t("site.officeLabelPlaceholder")}
                            value={translation?.label ?? ""}
                          />
                        </FormField>
                        <FormField
                          description={
                            office.isActive
                              ? undefined
                              : t("site.inactiveOfficeHint")
                          }
                          htmlFor={`website-office-phone-${office.id}`}
                          label={t("site.officePhone")}
                        >
                          <Input
                            disabled={disabled}
                            id={`website-office-phone-${office.id}`}
                            onChange={(event) =>
                              updateOffices(
                                form.offices.map((item) =>
                                  item.id === office.id
                                    ? { ...item, phone: event.target.value }
                                    : item,
                                ),
                              )
                            }
                            placeholder="0886 33 77 33"
                            type="tel"
                            value={office.phone ?? ""}
                          />
                        </FormField>
                        <div className="lg:col-span-2">
                          <FormField
                            htmlFor={`website-office-address-${office.id}-${locale}`}
                            label={t("site.officeAddress")}
                          >
                            <Textarea
                              disabled={disabled}
                              id={`website-office-address-${office.id}-${locale}`}
                              onChange={(event) =>
                                updateOffices(
                                  form.offices.map((item) =>
                                    item.id === office.id
                                      ? {
                                          ...item,
                                          translations: item.translations.map(
                                            (text) =>
                                              text.locale === locale
                                                ? {
                                                    ...text,
                                                    address: event.target.value,
                                                  }
                                                : text,
                                          ),
                                        }
                                      : item,
                                  ),
                                )
                              }
                              placeholder={t("site.officeAddressPlaceholder")}
                              rows={3}
                              value={translation?.address ?? ""}
                            />
                          </FormField>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </SortableConfigItem>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
      {form.offices.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          {t("site.officeEmpty")}
        </p>
      ) : null}
    </FormSection>
  );
}
