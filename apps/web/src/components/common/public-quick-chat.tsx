"use client";

import { MessageCircle, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useEffect, useId, useState } from "react";
import { cn } from "@repo/ui/lib/utils";
import type { PublicWebsiteSiteSetting } from "@repo/shared";
import { ContactMessageForm } from "./contact-message-form";
import { PublicContactActions } from "./public-contact-actions";

export function PublicQuickChat({
  siteSettings,
}: {
  siteSettings?: PublicWebsiteSiteSetting | null;
}) {
  const t = useTranslations("QuickChat");
  const [isOpen, setIsOpen] = useState(false);
  const [isTriggerHovered, setIsTriggerHovered] = useState(false);
  const [isTriggerVisible, setIsTriggerVisible] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const panelId = useId();
  const titleId = useId();

  useEffect(() => {
    const updateTriggerVisibility = () => {
      const nextIsVisible = window.scrollY > 400;
      setIsTriggerVisible(nextIsVisible);

      if (!nextIsVisible) setIsOpen(false);
    };

    updateTriggerVisibility();
    window.addEventListener("scroll", updateTriggerVisibility, {
      passive: true,
    });

    return () => window.removeEventListener("scroll", updateTriggerVisibility);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  return (
    <>
      <motion.section
        animate={
          isOpen
            ? { opacity: 1, scale: 1 }
            : { opacity: 0, scale: shouldReduceMotion ? 1 : 0.92 }
        }
        aria-hidden={!isOpen}
        aria-labelledby={titleId}
        className={cn(
          "fixed inset-x-4 bottom-24 z-[60] flex max-h-[80dvh] origin-bottom-right flex-col overflow-hidden rounded-md border border-premium-red/20 bg-white shadow-2xl sm:left-auto sm:right-6 sm:w-[400px]",
          !isOpen && "pointer-events-none",
        )}
        id={panelId}
        initial={false}
        inert={!isOpen}
        role="dialog"
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : isOpen
              ? { type: "spring", stiffness: 380, damping: 25, mass: 0.8 }
              : { duration: 0.18, ease: "easeIn" }
        }
      >
        <header className="flex shrink-0 items-start justify-between gap-4 bg-premium-red px-5 py-4 text-white">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold" id={titleId}>
              {t("title")}
            </h2>
            <p className="mt-1 text-sm leading-5 text-white/90">
              {t("description")}
            </p>
          </div>
          <button
            aria-label={t("closeAriaLabel")}
            className="flex size-11 shrink-0 items-center justify-center rounded-md text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            onClick={() => setIsOpen(false)}
            type="button"
          >
            <X className="size-5" />
          </button>
        </header>

        <div className="overflow-y-auto p-4 sm:p-5" data-lenis-prevent>
          <ContactMessageForm loadLocations={isOpen} variant="quickChat" />
        </div>
      </motion.section>

      <PublicContactActions isVisible={isOpen} siteSettings={siteSettings} />

      <AnimatePresence>
        {isTriggerVisible ? (
          <motion.button
            animate={{ opacity: 1, scale: 1, y: 0 }}
            aria-controls={panelId}
            aria-expanded={isOpen}
            aria-label={t(isOpen ? "closeAriaLabel" : "openAriaLabel")}
            className={cn(
              "group fixed bottom-6 right-6 z-[60] isolate h-12 w-12 cursor-pointer rounded-full border border-white/20 bg-premium-red text-white shadow-xl transition-[width,background-color,border-color] duration-300 ease-out hover:bg-warm-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-red focus-visible:ring-offset-2",
              !isOpen && "sm:hover:w-44 sm:focus-visible:w-44",
            )}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            onClick={() => setIsOpen((current) => !current)}
            onHoverEnd={() => setIsTriggerHovered(false)}
            onHoverStart={() => setIsTriggerHovered(true)}
            transition={shouldReduceMotion ? { duration: 0 } : undefined}
            type="button"
          >
            {!isOpen ? (
              <span className="pointer-events-none absolute inset-y-0 left-0 right-12 hidden items-center justify-center whitespace-nowrap pl-4 text-sm font-medium uppercase text-white opacity-0 transition-opacity delay-0 duration-150 group-hover:opacity-100 group-hover:delay-100 group-focus-visible:opacity-100 group-focus-visible:delay-100 sm:flex">
                {t("helpPrompt")}
              </span>
            ) : null}
            <motion.span
              animate={
                !isOpen && !isTriggerHovered && !shouldReduceMotion
                  ? { opacity: [0.4, 0], scale: [1, 1.55] }
                  : { opacity: 0, scale: 1 }
              }
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 rounded-full border-2 border-premium-red"
              transition={
                !isOpen && !isTriggerHovered && !shouldReduceMotion
                  ? {
                      duration: 1.1,
                      ease: "easeOut",
                      repeat: Infinity,
                      repeatDelay: 1.2,
                    }
                  : { duration: 0.15 }
              }
            />
            <MessageCircle
              className={cn(
                "absolute right-3.5 top-3.5 size-5 transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none",
                isOpen
                  ? "rotate-90 scale-75 opacity-0"
                  : "rotate-0 scale-100 opacity-100",
              )}
            />
            <X
              className={cn(
                "absolute right-3.5 top-3.5 size-5 transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none",
                isOpen
                  ? "rotate-0 scale-100 opacity-100"
                  : "-rotate-90 scale-75 opacity-0",
              )}
            />
          </motion.button>
        ) : null}
      </AnimatePresence>
    </>
  );
}
