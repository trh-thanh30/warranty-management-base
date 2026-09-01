"use client";

import { useRef } from "react";
import { Camera, Loader2, SlidersHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from "@repo/ui";
import { FormField } from "@/src/components/common/form-field";
import { getInitials } from "@/src/utils/get-initials";
import { useSettingsForm } from "../hooks/use-settings-form";

export function SettingsProfileSection() {
  const t = useTranslations("Settings");
  const {
    user,
    uploadingAvatar,
    profileForm,
    updateProfileMutation,
    handleAvatarUpload,
    onProfileSubmit,
  } = useSettingsForm();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const displayName = user?.full_name || user?.username || "Admin";
  const avatarFallback = getInitials(displayName);

  const triggerFileInput = () => fileInputRef.current?.click();
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) void handleAvatarUpload(file);
  };

  return (
    <form onSubmit={onProfileSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            {t("profile.title")}
          </CardTitle>
          <CardDescription>{t("profile.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-4 border-b border-slate-100 pb-6 dark:border-slate-800 sm:flex-row sm:gap-6">
            <button
              aria-label={t("profile.uploadAvatar")}
              className="group relative size-20 shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:focus-visible:ring-slate-300"
              onClick={triggerFileInput}
              type="button"
            >
              <Avatar className="h-20 w-20 border-2 border-slate-200 transition-opacity hover:opacity-90 dark:border-slate-800">
                {user?.avatar_url ? (
                  <AvatarImage alt={displayName} src={user.avatar_url} />
                ) : null}
                <AvatarFallback className="text-xl font-semibold">
                  {avatarFallback}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                <Camera aria-hidden="true" className="h-5 w-5 text-white" />
              </div>
            </button>
            <div className="w-full space-y-1 text-center sm:w-auto sm:text-left">
              <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {t("profile.avatar")}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t("profile.avatarHelp")}
              </p>
              <div className="pt-1">
                <Button
                  className="h-11 w-full sm:h-9 sm:w-auto"
                  disabled={uploadingAvatar}
                  onClick={triggerFileInput}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  {uploadingAvatar ? (
                    <Loader2
                      aria-hidden="true"
                      className="mr-2 h-3.5 w-3.5 animate-spin"
                    />
                  ) : (
                    <Camera aria-hidden="true" className="mr-2 h-3.5 w-3.5" />
                  )}
                  {uploadingAvatar
                    ? t("profile.uploading")
                    : t("profile.uploadAvatar")}
                </Button>
              </div>
            </div>
            <input
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              disabled={uploadingAvatar}
              onChange={handleFileChange}
              ref={fileInputRef}
              type="file"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <ProfileInput
              form={profileForm}
              field="fullName"
              id="profile-fullname"
              label={t("profile.fullName")}
              placeholder={t("profile.fullNamePlaceholder")}
              translate={t}
            />
            <ProfileInput
              form={profileForm}
              field="phone"
              id="profile-phone"
              inputMode="tel"
              label={t("profile.phone")}
              placeholder={t("profile.phonePlaceholder")}
              translate={t}
            />
            <ProfileInput
              form={profileForm}
              field="username"
              id="profile-username"
              label={t("profile.username")}
              translate={t}
            />
            <ProfileInput
              form={profileForm}
              field="email"
              id="profile-email"
              label={t("profile.email")}
              type="email"
              translate={t}
            />
          </div>
        </CardContent>
        <div className="flex justify-end border-t border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/10">
          <Button
            className="h-11 w-full sm:h-10 sm:w-auto"
            disabled={
              updateProfileMutation.isPending || !profileForm.formState.isDirty
            }
            type="submit"
          >
            {updateProfileMutation.isPending ? (
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

function ProfileInput({
  form,
  field,
  id,
  label,
  placeholder,
  translate,
  type = "text",
  inputMode,
}: {
  form: ReturnType<typeof useSettingsForm>["profileForm"];
  field: "fullName" | "phone" | "username" | "email";
  id: string;
  label: string;
  placeholder?: string;
  translate: (key: string) => string;
  type?: string;
  inputMode?: "tel";
}) {
  const error = form.formState.errors[field]?.message;
  return (
    <FormField
      error={error ? translate(`profile.${error}`) : undefined}
      htmlFor={id}
      label={label}
    >
      <Input
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={Boolean(error)}
        autoComplete={
          field === "fullName"
            ? "name"
            : field === "phone"
              ? "tel"
              : field === "username"
                ? "username"
                : "email"
        }
        className="h-11 text-base sm:h-10 sm:text-sm"
        id={id}
        inputMode={inputMode}
        placeholder={placeholder}
        type={type}
        {...form.register(field)}
      />
    </FormField>
  );
}
