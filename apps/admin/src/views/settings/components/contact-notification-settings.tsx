"use client";

import { useEffect, useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
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
import { systemConfigService } from "@/src/services/system-config/system-config.service";

const queryKey = ["system-config", "contact-notification-settings"];
const emailSchema = z.string().trim().email().max(160);

export function ContactNotificationSettings() {
  const t = useTranslations("Settings.contactNotification");
  const toast = useToast();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const canView = hasPermission(PERMISSIONS.SYSTEM_CONFIG_VIEW);
  const canUpdate = hasPermission(PERMISSIONS.SYSTEM_CONFIG_UPDATE);
  const [email, setEmail] = useState("");
  const [showValidation, setShowValidation] = useState(false);
  const query = useQuery({
    enabled: canView,
    queryFn: systemConfigService.getContactNotificationSettings,
    queryKey,
  });

  useEffect(() => {
    if (query.data) setEmail(query.data.email);
  }, [query.data]);

  const parsedEmail = emailSchema.safeParse(email);
  const emailError =
    showValidation && !parsedEmail.success ? t("emailInvalid") : undefined;
  const mutation = useMutation({
    mutationFn: (value: string) =>
      systemConfigService.updateContactNotificationSettings({ email: value }),
    onSuccess: (settings) => {
      queryClient.setQueryData(queryKey, settings);
      setEmail(settings.email);
      setShowValidation(false);
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
        icon={Mail}
        title={t("errorTitle")}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail aria-hidden="true" className="size-4" />
          {t("title")}
        </CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          setShowValidation(true);
          if (parsedEmail.success && canUpdate)
            mutation.mutate(parsedEmail.data);
        }}
      >
        <CardContent className="space-y-4">
          <FormField
            description={t("emailHelp")}
            error={emailError}
            htmlFor="contact-notification-email"
            label={t("emailLabel")}
          >
            <Input
              aria-describedby={
                emailError ? "contact-notification-email-error" : undefined
              }
              aria-invalid={Boolean(emailError)}
              autoComplete="email"
              disabled={!canUpdate || mutation.isPending}
              id="contact-notification-email"
              maxLength={160}
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </FormField>
        </CardContent>
        {canUpdate ? (
          <div className="flex justify-end border-t border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/10">
            <Button
              disabled={mutation.isPending || email.trim() === query.data.email}
              type="submit"
            >
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
