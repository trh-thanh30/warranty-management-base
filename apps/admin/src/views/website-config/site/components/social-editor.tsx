"use client";

import { closestCenter, DndContext, type DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { WebsiteSocialLink } from "@repo/shared";
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Switch,
} from "@repo/ui";
import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { IconType } from "react-icons";
import {
  FaFacebookF,
  FaShareNodes,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa6";
import { SiZalo } from "react-icons/si";
import { FormSection } from "@/src/components/common/form-section";
import { SortableConfigItem } from "../sortable-config-item";
import { useConfigDndSensors } from "../use-config-dnd-sensors";
import type { SiteDraft, SiteDraftUpdater } from "../website-site-config.types";
import { reorderById } from "../website-site-config.utils";

type SocialPlatform = WebsiteSocialLink["platform"];

const SOCIAL_PLATFORM_OPTIONS = [
  {
    icon: FaFacebookF,
    iconClassName: "text-[#1877F2]",
    labelKey: "site.platforms.facebook",
    value: "FACEBOOK",
  },
  {
    icon: SiZalo,
    iconClassName: "text-[#0068FF]",
    labelKey: "site.platforms.zalo",
    value: "ZALO",
  },
  {
    icon: FaTiktok,
    iconClassName: "text-slate-950 dark:text-white",
    labelKey: "site.platforms.tiktok",
    value: "TIKTOK",
  },
  {
    icon: FaYoutube,
    iconClassName: "text-[#FF0000]",
    labelKey: "site.platforms.youtube",
    value: "YOUTUBE",
  },
  {
    icon: FaShareNodes,
    iconClassName: "text-slate-500",
    labelKey: "site.platforms.other",
    value: "OTHER",
  },
] as const satisfies ReadonlyArray<{
  icon: IconType;
  iconClassName: string;
  labelKey:
    | "site.platforms.facebook"
    | "site.platforms.zalo"
    | "site.platforms.tiktok"
    | "site.platforms.youtube"
    | "site.platforms.other";
  value: SocialPlatform;
}>;

function SocialPlatformOption({
  icon: Icon,
  iconClassName,
  label,
}: {
  icon: IconType;
  iconClassName: string;
  label: string;
}) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <Icon aria-hidden="true" className={`size-4 shrink-0 ${iconClassName}`} />
      <span className="truncate">{label}</span>
    </span>
  );
}

