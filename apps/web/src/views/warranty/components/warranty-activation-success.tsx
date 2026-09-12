"use client";

import { APP_ROUTES } from "@/src/constants/routes.constants";
import { Link } from "@/src/i18n/navigation";
import {
  formatDate,
  type PublicWarrantyActivationRequestReceipt,
} from "@repo/shared";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { motion, useReducedMotion } from "framer-motion";
import {
  Check,
  CheckCircle2,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  Copy,
  Mail,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

type WarrantyActivationSuccessProps = {
  onReset: () => void;
  request: PublicWarrantyActivationRequestReceipt;
};

export function WarrantyActivationSuccess({
  onReset,
  request,
}: WarrantyActivationSuccessProps) {
  const t = useTranslations("Warranty.activate.success");
  const locale = useLocale();
  const shouldReduceMotion = useReducedMotion();
  const [isCodeCopied, setIsCodeCopied] = useState(false);
  const submittedAt = formatDate(request.createdAt, {
    locale,
    showTime: true,
  });
  const timeline = [
    {
      description: submittedAt,
      icon: Check,
      state: "done",
      title: t("submittedStep"),
    },
    {
      description: t("reviewDescription"),
      icon: ClipboardCheck,
      state: "active",
      title: t("reviewStep"),
    },
    {
      description: t("activationDescription"),
      icon: ShieldCheck,
      state: "pending",
      title: t("activationStep"),
    },
  ] as const;

  const copyRequestCode = async () => {
    try {
      await navigator.clipboard.writeText(request.requestCode);
      setIsCodeCopied(true);
      toast.success(t("copied"));
      window.setTimeout(() => setIsCodeCopied(false), 2000);
    } catch {
      setIsCodeCopied(false);
      toast.error(t("copyFailed"));
    }
  };

  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      aria-atomic="true"
      aria-live="polite"
      className="mx-auto max-w-4xl overflow-hidden rounded-md border border-border-gray bg-white"
      initial={
        shouldReduceMotion
          ? false
          : {
              opacity: 0,
              y: 16,
            }
      }
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="border-b border-border-gray px-5 py-8 text-center sm:px-10 sm:py-10">
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="mx-auto flex size-12 items-center justify-center rounded-full bg-success-surface text-success-text"
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.75 }}
          transition={{
            delay: shouldReduceMotion ? 0 : 0.12,
            duration: 0.3,
            ease: "easeOut",
          }}
        >
          <CheckCircle2 className="size-6" aria-hidden="true" />
        </motion.div>

        <h2 className="mt-5 text-xl font-semibold uppercase text-deep-black sm:text-2xl">
          {t("title")}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-stone-gray">
          {t("description")}
        </p>
      </div>

      <div className="grid bg-surface-muted sm:grid-cols-3">
        <div className="min-w-0 border-b border-border-gray p-5 sm:border-b-0 sm:border-r sm:p-6">
          <p className="text-xs font-semibold uppercase text-stone-gray">
            {t("requestCodeLabel")}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <p className="min-w-0 break-all  text-base font-semibold text-premium-red">
              {request.requestCode}
            </p>
            <Button
              aria-label={isCodeCopied ? t("copied") : t("copyCode")}
              className="size-9 shrink-0 rounded-md border-border-gray bg-white p-0 text-stone-gray hover:border-premium-red hover:bg-premium-red hover:text-white"
              onClick={() => void copyRequestCode()}
              title={isCodeCopied ? t("copied") : t("copyCode")}
              type="button"
              variant="outline"
            >
              {isCodeCopied ? (
                <Check className="size-4" aria-hidden="true" />
              ) : (
                <Copy className="size-4" aria-hidden="true" />
              )}
            </Button>
          </div>
          <p className="mt-2 text-xs leading-5 text-stone-gray">
            {t("requestCodeHint")}
          </p>
        </div>

        <div className="border-b border-border-gray p-5 sm:border-b-0 sm:border-r sm:p-6">
          <p className="text-xs font-semibold uppercase text-stone-gray">
            {t("statusLabel")}
          </p>
          <Badge
            className="mt-3 gap-2 bg-info-surface px-3 py-1.5 text-info-text"
            variant="secondary"
          >
            <Clock3 className="size-4" aria-hidden="true" />
            {request.status === "PENDING" ? t("pendingStatus") : request.status}
          </Badge>
        </div>

        <div className="p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase text-stone-gray">
            {t("submittedAtLabel")}
          </p>
          <p className="mt-3 text-sm font-semibold leading-6 text-deep-black">
            {submittedAt}
          </p>
        </div>
      </div>

      <div className="px-5 pt-6 sm:px-10 sm:pt-8">
        <div className="rounded-md border border-info-border bg-info-surface p-4 text-deep-black">
          <div className="flex gap-3">
            <CircleAlert
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-info-text"
            />
            <div className="min-w-0">
              <h3 className="text-sm font-semibold">{t("reservationTitle")}</h3>
              <p className="mt-1 text-sm leading-6 text-stone-gray">
                {t("reservationDescription")}
              </p>
              <p className="mt-3 flex gap-2 text-sm leading-6 text-stone-gray">
                <Mail aria-hidden="true" className="mt-1 size-4 shrink-0" />
                <span>{t("emailDescription")}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-7 sm:px-10 sm:py-8">
        <h3 className="text-sm font-semibold uppercase text-deep-black">
          {t("timelineTitle")}
        </h3>

        <ol className="mt-6">
          {timeline.map(({ description, icon: Icon, state, title }, index) => (
            <motion.li
              animate={{ opacity: 1, x: 0 }}
              className="relative flex gap-4 pb-6 last:pb-0"
              initial={shouldReduceMotion ? false : { opacity: 0, x: -12 }}
              key={title}
              transition={{
                delay: shouldReduceMotion ? 0 : 0.18 + index * 0.08,
                duration: 0.28,
                ease: "easeOut",
              }}
            >
              {index < timeline.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={`absolute bottom-0 left-3.5 top-7 w-px ${
                    state === "done" ? "bg-success" : "bg-border-gray"
                  }`}
                />
              ) : null}

              <span
                className={`relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border ${
                  state === "done"
                    ? "border-success bg-success text-white"
                    : state === "active"
                      ? "border-info bg-info-surface text-info-text"
                      : "border-border-gray bg-white text-stone-gray"
                }`}
              >
                <Icon className="size-3.5" aria-hidden="true" />
              </span>

              <div className="min-w-0 pt-1">
                <p
                  className={`text-sm font-semibold ${
                    state === "pending" ? "text-stone-gray" : "text-deep-black"
                  }`}
                >
                  {title}
                </p>
                <p className="mt-1 text-sm text-stone-gray">{description}</p>
              </div>
            </motion.li>
          ))}
        </ol>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <Button
            asChild
            className="h-12 rounded-md bg-premium-red text-sm font-semibold uppercase text-white hover:bg-warm-red"
          >
            <Link
              href={{
                pathname: APP_ROUTES.warrantyTrack,
                query: { requestCode: request.requestCode },
              }}
            >
              <Search className="size-4" aria-hidden="true" />
              {t("track")}
            </Link>
          </Button>
          <Button
            className="h-12 rounded-md border-premium-red text-sm font-semibold uppercase text-premium-red transition-colors hover:bg-premium-red hover:text-white"
            onClick={onReset}
            type="button"
            variant="outline"
          >
            {t("reset")}
          </Button>
        </div>
      </div>
    </motion.section>
  );
}
