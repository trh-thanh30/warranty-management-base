import type { ReactNode } from "react";
import { DashboardShell } from "@/src/components/layout/dashboard-shell";
import { AuthGuard } from "@/src/components/auth-guard";
import { PresenceTracker } from "@/src/components/common/presence-tracker";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <PresenceTracker />
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}
