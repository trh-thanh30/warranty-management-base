"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState, type WheelEvent } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { cn } from "@repo/ui/lib/utils";
import { Textarea } from "@repo/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import { HttpClientError } from "@repo/shared";
import {
  CONTACT_CONSULTATION_TOPICS,
  CONTACT_SUBMISSION_ERROR_CODES,
  CONTACT_SUBMISSION_LIMITS,
} from "@repo/shared/constants";
import { contactSubmissionsService } from "@/src/services/contact-submissions/contact-submissions.service";
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
  createContactMessageSchema,
  type ContactMessageFormValues,
} from "./contact-message-form.schema";
import { useVietnamProvinces } from "@/src/hooks/use-vietnam-provinces";

type ContactMessageFormProps = {
  loadLocations?: boolean;
  variant?: "page" | "quickChat";
};

export function ContactMessageForm({
  loadLocations = true,
  variant = "page",
}: ContactMessageFormProps) {
  const t = useTranslations("ContactPage");
  const isQuickChat = variant === "quickChat";
  const [isSubmitted, setIsSubmitted] = useState(false);
  const provincesQuery = useVietnamProvinces({ enabled: loadLocations });
  const submitErrorMessage = t("form.validation.submitError");
  const submittingLabel = t("form.submitting");
  const schema = useMemo(
    () =>
      createContactMessageSchema({
        consultationTopicRequired: t(
          "form.validation.consultationTopicRequired",
        ),
        contentMax: t("form.validation.contentMax"),
        contentMin: t("form.validation.contentMin"),
        fullNameMax: t("form.validation.fullNameMax"),
        fullNameMin: t("form.validation.fullNameMin"),
        phoneInvalid: t("form.validation.phoneInvalid"),
        provinceRequired: t("form.validation.provinceRequired"),
      }),
    [t],
  );

  const form = useForm<ContactMessageFormValues>({
    defaultValues: {
      content: "",
      fullName: "",
      phone: "",
      provinceCode: "",
    },
    resolver: zodResolver(schema),
  });

  const handleSubmit = async (values: ContactMessageFormValues) => {
    const selectedProvince = provincesQuery.data.find(
      (province) => String(province.code) === values.provinceCode,
    );

    if (!selectedProvince) {
      form.setError("provinceCode", {
        message: t("form.validation.provinceRequired"),
      });
      return;
    }

    try {
      await contactSubmissionsService.createContactSubmission({
        ...values,
        ...(variant === "page"
          ? {
              sourcePath:
                typeof window === "undefined"
                  ? "/contact"
                  : window.location.pathname,
            }
          : {}),
      });
      setIsSubmitted(true);
      form.reset();
    } catch (error) {
      if (
        error instanceof HttpClientError &&
        error.code === CONTACT_SUBMISSION_ERROR_CODES.PHONE_PENDING
      ) {
        form.setError(
          "phone",
          {
            message: t("form.validation.phonePending"),
          },
          { shouldFocus: true },
        );
        return;
      }

      if (error instanceof HttpClientError && error.status === 429) {
        form.setError("root", {
          message: t("form.validation.rateLimit"),
        });
        return;
      }

      form.setError("root", {
        message: submitErrorMessage,
      });
    }
  };

  if (isSubmitted) {
    return (
      <div
        className={cn(
          "animate-in space-y-4 rounded-md border border-premium-red/30 bg-surface-muted text-center zoom-in-95",
          isQuickChat ? "p-5" : "p-8",
        )}
      >
        <div
          className={cn(
            "mx-auto flex items-center justify-center rounded-md bg-premium-red/10 text-premium-red",
            isQuickChat ? "size-12" : "size-16",
          )}
        >
          <CheckCircle2 className={isQuickChat ? "size-6" : "size-8"} />
        </div>
        <h3 className="text-xl font-semibold uppercase text-deep-black">
          {t("form.success.title")}
        </h3>
        <p className="text-sm text-stone-gray font-medium">
          {t("form.success.description")}
        </p>
        <Button
          type="button"
          onClick={() => setIsSubmitted(false)}
          className="bg-deep-black hover:bg-premium-red text-white px-6 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
        >
          {t("form.success.reset")}
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        className={isQuickChat ? "space-y-4" : "space-y-5"}
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <div
          className={cn("grid", isQuickChat ? "gap-4" : "gap-5 sm:grid-cols-2")}
        >
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold uppercase text-deep-black">
                  {t("form.fields.fullName.label")}
                </FormLabel>
                <FormControl>
                  <Input
                    maxLength={CONTACT_SUBMISSION_LIMITS.fullName.max}
                    placeholder={t("form.fields.fullName.placeholder")}
                    className={`${isQuickChat ? "h-11" : "h-12"} rounded-md bg-white border-border-gray ${formControlFocusClassName}`}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold uppercase text-deep-black">
                  {t("form.fields.phone.label")}
                </FormLabel>
                <FormControl>
                  <Input
                    maxLength={CONTACT_SUBMISSION_LIMITS.phone.max}
                    placeholder={t("form.fields.phone.placeholder")}
                    className={`${isQuickChat ? "h-11" : "h-12"} rounded-md bg-white border-border-gray ${formControlFocusClassName}`}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="consultationTopic"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold uppercase text-deep-black">
                {t("form.fields.consultationTopic.label")}
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger
                    className={`${isQuickChat ? "h-11" : "h-12"} rounded-md bg-white border-border-gray ${formControlFocusClassName}`}
                  >
                    <SelectValue
                      placeholder={t(
                        "form.fields.consultationTopic.placeholder",
                      )}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className={isQuickChat ? "z-[70]" : undefined}>
                  {CONTACT_CONSULTATION_TOPICS.map((topic) => (
                    <SelectItem key={topic} value={topic}>
                      {t(`form.consultationTopics.${topic}`)}
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
          name="provinceCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold uppercase text-deep-black">
                {t("form.fields.province.label")}
              </FormLabel>
              <Select
                disabled={provincesQuery.isLoading || provincesQuery.isError}
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger
                    className={`${isQuickChat ? "h-11" : "h-12"} rounded-md bg-white border-border-gray ${formControlFocusClassName}`}
                  >
                    <SelectValue
                      placeholder={
                        provincesQuery.isLoading
                          ? t("form.fields.province.loading")
                          : t("form.fields.province.placeholder")
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent
                  className={isQuickChat ? "z-[70]" : undefined}
                  onWheelCapture={handleProvinceSelectWheel}
                  viewportClassName="h-auto max-h-72 overflow-y-auto"
                >
                  {provincesQuery.data.map((province) => (
                    <SelectItem
                      key={province.code}
                      value={String(province.code)}
                    >
                      {province.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {provincesQuery.isError ? (
                <div className="flex flex-wrap items-center gap-2 text-xs text-premium-red">
                  <span>{t("form.fields.province.loadError")}</span>
                  <button
                    className="font-semibold underline underline-offset-4"
                    onClick={() => {
                      void provincesQuery.refetch();
                    }}
                    type="button"
                  >
                    {t("form.fields.province.retry")}
                  </button>
                </div>
              ) : (
                <FormMessage />
              )}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold uppercase text-deep-black">
                {t("form.fields.content.label")}
              </FormLabel>
              <FormControl>
                <Textarea
                  maxLength={CONTACT_SUBMISSION_LIMITS.content.max}
                  rows={isQuickChat ? 3 : 5}
                  placeholder={t("form.fields.content.placeholder")}
                  className={`${isQuickChat ? "min-h-24" : "min-h-[134px]"} rounded-md bg-white border-border-gray ${formControlFocusClassName}`}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          disabled={form.formState.isSubmitting}
          type="submit"
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-md bg-premium-red px-8 py-3.5 text-xs font-medium uppercase tracking-wider text-white shadow-md shadow-premium-red/20 transition-colors duration-300 hover:bg-warm-red",
            !isQuickChat && "sm:w-auto",
          )}
        >
          <span>
            {form.formState.isSubmitting ? submittingLabel : t("form.submit")}
          </span>
          <Send className="size-4" />
        </Button>
        {form.formState.errors.root?.message ? (
          <p className="text-xs font-medium text-premium-red">
            {form.formState.errors.root.message}
          </p>
        ) : null}
      </form>
    </Form>
  );
}

function handleProvinceSelectWheel(event: WheelEvent<HTMLDivElement>) {
  const viewport = event.currentTarget.querySelector<HTMLElement>(
    "[data-radix-select-viewport]",
  );

  if (!viewport) return;

  viewport.scrollTop += event.deltaY;
  event.stopPropagation();
}
