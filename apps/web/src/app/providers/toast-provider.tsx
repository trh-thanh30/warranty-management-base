"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      closeButton
      position="top-right"
      richColors
      theme="light"
      toastOptions={{
        duration: 3_500,
      }}
    />
  );
}
