"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useScrollReveal } from "@/src/hooks/use-scroll-reveal";
import { revealViewportOnce } from "@/src/constants/motion.constants";
import { ArrowRight } from "lucide-react";
import { APP_ROUTES } from "@/src/constants/routes.constants";
import { Link } from "@/src/i18n/navigation";
import { featuredProducts } from "../home.constants";

export function ProductsSection() {
  const t = useTranslations("HomePage.products");
  const productsT = useTranslations("ProductsPage");
  const { container, fadeUp } = useScrollReveal();

  return (
    <section
      id="products"
      className="w-full bg-light-gray py-10 lg:py-14 border-b border-border-gray"
    >
      <div className="mx-auto max-w-[1640px] px-4 sm:px-6 lg:px-8 w-full">
        {/* Section Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={revealViewportOnce}
          className="text-center pb-6 lg:pb-8"
        >
          <span className="block text-xs sm:text-sm font-sans font-semibold uppercase tracking-[0.25em] text-premium-red mb-1.5">
            {t("eyebrow")}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-condensed font-semibold uppercase tracking-wide text-deep-black leading-snug text-center">
            {t("title")}
          </h2>
          <p className="mt-3 text-base sm:text-lg text-stone-gray font-sans font-medium max-w-2xl mx-auto">
            {t("description")}
          </p>
          <div className="mt-4 mx-auto h-[3px] w-20 bg-premium-red" />
        </motion.div>

        {/* Products Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={revealViewportOnce}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {featuredProducts.map((product) => (
            <motion.div
              key={product.id}
              variants={fadeUp}
              className="group flex flex-col justify-between rounded-[20px] bg-white border border-border-gray overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl hover:border-premium-red"
            >
              {/* Product Image */}
              <Link
                href={APP_ROUTES.product(product.slug)}
                className="relative w-full aspect-[4/3] bg-black/5 overflow-hidden block"
              >
                <Image
                  src={product.image}
                  alt={t(`items.${product.id}.imageAlt`)}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span
                  className={`absolute top-4 left-4 ${product.badgeClassName} text-white px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider shadow-sm`}
                >
                  {t(`items.${product.id}.badge`)}
                </span>
              </Link>

              {/* Product Info */}
              <div className="flex flex-col justify-between p-6 sm:p-7 flex-1">
                <div>
                  <h3 className="text-xl font-semibold uppercase text-deep-black tracking-tight group-hover:text-premium-red transition-colors">
                    <Link href={APP_ROUTES.product(product.slug)}>
                      {productsT(`catalog.items.${product.detailKey}.name`)}
                    </Link>
                  </h3>
                  <div className="mt-2 text-lg font-semibold text-premium-red">
                    {t(`items.${product.id}.price`)}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-stone-gray font-sans">
                    {t(`items.${product.id}.description`)}
                  </p>

                  {/* Specs List */}
                  <div className="mt-5 pt-4 border-t border-border-gray space-y-2">
                    {(["uv", "ir", "vlt"] as const).map((spec) => (
                      <div
                        key={spec}
                        className="flex items-center gap-2 text-xs font-medium text-deep-black"
                      >
                        <span
                          aria-hidden="true"
                          className="size-1.5 shrink-0 rounded-full bg-premium-red"
                        />
                        <span>
                          {t(`specs.${spec}`, { value: product.specs[spec] })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Action */}
                <div className="mt-7">
                  <Link
                    href={APP_ROUTES.product(product.id)}
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase text-deep-black group-hover:text-premium-red transition-colors"
                  >
                    <span>{t("bookInstallation")}</span>
                    <ArrowRight className="size-4 text-premium-red" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        {/* View All Products Button */}
        <div className="text-center pt-8">
          <Link
            href={APP_ROUTES.products}
            className="inline-flex items-center gap-2 bg-premium-red sm:bg-deep-black sm:hover:bg-premium-red active:scale-95 text-white px-8 py-4 rounded-[14px] text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all duration-300 shadow-lg cursor-pointer"
          >
            <span>{t("viewAll")}</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
