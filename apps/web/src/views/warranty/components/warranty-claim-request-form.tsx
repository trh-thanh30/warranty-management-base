"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  isWarrantyClaimIssueOption,
  WARRANTY_CLAIM_ISSUE_OPTIONS,
} from "@repo/shared/constants";
import type {
  CreateWarrantyClaimBody,
  PublicWarrantyClaimSummary,
  WarrantyClaimIssueOption,
} from "@repo/shared";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import { Textarea } from "@repo/ui/textarea";
import { Dropzone } from "@repo/ui/dropzone";
import { Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/common/form";
import { formControlFocusClassName } from "@/src/components/common/form-control.constants";
import {
  isTurnstileEnabled,
  TurnstileWidget,
} from "@/src/components/common/turnstile-widget";
import {
  getWarrantyClaimRequestErrorKind,
  type WarrantyClaimRequestErrorKind,
} from "@/src/hooks/use-warranty-claim-request";
import {
  createWarrantyClaimRequestFormSchema,
  type WarrantyClaimRequestFormValues,
} from "../warranty-claim-request-form.schema";
import { toWarrantyClaimRequestBody } from "../warranty-claim-request.utils";
import { WARRANTY_CLAIM_EVIDENCE_ACCEPT } from "../warranty-claim-evidence.constants";

type WarrantyClaimRequestFormProps = {
  errorKind: WarrantyClaimRequestErrorKind | null;
  isPending: boolean;
  onResetError: () => void;
  onSubmit: (
    body: CreateWarrantyClaimBody,
    attachments: File[],
    turnstileToken?: string,
  ) => Promise<PublicWarrantyClaimSummary>;
};

export function WarrantyClaimRequestForm({
  errorKind,
  isPending,
  onResetError,
  onSubmit,
}: WarrantyClaimRequestFormProps) {
  const t = useTranslations("Warranty.request");
  const schema = useMemo(
    () =>
      createWarrantyClaimRequestFormSchema({
        detailsInvalid: t("validation.detailsInvalid"),
        evidenceInvalid: t("validation.evidenceInvalid"),
        evidenceRequired: t("validation.evidenceRequired"),
        evidenceTooLarge: t("validation.evidenceTooLarge"),
        issueRequired: t("validation.issueRequired"),
        nameInvalid: t("validation.nameInvalid"),
        phoneInvalid: t("validation.phoneInvalid"),
        warrantyCodeInvalid: t("validation.warrantyCodeInvalid"),
      }),
    [t],
  );
  const form = useForm<WarrantyClaimRequestFormValues>({
    defaultValues: {
      attachments: [],
      issue: undefined,
      issueDetail: "",
      requesterName: "",
      requesterPhone: "",
      warrantyCode: "",
    },
    resolver: zodResolver(schema),
  });
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const issueTitles = {
    bubble: t("fields.issue.options.bubble"),
    connectionFailure: t("fields.issue.options.connectionFailure"),
    fade: t("fields.issue.options.fade"),
    inaccurateReading: t("fields.issue.options.inaccurateReading"),
    intermittentOperation: t("fields.issue.options.intermittentOperation"),
    lowSensorBattery: t("fields.issue.options.lowSensorBattery"),
    moisture: t("fields.issue.options.moisture"),
    noPower: t("fields.issue.options.noPower"),
    noRecording: t("fields.issue.options.noRecording"),
    other: t("fields.issue.options.other"),
    poorVideoQuality: t("fields.issue.options.poorVideoQuality"),
    scratch: t("fields.issue.options.scratch"),
    storageFailure: t("fields.issue.options.storageFailure"),
    weakOrWrongLight: t("fields.issue.options.weakOrWrongLight"),
  } satisfies Record<WarrantyClaimIssueOption, string>;

  useEffect(() => {
    const subscription = form.watch(() => {
      if (errorKind) onResetError();
    });

    return () => subscription.unsubscribe();
  }, [errorKind, form, onResetError]);

  const handleSubmit = async (values: WarrantyClaimRequestFormValues) => {
    try {
      await onSubmit(
        toWarrantyClaimRequestBody(values, issueTitles),
        values.attachments,
        turnstileToken ?? undefined,
      );
      toast.success(t("success.title"));
      form.reset();
      setTurnstileToken(null);
    } catch (error) {
      setTurnstileResetKey((value) => value + 1);
      toast.error(t(`errors.${getWarrantyClaimRequestErrorKind(error)}`));
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="requesterName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold uppercase text-deep-black">
                  {t("fields.customerName.label")}
                </FormLabel>
                <FormControl>
                  <Input
                    autoComplete="name"
                    className={`h-12 rounded-md border-border-gray bg-white ${formControlFocusClassName}`}
                    maxLength={255}
                    placeholder={t("fields.customerName.placeholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="requesterPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold uppercase text-deep-black">
                  {t("fields.phone.label")}
                </FormLabel>
                <FormControl>
                  <Input
                    autoComplete="tel"
                    className={`h-12 rounded-md border-border-gray bg-white ${formControlFocusClassName}`}
                    inputMode="tel"
                    maxLength={32}
                    placeholder={t("fields.phone.placeholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="warrantyCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold uppercase text-deep-black">
                  {t("fields.reference.label")}
                </FormLabel>
                <FormControl>
                  <Input
                    autoComplete="off"
                    className={`h-12 rounded-md border-border-gray bg-white font-mono uppercase ${formControlFocusClassName}`}
                    maxLength={64}
                    placeholder={t("fields.reference.placeholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="issue"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold uppercase text-deep-black">
                  {t("fields.issue.label")}
                </FormLabel>
                <Select
                  onValueChange={(value) => {
                    if (isWarrantyClaimIssueOption(value)) {
                      field.onChange(value);
                    }
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger
                      className={`h-12 rounded-md border-border-gray bg-white ${formControlFocusClassName}`}
                    >
                      <SelectValue
                        placeholder={t("fields.issue.placeholder")}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {WARRANTY_CLAIM_ISSUE_OPTIONS.map((issue) => (
                      <SelectItem key={issue} value={issue}>
                        {issueTitles[issue]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="issueDetail"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel className="text-sm font-semibold uppercase text-deep-black">
                  {t("fields.details.label")}
                </FormLabel>
                <FormControl>
                  <Textarea
                    className={`min-h-32 resize-y rounded-md border-border-gray bg-white ${formControlFocusClassName}`}
                    maxLength={4000}
                    placeholder={t("fields.details.placeholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="attachments"
            render={({ field }) => (
              <FormItem className="min-w-0 sm:col-span-2">
                <FormLabel className="text-sm font-semibold uppercase text-deep-black">
                  {t("fields.evidence.label")}
                </FormLabel>
                <FormControl>
                  <Dropzone
                    accept={WARRANTY_CLAIM_EVIDENCE_ACCEPT}
                    chooseLabel={t("fields.evidence.choose")}
                    disabled={isPending}
                    files={field.value}
                    hint={t("fields.evidence.hint")}
                    id="warranty-claim-evidence"
                    onFilesChange={field.onChange}
                    previewFileLabel={(name) =>
                      t("fields.evidence.preview", { name })
                    }
                    closePreviewLabel={t("fields.evidence.closePreview")}
                    removeFileLabel={(name) =>
                      t("fields.evidence.remove", { name })
                    }
                    selectedFilesLabel={t("fields.evidence.selectedFiles")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <TurnstileWidget
          onTokenChange={setTurnstileToken}
          resetKey={turnstileResetKey}
        />

        <Button
          className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-premium-red text-sm font-semibold uppercase text-white shadow-md transition-colors hover:bg-warm-red"
          disabled={
            isPending || (isTurnstileEnabled && turnstileToken === null)
          }
          type="submit"
        >
          <span>{isPending ? t("submitting") : t("submit")}</span>
          <Send className="size-4" aria-hidden="true" />
        </Button>

        {errorKind ? (
          <p role="alert" className="text-sm font-medium text-premium-red">
            {t(`errors.${errorKind}`)}
          </p>
        ) : null}
      </form>
    </Form>
  );
}
