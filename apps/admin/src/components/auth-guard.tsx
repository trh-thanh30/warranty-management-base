"use client";

import { useEffect, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/src/app/providers/auth-provider";
import { useRouter } from "@/src/i18n/navigation";

export function AuthGuard({ children }: { children: ReactNode }) {
  const t = useTranslations("Common");
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [router, status]);

  if (status !== "authenticated") {
    return (
      <div className="grid min-h-[100dvh] place-items-center bg-slate-50 dark:bg-slate-950">
        <Loader2
          aria-label={t("loadingSession")}
          className="size-6 animate-spin text-slate-500"
        />
      </div>
    );
  }

  return children;
}
