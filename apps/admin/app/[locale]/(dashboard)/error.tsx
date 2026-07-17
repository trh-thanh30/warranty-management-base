"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, ShieldAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@repo/ui";
import { StatePanel } from "@/src/components/common/state-panel";
import { isForbiddenError } from "@/src/lib/http-error.utils";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const tRoute = useTranslations("RouteStates");
  const tCommon = useTranslations("Common");

  useEffect(() => {
    console.error(error);
  }, [error]);

  if (isForbiddenError(error)) {
    return (
      <StatePanel
        description={tCommon("accessDeniedDescription")}
        icon={ShieldAlert}
        title={tCommon("accessDeniedTitle")}
      />
    );
  }

  return (
    <StatePanel
      action={
        <Button onClick={reset}>
          <RotateCcw className="h-4 w-4" />
          {tRoute("tryAgain")}
        </Button>
      }
      description={tRoute("errorDescription")}
      icon={AlertTriangle}
      title={tRoute("errorTitle")}
    />
  );
}
