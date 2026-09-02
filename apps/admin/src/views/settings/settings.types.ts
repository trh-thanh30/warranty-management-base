import { z } from "zod";

export type SettingsSection = "profile" | "security" | "permissions";

export const profileSchema = z.object({
  fullName: z.string().trim().max(120, "fullNameLength").nullable(),
  phone: z.string().trim().max(32, "phoneLength").nullable(),
  username: z
    .string()
    .trim()
    .min(2, "usernameLength")
    .max(80, "usernameLength"),
  email: z.string().trim().email("emailInvalid").max(160, "emailLength"),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "currentPasswordRequired"),
    password: z.string().min(6, "passwordLength"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "confirmPasswordMatch",
    path: ["confirmPassword"],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
