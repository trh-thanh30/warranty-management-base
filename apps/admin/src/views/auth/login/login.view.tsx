import { LanguageSwitcher } from "@/src/components/language-switcher";
import { ThemeToggle } from "@/src/components/theme-toggle";
import { CheckCircle2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { LoginContent } from "./login-content";

export async function LoginView() {
  const t = await getTranslations("Login");

  return (
    <main className="grid min-h-dvh bg-white text-slate-950 dark:bg-slate-950 dark:text-white lg:grid-cols-[minmax(0,1.08fr)_minmax(480px,0.92fr)]">
      <section className="relative hidden min-h-[100dvh] overflow-hidden border-r border-blue-400/30 bg-blue-600 p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16 dark:bg-blue-900">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.24),transparent_32%),linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] [background-size:auto,48px_48px,48px_48px]"
        />

        <div aria-hidden="true" className="relative" />

        <div className="relative max-w-xl">
          <p className="mb-5 text-sm font-medium uppercase tracking-[0.18em] text-blue-100/75">
            {t("eyebrow")}
          </p>
          <h1 className="max-w-lg text-4xl font-semibold leading-[1.08] tracking-[-0.035em] xl:text-5xl">
            {t("heroTitle")}
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-blue-50/80">
            {t("heroDescription")}
          </p>

          <ul className="mt-10 grid gap-4 text-sm text-blue-50/90">
            {(["featureOne", "featureTwo", "featureThree"] as const).map(
              (key) => (
                <li className="flex items-center gap-3" key={key}>
                  <CheckCircle2
                    className="size-5 shrink-0 text-white"
                    aria-hidden="true"
                  />
                  <span>{t(key)}</span>
                </li>
              ),
            )}
          </ul>
        </div>

        <p className="relative text-xs text-blue-100/60">{t("securityNote")}</p>
      </section>

      <section className="flex min-h-[100dvh] flex-col">
        <header className="flex h-20 items-center justify-between px-5 sm:px-8 lg:justify-end">
          <div className="flex items-center gap-3 lg:hidden">
            <Image
              alt={t("brand")}
              className="h-9 w-auto max-w-[160px] object-contain"
              height={36}
              priority
              src="/logo.png"
              width={160}
            />
          </div>
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center px-5 pb-20 pt-8 sm:px-8 lg:px-12">
          <div className="w-full max-w-[420px]">
            <Image
              alt={t("brand")}
              className="mx-auto mb-8 hidden h-14 w-auto max-w-[260px] object-contain lg:block"
              height={56}
              priority
              src="/logo.png"
              width={260}
            />
            <LoginContent
              description={t("description")}
              title={t("title")}
              twoFactorDescription={t("twoFactorDescription", {
                email: "{email}",
              })}
              twoFactorTitle={t("twoFactorTitle")}
              welcome={t("welcome")}
            />
            <p className="mt-8 text-center text-xs leading-5 text-slate-500 dark:text-slate-500">
              {t("support")}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
