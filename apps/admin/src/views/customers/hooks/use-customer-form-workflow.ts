"use client";

import { useRouter } from "@/src/i18n/navigation";

export function useCustomerFormWorkflow() {
  const router = useRouter();

  function goBackToDirectory() {
    router.push("/customers");
  }

  function handleSaved() {
    goBackToDirectory();
  }

  return {
    goBackToDirectory,
    handleSaved,
  };
}
