import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(120).optional(),
  password: z.string().min(8),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

const optionalPhoneSchema = z
  .string()
  .trim()
  .max(32)
  .optional()
  .or(z.literal(""));

export const createModeratorSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  username: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  phone: optionalPhoneSchema,
});

export type CreateModeratorInput = z.infer<typeof createModeratorSchema>;

export const updateModeratorSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  username: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  phone: optionalPhoneSchema,
  password: z.string().min(8).optional().or(z.literal("")),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export type UpdateModeratorInput = z.infer<typeof updateModeratorSchema>;
