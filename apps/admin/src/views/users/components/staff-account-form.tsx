"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm, type UseFormSetError } from "react-hook-form";
import {
  HttpClientError,
  type CreateModeratorBody,
  type UpdateModeratorBody,
  updateModeratorSchema,
  type UpdateModeratorInput,
  type UserAccountSummary,
} from "@repo/shared";
import { Button, Input, Label } from "@repo/ui";
import { usersService } from "@/src/services/users.service";
import { useToast } from "@/src/hooks/use-toast";

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
  const toast = useToast();
  const creating = !user;
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<UpdateModeratorInput>({
    resolver: zodResolver(updateModeratorSchema),
    defaultValues: {
      email: "",
      fullName: "",
      password: "",
      phone: "",
      status: "ACTIVE",
      username: "",
    },
  });

  useEffect(() => {
    reset({
      email: user?.email ?? "",
      fullName: user?.fullName ?? "",
      password: "",
      phone: user?.phone ?? "",
      status: user?.status ?? "ACTIVE",
      username: user?.username ?? "",
    });
  }, [reset, user]);

  async function submit(values: UpdateModeratorInput) {
    try {
      if (creating) {
        const result = await usersService.createModerator(
          toCreateModeratorBody(values),
        );

        toast.success(t("created"));
        onSaved(result.user, true, result.temporaryPassword);
        return;
      }

      const result = await usersService.updateModerator(
        user.id,
        toUpdateModeratorBody(values),
      );

      toast.success(t("updated"));
      onSaved(result, false);
    } catch (error) {
      const duplicateMessage = handleDuplicateAccountError(error, setError, t);
      if (duplicateMessage) {
        toast.error(duplicateMessage);
        return;
      }

      const message =
        error instanceof HttpClientError ? error.message : t("saveError");
      setError("root", {
        message,
      });
      toast.error(message);
    }
  }

  return (
    <form className="space-y-6" noValidate onSubmit={handleSubmit(submit)}>
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

function toCreateModeratorBody(
  values: UpdateModeratorInput,
): CreateModeratorBody {
  return {
    email: values.email.trim(),
    full_name: values.fullName.trim(),
    phone: values.phone?.trim() || undefined,
    role: "MODERATOR",
    status: "ACTIVE",
    username: values.username.trim(),
  };
}

function toUpdateModeratorBody(
  values: UpdateModeratorInput,
): UpdateModeratorBody {
  return {
    email: values.email.trim(),
    full_name: values.fullName.trim(),
    password: values.password || undefined,
    phone: values.phone?.trim() || null,
    status: values.status,
    username: values.username.trim(),
  };
}

function handleDuplicateAccountError(
  error: unknown,
  setError: UseFormSetError<UpdateModeratorInput>,
  t: (key: string) => string,
) {
  if (
    !(error instanceof HttpClientError) ||
    error.code !== "USER_ACCOUNT_EXISTS"
  ) {
    return null;
  }

  const duplicateFields = getDuplicateFields(error);
  const message = getDuplicateAccountMessage(duplicateFields, t);

  if (duplicateFields.includes("email")) {
    setError("email", { message: t("duplicateEmail") });
  }
  if (duplicateFields.includes("username")) {
    setError("username", { message: t("duplicateUsername") });
  }
  if (duplicateFields.includes("phone")) {
    setError("phone", { message: t("duplicatePhone") });
  }
  if (duplicateFields.length === 0) {
    setError("root", { message });
  }

  return message;
}

function getDuplicateAccountMessage(
  duplicateFields: string[],
  t: (key: string) => string,
) {
  if (duplicateFields.includes("email")) return t("duplicateEmail");
  if (duplicateFields.includes("username")) return t("duplicateUsername");
  if (duplicateFields.includes("phone")) return t("duplicatePhone");

  return t("duplicateAccount");
}

function getDuplicateFields(error: HttpClientError): string[] {
  if (
    !error.details ||
    typeof error.details !== "object" ||
    !("fields" in error.details)
  ) {
    return [];
  }

  const fields = error.details.fields;
  return Array.isArray(fields)
    ? fields.filter((field): field is string => typeof field === "string")
    : [];
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
