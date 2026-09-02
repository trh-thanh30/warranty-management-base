"use client";

import { useState } from "react";
import { Eye, EyeOff, Key, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from "@repo/ui";
import { FormField } from "@/src/components/common/form-field";
import { useSettingsForm } from "../hooks/use-settings-form";

export function SettingsSecuritySection() {
  const t = useTranslations("Settings");
  const { passwordForm, changePasswordMutation, onPasswordSubmit } =
    useSettingsForm();
  const [visiblePasswords, setVisiblePasswords] = useState({
    currentPassword: false,
    password: false,
    confirmPassword: false,
  });
  const togglePassword = (field: keyof typeof visiblePasswords) =>
    setVisiblePasswords((current) => ({
      ...current,
      [field]: !current[field],
    }));

  const renderPasswordField = (
    field: keyof typeof visiblePasswords,
    id: string,
    label: string,
    placeholder: string,
    autoComplete: "current-password" | "new-password",
  ) => {
    const error = passwordForm.formState.errors[field]?.message;
    const visible = visiblePasswords[field];
    return (
      <FormField
        error={error ? t(`security.${error}`) : undefined}
        htmlFor={id}
        label={label}
      >
        <div className="relative">
          <Input
            aria-describedby={error ? `${id}-error` : undefined}
            aria-invalid={Boolean(error)}
            autoComplete={autoComplete}
            className="h-11 pr-12 text-base sm:h-10 sm:text-sm"
            id={id}
            placeholder={placeholder}
            type={visible ? "text" : "password"}
            {...passwordForm.register(field)}
          />
          <button
            aria-label={t(
              visible ? "security.hidePassword" : "security.showPassword",
            )}
            aria-pressed={visible}
            className="absolute right-0 top-0 grid size-11 place-items-center rounded-md text-slate-500 outline-none hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-slate-950 dark:hover:text-slate-50 dark:focus-visible:ring-slate-300 sm:size-10"
            onClick={() => togglePassword(field)}
            type="button"
          >
            {visible ? (
              <EyeOff aria-hidden="true" className="size-4" />
            ) : (
              <Eye aria-hidden="true" className="size-4" />
            )}
          </button>
        </div>
      </FormField>
    );
  };

  return (
    <form onSubmit={onPasswordSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            {t("security.title")}
          </CardTitle>
          <CardDescription>{t("security.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderPasswordField(
            "currentPassword",
            "security-current-password",
            t("security.currentPassword"),
            t("security.currentPasswordPlaceholder"),
            "current-password",
          )}
          {renderPasswordField(
            "password",
            "security-new-password",
            t("security.newPassword"),
            t("security.newPasswordPlaceholder"),
            "new-password",
          )}
          {renderPasswordField(
            "confirmPassword",
            "security-confirm-password",
            t("security.confirmPassword"),
            t("security.confirmPasswordPlaceholder"),
            "new-password",
          )}
        </CardContent>
        <div className="flex justify-end border-t border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/10">
          <Button
            className="h-11 w-full sm:h-10 sm:w-auto"
            disabled={
              changePasswordMutation.isPending ||
              !passwordForm.formState.isDirty
            }
            type="submit"
          >
            {changePasswordMutation.isPending ? (
              <Loader2
                aria-hidden="true"
                className="mr-2 h-4 w-4 animate-spin"
              />
            ) : null}
            {t("save")}
          </Button>
        </div>
      </Card>
    </form>
  );
}
