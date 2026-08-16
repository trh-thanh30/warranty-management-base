"use client";

import { usePermissions } from "@/src/hooks/use-permissions";
import { Link } from "@/src/i18n/navigation";
import type { ProductTemplateSummary } from "@repo/shared";
import { PERMISSIONS } from "@repo/shared/constants";
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Table,
  TableScroll,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui";
import { Ban, Eye, MoreHorizontal, Pencil, PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { ProductTemplatePublicationBadge } from "./product-template-publication-badge";

export function ProductTemplatesTable({
  items,
  onDeactivate,
}: {
  items: ProductTemplateSummary[];
  onDeactivate: (template: ProductTemplateSummary) => void;
}) {
  const t = useTranslations("ProductTemplates");
  return (
    <>
      <div className="space-y-3 lg:hidden">
        {items.map((template) => (
          <article
            className="rounded-md border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950"
            key={template.id}
          >
            <div className="flex items-start justify-between gap-3">
              <TemplateIdentity template={template} />
              <TemplateActions
                onDeactivate={onDeactivate}
                template={template}
              />
            </div>
            <div className="mt-4 grid grid-cols-[max-content_minmax(0,1fr)] items-center gap-x-2 gap-y-2">
              <TemplateMobileField label={t("status")}>
                <TemplateStatus template={template} />
              </TemplateMobileField>
              <TemplateMobileField label={t("visibility")}>
                <ProductTemplatePublicationBadge
                  isPublished={template.isPublished}
                />
              </TemplateMobileField>
              <TemplateMobileField label={t("linkedProduct")}>
                <Badge className="whitespace-nowrap" variant="secondary">
                  {t("productCount", { count: template.productCount })}
                </Badge>
              </TemplateMobileField>
            </div>
          </article>
        ))}
      </div>
      <TableScroll className="hidden max-h-144 overflow-y-auto rounded-md border border-slate-200 lg:block dark:border-slate-800">
        <Table className="min-w-5xl">
          <TableHeader className="sticky top-0 z-10 bg-white dark:bg-slate-950 [&_th]:h-auto [&_th]:whitespace-normal [&_th]:text-wrap [&_th]:py-2 [&_th]:leading-4">
            <TableRow>
              <TableHead>{t("name")}</TableHead>
              <TableHead>{t("sku")}</TableHead>
              <TableHead>{t("category")}</TableHead>
              <TableHead>{t("defaultWarrantyDuration")}</TableHead>
              <TableHead>{t("products")}</TableHead>
              <TableHead>{t("status")}</TableHead>
              <TableHead aria-label={t("actions")} className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((template) => (
              <TableRow key={template.id}>
                <TableCell>
                  <TemplateIdentity template={template} />
                </TableCell>
                <TableCell className="font-mono text-xs whitespace-nowrap">
                  {template.sku}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {template.categoryRef?.name ?? "-"}
                </TableCell>
                <TableCell>
                  {template.defaultWarrantyDurationMonths === null
                    ? "-"
                    : t("durationValue", {
                        count: template.defaultWarrantyDurationMonths,
                      })}
                </TableCell>
                <TableCell>{template.productCount}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    <TemplateStatus template={template} />
                    <ProductTemplatePublicationBadge
                      isPublished={template.isPublished}
                    />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <TemplateActions
                    onDeactivate={onDeactivate}
                    template={template}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableScroll>
    </>
  );
}

function TemplateMobileField({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="contents">
      <span className="shrink-0 text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <div className="min-w-0 justify-self-start">{children}</div>
    </div>
  );
}

function TemplateIdentity({ template }: { template: ProductTemplateSummary }) {
  return (
    <div className="min-w-0">
      <p className="truncate font-medium text-slate-950 dark:text-slate-50">
        {template.name}
      </p>
      <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
        {[template.brand, template.model].filter(Boolean).join(" · ") || "-"}
      </p>
    </div>
  );
}

function TemplateStatus({ template }: { template: ProductTemplateSummary }) {
  const t = useTranslations("ProductTemplates");
  return (
    <Badge
      className="whitespace-nowrap"
      variant={template.isActive ? "success" : "secondary"}
    >
      {template.isActive ? t("active") : t("inactive")}
    </Badge>
  );
}

function TemplateActions({
  onDeactivate,
  template,
}: {
  onDeactivate: (template: ProductTemplateSummary) => void;
  template: ProductTemplateSummary;
}) {
  const t = useTranslations("ProductTemplates");
  const { hasPermission } = usePermissions();
  const canCreateProduct = hasPermission(PERMISSIONS.PRODUCT_CREATE);
  const canEdit = hasPermission(PERMISSIONS.PRODUCT_TEMPLATE_UPDATE);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={t("openActions", { name: template.name })}
          className="size-10"
          size="icon"
          variant="ghost"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/product-templates/${template.id}`}>
            <Eye className="mr-2 size-4" />
            {t("view")}
          </Link>
        </DropdownMenuItem>
        {canCreateProduct && template.isActive ? (
          <DropdownMenuItem asChild>
            <Link href={`/products/create?templateId=${template.id}`}>
              <PlusCircle className="mr-2 size-4" />
              {t("createProductFromTemplate")}
            </Link>
          </DropdownMenuItem>
        ) : null}
        {canEdit ? (
          <>
            <DropdownMenuItem asChild>
              <Link href={`/product-templates/${template.id}/edit`}>
                <Pencil className="mr-2 size-4" />
                {t("edit")}
              </Link>
            </DropdownMenuItem>
            {template.isActive ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-700"
                  onSelect={() => onDeactivate(template)}
                >
                  <Ban className="mr-2 size-4" />
                  {t("deactivate")}
                </DropdownMenuItem>
              </>
            ) : null}
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
