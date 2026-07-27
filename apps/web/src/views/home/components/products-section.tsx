"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useScrollReveal } from "@/src/hooks/use-scroll-reveal";
import { revealViewportOnce } from "@/src/constants/motion.constants";
import { ArrowRight } from "lucide-react";
import { APP_ROUTES } from "@/src/constants/routes.constants";
import { Link } from "@/src/i18n/navigation";

const mainCategories = [
  {
    key: "film",
    image: "/product/product_1.jpg",
    badgeKey: "Hàn Quốc",
  },
  {
    key: "lighting",
    image: "/product/product_3.jpg",
    badgeKey: "Công nghệ Nhật",
  },
  {
    key: "dashcam",
    image: "/product/product_9.jpg",
    badgeKey: "Ghi hình 4K",
  },
  {
    key: "tpms",
    image: "/product/product_10.jpg",
    badgeKey: "An toàn",
  },
] as const;

import { Container } from "@/src/components/common/container";

export function ProductsSection() {
  const t = useTranslations("HomePage.products");
  const { container, fadeUp } = useScrollReveal();

  return (
    <section id="products" className="w-full bg-gray-50 py-12 lg:py-16">
      <Container>
        {/* Section Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={revealViewportOnce}
          className="text-center pb-8 lg:pb-12"
        >
          <span className="block text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] text-premium-red mb-2">
            {t("eyebrow")}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold uppercase tracking-wide text-deep-black leading-snug text-center">
            {t("title")}
          </h2>
          <p className="mt-3 text-base sm:text-lg text-stone-gray max-w-2xl mx-auto">
            {t("description")}
          </p>
        </motion.div>

        {/* 4 Main Categories Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={revealViewportOnce}
          className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4"
        >
          {mainCategories.map((cat) => (
            <motion.div
              key={cat.key}
              variants={fadeUp}
              className="group flex flex-col justify-between rounded-md bg-white border border-border-gray overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md hover:border-premium-red"
            >
              {/* Category Image */}
              <Link
                href={APP_ROUTES.products}
                className="relative w-full aspect-[16/9] bg-black/5 overflow-hidden block"
              >
                <Image
                  src={cat.image}
                  alt={t(`categories.${cat.key}.title`)}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-2.5 left-2.5 bg-deep-black/80 backdrop-blur-xs text-white px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider shadow-sm transition-colors duration-300 group-hover:bg-premium-red group-hover:text-white">
                  {cat.badgeKey}
                </span>
              </Link>

              {/* Category Content */}
              <div className="flex flex-col justify-between p-4 sm:p-5 flex-1">
                <div>
                  <h3 className="text-sm sm:text-base font-semibold uppercase text-deep-black tracking-tight leading-snug group-hover:text-premium-red transition-colors min-h-[2.75rem] sm:min-h-[3rem]">
                    <Link href={APP_ROUTES.products}>
                      {t(`categories.${cat.key}.title`)}
                    </Link>
                  </h3>
                  <p className="mt-2.5 text-sm text-stone-gray leading-relaxed">
                    {t(`categories.${cat.key}.description`)}
                  </p>
                </div>

                {/* Explore CTA */}
                <div className="mt-5 pt-3.5 border-t border-border-gray">
                  <Link
                    href={APP_ROUTES.products}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase text-deep-black group-hover:text-premium-red transition-colors"
                  >
                    <span>{t("explore")}</span>
                    <ArrowRight className="size-3.5 text-premium-red transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* View All Categories Button */}
        <div className="text-center pt-8">
          <Link
            href={APP_ROUTES.products}
            className="inline-flex items-center gap-2 bg-premium-red sm:bg-deep-black sm:hover:bg-premium-red active:scale-95 text-white px-7 py-3 rounded-md text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all duration-300 shadow-md cursor-pointer"
          >
            <span>{t("viewAll")}</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
