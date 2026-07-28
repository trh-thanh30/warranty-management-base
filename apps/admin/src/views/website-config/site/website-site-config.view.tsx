"use client";

import { useEffect, useState } from "react";
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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  ChevronDown,
  ChevronUp,
  Image,
  Images,
  House,
  MapPin,
  Plus,
  Share2,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { IconType } from "react-icons";
import {
  FaFacebookF,
  FaShareNodes,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa6";
import { SiZalo } from "react-icons/si";
import type {
  UpdateWebsiteSiteSettingBody,
  WebsiteLocale,
  WebsiteOffice,
  WebsiteSiteSetting,
  WebsiteSocialLink,
} from "@repo/shared";
import { HttpClientError } from "@repo/shared";
import { PERMISSIONS } from "@repo/shared/constants";
import {
  Button,
  Card,
  CardContent,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from "@repo/ui";
import { useAuth } from "@/src/app/providers/auth-provider";
import { FormField } from "@/src/components/common/form-field";
import { FormSection } from "@/src/components/common/form-section";
import { ImageUpload } from "@/src/components/common/image-upload";
import { PageHeader } from "@/src/components/common/page-header";
import { PermissionGuard } from "@/src/components/permission-guard";
import { usePermissions } from "@/src/hooks/use-permissions";
import {
  usePublishWebsiteSite,
  useSaveWebsiteSite,
  useWebsiteSite,
} from "@/src/hooks/use-website-config";
import { useToast } from "@/src/hooks/use-toast";
import { isWebsiteVersionConflict } from "@/src/lib/http-error.utils";
import { websiteConfigService } from "@/src/services/website-config/website-config.service";
import { LocaleTabs } from "../components/locale-tabs";
import { PreviewDataDialog } from "../components/preview-data-dialog";
import { RevisionStatusBar } from "../components/revision-status-bar";
import { WebsiteConfigQueryState } from "../components/website-config-query-state";
import { ThumbnailUploadPanel } from "./thumbnail-upload-panel";
import { SortableConfigItem } from "./sortable-config-item";
import {
  createDefaultHeroSlideDrafts,
  HomepageHeroEditor,
} from "./homepage-hero-editor";

type SiteDraft = Omit<UpdateWebsiteSiteSettingBody, "expectedVersion">;
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

export function WebsiteSiteConfigView() {
  const t = useTranslations("WebsiteConfig");
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const toast = useToast();
  const canUpdate = hasPermission(PERMISSIONS.WEBSITE_CONFIG_UPDATE);
  const canPublish = hasPermission(PERMISSIONS.WEBSITE_CONFIG_PUBLISH);
  const query = useWebsiteSite({ enabled: Boolean(user) });
  const saveMutation = useSaveWebsiteSite();
  const publishMutation = usePublishWebsiteSite();
  const [locale, setLocale] = useState<WebsiteLocale>("vi");
  const [form, setForm] = useState<SiteDraft | null>(null);
  const [assets, setAssets] = useState({
    footerLogoUrl: "",
    headerLogoUrl: "",
    ogImageUrl: "",
  });
  const [dirty, setDirty] = useState(false);
  const conflict =
    isWebsiteVersionConflict(saveMutation.error) ||
    isWebsiteVersionConflict(publishMutation.error);

  useEffect(() => {
    if (!query.data) return;
    setForm(toDraft(query.data));
    setAssets({
      footerLogoUrl: query.data.footerLogo?.url ?? "",
      headerLogoUrl: query.data.headerLogo?.url ?? "",
      ogImageUrl: query.data.ogImage?.url ?? "",
    });
    setDirty(false);
  }, [query.data]);

  useEffect(() => {
    const guard = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [dirty]);

  function change(updater: (current: SiteDraft) => SiteDraft) {
    setForm((current) => (current ? updater(current) : current));
    setDirty(true);
  }

  async function saveDraft() {
    if (!form || !query.data) return;
    try {
      await saveMutation.mutateAsync({
        ...form,
        expectedVersion: query.data.revision.draftVersion,
      });
      setDirty(false);
      toast.success(t("toast.saved"));
    } catch (error) {
      showMutationError(error);
    }
  }

  async function publish() {
    if (!query.data) return;
    try {
      await publishMutation.mutateAsync({
        expectedVersion: query.data.revision.draftVersion,
      });
      setDirty(false);
      toast.success(t("toast.published"));
    } catch (error) {
      showMutationError(error);
    }
  }

  function showMutationError(error: unknown) {
    const field =
      error instanceof HttpClientError &&
      error.details &&
      typeof error.details === "object" &&
      "field" in error.details
        ? error.details.field
        : undefined;

    if (field === "contactEmail") {
      toast.error(t("toast.contactEmailInvalid"));
      return;
    }

    toast.error(
      error instanceof Error && error.message
        ? error.message
        : t("toast.error"),
    );
  }

  return (
    <PermissionGuard permissions={[PERMISSIONS.WEBSITE_CONFIG_VIEW]}>
      <div className="space-y-6">
        <PageHeader
          actions={
            <PreviewDataDialog
              load={websiteConfigService.previewSite}
              locale={locale}
            />
          }
          description={t("site.description")}
          eyebrow={t("eyebrow")}
          title={t("site.title")}
        />
        <WebsiteConfigQueryState
          isError={query.isError}
          isLoading={query.isLoading}
          onRetry={() => void query.refetch()}
        />
        {query.data ? (
          <RevisionStatusBar
            canSave={canUpdate}
            canPublish={canPublish}
            hasUnsavedChanges={dirty}
            isPublishing={publishMutation.isPending}
            isSaving={saveMutation.isPending}
            onPublish={publish}
            onSave={saveDraft}
            revision={query.data.revision}
          />
        ) : null}
        {conflict ? (
          <Card className="border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-amber-950 dark:text-amber-100">
                  {t("states.conflict")}
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  {t("states.conflictDescription")}
                </p>
              </div>
              <Button
                onClick={() => void query.refetch()}
                type="button"
                variant="outline"
              >
                {t("actions.reload")}
              </Button>
            </CardContent>
          </Card>
        ) : null}
        {form && query.data ? (
          <Tabs className="space-y-5" defaultValue="identity">
            <Card>
              <CardContent className="p-2">
                <TabsList className="grid h-auto w-full grid-cols-2 gap-1 bg-transparent p-0 lg:grid-cols-5">
                  <TabsTrigger
                    className="min-h-12 gap-2 px-4 data-[state=active]:bg-slate-950 data-[state=active]:text-white dark:data-[state=active]:bg-slate-50 dark:data-[state=active]:text-slate-950"
                    value="identity"
                  >
                    <Image aria-hidden="true" className="size-4" />
                    {t("site.tabs.identity")}
                  </TabsTrigger>
                  <TabsTrigger
                    className="min-h-12 gap-2 px-4 data-[state=active]:bg-slate-950 data-[state=active]:text-white dark:data-[state=active]:bg-slate-50 dark:data-[state=active]:text-slate-950"
                    value="homepage"
                  >
                    <House aria-hidden="true" className="size-4" />
                    {t("site.tabs.homepage")}
                  </TabsTrigger>
                  <TabsTrigger
                    className="min-h-12 gap-2 px-4 data-[state=active]:bg-slate-950 data-[state=active]:text-white dark:data-[state=active]:bg-slate-50 dark:data-[state=active]:text-slate-950"
                    value="thumbnails"
                  >
                    <Images aria-hidden="true" className="size-4" />
                    {t("site.tabs.thumbnails")}
                  </TabsTrigger>
                  <TabsTrigger
                    className="min-h-12 gap-2 px-4 data-[state=active]:bg-slate-950 data-[state=active]:text-white dark:data-[state=active]:bg-slate-50 dark:data-[state=active]:text-slate-950"
                    value="contact"
                  >
                    <MapPin aria-hidden="true" className="size-4" />
                    {t("site.tabs.contact")}
                  </TabsTrigger>
                  <TabsTrigger
                    className="min-h-12 gap-2 px-4 data-[state=active]:bg-slate-950 data-[state=active]:text-white dark:data-[state=active]:bg-slate-50 dark:data-[state=active]:text-slate-950"
                    value="socials"
                  >
                    <Share2 aria-hidden="true" className="size-4" />
                    {t("site.tabs.socials")}
                  </TabsTrigger>
                </TabsList>
              </CardContent>
            </Card>

            <TabsContent className="mt-0" value="identity">
              <Card>
                <CardContent className="p-5 sm:p-6">
                  <FormSection
                    description={t("site.mediaDescription")}
                    title={t("site.media")}
                  >
                    <div className="grid gap-4 lg:grid-cols-3">
                      <AssetField
                        disabled={!canUpdate}
                        id="website-header-logo"
                        label={t("site.headerLogo")}
                        onChange={(assetId, url) => {
                          change((current) => ({
                            ...current,
                            headerLogoAssetId: assetId,
                          }));
                          setAssets((current) => ({
                            ...current,
                            headerLogoUrl: url,
                          }));
                        }}
                        persistedUrl={query.data.headerLogo?.url ?? ""}
                        url={assets.headerLogoUrl}
                      />
                      <AssetField
                        disabled={!canUpdate}
                        id="website-footer-logo"
                        label={t("site.footerLogo")}
                        onChange={(assetId, url) => {
                          change((current) => ({
                            ...current,
                            footerLogoAssetId: assetId,
                          }));
                          setAssets((current) => ({
                            ...current,
                            footerLogoUrl: url,
                          }));
                        }}
                        persistedUrl={query.data.footerLogo?.url ?? ""}
                        url={assets.footerLogoUrl}
                      />
                      <AssetField
                        disabled={!canUpdate}
                        id="website-og-image"
                        label={t("site.ogImage")}
                        onChange={(assetId, url) => {
                          change((current) => ({
                            ...current,
                            ogImageAssetId: assetId,
                          }));
                          setAssets((current) => ({
                            ...current,
                            ogImageUrl: url,
                          }));
                        }}
                        persistedUrl={query.data.ogImage?.url ?? ""}
                        url={assets.ogImageUrl}
                      />
                    </div>
                  </FormSection>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent className="mt-0" value="homepage">
              <Card>
                <CardContent className="p-5 sm:p-6">
                  <HomepageHeroEditor
                    configuredSlides={query.data.heroSlides}
                    disabled={!canUpdate}
                    onChange={(heroSlides) =>
                      change((current) => ({ ...current, heroSlides }))
                    }
                    slides={form.heroSlides}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent className="mt-0" value="thumbnails">
              <Card>
                <CardContent className="p-5 sm:p-6">
                  <ThumbnailUploadPanel disabled={!canUpdate} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent className="mt-0" value="contact">
              <Card>
                <CardContent className="space-y-8 p-5 sm:p-6">
                  <LocaleTabs locale={locale} onChange={setLocale} />
                  <OfficeEditor
                    disabled={!canUpdate}
                    form={form}
                    locale={locale}
                    onChange={change}
                  />
                  <ContactEditor
                    disabled={!canUpdate}
                    form={form}
                    onChange={change}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent className="mt-0" value="socials">
              <Card>
                <CardContent className="p-5 sm:p-6">
                  <SocialEditor
                    disabled={!canUpdate}
                    form={form}
                    onChange={change}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : null}
      </div>
    </PermissionGuard>
  );
}

function toDraft(site: WebsiteSiteSetting): SiteDraft {
  return {
    contactEmail: site.contactEmail,
    footerLogoAssetId: site.footerLogo?.id ?? null,
    headerLogoAssetId: site.headerLogo?.id ?? null,
    heroSlides:
      site.heroSlides.length > 0
        ? site.heroSlides.map((slide) => ({
            desktopAssetId: slide.desktopImage?.id ?? null,
            id: slide.id,
            isActive: slide.isActive,
            key: slide.key,
            mobileAssetId: slide.mobileImage?.id ?? null,
            sortOrder: slide.sortOrder,
          }))
        : createDefaultHeroSlideDrafts(),
    offices: structuredClone(site.offices),
    ogImageAssetId: site.ogImage?.id ?? null,
    socialLinks: structuredClone(site.socialLinks),
    websiteUrl: site.websiteUrl,
  };
}

function ContactEditor({
  disabled,
  form,
  onChange,
}: {
  disabled: boolean;
  form: SiteDraft;
  onChange: (updater: (current: SiteDraft) => SiteDraft) => void;
}) {
  const t = useTranslations("WebsiteConfig");
  return (
    <FormSection
      description={t("site.contactDetailsDescription")}
      title={t("site.contactDetails")}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <FormField
          htmlFor="website-contact-email"
          label={t("site.contactEmail")}
        >
          <Input
            disabled={disabled}
            id="website-contact-email"
            onChange={(event) =>
              onChange((current) => ({
                ...current,
                contactEmail: event.target.value,
              }))
            }
            placeholder="fujitek.lexzenz.vn@gmail.com"
            type="email"
            value={form.contactEmail}
          />
        </FormField>
        <FormField htmlFor="website-url" label={t("site.websiteUrl")}>
          <Input
            disabled={disabled}
            id="website-url"
            onChange={(event) =>
              onChange((current) => ({
                ...current,
                websiteUrl: event.target.value,
              }))
            }
            placeholder="https://fujitekvietnam.com"
            type="url"
            value={form.websiteUrl}
          />
        </FormField>
      </div>
    </FormSection>
  );
}

function OfficeEditor({
  disabled,
  form,
  locale,
  onChange,
}: {
  disabled: boolean;
  form: SiteDraft;
  locale: WebsiteLocale;
  onChange: (updater: (current: SiteDraft) => SiteDraft) => void;
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

function SocialEditor({
  disabled,
  form,
  onChange,
}: {
  disabled: boolean;
  form: SiteDraft;
  onChange: (updater: (current: SiteDraft) => SiteDraft) => void;
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

function AssetField({
  disabled,
  id,
  label,
  onChange,
  persistedUrl,
  url,
}: {
  disabled: boolean;
  id: string;
  label: string;
  onChange: (assetId: string | null, url: string) => void;
  persistedUrl: string;
  url: string;
}) {
  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/30">
      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
        {label}
      </p>
      <ImageUpload
        compact
        disabled={disabled}
        id={id}
        onAssetChange={(asset) => onChange(asset?.id ?? null, asset?.url ?? "")}
        onChange={(value) => {
          if (!value) onChange(null, "");
        }}
        persistedValue={persistedUrl}
        uploadOptions={{ accessType: "PUBLIC", folder: "website-config" }}
        value={url}
      />
    </div>
  );
}

function reorderById<T extends { id: string }>(
  items: T[],
  activeId: string,
  overId: string,
) {
  const from = items.findIndex((item) => item.id === activeId);
  const to = items.findIndex((item) => item.id === overId);
  if (from < 0 || to < 0 || from === to) return items;
  return arrayMove(items, from, to).map((item, sortOrder) => ({
    ...item,
    sortOrder,
  }));
}

function useConfigDndSensors() {
  return useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
}
