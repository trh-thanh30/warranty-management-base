"use client";

import { useRef, useState } from "react";
import {
  Camera,
  Eye,
  EyeOff,
  Key,
  Loader2,
  Shield,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from "@repo/ui";
import { FormField } from "@/src/components/common/form-field";
import { PageHeader } from "@/src/components/common/page-header";
import { getInitials } from "@/src/utils/get-initials";
import { useSettingsForm } from "./hooks/use-settings-form";
import { groupPermissions } from "./settings.utils";
import type { SettingsSection } from "./settings.types";

export function SettingsView({ section }: { section: SettingsSection }) {
  const t = useTranslations("Settings");
  const {
    user,
    uploadingAvatar,
    profileForm,
    passwordForm,
    updateProfileMutation,
    changePasswordMutation,
    handleAvatarUpload,
    onProfileSubmit,
    onPasswordSubmit,
  } = useSettingsForm();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [visiblePasswords, setVisiblePasswords] = useState({
    currentPassword: false,
    password: false,
    confirmPassword: false,
  });

  const displayName = user?.full_name || user?.username || "Admin";
  const avatarFallback = getInitials(displayName);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) {
      void handleAvatarUpload(file);
    }
  };

  const togglePassword = (field: keyof typeof visiblePasswords) => {
    setVisiblePasswords((current) => ({
      ...current,
      [field]: !current[field],
    }));
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        description={t("description")}
        eyebrow={t("eyebrow")}
        title={t("title")}
      />

      <div className="space-y-6">
        {section === "profile" ? (
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
                {/* Avatar row block */}
                <div className="flex flex-col items-center gap-4 border-b border-slate-100 pb-6 dark:border-slate-800 sm:flex-row sm:gap-6">
                  <button
                    aria-label={t("profile.uploadAvatar")}
                    className="group relative size-20 shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:focus-visible:ring-slate-300"
                    onClick={triggerFileInput}
                    type="button"
                  >
                    <Avatar className="h-20 w-20 border-2 border-slate-200 dark:border-slate-800 transition-opacity hover:opacity-90">
                      {user?.avatar_url ? (
                        <AvatarImage alt={displayName} src={user.avatar_url} />
                      ) : null}
                      <AvatarFallback className="text-xl font-semibold">
                        {avatarFallback}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                      <Camera
                        aria-hidden="true"
                        className="h-5 w-5 text-white"
                      />
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
                        type="button"
                        disabled={uploadingAvatar}
                        onClick={triggerFileInput}
                        className="h-11 w-full sm:h-9 sm:w-auto"
                        size="sm"
                        variant="outline"
                      >
                        {uploadingAvatar ? (
                          <Loader2
                            aria-hidden="true"
                            className="mr-2 h-3.5 w-3.5 animate-spin"
                          />
                        ) : (
                          <Camera
                            aria-hidden="true"
                            className="mr-2 h-3.5 w-3.5"
                          />
                        )}
                        {uploadingAvatar
                          ? t("profile.uploading")
                          : t("profile.uploadAvatar")}
                      </Button>
                    </div>
                  </div>
                  <input
                    className="hidden"
                    disabled={uploadingAvatar}
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                  />
                </div>

                {/* Form inputs grid */}
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    error={
                      profileForm.formState.errors.fullName?.message
                        ? t(
                            `profile.${profileForm.formState.errors.fullName.message}`,
                          )
                        : undefined
                    }
                    htmlFor="profile-fullname"
                    label={t("profile.fullName")}
                  >
                    <Input
                      aria-describedby={
                        profileForm.formState.errors.fullName
                          ? "profile-fullname-error"
                          : undefined
                      }
                      aria-invalid={Boolean(
                        profileForm.formState.errors.fullName,
                      )}
                      autoComplete="name"
                      className="h-11 text-base sm:h-10 sm:text-sm"
                      id="profile-fullname"
                      placeholder={t("profile.fullNamePlaceholder")}
                      {...profileForm.register("fullName")}
                    />
                  </FormField>
                  <FormField
                    error={
                      profileForm.formState.errors.phone?.message
                        ? t(
                            `profile.${profileForm.formState.errors.phone.message}`,
                          )
                        : undefined
                    }
                    htmlFor="profile-phone"
                    label={t("profile.phone")}
                  >
                    <Input
                      aria-describedby={
                        profileForm.formState.errors.phone
                          ? "profile-phone-error"
                          : undefined
                      }
                      aria-invalid={Boolean(profileForm.formState.errors.phone)}
                      autoComplete="tel"
                      className="h-11 text-base sm:h-10 sm:text-sm"
                      id="profile-phone"
                      inputMode="tel"
                      placeholder={t("profile.phonePlaceholder")}
                      {...profileForm.register("phone")}
                    />
                  </FormField>
                  <FormField
                    error={
                      profileForm.formState.errors.username?.message
                        ? t(
                            `profile.${profileForm.formState.errors.username.message}`,
                          )
                        : undefined
                    }
                    htmlFor="profile-username"
                    label={t("profile.username")}
                  >
                    <Input
                      aria-describedby={
                        profileForm.formState.errors.username
                          ? "profile-username-error"
                          : undefined
                      }
                      aria-invalid={Boolean(
                        profileForm.formState.errors.username,
                      )}
                      autoComplete="username"
                      className="h-11 text-base sm:h-10 sm:text-sm"
                      id="profile-username"
                      {...profileForm.register("username")}
                    />
                  </FormField>
                  <FormField
                    error={
                      profileForm.formState.errors.email?.message
                        ? t(
                            `profile.${profileForm.formState.errors.email.message}`,
                          )
                        : undefined
                    }
                    htmlFor="profile-email"
                    label={t("profile.email")}
                  >
                    <Input
                      aria-describedby={
                        profileForm.formState.errors.email
                          ? "profile-email-error"
                          : undefined
                      }
                      aria-invalid={Boolean(profileForm.formState.errors.email)}
                      autoComplete="email"
                      className="h-11 text-base sm:h-10 sm:text-sm"
                      id="profile-email"
                      type="email"
                      {...profileForm.register("email")}
                    />
                  </FormField>
                </div>
              </CardContent>
              <div className="flex justify-end border-t border-slate-100 p-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10">
                <Button
                  className="h-11 w-full sm:h-10 sm:w-auto"
                  disabled={
                    updateProfileMutation.isPending ||
                    !profileForm.formState.isDirty
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
        ) : null}

        {section === "security" ? (
          <form onSubmit={onPasswordSubmit}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  {t("security.title")}
                </CardTitle>
                <CardDescription>{t("security.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-w-2xl">
                <FormField
                  error={
                    passwordForm.formState.errors.currentPassword?.message
                      ? t(
                          `security.${passwordForm.formState.errors.currentPassword.message}`,
                        )
                      : undefined
                  }
                  htmlFor="security-current-password"
                  label={t("security.currentPassword")}
                >
                  <div className="relative">
                    <Input
                      aria-describedby={
                        passwordForm.formState.errors.currentPassword
                          ? "security-current-password-error"
                          : undefined
                      }
                      aria-invalid={Boolean(
                        passwordForm.formState.errors.currentPassword,
                      )}
                      autoComplete="current-password"
                      className="h-11 pr-12 text-base sm:h-10 sm:text-sm"
                      id="security-current-password"
                      placeholder={t("security.currentPasswordPlaceholder")}
                      type={
                        visiblePasswords.currentPassword ? "text" : "password"
                      }
                      {...passwordForm.register("currentPassword")}
                    />
                    <button
                      aria-label={t(
                        visiblePasswords.currentPassword
                          ? "security.hidePassword"
                          : "security.showPassword",
                      )}
                      aria-pressed={visiblePasswords.currentPassword}
                      className="absolute right-0 top-0 grid size-11 place-items-center rounded-md text-slate-500 outline-none hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-slate-950 dark:hover:text-slate-50 dark:focus-visible:ring-slate-300 sm:size-10"
                      onClick={() => togglePassword("currentPassword")}
                      type="button"
                    >
                      {visiblePasswords.currentPassword ? (
                        <EyeOff aria-hidden="true" className="size-4" />
                      ) : (
                        <Eye aria-hidden="true" className="size-4" />
                      )}
                    </button>
                  </div>
                </FormField>
                <FormField
                  error={
                    passwordForm.formState.errors.password?.message
                      ? t(
                          `security.${passwordForm.formState.errors.password.message}`,
                        )
                      : undefined
                  }
                  htmlFor="security-new-password"
                  label={t("security.newPassword")}
                >
                  <div className="relative">
                    <Input
                      aria-describedby={
                        passwordForm.formState.errors.password
                          ? "security-new-password-error"
                          : undefined
                      }
                      aria-invalid={Boolean(
                        passwordForm.formState.errors.password,
                      )}
                      autoComplete="new-password"
                      className="h-11 pr-12 text-base sm:h-10 sm:text-sm"
                      id="security-new-password"
                      placeholder={t("security.newPasswordPlaceholder")}
                      type={visiblePasswords.password ? "text" : "password"}
                      {...passwordForm.register("password")}
                    />
                    <button
                      aria-label={t(
                        visiblePasswords.password
                          ? "security.hidePassword"
                          : "security.showPassword",
                      )}
                      aria-pressed={visiblePasswords.password}
                      className="absolute right-0 top-0 grid size-11 place-items-center rounded-md text-slate-500 outline-none hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-slate-950 dark:hover:text-slate-50 dark:focus-visible:ring-slate-300 sm:size-10"
                      onClick={() => togglePassword("password")}
                      type="button"
                    >
                      {visiblePasswords.password ? (
                        <EyeOff aria-hidden="true" className="size-4" />
                      ) : (
                        <Eye aria-hidden="true" className="size-4" />
                      )}
                    </button>
                  </div>
                </FormField>
                <FormField
                  error={
                    passwordForm.formState.errors.confirmPassword?.message
                      ? t(
                          `security.${passwordForm.formState.errors.confirmPassword.message}`,
                        )
                      : undefined
                  }
                  htmlFor="security-confirm-password"
                  label={t("security.confirmPassword")}
                >
                  <div className="relative">
                    <Input
                      aria-describedby={
                        passwordForm.formState.errors.confirmPassword
                          ? "security-confirm-password-error"
                          : undefined
                      }
                      aria-invalid={Boolean(
                        passwordForm.formState.errors.confirmPassword,
                      )}
                      autoComplete="new-password"
                      className="h-11 pr-12 text-base sm:h-10 sm:text-sm"
                      id="security-confirm-password"
                      placeholder={t("security.confirmPasswordPlaceholder")}
                      type={
                        visiblePasswords.confirmPassword ? "text" : "password"
                      }
                      {...passwordForm.register("confirmPassword")}
                    />
                    <button
                      aria-label={t(
                        visiblePasswords.confirmPassword
                          ? "security.hidePassword"
                          : "security.showPassword",
                      )}
                      aria-pressed={visiblePasswords.confirmPassword}
                      className="absolute right-0 top-0 grid size-11 place-items-center rounded-md text-slate-500 outline-none hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-slate-950 dark:hover:text-slate-50 dark:focus-visible:ring-slate-300 sm:size-10"
                      onClick={() => togglePassword("confirmPassword")}
                      type="button"
                    >
                      {visiblePasswords.confirmPassword ? (
                        <EyeOff aria-hidden="true" className="size-4" />
                      ) : (
                        <Eye aria-hidden="true" className="size-4" />
                      )}
                    </button>
                  </div>
                </FormField>
              </CardContent>
              <div className="flex justify-end border-t border-slate-100 p-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10">
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
        ) : null}

        {section === "permissions" ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                {t("permissions.title")}
              </CardTitle>
              <CardDescription>{t("permissions.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {t("permissions.role")}
                </p>
                <div className="mt-2">
                  <Badge className="px-3 py-1 text-sm bg-slate-900 text-slate-50 hover:bg-slate-900 dark:bg-slate-50 dark:text-slate-950 dark:hover:bg-slate-50 font-semibold capitalize">
                    {user?.role ? t(`permissions.roleLabel.${user.role}`) : ""}
                  </Badge>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6 dark:border-slate-800 space-y-6">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {t("permissions.permissionsList")}
                </p>
                {user?.permissions && user.permissions.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {groupPermissions(user.permissions).map((group) => (
                      <div
                        className="rounded-lg border border-slate-100 p-4 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/5 space-y-3"
                        key={group.key}
                      >
                        <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          {t(`permissions.categories.${group.key}`)}
                        </h5>
                        <div className="flex flex-wrap gap-1.5">
                          {group.permissions.map((perm) => (
                            <Badge
                              className="bg-white text-slate-800 hover:bg-white dark:bg-slate-950 dark:text-slate-200 border-slate-200 dark:border-slate-800 font-normal px-2.5 py-1 text-xs shadow-sm"
                              key={perm}
                              variant="secondary"
                            >
                              <UserRound
                                aria-hidden="true"
                                className="mr-1 h-3 w-3 opacity-60"
                              />
                              {t.has(`permissions.labels.${perm}`)
                                ? t(`permissions.labels.${perm}`)
                                : perm}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                    {t("permissions.noPermissions")}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
