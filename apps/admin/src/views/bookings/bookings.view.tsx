import { Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@repo/ui";
import { PageHeader } from "@/src/components/common/page-header";
import { BookingsTable } from "@/src/views/bookings/components/bookings-table";

export function BookingsView() {
  const t = useTranslations("Bookings");

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Button variant="secondary">
            <Download className="h-4 w-4" />
            {t("export")}
          </Button>
        }
        description={t("description")}
        eyebrow={t("eyebrow")}
        title={t("title")}
      />
      <BookingsTable />
    </div>
  );
}
