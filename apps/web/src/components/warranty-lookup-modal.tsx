"use client";

import { useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Phone, ShieldCheck, X } from "lucide-react";
import { usePrimaryWebsiteHotline } from "@/src/app/providers/site-settings-provider";
import { WarrantyLookupForm } from "@/src/components/common/warranty-lookup-form";
import { WarrantyLookupResultDetails } from "@/src/components/warranty-lookup-result";
import { useWarrantyLookup } from "@/src/hooks/use-warranty-lookup";

interface WarrantyLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export function WarrantyLookupModal({
  isOpen,
  onClose,
  initialQuery = "",
}: WarrantyLookupModalProps) {
  const t = useTranslations("WarrantyLookupModal");
  const hotline = usePrimaryWebsiteHotline();
  const {
    data: searchResult,
    errorKind,
    isPending,
    lookup,
    reset,
  } = useWarrantyLookup();

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  useEffect(() => {
    if (!isOpen) return;

    reset();

    if (initialQuery.trim()) {
      lookup(initialQuery);
    }
  }, [initialQuery, isOpen, lookup, reset]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };
    const originalOverflow = document.body.style.overflow;

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [handleClose, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6">
      <button
        type="button"
        aria-label={t("closeAriaLabel")}
        className="fixed inset-0 cursor-default bg-deep-black/70 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="warranty-lookup-title"
        className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-border-gray bg-white shadow-2xl animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border-gray bg-surface-muted p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center text-stone-gray">
              <ShieldCheck className="size-7" strokeWidth={1.6} />
            </div>
            <div>
              <h3
                id="warranty-lookup-title"
                className="text-base font-medium uppercase text-deep-black sm:text-lg"
              >
                {t("title")}
              </h3>
              <p className="mt-1 text-sm font-normal text-stone-gray">
                {t("subtitle")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label={t("closeAriaLabel")}
            className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-white text-stone-gray transition-colors hover:bg-light-gray hover:text-deep-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-red focus-visible:ring-offset-2"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="max-h-[80vh] space-y-6 overflow-y-auto p-5 sm:p-6">
          <WarrantyLookupForm
            autoFocus
            initialValue={initialQuery}
            isPending={isPending}
            onSubmit={lookup}
            onValueChange={reset}
            variant="modal"
          />

          {searchResult && (
            <div className="space-y-6 rounded-2xl border border-border-gray bg-surface-muted p-5 shadow-md animate-in fade-in duration-300 sm:p-6">
              <WarrantyLookupResultDetails result={searchResult} />

              <div className="space-y-3 border-t border-border-gray pt-5 text-center">
                <p className="mx-auto max-w-md text-xs font-medium leading-relaxed text-stone-gray">
                  {t("supportMessage")}
                </p>
                {hotline && (
                  <a
                    href={hotline.href}
                    className="inline-flex items-center gap-2 rounded-full bg-premium-red px-5 py-2.5 text-xs font-semibold uppercase text-white shadow-md transition-colors hover:bg-warm-red"
                  >
                    <Phone className="size-3.5" />
                    <span>
                      {t("supportHotlineLabel")}: {hotline.displayValue}
                    </span>
                  </a>
                )}
                <p className="text-xs font-semibold uppercase text-deep-black">
                  {t("supportClosing")}
                </p>
              </div>
            </div>
          )}

          {errorKind && (
            <p
              role="alert"
              className="rounded-xl border border-premium-red/20 bg-premium-red/5 px-4 py-3 text-center text-sm font-medium text-premium-red"
            >
              {t(`errors.${errorKind}`)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
