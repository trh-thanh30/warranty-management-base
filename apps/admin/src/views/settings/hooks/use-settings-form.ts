"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { HttpClientError, type UpdateProfileBody } from "@repo/shared";
import { useAuth } from "@/src/app/providers/auth-provider";
import {
  setAuthUser,
  clearAuthSession,
} from "@/src/app/stores/auth-session.store";
import { useToast } from "@/src/hooks/use-toast";
import { authService } from "@/src/services/auth/auth.service";
import { useRouter } from "@/src/i18n/navigation";
import {
  profileSchema,
  type ProfileFormValues,
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "../settings.types";
import { getProfileFormValues, validateAvatarFile } from "../settings.utils";

export function useSettingsForm() {
  const t = useTranslations("Settings");
  const toast = useToast();
  const router = useRouter();
  const { user } = useAuth();

  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Profile Form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.full_name ?? "",
      phone: user?.phone ?? "",
      username: user?.username ?? "",
      email: user?.email ?? "",
    },
  });

  // Password Form
  const passwordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      const body: UpdateProfileBody = {
        full_name: values.fullName || null,
        phone: values.phone || null,
        username: values.username,
        email: values.email,
      };
      return authService.updateProfile(body);
    },
    onSuccess: (updatedUser) => {
      setAuthUser(updatedUser);
      profileForm.reset(getProfileFormValues(updatedUser));
      toast.success(t("profile.updateSuccess"));
    },
    onError: () => {
      toast.error(t("profile.updateError"));
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (values: ChangePasswordFormValues) => {
      return authService.changePassword({
        currentPassword: values.currentPassword,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });
    },
    onSuccess: () => {
      toast.success(t("security.changePasswordSuccess"));
      clearAuthSession();
      router.replace("/login");
    },
    onError: (error: unknown) => {
      if (
        error instanceof HttpClientError &&
        error.status === 401 &&
        error.message.toLowerCase().includes("current password")
      ) {
        passwordForm.setError(
          "currentPassword",
          {
            message: "currentPasswordIncorrect",
          },
          {
            shouldFocus: true,
          },
        );
      }
      toast.error(t("security.changePasswordError"));
    },
  });

  const handleAvatarUpload = async (file: File) => {
    const validationError = validateAvatarFile(file);
    if (validationError) {
      toast.error(t(`profile.${validationError}`));
      return;
    }

    setUploadingAvatar(true);
    try {
      const updatedUser = await authService.updateAvatar(file);
      setAuthUser(updatedUser);
      toast.success(t("profile.avatarSuccess"));
    } catch {
      toast.error(t("profile.avatarError"));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const onProfileSubmit = profileForm.handleSubmit((values) => {
    updateProfileMutation.mutate(values);
  });

  const onPasswordSubmit = passwordForm.handleSubmit((values) => {
    changePasswordMutation.mutate(values);
  });

  return {
    user,
    uploadingAvatar,
    profileForm,
    passwordForm,
    updateProfileMutation,
    changePasswordMutation,
    handleAvatarUpload,
    onProfileSubmit,
    onPasswordSubmit,
  };
}
