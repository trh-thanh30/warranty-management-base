"use client";

import { useEffect } from "react";
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
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Input,
  Label,
} from "@repo/ui";
import { usersService } from "@/src/services/users.service";
import { useToast } from "@/src/hooks/use-toast";

type StaffFormDialogProps = {
  onOpenChange: (open: boolean) => void;
  onSaved: (
    user: UserAccountSummary,
    created: boolean,
    temporaryPassword?: string,
  ) => void;
  open: boolean;
  user: UserAccountSummary | null;
};

export function StaffFormDialog({
  onOpenChange,
  onSaved,
  open,
  user,
}: StaffFormDialogProps) {
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
    if (!open) return;
    reset({
      email: user?.email ?? "",
      fullName: user?.fullName ?? "",
      password: "",
      phone: user?.phone ?? "",
      status: user?.status ?? "ACTIVE",
      username: user?.username ?? "",
    });
  }, [open, reset, user]);

  async function submit(values: UpdateModeratorInput) {
    try {
      if (creating) {
        const result = await usersService.createModerator(
          toCreateModeratorBody(values),
        );

        toast.success(t("created"));
        onOpenChange(false);
        onSaved(result.user, true, result.temporaryPassword);
        return;
      }

      const result = await usersService.updateModerator(
        user.id,
        toUpdateModeratorBody(values),
      );

      toast.success(t("updated"));
      onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-none overflow-y-auto p-0 sm:w-[min(calc(100vw-2rem),34rem)]">
        <form
          className="flex flex-col"
          noValidate
          onSubmit={handleSubmit(submit)}
        >
          <div className="shrink-0 border-b border-slate-200 px-4 py-4 dark:border-slate-800 sm:border-b-0 sm:px-6 sm:pb-0">
            <DialogTitle className="text-lg font-semibold sm:text-xl">
              {creating ? t("createTitle") : t("editTitle")}
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {creating ? t("createDescription") : t("editDescription")}
            </DialogDescription>
          </div>

          <div className="space-y-5 px-4 py-5 sm:px-6 sm:py-6">
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
                  {...register("username")}
                />
              </Field>
            </div>

            <Field
              error={errors.email?.message}
              id="staff-email"
              label={t("email")}
            >
              <Input
                id="staff-email"
                autoComplete="email"
                type="email"
                {...register("email")}
              />
            </Field>
            <Field
              error={errors.phone?.message}
              id="staff-phone"
              label={t("phone")}
            >
              <Input
                id="staff-phone"
                autoComplete="tel"
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
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950 sm:flex sm:justify-end sm:border-t-0 sm:px-6 sm:pb-6 sm:pt-0">
            <DialogClose asChild>
              <Button
                className="w-full sm:w-auto"
                disabled={isSubmitting}
                type="button"
                variant="secondary"
              >
                {t("cancel")}
              </Button>
            </DialogClose>
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
      </DialogContent>
    </Dialog>
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
  children: React.ReactNode;
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
