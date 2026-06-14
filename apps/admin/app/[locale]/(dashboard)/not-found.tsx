import { SearchX } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@repo/ui";
import { StatePanel } from "@/src/components/common/state-panel";
import { Link } from "@/src/i18n/navigation";

export default function DashboardNotFound() {
  const t = useTranslations("RouteStates");

  return (
    <StatePanel
      action={
        <Button asChild>
          <Link href="/dashboard">{t("backToDashboard")}</Link>
        </Button>
      }
      description={t("notFoundDescription")}
      icon={SearchX}
      title={t("notFoundTitle")}
    />
  );
}
