"use client";

import { useRouter } from "@/src/i18n/navigation";

export function useServiceCenterFormWorkflow() {
  const router = useRouter();

  function goBackToDirectory() {
    router.push("/service-centers");
  }

  function handleSaved() {
    goBackToDirectory();
  }

  return {
    goBackToDirectory,
    handleSaved,
  };
}
