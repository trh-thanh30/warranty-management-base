"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { cn } from "@repo/ui/lib/utils";
import { warrantyLookupExamples } from "@/src/constants/warranty.constants";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./form";
import { formControlFocusClassName } from "./form-control.constants";
import {
  createWarrantyLookupFormSchema,
  type WarrantyLookupFormValues,
} from "./warranty-lookup-form.schema";

type WarrantyLookupFormProps = {
  autoFocus?: boolean;
  initialValue?: string;
  isPending: boolean;
  onSubmit: (warrantyCode: string) => void;
  onValueChange: () => void;
  variant?: "modal" | "page";
};

export function WarrantyLookupForm({
  autoFocus = false,
  initialValue = "",
  isPending,
  onSubmit,
  onValueChange,
  variant = "page",
}: WarrantyLookupFormProps) {
  const t = useTranslations("WarrantyLookupForm");
  const isPage = variant === "page";
  const schema = useMemo(
    () =>
      createWarrantyLookupFormSchema({
        format: t("validation.format"),
        maxLength: t("validation.maxLength"),
        minLength: t("validation.minLength"),
        required: t("validation.required"),
      }),
    [t],
  );
  const form = useForm<WarrantyLookupFormValues>({
    defaultValues: {
      warrantyCode: initialValue,
    },
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    form.reset({ warrantyCode: initialValue });
  }, [form, initialValue]);

  const handleSubmit = ({ warrantyCode }: WarrantyLookupFormValues) => {
    onSubmit(warrantyCode);
  };

  return (
    <Form {...form}>
      <form
        className={isPage ? "space-y-4" : "space-y-3"}
        noValidate
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <div
          className={cn(
            "flex flex-col gap-3",
            isPage && "sm:flex-row sm:items-start",
          )}
        >
          <FormField
            control={form.control}
            name="warrantyCode"
            render={({ field }) => (
              <FormItem className="min-w-0 flex-1 space-y-1.5">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 z-10 size-5 -translate-y-1/2 text-stone-gray" />
                  <FormControl>
                    <Input
                      {...field}
                      aria-label={t("ariaLabel")}
                      autoComplete="off"
                      autoFocus={autoFocus}
                      disabled={isPending}
                      maxLength={64}
                      onChange={(event) => {
                        field.onChange(event);
                        onValueChange();
                      }}
                      placeholder={t("placeholder")}
                      type="text"
                      className={cn(
                        "border-border-gray bg-white pl-12 text-base aria-invalid:border-premium-red",
                        formControlFocusClassName,
                        isPage ? "h-14 rounded-md" : "h-12 rounded-xl sm:h-14",
                      )}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isPending}
            className={cn(
              "w-full shrink-0 cursor-pointer bg-premium-red font-semibold uppercase text-white shadow-md hover:bg-warm-red disabled:cursor-wait disabled:opacity-70 focus-visible:ring-premium-red",
              isPage
                ? "h-14 rounded-md px-8 text-base tracking-wider sm:w-auto"
                : "h-12 rounded-xl px-6 text-sm sm:h-14",
            )}
          >
            {isPending ? t("submitting") : t("submit")}
          </Button>
        </div>

        <p className="text-center text-xs font-medium text-stone-gray">
          {t("tryPrefix")}{" "}
          <code className="rounded-md bg-light-gray px-2 py-0.5 font-mono text-premium-red">
            {warrantyLookupExamples[0]}
          </code>{" "}
          {t("or")}{" "}
          <code className="rounded-md bg-light-gray px-2 py-0.5 font-mono text-premium-red">
            {warrantyLookupExamples[1]}
          </code>
        </p>
      </form>
    </Form>
  );
}