export function SocialEditor({
  disabled,
  form,
  onChange,
}: {
  disabled: boolean;
  form: SiteDraft;
  onChange: SiteDraftUpdater;
}) {
  const t = useTranslations("WebsiteConfig");
  const sensors = useConfigDndSensors();
  const updateSocials = (socialLinks: WebsiteSocialLink[]) =>
    onChange((current) => ({ ...current, socialLinks }));
  const sortingDisabled = disabled || form.socialLinks.length < 2;

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    updateSocials(
      reorderById(form.socialLinks, String(active.id), String(over.id)),
    );
  }

  return (
    <FormSection
      description={t("site.socialsDescription")}
      title={t("site.socials")}
    >
      <Button
        disabled={disabled}
        onClick={() =>
          updateSocials([
            ...form.socialLinks,
            {
              id: crypto.randomUUID(),
              isActive: true,
              label: "",
              platform: "OTHER",
              sortOrder: form.socialLinks.length,
              url: "https://",
            },
          ])
        }
        type="button"
        variant="outline"
      >
        <Plus aria-hidden="true" className="size-4" />
        {t("site.addSocial")}
      </Button>
      <DndContext
        accessibility={{
          screenReaderInstructions: {
            draggable: t("site.sortSocialInstructions"),
          },
        }}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <SortableContext
          items={form.socialLinks.map((social) => social.id)}
          strategy={verticalListSortingStrategy}
        >
          {form.socialLinks.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="hidden grid-cols-[2.75rem_minmax(0,1fr)] bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500 md:grid dark:bg-slate-900/60 dark:text-slate-400">
                <span aria-hidden="true" />
                <div className="grid grid-cols-[180px_1fr_1.5fr_112px] gap-4 px-4 py-3">
                  <span>{t("site.platform")}</span>
                  <span>{t("site.socialLabel")}</span>
                  <span>{t("site.socialUrl")}</span>
                  <span>{t("site.active")}</span>
                </div>
              </div>
              {form.socialLinks.map((social, index) => (
                <SortableConfigItem
                  className="gap-0 border-t border-slate-200 dark:border-slate-800"
                  disabled={sortingDisabled}
                  handleClassName="mt-0 self-center"
                  id={social.id}
                  key={social.id}
                  label={t("site.moveSocial", { index: index + 1 })}
                >
                  <div className="grid gap-4 p-4 md:grid-cols-[180px_1fr_1.5fr_112px] md:items-center">
                    <div className="space-y-2">
                      <label
                        className="text-sm font-medium text-slate-700 md:sr-only dark:text-slate-300"
                        htmlFor={`website-social-platform-${social.id}`}
                      >
                        {t("site.platform")}
                      </label>
                      <Select
                        disabled={disabled}
                        onValueChange={(platform: SocialPlatform) =>
                          updateSocials(
                            form.socialLinks.map((item) =>
                              item.id === social.id
                                ? {
                                    ...item,
                                    platform,
                                  }
                                : item,
                            ),
                          )
                        }
                        value={social.platform}
                      >
                        <SelectTrigger
                          aria-label={t("site.platform")}
                          className="h-11"
                          id={`website-social-platform-${social.id}`}
                        >
                          {(() => {
                            const option =
                              SOCIAL_PLATFORM_OPTIONS.find(
                                ({ value }) => value === social.platform,
                              ) ?? SOCIAL_PLATFORM_OPTIONS.at(-1)!;

                            return (
                              <SocialPlatformOption
                                icon={option.icon}
                                iconClassName={option.iconClassName}
                                label={t(option.labelKey)}
                              />
                            );
                          })()}
                        </SelectTrigger>
                        <SelectContent>
                          {SOCIAL_PLATFORM_OPTIONS.map((option) => (
                            <SelectItem
                              key={option.value}
                              textValue={t(option.labelKey)}
                              value={option.value}
                            >
                              <SocialPlatformOption
                                icon={option.icon}
                                iconClassName={option.iconClassName}
                                label={t(option.labelKey)}
                              />
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label
                        className="text-sm font-medium text-slate-700 md:sr-only dark:text-slate-300"
                        htmlFor={`website-social-label-${social.id}`}
                      >
                        {t("site.socialLabel")}
                      </label>
                      <Input
                        disabled={disabled}
                        id={`website-social-label-${social.id}`}
                        onChange={(event) =>
                          updateSocials(
                            form.socialLinks.map((item) =>
                              item.id === social.id
                                ? { ...item, label: event.target.value }
                                : item,
                            ),
                          )
                        }
                        placeholder={t("site.socialLabel")}
                        value={social.label}
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        className="text-sm font-medium text-slate-700 md:sr-only dark:text-slate-300"
                        htmlFor={`website-social-url-${social.id}`}
                      >
                        {t("site.socialUrl")}
                      </label>
                      <Input
                        disabled={disabled}
                        id={`website-social-url-${social.id}`}
                        onChange={(event) =>
                          updateSocials(
                            form.socialLinks.map((item) =>
                              item.id === social.id
                                ? { ...item, url: event.target.value }
                                : item,
                            ),
                          )
                        }
                        placeholder="https://"
                        type="url"
                        value={social.url}
                      />
                    </div>
                    <div className="flex min-h-11 items-center justify-between gap-2 md:justify-start">
                      <span className="text-sm font-medium text-slate-700 md:sr-only dark:text-slate-300">
                        {t("site.active")}
                      </span>
                      <div className="flex items-center gap-2">
                        <Switch
                          aria-label={t("site.active")}
                          checked={social.isActive}
                          disabled={disabled}
                          onCheckedChange={(checked) =>
                            updateSocials(
                              form.socialLinks.map((item) =>
                                item.id === social.id
                                  ? { ...item, isActive: checked }
                                  : item,
                              ),
                            )
                          }
                        />
                        <Button
                          aria-label={t("actions.remove")}
                          className="bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600"
                          disabled={disabled}
                          onClick={() =>
                            updateSocials(
                              form.socialLinks.filter(
                                (item) => item.id !== social.id,
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
                  </div>
                </SortableConfigItem>
              ))}
            </div>
          ) : null}
        </SortableContext>
      </DndContext>
      {form.socialLinks.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          {t("site.socialEmpty")}
        </p>
      ) : null}
    </FormSection>
  );
}
