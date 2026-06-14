"use client";

import type { ReactNode } from "react";
import { AppSidebar } from "@/src/components/layout/app-sidebar";
import { Header } from "@/src/components/layout/header";
import { useAdminUiStore } from "@/src/app/stores/ui.store";
import { cn } from "@repo/ui/lib/utils";

export function DashboardShell({ children }: { children: ReactNode }) {
  const collapsed = useAdminUiStore((state) => state.sidebarCollapsed);

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-950 dark:bg-[#020817] dark:text-slate-50">
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden transition-all duration-300 ease-in-out lg:block",
          collapsed ? "w-16" : "w-72",
        )}
      >
        <AppSidebar />
      </div>
      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          collapsed ? "lg:pl-16" : "lg:pl-72",
        )}
      >
        <Header />
        <main className="mx-auto w-full max-w-[88rem] px-4 py-8 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
