"use client";

import { useEffect, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/src/app/providers/auth-provider";
import { useRouter } from "@/src/i18n/navigation";

export function GuestGuard({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [router, status]);

  if (status !== "unauthenticated") {
    return (
      <div className="grid min-h-[100dvh] place-items-center bg-white dark:bg-slate-950">
        <Loader2
          aria-label="Loading session"
          className="size-6 animate-spin text-slate-500"
        />
      </div>
    );
  }

  return children;
}
