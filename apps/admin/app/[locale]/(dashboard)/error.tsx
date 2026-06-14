"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@repo/ui";
import { StatePanel } from "@/src/components/common/state-panel";

export default function DashboardError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const t = useTranslations("RouteStates");

  return (
    <StatePanel
      action={
        <Button onClick={reset}>
          <RotateCcw className="h-4 w-4" />
          {t("tryAgain")}
        </Button>
      }
      description={t("errorDescription")}
      icon={AlertTriangle}
      title={t("errorTitle")}
    />
  );
}
