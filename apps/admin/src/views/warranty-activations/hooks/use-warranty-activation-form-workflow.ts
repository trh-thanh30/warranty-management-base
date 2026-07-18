"use client";

import { useRouter } from "@/src/i18n/navigation";

export function useWarrantyActivationFormWorkflow() {
  const router = useRouter();

  return {
    goBackToWarranties: () => router.push("/warranties"),
    handleSaved: () => router.push("/warranties"),
  };
}
