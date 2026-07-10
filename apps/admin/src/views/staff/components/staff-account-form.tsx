"use client";

import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { UserAccountSummary } from "@repo/shared";
import { Button, Input, Label } from "@repo/ui";
import { useStaffAccountForm } from "../hooks/use-staff-account-form";

type StaffAccountFormProps = {
  onCancel: () => void;
  onSaved: (
    user: UserAccountSummary,
    created: boolean,
    temporaryPassword?: string,
  ) => void;
  user: UserAccountSummary | null;
};

export function StaffAccountForm({
  onCancel,
  onSaved,
  user,
}: StaffAccountFormProps) {
  const t = useTranslations("Staff");
  const { creating, errors, isSubmitting, onSubmit, register } =
    useStaffAccountForm({ onSaved, user });

  return (
    <form className="space-y-6" noValidate onSubmit={onSubmit}>
      {errors.root?.message ? (
        <div
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300"
          role="alert"
        >
          {errors.root.message}
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          error={errors.fullName?.message}
          id="staff-full-name"
          label={t("fullName")}
        >
          <Input
            id="staff-full-name"
            autoComplete="name"
            placeholder={t("fullNamePlaceholder")}
            {...register("fullName")}
          />
        </Field>
        <Field
          error={errors.username?.message}
          id="staff-username"
          label={t("username")}
        >
          <Input
            id="staff-username"
            autoComplete="username"
            placeholder={t("usernamePlaceholder")}
            {...register("username")}
          />
        </Field>
      </div>

      <Field error={errors.email?.message} id="staff-email" label={t("email")}>
        <Input
          id="staff-email"
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
          type="email"
          {...register("email")}
        />
      </Field>
      <Field error={errors.phone?.message} id="staff-phone" label={t("phone")}>
        <Input
          id="staff-phone"
          autoComplete="tel"
          placeholder={t("phonePlaceholder")}
          {...register("phone")}
        />
      </Field>
      {!creating ? (
        <Field
          error={errors.password?.message}
          id="staff-password"
          label={t("newPassword")}
        >
          <Input
            id="staff-password"
            autoComplete="new-password"
            placeholder={t("passwordUnchanged")}
            type="password"
            {...register("password")}
          />
        </Field>
      ) : null}

      {!creating ? (
        <Field id="staff-status" label={t("status")}>
          <select
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
            id="staff-status"
            {...register("status")}
          >
            <option value="ACTIVE">{t("active")}</option>
            <option value="INACTIVE">{t("inactive")}</option>
          </select>
        </Field>
      ) : null}

      <div className="grid grid-cols-2 gap-2 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex sm:justify-end">
        <Button
          className="w-full sm:w-auto"
          disabled={isSubmitting}
          onClick={onCancel}
          type="button"
          variant="secondary"
        >
          {t("cancel")}
        </Button>
        <Button
          className="w-full sm:w-auto"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : null}
          {creating ? t("create") : t("save")}
        </Button>
      </div>
    </form>
  );
}

function Field({
  children,
  error,
  id,
  label,
}: {
  children: ReactNode;
  error?: string;
  id: string;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}
    </div>
  );
}
