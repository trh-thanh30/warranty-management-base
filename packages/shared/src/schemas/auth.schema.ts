import { z } from "zod";
import { ADMIN_TWO_FACTOR_METHOD } from "../constants/auth.ts";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const adminLoginSchema = z.object({
  usernameOrEmail: z.string().trim().min(1),
  password: z.string().min(1),
  method: z
    .enum([ADMIN_TWO_FACTOR_METHOD.EMAIL_OTP, ADMIN_TWO_FACTOR_METHOD.PIN])
    .optional(),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

export const adminTwoFactorSchema = z.object({
  code: z.string().regex(/^\d{6}$/),
});

export type AdminTwoFactorInput = z.infer<typeof adminTwoFactorSchema>;

export const adminPinSchema = z.object({
  pin: z.string().regex(/^\d{6}$/),
});

export const adminPinSetupSchema = adminPinSchema
  .extend({ confirmPin: z.string().regex(/^\d{6}$/) })
  .refine((value) => value.pin === value.confirmPin, {
    path: ["confirmPin"],
    message: "PIN confirmation does not match",
  });
