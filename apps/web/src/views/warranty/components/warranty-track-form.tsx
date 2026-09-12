"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/src/components/common/form";
import { formControlFocusClassName } from "@/src/components/common/form-control.constants";
import { getWarrantyTrackingErrorKind } from "@/src/hooks/use-warranty-tracking";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { cn } from "@repo/ui/lib/utils";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  createWarrantyTrackFormSchema,
  type WarrantyTrackFormValues,
} from "../warranty-track-form.schema";

type WarrantyTrackFormProps = {
  initialValue?: string;
  isPending: boolean;
  onValueChange: () => void;
  onSubmit: (trackingCode: string) => Promise<unknown>;
};

export function WarrantyTrackForm({
  initialValue = "",
  isPending,
  onValueChange,
  onSubmit,
}: WarrantyTrackFormProps) {
  const t = useTranslations("Warranty.track");
  const schema = useMemo(
    () =>
      createWarrantyTrackFormSchema({
        trackingCodeInvalid: t("validation.trackingCodeInvalid"),
      }),
    [t],
  );
  const form = useForm<WarrantyTrackFormValues>({
    defaultValues: { trackingCode: initialValue },
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    form.reset({ trackingCode: initialValue });
  }, [form, initialValue]);

  const handleSubmit = async ({ trackingCode }: WarrantyTrackFormValues) => {
    try {
      await onSubmit(trackingCode);
    } catch (error) {
      toast.error(t(`errors.${getWarrantyTrackingErrorKind(error)}`));
    }
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start"
        noValidate
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <FormField
          control={form.control}
          name="trackingCode"
          render={({ field }) => (
            <FormItem className="min-w-0 flex-1 space-y-1.5">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-stone-gray" />
                <FormControl>
                  <Input
                    {...field}
                    aria-label={t("form.trackingCodeLabel")}
                    autoComplete="off"
                    className={cn(
                      "h-12 rounded-md border-border-gray bg-white pl-12 text-base uppercase aria-invalid:border-premium-red",
                      formControlFocusClassName,
                    )}
                    disabled={isPending}
                    maxLength={32}
                    onChange={(event) => {
                      field.onChange(event);
                      onValueChange();
                    }}
                    placeholder={t("form.placeholder")}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          className="h-12 w-full rounded-md bg-premium-red px-7 font-semibold uppercase text-white hover:bg-warm-red focus-visible:ring-premium-red sm:w-auto"
          disabled={isPending}
          type="submit"
        >
          {isPending ? t("form.submitting") : t("form.submit")}
        </Button>
        <p className="text-sm text-stone-gray sm:basis-full">
          {t("form.help")}
        </p>
      </form>
    </Form>
  );
}
