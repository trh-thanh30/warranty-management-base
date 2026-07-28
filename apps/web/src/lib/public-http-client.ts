import { createHttpClient } from "@repo/shared";

export const publicHttpClient = createHttpClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10_000,
});
