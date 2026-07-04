"use client";

import { useTheme } from "next-themes";
import { Toaster } from "sonner";

export function ToastProvider() {
  const { resolvedTheme } = useTheme();

  return (
    <Toaster
      closeButton
      position="top-right"
      richColors
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      toastOptions={{
        duration: 3_500,
      }}
    />
  );
}
