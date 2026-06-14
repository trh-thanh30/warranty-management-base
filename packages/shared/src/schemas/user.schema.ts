import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(120).optional(),
  password: z.string().min(8),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
