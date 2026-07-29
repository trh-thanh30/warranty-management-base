import { AlertTriangle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@repo/ui";
import { StatePanel } from "@/src/components/common/state-panel";

type WebsiteConfigQueryStateProps = {
  isError: boolean;
  isLoading: boolean;
  onRetry: () => void;
};

export function WebsiteConfigQueryState({
  isError,
  isLoading,
  onRetry,
}: WebsiteConfigQueryStateProps) {
  const t = useTranslations("WebsiteConfig");
  if (isLoading) {
    return (
      <StatePanel
        description={t("states.loadingDescription")}
        icon={Loader2}
        title={t("states.loading")}
      />
    );
  }
  if (isError) {
    return (
      <StatePanel
        action={
          <Button onClick={onRetry} type="button" variant="outline">
            {t("actions.retry")}
          </Button>
        }
        description={t("states.errorDescription")}
        icon={AlertTriangle}
        title={t("states.error")}
      />
    );
  }
  return null;
}
