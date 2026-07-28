"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Container } from "@/src/components/common/container";
import { Counter } from "@/src/components/animation/counter";

export function AboutBrandHeritage() {
  const t = useTranslations("AboutPage");

  return (
    <>
      {/* ROW 1: Brand Definition & Slanted Image Showcase (1 Full Viewport Height, bg-white) */}
      <section className="w-full min-h-[calc(100vh-5rem)] flex items-center bg-white py-12 lg:py-16 overflow-hidden">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 items-center">
            {/* Left: Narrative Text & 3-Stat Horizontal Row (7 Columns) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-7 space-y-6"
            >
              {/* Red Line + Eyebrow Tag */}
              <div className="flex items-center gap-3">
                <span className="w-12 h-[2px] bg-premium-red shrink-0" />
                <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-premium-red">
                  FUJITEK VIETNAM
                </span>
              </div>

              {/* Headline matching Home Page typography standard */}
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-wide text-deep-black leading-tight">
                <span className="block">ĐỊNH NGHĨA</span>
                <span className="block">
                  LẠI <span className="text-premium-red">CHUẨN MỰC</span>
                </span>
                <span className="block">PHIM CÁCH NHIỆT</span>
              </h2>

              <div className="max-w-xl space-y-4 pt-2">
                <p className="text-base sm:text-lg text-stone-gray leading-relaxed text-pretty">
                  {t("brandHeritage.row1Desc1")}
                </p>

                <p className="text-sm sm:text-base text-stone-gray leading-relaxed text-pretty">
                  {t("brandHeritage.row1Desc2")}
                </p>
              </div>

              {/* Full-width Thin Divider Line */}
              <div className="w-full h-[1px] bg-border-gray/60 my-6" />

              {/* 3-Stat Counter Row with Animated Count-up Numbers */}
              <div className="grid grid-cols-3 gap-6 max-w-xl">
                <div className="space-y-1">
                  <div className="text-3xl sm:text-4xl font-bold tracking-tight text-deep-black leading-none">
                    <Counter value={10} suffix="+" />
                  </div>
                  <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-gray leading-tight mt-1.5">
                    Năm kinh nghiệm
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="text-3xl sm:text-4xl font-bold tracking-tight text-deep-black leading-none">
                    <Counter value={200} suffix="+" />
                  </div>
                  <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-gray leading-tight mt-1.5">
                    Đại lý toàn quốc
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="text-3xl sm:text-4xl font-bold tracking-tight text-premium-red leading-none">
                    <Counter value={99} suffix="%" />
                  </div>
                  <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-gray leading-tight mt-1.5">
                    Cản tia UV
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Right: Large Image with Prototype Exact Slanted Crop (5 Columns) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative aspect-[4/5] sm:h-[600px] w-full overflow-hidden bg-white shadow-2xl rounded-sm border border-border-gray/70 [clip-path:polygon(15%_0%,_100%_0%,_100%_100%,_0%_100%)]">
                <Image
                  src="/hero/hero_6.jpg"
                  alt={t("brandHeritage.row1Title")}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 650px"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* ROW 2: Tech Origin & Manufacturing Image (1 Full Viewport Height, bg-surface-muted) */}
      <section className="w-full min-h-[calc(100vh-5rem)] flex items-center bg-surface-muted py-12 lg:py-16 overflow-hidden">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 items-start">
            {/* Left: High-Res Origin Image (5 Columns, Slanted Frame) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-5 order-2 lg:order-1 relative"
            >
              <div className="relative aspect-[4/5] sm:h-[600px] w-full overflow-hidden bg-white shadow-2xl rounded-sm border border-border-gray/70 [clip-path:polygon(0%_0%,_85%_0%,_100%_100%,_0%_100%)]">
                <Image
                  src="/hero/hero_7.jpg"
                  alt={t("brandHeritage.row2Title")}
                  fill
                  sizes="(max-width: 1024px) 100vw, 650px"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
            </motion.div>

            {/* Right: Narrative Text (7 Columns) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-7 order-1 lg:order-2 space-y-6"
            >
              {/* Red Line + Eyebrow Tag */}
              <div className="flex items-center gap-3">
                <span className="w-12 h-[2px] bg-premium-red shrink-0" />
                <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-premium-red">
                  XUẤT XỨ CÔNG NGHỆ
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-wide text-deep-black leading-tight text-pretty">
                {t("brandHeritage.row2Title")}
              </h2>

              <p className="text-base sm:text-lg text-stone-gray leading-relaxed text-pretty max-w-xl">
                {t("brandHeritage.row2Desc1")}
              </p>

              <p className="text-base sm:text-lg text-stone-gray leading-relaxed text-pretty max-w-xl">
                {t("brandHeritage.row2Desc2")}
              </p>
            </motion.div>
          </div>
        </Container>
      </section>
    </>
  );
}
