"use client";

import { useRouter } from "@/src/i18n/navigation";

export function useProductFormWorkflow() {
  const router = useRouter();

  function goBackToDirectory() {
    router.push("/products");
  }

  function handleSaved() {
    router.push("/products");
  }

  return {
    goBackToDirectory,
    handleSaved,
  };
}
