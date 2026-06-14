import { useTranslations } from "next-intl";
import { Button } from "@repo/ui/button";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export function HomeView() {
  const t = useTranslations("Home");

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-12">
      <div className="max-w-2xl space-y-6">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
          {t("eyebrow")}
        </p>
        <h1 className="text-4xl font-semibold tracking-normal text-slate-950">
          {t("title")}
        </h1>
        <p className="text-base leading-7 text-slate-600">{t("description")}</p>
        <div className="flex items-center gap-3">
          <Button>{t("primaryAction")}</Button>
          <a
            className="text-sm font-medium text-slate-700 hover:text-slate-950"
            href={`${apiUrl}/docs`}
          >
            {t("apiDocs")}
          </a>
        </div>
      </div>
    </main>
  );
}
