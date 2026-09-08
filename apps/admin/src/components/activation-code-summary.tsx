"use client";

import type { ActivationCodeReportStatus } from "@repo/shared";
import { Badge } from "@repo/ui";
import { ActivationCodeStatusBadge } from "./activation-code-status-badge";

type ActivationCodeSummaryValue = {
  code: string | null;
  status: ActivationCodeReportStatus;
};

export function ActivationCodeSummary({
  activationCode,
  notRequiredLabel,
}: {
  activationCode: ActivationCodeSummaryValue | null;
  notRequiredLabel: string;
}) {
  if (!activationCode) {
    return <Badge variant="secondary">{notRequiredLabel}</Badge>;
  }

  return (
    <div className="flex min-w-0 flex-col items-start gap-1">
      <span className="max-w-52 truncate font-mono text-xs font-semibold text-slate-950 dark:text-slate-50">
        {activationCode.code ?? "-"}
      </span>
      <ActivationCodeStatusBadge status={activationCode.status} />
    </div>
  );
}
