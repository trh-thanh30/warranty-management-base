"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { APP_ROUTES } from "@/src/constants/routes.constants";
import { Link } from "@/src/i18n/navigation";
import {
  catalogCategories,
  expandedProductsCatalog,
  pageSizeOptions,
} from "./products.constants";
import type { CatalogCategory } from "./products.types";

export function ProductsView() {
  const t = useTranslations("ProductsPage");
  const [activeCategory, setActiveCategory] = useState<CatalogCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isCategoryDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isCategoryDrawerOpen]);

  // Reset page number on filter, search, or page size change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery, itemsPerPage]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: expandedProductsCatalog.length,
    };
    catalogCategories.forEach((category) => {
      if (category !== "all") {
        counts[category] = expandedProductsCatalog.filter(
          (item) => item.category === category,
        ).length;
      }
    });
    return counts;
  }, []);

  const filteredCatalog = useMemo(() => {
    let list = expandedProductsCatalog;
    if (activeCategory !== "all") {
      list = list.filter((item) => item.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          t(`catalog.items.${item.detailKey}.name`)
            .toLowerCase()
            .includes(query) ||
          item.code.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query),
      );
    }
    return list;
  }, [activeCategory, searchQuery, t]);

  const totalPages = Math.ceil(filteredCatalog.length / itemsPerPage) || 1;

  const paginatedCatalog = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCatalog.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCatalog, currentPage, itemsPerPage]);

  return (
    <main className="min-h-screen bg-surface-muted text-deep-black">
      {/* MOBILE CATEGORY DRAWER OVERLAY */}
      <AnimatePresence>
        {isCategoryDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCategoryDrawerOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed inset-y-0 left-0 z-50 w-[85%] max-w-xs border-r border-border-gray bg-white p-5 shadow-2xl lg:hidden flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-border-gray pb-4">
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="size-5 text-premium-red" />
                    <h2 className="font-condensed text-base font-semibold uppercase tracking-wider text-deep-black">
                      {t("catalog.title")}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCategoryDrawerOpen(false)}
                    className="rounded-full p-1 text-stone-gray hover:bg-surface-muted hover:text-deep-black cursor-pointer"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                <nav className="mt-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-140px)]">
                  {catalogCategories.map((category) => {
                    const isActive = activeCategory === category;
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => {
                          setActiveCategory(category);
                          setIsCategoryDrawerOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-xs font-semibold uppercase tracking-wide transition-all cursor-pointer ${
                          isActive
                            ? "bg-premium-red text-white shadow-md"
                            : "text-deep-black hover:bg-surface-muted hover:text-premium-red"
                        }`}
                      >
                        <span>{t(`catalog.categories.${category}`)}</span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-surface-muted text-stone-gray"
                          }`}
                        >
                          {categoryCounts[category] ?? 0}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* HERO SECTION */}
      <section className="relative flex min-h-[200px] sm:h-[300px] items-center justify-center overflow-hidden bg-deep-black py-10 sm:py-0">
        <Image
          src="/bg.jpg"
          alt={t("hero.imageAlt")}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-deep-black/70 to-transparent" />
        <div className="relative z-10 max-w-3xl px-6 text-center">
          <span className="text-base font-semibold uppercase tracking-[0.25em] text-accent-gold">
            {t("catalog.eyebrow")}
          </span>
          <h1 className="mt-2 sm:mt-3 font-condensed text-2xl xs:text-3xl font-semibold uppercase tracking-widest text-white sm:text-5xl">
            {t("hero.title")}
          </h1>
          <p className="mt-3 text-base font-medium leading-relaxed text-white/80 max-w-xl mx-auto text-pretty">
            {t("catalog.description")}
          </p>
        </div>
      </section>

      {/* CATALOG SECTION */}
      <section className="w-full py-6 sm:py-10 lg:py-16">
        <div className="mx-auto grid max-w-[1640px] gap-6 sm:gap-8 px-4 sm:px-10 lg:grid-cols-12 lg:px-12">
          {/* DESKTOP SIDEBAR */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 rounded-[24px] border border-border-gray bg-white p-6 shadow-md">
              <div className="mb-4 flex items-center gap-2 border-b border-border-gray pb-3">
                <LayoutGrid className="size-5 text-premium-red" />
                <h2 className="font-condensed text-lg font-semibold uppercase tracking-wider text-deep-black">
                  {t("catalog.title")}
                </h2>
              </div>
              <nav className="space-y-1">
                {catalogCategories.map((category) => {
                  const isActive = activeCategory === category;
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setActiveCategory(category)}
                      className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-xs font-semibold uppercase tracking-wide transition-all cursor-pointer ${
                        isActive
                          ? "bg-premium-red text-white shadow-md"
                          : "text-deep-black hover:bg-surface-muted hover:text-premium-red"
                      }`}
                    >
                      <span>{t(`catalog.categories.${category}`)}</span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-surface-muted text-stone-gray"
                        }`}
                      >
                        {categoryCounts[category] ?? 0}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          <div className="space-y-6 lg:col-span-9">
            {/* TOOLBAR FOR MOBILE & DESKTOP */}
            <div className="rounded-[20px] border border-border-gray bg-white p-3.5 sm:p-4 shadow-sm space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
              {/* MOBILE ROW 1: FULL WIDTH CATEGORY DRAWER TRIGGER BUTTON */}
              <div className="flex items-center justify-between gap-3 sm:hidden">
                <button
                  type="button"
                  onClick={() => setIsCategoryDrawerOpen(true)}
                  className="flex w-full items-center justify-between rounded-xl border border-border-gray bg-surface-muted px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider text-deep-black shadow-xs hover:border-premium-red hover:bg-white cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="size-4 text-premium-red" />
                    <span>{t("catalog.title")}</span>
                  </div>
                  <span className="rounded-full bg-premium-red px-2 py-0.5 text-xs font-semibold text-white">
                    {categoryCounts[activeCategory] ?? 0}
                  </span>
                </button>
              </div>

              {/* DESKTOP LEFT: CATEGORY TITLE & COUNT */}
              <div className="hidden sm:block">
                <span className="text-xs font-semibold uppercase tracking-wider text-premium-red">
                  {t(`catalog.categories.${activeCategory}`)}
                </span>
                <p className="mt-0.5 text-xs sm:text-sm font-medium text-stone-gray flex items-center gap-2">
                  <span>
                    {t("catalog.itemCount", { count: filteredCatalog.length })}
                  </span>
                  {totalPages > 1 && (
                    <>
                      <span className="text-stone-gray/40">•</span>
                      <span className="font-semibold text-deep-black">
                        {t("catalog.pageInfo", {
                          current: currentPage,
                          total: totalPages,
                        })}
                      </span>
                    </>
                  )}
                </p>
              </div>

              {/* SEARCH INPUT (FULL WIDTH ON MOBILE, 60-72 ON DESKTOP) */}
              <div className="relative w-full sm:w-60 md:w-72">
                <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-stone-gray" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("catalog.searchPlaceholder")}
                  className="w-full rounded-xl border border-border-gray bg-surface-muted py-2.5 pl-10 pr-9 text-xs font-medium text-deep-black transition-all placeholder:text-stone-gray focus:border-premium-red focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-premium-red"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-stone-gray hover:bg-border-gray hover:text-deep-black cursor-pointer"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              {/* MOBILE ROW 3: CATEGORY INFO + ITEMS PER PAGE SELECTOR */}
              <div className="flex sm:hidden items-center justify-between border-t border-border-gray/60 pt-2.5 text-xs">
                <div className="flex items-center gap-1.5 min-w-0 pr-2">
                  <span className="font-semibold uppercase tracking-wider text-premium-red truncate">
                    {t(`catalog.categories.${activeCategory}`)}
                  </span>
                  <span className="text-stone-gray shrink-0">
                    ({filteredCatalog.length})
                  </span>
                </div>

                <div className="flex items-center gap-1 text-xs text-stone-gray shrink-0">
                  <span className="font-medium text-stone-gray">
                    {t("catalog.itemsPerPageLabel")}:
                  </span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="rounded-xl border border-border-gray bg-surface-muted px-2 py-1 text-xs font-semibold text-deep-black transition-all focus:border-premium-red focus:bg-white focus:outline-hidden cursor-pointer"
                  >
                    {pageSizeOptions.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* DESKTOP ITEMS PER PAGE SELECTOR */}
              <div className="hidden sm:flex items-center gap-2 text-xs text-stone-gray shrink-0">
                <label
                  htmlFor="itemsPerPageSelect"
                  className="whitespace-nowrap font-medium text-stone-gray"
                >
                  {t("catalog.itemsPerPageLabel")}:
                </label>
                <select
                  id="itemsPerPageSelect"
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="rounded-xl border border-border-gray bg-surface-muted px-2.5 py-2 text-xs font-semibold text-deep-black transition-all focus:border-premium-red focus:bg-white focus:outline-hidden cursor-pointer"
                >
                  {pageSizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {size} / {t("catalog.perPage")}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {paginatedCatalog.length > 0 ? (
              <>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {paginatedCatalog.map((item) => (
                    <article
                      key={item.id}
                      className="group flex flex-col justify-between overflow-hidden rounded-[24px] border border-border-gray bg-white shadow-md transition-all duration-300 hover:border-premium-red hover:shadow-xl"
                    >
                      <div>
                        <div className="relative aspect-[16/11] sm:aspect-[4/3] w-full overflow-hidden bg-surface-muted border-b border-border-gray">
                          <Image
                            src={item.image}
                            alt={t("productImageAlt", { code: item.code })}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                          />
                          <span className="absolute left-3.5 top-3.5 rounded-full bg-premium-red px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-white shadow-xs">
                            {t(`catalog.categories.${item.category}`)}
                          </span>
                        </div>

                        <div className="space-y-4 p-5">
                          <div className="space-y-1">
                            <span className="font-mono text-sm font-semibold uppercase text-premium-red">
                              {item.code}
                            </span>
                            <h3 className="line-clamp-2 text-base font-semibold text-deep-black transition-colors group-hover:text-premium-red">
                              {t(`catalog.items.${item.detailKey}.name`)}
                            </h3>
                          </div>

                          <div className="grid grid-cols-2 gap-2.5 border-t border-border-gray pt-3.5 text-xs">
                            {item.highlightSpecs.map((spec) => (
                              <div
                                key={spec.id}
                                className="rounded-xl border border-border-gray bg-surface-muted p-2"
                              >
                                <span className="block text-xs font-medium uppercase text-stone-gray">
                                  {t(`catalog.specs.${spec.id}`)}
                                </span>
                                <span className="font-semibold text-deep-black">
                                  {"translateValue" in spec &&
                                  spec.translateValue
                                    ? t(`catalog.values.${spec.value}`)
                                    : spec.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-border-gray p-5 pt-3.5">
                        {item.warrantyYears ? (
                          <div className="flex items-center gap-1.5 text-xs font-medium text-stone-gray">
                            <ShieldCheck className="size-4 text-premium-red" />
                            <span>
                              {t("warrantyYears", {
                                years: item.warrantyYears,
                              })}
                            </span>
                          </div>
                        ) : (
                          <span />
                        )}

                        <Link
                          href={APP_ROUTES.product(item.slug)}
                          className="inline-flex items-center gap-1 text-xs font-semibold uppercase text-deep-black transition-colors group-hover:text-premium-red"
                        >
                          <span>{t("viewDetails")}</span>
                          <ChevronRight className="size-4" />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>

                {/* PAGINATION BAR */}
                {totalPages > 1 && (
                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-[20px] border border-border-gray bg-white p-4 shadow-sm">
                    <span className="text-xs font-medium text-stone-gray">
                      {t("catalog.pageInfo", {
                        current: currentPage,
                        total: totalPages,
                      })}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={currentPage === 1}
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        className="flex items-center gap-1 rounded-xl border border-border-gray bg-surface-muted px-3.5 py-2 text-xs font-semibold uppercase text-deep-black transition-all hover:border-premium-red hover:bg-white hover:text-premium-red disabled:opacity-40 disabled:hover:border-border-gray disabled:hover:bg-surface-muted disabled:hover:text-deep-black disabled:cursor-not-allowed cursor-pointer"
                      >
                        <ChevronLeft className="size-4" />
                        <span className="hidden xs:inline">
                          {t("catalog.prev")}
                        </span>
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <button
                            key={page}
                            type="button"
                            onClick={() => setCurrentPage(page)}
                            className={`size-9 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                              currentPage === page
                                ? "bg-premium-red text-white shadow-md"
                                : "border border-border-gray bg-surface-muted text-deep-black hover:border-premium-red hover:bg-white hover:text-premium-red"
                            }`}
                          >
                            {page}
                          </button>
                        ),
                      )}

                      <button
                        type="button"
                        disabled={currentPage === totalPages}
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages),
                          )
                        }
                        className="flex items-center gap-1 rounded-xl border border-border-gray bg-surface-muted px-3.5 py-2 text-xs font-semibold uppercase text-deep-black transition-all hover:border-premium-red hover:bg-white hover:text-premium-red disabled:opacity-40 disabled:hover:border-border-gray disabled:hover:bg-surface-muted disabled:hover:text-deep-black disabled:cursor-not-allowed cursor-pointer"
                      >
                        <span className="hidden xs:inline">
                          {t("catalog.next")}
                        </span>
                        <ChevronRight className="size-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-border-gray bg-white py-16 px-6 text-center shadow-xs">
                <Search className="size-10 text-stone-gray/40" />
                <h3 className="mt-4 font-condensed text-xl font-semibold uppercase text-deep-black">
                  {t("catalog.noResultsTitle")}
                </h3>
                <p className="mt-1 text-sm font-medium text-stone-gray max-w-md">
                  {t("catalog.noResultsDesc")}
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mt-5 rounded-full bg-premium-red px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-warm-red cursor-pointer"
                >
                  {t("catalog.clearSearch")}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
