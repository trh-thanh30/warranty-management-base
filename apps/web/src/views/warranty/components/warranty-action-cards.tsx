"use client";

import { Container } from "@/src/components/common/container";
import { revealViewportOnce } from "@/src/constants/motion.constants";
import { useScrollReveal } from "@/src/hooks/use-scroll-reveal";
import { Link } from "@/src/i18n/navigation";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Clock,
  FileText,
  HelpCircle,
  MapPin,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { warrantyActions } from "../warranty.constants";

const actionIcons = {
  search: Search,
  shield: ShieldCheck,
  file: FileText,
  clock: Clock,
  map: MapPin,
  help: HelpCircle,
} as const;

export function WarrantyActionCards() {
  const t = useTranslations("Warranty.actions");
  const { fadeUp } = useScrollReveal();

  return (
    <section className="w-full py-16 lg:py-24 bg-surface-muted border-b border-border-gray">
      <Container className="space-y-12">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={revealViewportOnce}
          className="text-center space-y-3"
        >
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-condensed font-semibold uppercase tracking-wider text-deep-black">
            {t("title")}
          </h2>
          <p className="text-base sm:text-lg text-stone-gray font-normal max-w-2xl mx-auto">
            {t("description")}
          </p>
          <div className="mt-4 mx-auto h-0.75 w-20 bg-premium-red" />
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {warrantyActions.map((action) => {
            const Icon = actionIcons[action.icon];
            return (
              <motion.div
                key={action.id}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={revealViewportOnce}
                className="group bg-white rounded-[24px] border border-border-gray shadow-md hover:shadow-xl hover:border-premium-red transition-all"
              >
                <Link
                  href={action.href}
                  className="p-6 sm:p-7 space-y-5 flex h-full flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex size-12 items-center justify-center text-stone-gray transition-colors group-hover:text-deep-black">
                      <Icon className="size-7" strokeWidth={1.6} />
                    </div>
                    <span className="rounded-full bg-light-gray px-3 py-1 text-xs font-medium uppercase text-stone-gray">
                      {t(`items.${action.id}.badge`)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-semibold uppercase text-deep-black group-hover:text-premium-red transition-colors">
                      {t(`items.${action.id}.title`)}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-gray font-medium leading-relaxed">
                      {t(`items.${action.id}.description`)}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-border-gray flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-deep-black group-hover:text-premium-red">
                    <span>{t(`items.${action.id}.action`)}</span>
                    <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
