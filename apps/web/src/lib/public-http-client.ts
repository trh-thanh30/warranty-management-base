import { createHttpClient } from "@repo/shared";

export const publicHttpClient = createHttpClient({
  baseURL: process.env.PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_URL,
  timeout: 10_000,
});
