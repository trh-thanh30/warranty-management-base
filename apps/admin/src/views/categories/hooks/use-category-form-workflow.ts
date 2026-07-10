"use client";

import { useRouter } from "@/src/i18n/navigation";

export function useCategoryFormWorkflow() {
  const router = useRouter();

  function goBackToDirectory() {
    router.push("/categories");
  }

  function handleSaved() {
    router.push("/categories");
  }

  return {
    goBackToDirectory,
    handleSaved,
  };
}
