"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Textarea } from "@repo/ui/textarea";
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
} from "../contact-form.schema";

export function ContactMessageForm() {
  const t = useTranslations("ContactPage");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const schema = useMemo(
    () =>
      createContactMessageSchema({
        contentMin: t("form.validation.contentMin"),
        fullNameMin: t("form.validation.fullNameMin"),
        phoneInvalid: t("form.validation.phoneInvalid"),
      }),
    [t],
  );

  const form = useForm<ContactMessageFormValues>({
    defaultValues: {
      content: "",
      fullName: "",
      phone: "",
    },
    resolver: zodResolver(schema),
  });

  const handleSubmit = () => {
    setIsSubmitted(true);
    form.reset();
  };

  if (isSubmitted) {
    return (
      <div className="p-8 rounded-md bg-surface-muted border border-premium-red/30 text-center space-y-4 animate-in zoom-in-95">
        <div className="size-16 bg-premium-red/10 text-premium-red rounded-md flex items-center justify-center mx-auto">
          <CheckCircle2 className="size-8" />
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
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold uppercase text-deep-black">
                  {t("form.fields.fullName.label")}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("form.fields.fullName.placeholder")}
                    className={`h-12 rounded-md bg-white border-border-gray ${formControlFocusClassName}`}
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
                <FormLabel className="text-xs font-semibold uppercase text-deep-black">
                  {t("form.fields.phone.label")}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("form.fields.phone.placeholder")}
                    className={`h-12 rounded-md bg-white border-border-gray ${formControlFocusClassName}`}
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
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold uppercase text-deep-black">
                {t("form.fields.content.label")}
              </FormLabel>
              <FormControl>
                <Textarea
                  rows={5}
                  placeholder={t("form.fields.content.placeholder")}
                  className={`min-h-[134px] rounded-md bg-white border-border-gray ${formControlFocusClassName}`}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="bg-premium-red hover:bg-warm-red text-white px-8 py-3.5 rounded-md text-xs font-medium uppercase tracking-wider transition-colors duration-300 shadow-md shadow-premium-red/20 cursor-pointer flex items-center justify-center gap-2"
        >
          <span>{t("form.submit")}</span>
          <Send className="size-4" />
        </Button>
      </form>
    </Form>
  );
}
