"use client";

import { ConfirmActionDialog } from "@/src/components/common/confirm-action-dialog";
import { FormPageShell } from "@/src/components/common/form-page-shell";
import { SelectControl } from "@/src/components/common/select-control";
import { StatePanel } from "@/src/components/common/state-panel";
import { PermissionGuard } from "@/src/components/permission-guard";
import { usePermissions } from "@/src/hooks/use-permissions";
import { useToast } from "@/src/hooks/use-toast";
import { activationCodesService } from "@/src/services/activation-codes/activation-codes.service";
import { useDebounce } from "@repo/hooks";
import {
  formatDate,
  type ActivationCodeDetail,
  type ActivationCodeReportStatus,
} from "@repo/shared";
import { PERMISSIONS } from "@repo/shared/constants";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableScroll,
} from "@repo/ui";
import { PaginationControls } from "@repo/ui/pagination-controls";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  MoreHorizontal,
  ShieldOff,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ACTIVATION_CODE_BATCH_STATUSES } from "./activation-code-batches.constants";

const PAGE_SIZE = 10;

export function ActivationCodeDetailView({ batchId }: { batchId: string }) {
  const t = useTranslations("ActivationCodeDetail");
  const locale = useLocale();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const canRevoke = hasPermission(PERMISSIONS.ACTIVATION_CODE_BATCH_REVOKE);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ActivationCodeReportStatus | "">("");
  const [revokeTarget, setRevokeTarget] = useState<ActivationCodeDetail | null>(
    null,
  );
  const [replaceTarget, setReplaceTarget] =
    useState<ActivationCodeDetail | null>(null);
  const [replacementCode, setReplacementCode] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 300);
  const query = useQuery({
    placeholderData: (previous) => previous,
    queryFn: () =>
      activationCodesService.listCodes(batchId, {
        limit: PAGE_SIZE,
        page,
        search: debouncedSearch || undefined,
        status: status || undefined,
      }),
    queryKey: [
      "activation-code-detail",
      batchId,
      { page, search: debouncedSearch, status },
    ],
  });
  const revokeMutation = useMutation({
    mutationFn: (codeId: string) => activationCodesService.revokeCode(codeId),
    onError: () => toast.error(t("revokeError")),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["activation-code-detail", batchId],
      });
      setRevokeTarget(null);
      toast.success(t("revoked"));
    },
  });
  const replaceMutation = useMutation({
    mutationFn: () =>
      activationCodesService.replaceCode(
        replaceTarget!.id,
        replacementCode.trim(),
      ),
    onError: () => toast.error(t("replaceError")),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["activation-code-detail", batchId],
      });
      setReplaceTarget(null);
      setReplacementCode("");
      toast.success(t("replaced"));
    },
  });
  const statusOptions = useMemo(
    () => [
      { label: t("allStatuses"), value: "" },
      ...ACTIVATION_CODE_BATCH_STATUSES.map((value) => ({
        label: t(`statuses.${value}`),
        value,
      })),
    ],
    [t],
  );
  const data = query.data;

  return (
    <PermissionGuard permissions={[PERMISSIONS.ACTIVATION_CODE_BATCH_VIEW]}>
      <FormPageShell
        backHref="/activation-code-batches"
        backLabel={t("back")}
        description={t("description")}
        eyebrow={t("eyebrow")}
        maxWidthClassName="max-w-7xl"
        title={t("title")}
      >
        <Card>
          <CardHeader>
            <CardTitle>{t("directoryTitle")}</CardTitle>
            <CardDescription>{t("directoryDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_14rem]">
              <Input
                aria-label={t("searchLabel")}
                onChange={(event) => {
                  setPage(1);
                  setSearch(event.target.value);
                }}
                placeholder={t("searchPlaceholder")}
                value={search}
              />
              <SelectControl
                ariaLabel={t("statusLabel")}
                onValueChange={(value) => {
                  setPage(1);
                  setStatus(value as ActivationCodeReportStatus | "");
                }}
                options={statusOptions}
                value={status}
              />
            </div>

            {query.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: PAGE_SIZE }, (_, index) => (
                  <Skeleton className="h-12 w-full" key={index} />
                ))}
              </div>
            ) : query.isError ? (
              <StatePanel
                description={t("error")}
                icon={KeyRound}
                title={t("errorTitle")}
              />
            ) : data?.items.length ? (
              <>
                <ActivationCodesTable
                  canRevoke={canRevoke}
                  items={data.items}
                  locale={locale}
                  onCopy={(code) => {
                    if (!code.copyCode) return;
                    void navigator.clipboard
                      .writeText(code.copyCode)
                      .then(() => toast.success(t("copied")))
                      .catch(() => toast.error(t("copyError")));
                  }}
                  onRevoke={setRevokeTarget}
                  onReplace={(code) => {
                    setReplacementCode("");
                    setReplaceTarget(code);
                  }}
                  t={t}
                />
                <PaginationControls
                  nextLabel={t("next")}
                  onPageChange={setPage}
                  page={data.meta.page}
                  pageSize={PAGE_SIZE}
                  previousLabel={t("previous")}
                  summary={t("pagination", {
                    page: data.meta.page,
                    total: data.meta.total,
                    totalPages: Math.max(data.meta.totalPages, 1),
                  })}
                  totalPages={data.meta.totalPages}
                />
              </>
            ) : (
              <StatePanel
                description={t("empty")}
                icon={KeyRound}
                title={t("emptyTitle")}
              />
            )}
          </CardContent>
        </Card>

        <ConfirmActionDialog
          cancelLabel={t("cancel")}
          confirmLabel={t("revoke")}
          description={t("revokeConfirm", {
            code: revokeTarget?.maskedCode ?? "",
          })}
          isLoading={revokeMutation.isPending}
          onConfirm={() => {
            if (revokeTarget) revokeMutation.mutate(revokeTarget.id);
          }}
          onOpenChange={(open) => {
            if (!open && !revokeMutation.isPending) setRevokeTarget(null);
          }}
          open={Boolean(revokeTarget)}
          title={t("revokeTitle")}
          variant="destructive"
        />
        {replaceTarget ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            role="dialog"
            aria-modal="true"
          >
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-slate-900">
              <h2 className="text-lg font-semibold">{t("replaceTitle")}</h2>
              <p className="mt-2 text-sm text-slate-500">
                {t("replaceDescription", { code: replaceTarget.maskedCode })}
              </p>
              <Input
                className="mt-4"
                value={replacementCode}
                onChange={(e) => setReplacementCode(e.target.value)}
                placeholder={t("replacementCodePlaceholder")}
                aria-label={t("replacementCode")}
              />
              <div className="mt-5 flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setReplaceTarget(null)}
                >
                  {t("cancel")}
                </Button>
                <Button
                  disabled={
                    !replacementCode.trim() || replaceMutation.isPending
                  }
                  onClick={() => replaceMutation.mutate()}
                >
                  {t("replace")}
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </FormPageShell>
    </PermissionGuard>
  );
}

