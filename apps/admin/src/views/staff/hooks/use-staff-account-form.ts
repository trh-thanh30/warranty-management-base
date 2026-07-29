"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { usersService } from "@/src/services/users/users.service";
import { useToast } from "@/src/hooks/use-toast";

export function useStaffAccountForm({
  onSaved,
  user,
}: {
  onSaved: (
    user: UserAccountSummary,
    created: boolean,
    temporaryPassword?: string,
  ) => void;
  user: UserAccountSummary | null;
}) {
  const t = useTranslations("Staff");
  const toast = useToast();
  const creating = !user;
  const {
    control,
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
      setError("root", { message });
      toast.error(message);
    }
  }

  return {
    control,
    creating,
    errors,
    isSubmitting,
    onSubmit: handleSubmit(submit),
    register,
  };
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

function getDuplicateFields(error: HttpClientError) {
  if (!error.details || typeof error.details !== "object") return [];
  const fields = (error.details as { fields?: unknown }).fields;
  return Array.isArray(fields)
    ? fields.filter((field): field is string => typeof field === "string")
    : [];
}
