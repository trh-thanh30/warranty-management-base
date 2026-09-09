"use client";

import { useEffect, useState } from "react";
import { CircleAlert, Loader2, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { PERMISSIONS } from "@repo/shared/constants";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Skeleton,
} from "@repo/ui";
import { FormField } from "@/src/components/common/form-field";
import { StatePanel } from "@/src/components/common/state-panel";
import { usePermissions } from "@/src/hooks/use-permissions";
import { useToast } from "@/src/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { systemConfigService } from "@/src/services/system-config/system-config.service";

export function ActivationCodePolicySettings() {
  const t = useTranslations("Settings.activationCodePolicy");
  const toast = useToast();
  const { hasPermission } = usePermissions();
  const canView = hasPermission(PERMISSIONS.SYSTEM_CONFIG_VIEW);
  const canUpdate = hasPermission(PERMISSIONS.SYSTEM_CONFIG_UPDATE);
  const queryClient = useQueryClient();
  const [expiryMonths, setExpiryMonths] = useState(6);
  const [defaultBatchQuantity, setDefaultBatchQuantity] = useState(50);
  const query = useQuery({
    enabled: canView,
    queryFn: systemConfigService.getActivationCodePolicy,
    queryKey: ["system-config", "activation-code-policy"],
  });

  useEffect(() => {
    if (!query.data) return;
    setExpiryMonths(query.data.expiryMonths);
    setDefaultBatchQuantity(query.data.defaultBatchQuantity);
  }, [query.data]);

  const mutation = useMutation({
    mutationFn: () =>
      systemConfigService.updateActivationCodePolicy({
        defaultBatchQuantity,
        expiryMonths,
      }),
    onSuccess: (policy) => {
      queryClient.setQueryData(
        ["system-config", "activation-code-policy"],
        policy,
      );
      toast.success(t("saveSuccess"));
    },
    onError: () => toast.error(t("saveError")),
  });

  if (!canView) return null;
  if (query.isPending) {
    return (
      <Card>
        <CardContent className="space-y-4 p-5">
          <Skeleton className="h-5 w-64" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }
  if (query.isError || !query.data) {
    return (
      <StatePanel
        action={
          <Button onClick={() => void query.refetch()} size="sm">
            {t("retry")}
          </Button>
        }
        description={t("errorDescription")}
        icon={ShieldCheck}
        title={t("errorTitle")}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="size-4" />
          {t("title")}
        </CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          mutation.mutate();
        }}
      >
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FormField
            htmlFor="activation-policy-expiry"
            label={t("expiryMonths")}
          >
            <Input
              disabled={!canUpdate}
              id="activation-policy-expiry"
              max={120}
              min={1}
              onChange={(event) => setExpiryMonths(Number(event.target.value))}
              type="number"
              value={expiryMonths}
            />
            <div className="mt-2 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-5 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              <CircleAlert
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0"
              />
              <p>{t("expirySyncDescription")}</p>
            </div>
          </FormField>
          <FormField
            htmlFor="activation-policy-quantity"
            label={t("defaultBatchQuantity")}
          >
            <Input
              disabled={!canUpdate}
              id="activation-policy-quantity"
              max={1000}
              min={50}
              onChange={(event) =>
                setDefaultBatchQuantity(Number(event.target.value))
              }
              type="number"
              value={defaultBatchQuantity}
            />
          </FormField>
        </CardContent>
        {canUpdate ? (
          <div className="flex justify-end border-t border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/10">
            <Button disabled={mutation.isPending} type="submit">
              {mutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              {mutation.isPending ? t("saving") : t("save")}
            </Button>
          </div>
        ) : null}
      </form>
    </Card>
  );
}