function ActivationCodesTable({
  canRevoke,
  items,
  locale,
  onCopy,
  onRevoke,
  onReplace,
  t,
}: {
  canRevoke: boolean;
  items: ActivationCodeDetail[];
  locale: string;
  onCopy: (code: ActivationCodeDetail) => void;
  onRevoke: (code: ActivationCodeDetail) => void;
  onReplace: (code: ActivationCodeDetail) => void;
  t: ReturnType<typeof useTranslations<"ActivationCodeDetail">>;
}) {
  const [revealedCodeId, setRevealedCodeId] = useState<string | null>(null);

  return (
    <TableScroll className="rounded-md border border-slate-200 dark:border-slate-800">
      <Table className="min-w-[850px]">
        <TableHeader>
          <TableRow>
            <TableHead>{t("columns.code")}</TableHead>
            <TableHead>{t("columns.status")}</TableHead>
            <TableHead>{t("columns.createdAt")}</TableHead>
            <TableHead>{t("columns.expiresAt")}</TableHead>
            <TableHead>{t("columns.activatedAt")}</TableHead>
            <TableHead aria-label={t("columns.actions")} />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">
                <div className="group/code flex min-w-[12rem] items-center gap-1">
                  <span className="font-mono tabular-nums">
                    {revealedCodeId === item.id && item.copyCode
                      ? item.copyCode
                      : item.maskedCode}
                  </span>
                  {item.copyCode ? (
                    <Button
                      aria-label={
                        revealedCodeId === item.id
                          ? t("hideCodeAria", { code: item.maskedCode })
                          : t("revealCodeAria", { code: item.maskedCode })
                      }
                      className="size-8 opacity-100 transition-opacity md:opacity-0 md:group-hover/code:opacity-100 md:focus-visible:opacity-100"
                      onClick={() =>
                        setRevealedCodeId((current) =>
                          current === item.id ? null : item.id,
                        )
                      }
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      {revealedCodeId === item.id ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </Button>
                  ) : null}
                </div>
              </TableCell>
              <TableCell>
                <span className="rounded bg-slate-100 px-2 py-1 text-xs dark:bg-slate-800">
                  {t(`statuses.${item.status}`)}
                </span>
                {item.replacedBy ? (
                  <div className="mt-1 text-xs text-slate-500">
                    {t("replacedBy", { code: item.replacedBy.maskedCode })}
                  </div>
                ) : null}
                {item.replaces ? (
                  <div className="mt-1 text-xs text-slate-500">
                    {t("replaces", { code: item.replaces.maskedCode })}
                  </div>
                ) : null}
              </TableCell>
              <TableCell>{formatDate(item.createdAt, { locale })}</TableCell>
              <TableCell>{formatDate(item.expiresAt, { locale })}</TableCell>
              <TableCell>
                {item.activatedAt
                  ? formatDate(item.activatedAt, { locale })
                  : "—"}
              </TableCell>
              <TableCell className="text-right">
                {item.copyCode ||
                (canRevoke && item.status === "EXPIRED" && !item.replacedBy) ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        aria-label={t("openActions", { code: item.maskedCode })}
                        size="icon"
                        variant="ghost"
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {item.copyCode ? (
                        <>
                          <DropdownMenuItem
                            onSelect={() =>
                              setRevealedCodeId((current) =>
                                current === item.id ? null : item.id,
                              )
                            }
                          >
                            {revealedCodeId === item.id ? (
                              <EyeOff className="mr-2 size-4" />
                            ) : (
                              <Eye className="mr-2 size-4" />
                            )}
                            {revealedCodeId === item.id
                              ? t("hideCode")
                              : t("revealCode")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => onCopy(item)}>
                            <Copy className="mr-2 size-4" />
                            {t("copy")}
                          </DropdownMenuItem>
                        </>
                      ) : null}
                      {canRevoke ? (
                        item.status === "EXPIRED" && !item.replacedBy ? (
                          <DropdownMenuItem onSelect={() => onReplace(item)}>
                            <KeyRound className="mr-2 size-4" />
                            {t("replace")}
                          </DropdownMenuItem>
                        ) : null
                      ) : null}
                      {canRevoke && item.status === "AVAILABLE" ? (
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-700 dark:text-red-400"
                          onSelect={() => onRevoke(item)}
                        >
                          <ShieldOff className="mr-2 size-4" />
                          {t("revoke")}
                        </DropdownMenuItem>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableScroll>
  );
}
