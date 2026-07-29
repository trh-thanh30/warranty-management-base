import type { ReactNode } from "react";
import { DashboardShell } from "@/src/components/layout/dashboard-shell";
import { AuthGuard } from "@/src/components/auth-guard";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}
