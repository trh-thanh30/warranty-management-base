"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Search, ShieldCheck, FileText, X, Sparkles } from "lucide-react";
import { Link } from "@/src/i18n/navigation";

export function FloatingQuickAction() {
  const t = useTranslations("FloatingQuickAction");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Sticky Bottom Bar (Visible on sm & mobile screens) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-deep-black/95 backdrop-blur-md border-t border-white/10 p-3 sm:hidden shadow-2xl flex items-center justify-around">
        <Link
          href="/warranty/lookup"
          aria-label={t("lookup")}
          className="flex flex-col items-center gap-1 text-light-gray hover:text-premium-red text-xs font-semibold uppercase tracking-wider cursor-pointer"
        >
          <Search className="size-5 text-premium-red" />
          <span>{t("mobile.lookup")}</span>
        </Link>
        <Link
          href="/warranty/activate"
          className="flex flex-col items-center gap-1 text-light-gray hover:text-premium-red text-xs font-semibold uppercase tracking-wider"
        >
          <ShieldCheck className="size-5 text-premium-red" />
          <span>{t("mobile.activate")}</span>
        </Link>
        <Link
          href="/warranty/request"
          className="flex flex-col items-center gap-1 text-light-gray hover:text-premium-red text-xs font-semibold uppercase tracking-wider"
        >
          <FileText className="size-5 text-premium-red" />
          <span>{t("mobile.request")}</span>
        </Link>
      </div>

      {/* Desktop Floating Widget (Fixed bottom right) */}
      <div className="fixed bottom-6 right-6 z-40 hidden sm:flex flex-col items-end gap-3">
        {isOpen && (
          <div className="bg-deep-black border border-ink-black rounded-[24px] p-5 shadow-2xl space-y-3 w-64 text-white animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-semibold uppercase text-premium-red tracking-wider flex items-center gap-1.5">
                <Sparkles className="size-4" />
                <span>{t("panelTitle")}</span>
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label={t("closeMenuAriaLabel")}
                className="text-white/60 hover:text-white cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-2">
              <Link
                href="/warranty/lookup"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 text-xs font-medium uppercase transition-colors"
              >
                <Search className="size-4 text-premium-red" />
                <span>{t("lookup")}</span>
              </Link>

              <Link
                href="/warranty/activate"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 text-xs font-medium uppercase transition-colors"
              >
                <ShieldCheck className="size-4 text-premium-red" />
                <span>{t("activate")}</span>
              </Link>

              <Link
                href="/warranty/request"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 text-xs font-medium uppercase transition-colors"
              >
                <FileText className="size-4 text-premium-red" />
                <span>{t("request")}</span>
              </Link>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={t(isOpen ? "closeMenuAriaLabel" : "openMenuAriaLabel")}
          className="size-14 rounded-full bg-premium-red hover:bg-warm-red text-white shadow-2xl flex items-center justify-center transition-transform hover:scale-105 cursor-pointer border-2 border-white/20"
        >
          {isOpen ? (
            <X className="size-6" />
          ) : (
            <ShieldCheck className="size-7" />
          )}
        </button>
      </div>
    </>
  );
}
