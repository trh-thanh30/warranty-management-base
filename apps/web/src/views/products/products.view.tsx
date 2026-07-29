"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Filter,
  LayoutGrid,
  List,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useDebounce } from "@repo/hooks";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { PaginationControls } from "@repo/ui/pagination-controls";
import { RadioGroup, RadioGroupItem } from "@repo/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import { APP_ROUTES } from "@/src/constants/routes.constants";
import { Container } from "@/src/components/common/container";
import { useLenis } from "@/src/components/providers/lenis-provider";
import { Link } from "@/src/i18n/navigation";
import {
  catalogCategories,
  expandedProductsCatalog,
} from "./products.constants";
import type { CatalogCategory } from "./products.types";
import { FadeIn } from "@/src/components/animation/fade-in";
import {
  StaggerGroup,
  StaggerItem,
} from "@/src/components/animation/stagger-group";

// Helper Meta for Concept Redesign (Badges, Prices & Specs)
const PRODUCT_META: Record<
  string,
  {
    badge?: { label: string; color: string };
    priceRaw: number;
    priceFormatted: string;
  }
> = {
  sp50: {
    badge: { label: "HOT", color: "bg-premium-red text-white" },
    priceRaw: 5200000,
    priceFormatted: "5.200.000",
  },
  sp10: {
    badge: { label: "NEW", color: "bg-primary-blue text-white" },
    priceRaw: 4800000,
    priceFormatted: "4.800.000",
  },
  b55: {
    badge: { label: "BEST", color: "bg-accent-gold text-deep-black" },
    priceRaw: 6500000,
    priceFormatted: "6.500.000",
  },
  b15: {
    badge: { label: "HOT", color: "bg-premium-red text-white" },
    priceRaw: 5800000,
    priceFormatted: "5.800.000",
  },
  r70: {
    badge: { label: "NEW", color: "bg-primary-blue text-white" },
    priceRaw: 7200000,
    priceFormatted: "7.200.000",
  },
  r15: {
    priceRaw: 6800000,
    priceFormatted: "6.800.000",
  },
  fltrio3: {
    badge: { label: "HOT", color: "bg-premium-red text-white" },
    priceRaw: 8500000,
    priceFormatted: "8.500.000",
  },
  g3lazer: {
    badge: { label: "NEW", color: "bg-primary-blue text-white" },
    priceRaw: 12500000,
    priceFormatted: "12.500.000",
  },
  g44k: {
    badge: { label: "BEST", color: "bg-accent-gold text-deep-black" },
    priceRaw: 4500000,
    priceFormatted: "4.500.000",
  },
  tpms1: {
    priceRaw: 2800000,
    priceFormatted: "2.800.000",
  },
};

const PRICE_RANGE_OPTIONS = [
  { id: "all", min: 0, max: Infinity },
  { id: "under5", min: 0, max: 5000000 },
  { id: "5to10", min: 5000000, max: 10000000 },
  { id: "10to20", min: 10000000, max: 20000000 },
  { id: "over20", min: 20000000, max: Infinity },
] as const;

type PriceRangeId = (typeof PRICE_RANGE_OPTIONS)[number]["id"];
type SortOption = "newest" | "price-asc" | "price-desc";

const PRODUCT_RESULTS_ID = "product-results";

export function ProductsView() {
  const t = useTranslations("ProductsPage");
  const { scrollTo } = useLenis();
  const [activeCategory, setActiveCategory] = useState<CatalogCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] =
    useState<PriceRangeId>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [itemsPerPage] = useState<number>(6);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery.trim(), 300);

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

  // Reset page number on filter/search/sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    activeCategory,
    debouncedSearchQuery,
    selectedPriceRange,
    sortBy,
    itemsPerPage,
  ]);

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
    let list = [...expandedProductsCatalog];

    // Filter by Category
    if (activeCategory !== "all") {
      list = list.filter((item) => item.category === activeCategory);
    }

    // Filter by Search Query
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      list = list.filter(
        (item) =>
          t(`catalog.items.${item.detailKey}.name`)
            .toLowerCase()
            .includes(query) ||
          item.code.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query),
      );
    }

    // Filter by Price Range
    if (selectedPriceRange !== "all") {
      const rangeOption = PRICE_RANGE_OPTIONS.find(
        (opt) => opt.id === selectedPriceRange,
      );
      if (rangeOption) {
        list = list.filter((item) => {
          const price = PRODUCT_META[item.id]?.priceRaw ?? 5000000;
          return price >= rangeOption.min && price <= rangeOption.max;
        });
      }
    }

    // Sorting
    if (sortBy === "price-asc") {
      list.sort((a, b) => {
        const pA = PRODUCT_META[a.id]?.priceRaw ?? 0;
        const pB = PRODUCT_META[b.id]?.priceRaw ?? 0;
        return pA - pB;
      });
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => {
        const pA = PRODUCT_META[a.id]?.priceRaw ?? 0;
        const pB = PRODUCT_META[b.id]?.priceRaw ?? 0;
        return pB - pA;
      });
    }

    return list;
  }, [activeCategory, debouncedSearchQuery, selectedPriceRange, sortBy, t]);

  const totalPages = Math.ceil(filteredCatalog.length / itemsPerPage) || 1;

  const paginatedCatalog = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCatalog.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCatalog, currentPage, itemsPerPage]);

  return (
    <main className="min-h-screen bg-white text-deep-black">
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
                    <Filter className="size-5 text-premium-red" />
                    <h2 className="text-base font-semibold uppercase tracking-wider text-deep-black">
                      {t("catalog.filterTitle")}
                    </h2>
                  </div>
                  <Button
                    aria-label={t("catalog.closeFilter")}
                    className="size-8 rounded-full text-stone-gray hover:bg-surface-muted hover:text-deep-black"
                    size="icon"
                    type="button"
                    variant="ghost"
                    onClick={() => setIsCategoryDrawerOpen(false)}
                  >
                    <X className="size-5" />
                  </Button>
                </div>

                {/* SEARCH INPUT INSIDE MOBILE SIDEBAR */}
                <div className="relative mt-4">
                  <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-stone-gray" />
                  <Input
                    aria-label={t("catalog.searchLabel")}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("catalog.searchPlaceholder")}
                    className="h-10 border-border-gray bg-surface-muted pl-10 pr-9 text-sm font-medium text-deep-black placeholder:text-stone-gray focus:border-premium-red focus:bg-white"
                  />
                  {searchQuery && (
                    <Button
                      aria-label={t("catalog.clearSearch")}
                      className="absolute right-2 top-1/2 size-7 -translate-y-1/2 rounded-full text-stone-gray hover:bg-border-gray hover:text-deep-black"
                      size="icon"
                      type="button"
                      variant="ghost"
                      onClick={() => setSearchQuery("")}
                    >
                      <X className="size-3.5" />
                    </Button>
                  )}
                </div>

                <div className="mt-6 space-y-6">
                  {/* CATEGORIES */}
                  <div>
                    <span className="mb-3 block text-sm font-semibold uppercase tracking-wider text-stone-gray">
                      {t("catalog.categoriesTitle")}
                    </span>
                    <nav className="space-y-1.5 overflow-y-auto max-h-[40vh]">
                      {catalogCategories.map((category) => {
                        const isActive = activeCategory === category;
                        return (
                          <Button
                            key={category}
                            type="button"
                            variant="ghost"
                            onClick={() => {
                              setActiveCategory(category);
                              setIsCategoryDrawerOpen(false);
                            }}
                            className={`h-auto min-h-10 w-full justify-between whitespace-normal px-3.5 py-2.5 text-left text-sm font-medium ${
                              isActive
                                ? "bg-premium-red font-semibold text-white shadow-sm hover:bg-warm-red hover:text-white"
                                : "text-deep-black hover:bg-surface-muted hover:text-premium-red"
                            }`}
                          >
                            <span>{t(`catalog.categories.${category}`)}</span>
                            <span
                              className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                                isActive
                                  ? "bg-white/20 text-white"
                                  : "bg-surface-muted text-stone-gray"
                              }`}
                            >
                              {categoryCounts[category] ?? 0}
                            </span>
                          </Button>
                        );
                      })}
                    </nav>
                  </div>

                  {/* PRICE RANGES */}
                  <div className="border-t border-border-gray pt-4">
                    <span className="mb-3 block text-sm font-semibold uppercase tracking-wider text-stone-gray">
                      {t("catalog.priceTitle")}
                    </span>
                    <RadioGroup
                      className="gap-2"
                      value={selectedPriceRange}
                      onValueChange={(value) =>
                        setSelectedPriceRange(value as PriceRangeId)
                      }
                    >
                      {PRICE_RANGE_OPTIONS.map((range) => (
                        <div
                          className="flex items-center gap-2.5"
                          key={range.id}
                        >
                          <RadioGroupItem
                            className="border-border-gray text-premium-red focus-visible:ring-premium-red data-[state=checked]:border-premium-red"
                            id={`price-range-mobile-${range.id}`}
                            value={range.id}
                          />
                          <Label
                            className="cursor-pointer text-sm font-medium text-deep-black transition-colors hover:text-premium-red"
                            htmlFor={`price-range-mobile-${range.id}`}
                          >
                            {t(`catalog.priceRanges.${range.id}`)}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* HERO BANNER SECTION */}
      <section className="relative flex min-h-[180px] sm:h-[260px] items-center justify-center overflow-hidden bg-deep-black py-8 sm:py-0">
        <Image
          src="/bg_1.jpg"
          alt={t("hero.imageAlt")}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-deep-black/70 to-transparent" />
        <FadeIn
          direction="up"
          className="relative z-10 max-w-3xl px-6 text-center"
        >
          <span className="text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] text-accent-gold">
            {t("catalog.eyebrow")}
          </span>
          <h1 className="mt-1 sm:mt-2 text-2xl xs:text-3xl font-semibold uppercase tracking-widest text-white sm:text-4xl">
            {t("hero.title")}
          </h1>
          <p className="mt-2 text-xs sm:text-sm font-normal leading-relaxed text-white/80 max-w-xl mx-auto text-pretty">
            {t("catalog.description")}
          </p>
        </FadeIn>
      </section>

      {/* CATALOG SECTION */}
      <section className="w-full py-6 sm:py-10 lg:py-16">
        <Container className="grid gap-6 sm:gap-8 lg:grid-cols-12">
          {/* DESKTOP SIDEBAR FILTER */}
          <aside className="hidden font-sans lg:block lg:col-span-3">
            <div className="sticky top-24 space-y-7 px-2 py-2">
              {/* SIDEBAR TITLE */}
              <div className="flex items-center gap-2 pb-1">
                <Filter className="size-5 text-premium-red" />
                <h2 className="text-base font-semibold uppercase tracking-wider text-deep-black">
                  {t("catalog.filterTitle")}
                </h2>
              </div>

              {/* SEARCH INPUT INSIDE SIDEBAR */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-stone-gray" />
                <Input
                  aria-label={t("catalog.searchLabel")}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("catalog.searchPlaceholder")}
                  className="h-10 border-border-gray bg-white pl-10 pr-9 text-sm font-medium text-deep-black placeholder:text-stone-gray focus:border-premium-red"
                />
                {searchQuery && (
                  <Button
                    aria-label={t("catalog.clearSearch")}
                    className="absolute right-2 top-1/2 size-7 -translate-y-1/2 rounded-full text-stone-gray hover:bg-border-gray hover:text-deep-black"
                    size="icon"
                    type="button"
                    variant="ghost"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="size-3.5" />
                  </Button>
                )}
              </div>

              {/* CATEGORIES FILTER LIST */}
              <div>
                <span className="mb-3 block text-sm font-semibold uppercase tracking-wider text-stone-gray">
                  {t("catalog.categoriesTitle")}
                </span>
                <nav className="max-h-[40vh] space-y-1 overflow-y-auto overscroll-contain pr-1">
                  {catalogCategories.map((category) => {
                    const isActive = activeCategory === category;
                    return (
                      <Button
                        key={category}
                        type="button"
                        variant="ghost"
                        onClick={() => setActiveCategory(category)}
                        className={`relative h-auto min-h-10 w-full justify-between overflow-hidden whitespace-normal px-3 py-2.5 text-left text-sm font-medium leading-5 ${
                          isActive
                            ? "bg-premium-red/10 text-premium-red before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-premium-red"
                            : "text-deep-black hover:bg-surface-muted/70 hover:text-premium-red"
                        }`}
                      >
                        <span>{t(`catalog.categories.${category}`)}</span>
                        <span
                          className={`min-w-6 text-right text-sm font-medium leading-5 tabular-nums ${
                            isActive ? "text-premium-red" : "text-stone-gray"
                          }`}
                        >
                          {categoryCounts[category] ?? 0}
                        </span>
                      </Button>
                    );
                  })}
                </nav>
              </div>

              {/* PRICE RANGE CHECKBOXES */}
              <div className="pt-2">
                <span className="mb-3 block text-sm font-semibold uppercase tracking-wider text-stone-gray">
                  {t("catalog.priceTitle")}
                </span>
                <RadioGroup
                  className="gap-2.5"
                  value={selectedPriceRange}
                  onValueChange={(value) =>
                    setSelectedPriceRange(value as PriceRangeId)
                  }
                >
                  {PRICE_RANGE_OPTIONS.map((range) => (
                    <div className="flex items-center gap-2.5" key={range.id}>
                      <RadioGroupItem
                        className="border-border-gray text-premium-red focus-visible:ring-premium-red data-[state=checked]:border-premium-red"
                        id={`price-range-desktop-${range.id}`}
                        value={range.id}
                      />
                      <Label
                        className="cursor-pointer text-sm font-medium text-deep-black transition-colors hover:text-premium-red"
                        htmlFor={`price-range-desktop-${range.id}`}
                      >
                        {t(`catalog.priceRanges.${range.id}`)}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <div
            className="scroll-mt-24 space-y-6 lg:col-span-9"
            id={PRODUCT_RESULTS_ID}
          >
            {/* TOP CONTROL BAR (COUNT, SORT & VIEW MODE) */}
            <div className="flex flex-col justify-between gap-3 rounded-md border border-border-gray/80 bg-white p-3.5 shadow-2xs sm:flex-row sm:items-center sm:gap-4 sm:px-5 sm:py-3.5">
              {/* MOBILE DRAWER TRIGGER BUTTON */}
              <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2 sm:hidden">
                <Button
                  className="h-9 border-border-gray bg-surface-muted px-3.5 text-xs font-semibold uppercase tracking-wider text-deep-black shadow-2xs hover:border-premium-red hover:bg-white"
                  type="button"
                  variant="secondary"
                  onClick={() => setIsCategoryDrawerOpen(true)}
                >
                  <SlidersHorizontal className="size-4 text-premium-red" />
                  <span>{t("catalog.mobileFilterTrigger")}</span>
                </Button>
                <span className="justify-self-end whitespace-nowrap text-right text-sm font-medium text-stone-gray">
                  {t.rich("catalog.itemCount", {
                    count: filteredCatalog.length,
                    highlight: (chunks) => (
                      <strong className="font-semibold text-premium-red">
                        {chunks}
                      </strong>
                    ),
                  })}
                </span>
              </div>

              {/* DESKTOP ITEM COUNT */}
              <div className="hidden text-sm font-medium text-stone-gray sm:block">
                {t.rich("catalog.itemCount", {
                  count: filteredCatalog.length,
                  highlight: (chunks) => (
                    <strong className="font-semibold text-premium-red">
                      {chunks}
                    </strong>
                  ),
                })}
              </div>

              {/* RIGHT CONTROLS: SORT SELECTOR & VIEW MODE TOGGLE */}
              <div className="flex min-w-0 items-center justify-between gap-2 sm:shrink-0 sm:justify-end sm:gap-3">
                {/* SORT SELECTOR */}
                <div className="flex min-w-0 flex-1 items-center gap-2 text-xs sm:flex-none sm:text-sm">
                  <Label
                    className="hidden text-xs font-medium text-stone-gray xs:inline sm:text-sm"
                    htmlFor="sortBySelect"
                  >
                    {t("catalog.sortLabel")}
                  </Label>
                  <Select
                    value={sortBy}
                    onValueChange={(value) => setSortBy(value as SortOption)}
                  >
                    <SelectTrigger
                      className="h-9 w-full min-w-0 border-border-gray bg-white text-xs font-medium text-charcoal shadow-none focus:border-premium-red sm:w-auto sm:min-w-36 sm:text-sm"
                      id="sortBySelect"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="end">
                      <SelectItem value="newest">
                        {t("catalog.sortOptions.newest")}
                      </SelectItem>
                      <SelectItem value="price-asc">
                        {t("catalog.sortOptions.priceAsc")}
                      </SelectItem>
                      <SelectItem value="price-desc">
                        {t("catalog.sortOptions.priceDesc")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* VIEW MODE TOGGLE BUTTONS */}
                <div className="flex items-center rounded-md border border-border-gray p-0.5 bg-surface-muted">
                  <Button
                    aria-label={t("catalog.viewGrid")}
                    aria-pressed={viewMode === "grid"}
                    size="icon"
                    type="button"
                    variant="ghost"
                    onClick={() => setViewMode("grid")}
                    title={t("catalog.viewGrid")}
                    className={`size-8 rounded-sm ${
                      viewMode === "grid"
                        ? "bg-premium-red text-white shadow-2xs hover:bg-warm-red hover:text-white"
                        : "text-stone-gray hover:text-deep-black"
                    }`}
                  >
                    <LayoutGrid className="size-4" />
                  </Button>
                  <Button
                    aria-label={t("catalog.viewList")}
                    aria-pressed={viewMode === "list"}
                    size="icon"
                    type="button"
                    variant="ghost"
                    onClick={() => setViewMode("list")}
                    title={t("catalog.viewList")}
                    className={`size-8 rounded-sm ${
                      viewMode === "list"
                        ? "bg-premium-red text-white shadow-2xs hover:bg-warm-red hover:text-white"
                        : "text-stone-gray hover:text-deep-black"
                    }`}
                  >
                    <List className="size-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* PRODUCT CATALOG LISTING */}
            {paginatedCatalog.length > 0 ? (
              <>
                <StaggerGroup
                  key={`${activeCategory}-${currentPage}-${debouncedSearchQuery}-${selectedPriceRange}-${sortBy}-${viewMode}`}
                  className={
                    viewMode === "grid"
                      ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                      : "space-y-4"
                  }
                >
                  {paginatedCatalog.map((item) => {
                    const meta = PRODUCT_META[item.id] ?? {
                      priceRaw: 5200000,
                      priceFormatted: "5.200.000",
                    };

                    if (viewMode === "list") {
                      return (
                        <StaggerItem
                          key={item.id}
                          className="group flex flex-col justify-between gap-3 overflow-hidden rounded-md border border-border-gray/80 bg-white p-3 shadow-xs transition-all duration-300 hover:border-premium-red/50 hover:shadow-lg sm:flex-row sm:items-center sm:gap-6 sm:p-4"
                        >
                          <div className="flex w-full flex-row items-start gap-3 sm:items-center sm:gap-5">
                            <div className="relative aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-md border border-border-gray/60 bg-surface-muted sm:w-48">
                              <Image
                                src={item.image}
                                alt={t("productImageAlt", { code: item.code })}
                                fill
                                sizes="(max-width: 640px) 112px, 200px"
                                className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                              />
                              {meta.badge && (
                                <span
                                  className={`absolute left-2.5 top-2.5 rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wider shadow-2xs ${meta.badge.color}`}
                                >
                                  {meta.badge.label}
                                </span>
                              )}
                            </div>

                            <div className="min-w-0 flex-1 space-y-1.5 sm:space-y-2">
                              <span className="line-clamp-1 text-xs font-semibold text-premium-red">
                                {t(`catalog.categories.${item.category}`)}
                              </span>
                              <h3 className="line-clamp-3 text-sm font-semibold uppercase text-deep-black transition-colors group-hover:text-premium-red sm:text-base">
                                {t(`catalog.items.${item.detailKey}.name`)}
                              </h3>

                              <div className="hidden space-y-1 pt-1 text-xs sm:block">
                                {item.highlightSpecs.map((spec) => (
                                  <div
                                    key={spec.id}
                                    className="flex items-center gap-1.5 font-medium"
                                  >
                                    <Check className="size-3.5 text-premium-red shrink-0" />
                                    <span className="text-stone-gray font-medium">
                                      {spec.id === "irBlock"
                                        ? "IR Block"
                                        : spec.id === "uvBlock"
                                          ? "UV Block"
                                          : spec.id === "vlt"
                                            ? "VLT"
                                            : spec.id.toUpperCase()}
                                      :
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

                          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 w-full sm:w-auto border-t sm:border-t-0 border-border-gray/60 pt-3 sm:pt-0 shrink-0">
                            <div className="text-left sm:text-right">
                              <span className="text-xs text-stone-gray font-normal">
                                {t("catalog.priceFrom")}
                              </span>
                              <span className="block text-lg font-semibold text-premium-red">
                                {meta.priceFormatted}₫
                              </span>
                            </div>
                            <Link
                              href={APP_ROUTES.product(item.slug)}
                              className="inline-flex items-center justify-center rounded-md bg-deep-black px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-premium-red cursor-pointer shadow-xs"
                            >
                              {t("viewDetails")}
                            </Link>
                          </div>
                        </StaggerItem>
                      );
                    }

                    return (
                      <StaggerItem
                        key={item.id}
                        className="group flex flex-col justify-between overflow-hidden rounded-md border border-border-gray/80 bg-white shadow-xs transition-all duration-300 hover:border-premium-red/50 hover:shadow-xl hover:-translate-y-1"
                      >
                        <div>
                          {/* CARD TOP IMAGE WITH BADGE */}
                          <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-muted border-b border-border-gray/60">
                            <Image
                              src={item.image}
                              alt={t("productImageAlt", { code: item.code })}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              className="object-contain p-3 transition-transform duration-500 group-hover:scale-105"
                            />
                            {meta.badge && (
                              <span
                                className={`absolute left-3.5 top-3.5 rounded px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider shadow-2xs ${meta.badge.color}`}
                              >
                                {meta.badge.label}
                              </span>
                            )}
                          </div>

                          {/* CARD CONTENT BODY */}
                          <div className="space-y-3 p-5">
                            <div>
                              <span className="mb-1 block text-xs font-semibold text-premium-red">
                                {t(`catalog.categories.${item.category}`)}
                              </span>
                              <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold uppercase text-deep-black transition-colors group-hover:text-premium-red sm:text-base">
                                {t(`catalog.items.${item.detailKey}.name`)}
                              </h3>
                            </div>

                            {/* HIGHLIGHT SPECS LIST WITH CHECKMARKS */}
                            <div className="space-y-1.5 border-t border-border-gray/50 pt-2 text-xs">
                              {item.highlightSpecs.map((spec) => (
                                <div
                                  key={spec.id}
                                  className="flex items-center gap-1.5 font-medium"
                                >
                                  <Check className="size-3.5 text-premium-red shrink-0" />
                                  <span className="text-stone-gray font-medium">
                                    {spec.id === "irBlock"
                                      ? "IR Block"
                                      : spec.id === "uvBlock"
                                        ? "UV Block"
                                        : spec.id === "vlt"
                                          ? "VLT"
                                          : spec.id.toUpperCase()}
                                    :
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

                        {/* CARD FOOTER: PRICE & CTA */}
                        <div className="flex items-center justify-between border-t border-border-gray/60 p-5 pt-3.5">
                          <div>
                            <span className="text-xs text-stone-gray font-normal">
                              {t("catalog.priceFrom")}
                            </span>
                            <span className="text-base sm:text-lg font-semibold text-premium-red ml-1">
                              {meta.priceFormatted}₫
                            </span>
                          </div>

                          <Link
                            href={APP_ROUTES.product(item.slug)}
                            className="inline-flex items-center justify-center rounded-md bg-deep-black px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-premium-red cursor-pointer shadow-xs"
                          >
                            {t("viewDetails")}
                          </Link>
                        </div>
                      </StaggerItem>
                    );
                  })}
                </StaggerGroup>

                {/* PAGINATION BAR */}
                {totalPages > 1 && (
                  <PaginationControls
                    className="mt-8 items-center xl:flex-col xl:items-center"
                    classNames={{
                      activePageButton:
                        "border-premium-red bg-premium-red text-white shadow-sm hover:bg-warm-red",
                      directionButton:
                        "border border-border-gray bg-white text-stone-gray hover:border-premium-red hover:bg-white hover:text-premium-red",
                      pageButton:
                        "border border-border-gray bg-white text-deep-black hover:border-premium-red hover:bg-white hover:text-premium-red",
                      pageStatus: "text-stone-gray",
                    }}
                    nextLabel={t("catalog.next")}
                    onPageChange={setCurrentPage}
                    onScrollToTarget={(targetId) => {
                      const target = document.getElementById(targetId);
                      if (!target) return;

                      const reduceMotion = window.matchMedia(
                        "(prefers-reduced-motion: reduce)",
                      ).matches;
                      scrollTo(target, {
                        duration: reduceMotion ? 0 : 1.2,
                        immediate: reduceMotion,
                        offset: -96,
                      });
                    }}
                    page={currentPage}
                    pageLabel={(page) => t("catalog.goToPage", { page })}
                    paginationLabel={t("catalog.paginationLabel")}
                    previousLabel={t("catalog.prev")}
                    scrollTargetId={PRODUCT_RESULTS_ID}
                    showDesktopDirectionLabels={false}
                    totalPages={totalPages}
                  />
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border-gray bg-white py-16 px-6 text-center shadow-2xs">
                <Search className="size-10 text-stone-gray/40" />
                <h3 className="mt-4 font-semibold uppercase tracking-wider text-lg text-deep-black">
                  {t("catalog.noResultsTitle")}
                </h3>
                <p className="mt-1 text-xs text-stone-gray max-w-md">
                  {t("catalog.noResultsDesc")}
                </p>
                <Button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedPriceRange("all");
                    setActiveCategory("all");
                  }}
                  className="mt-5 bg-premium-red px-5 text-xs font-semibold uppercase tracking-wider text-white shadow-sm hover:bg-warm-red"
                >
                  {t("catalog.clearFilters")}
                </Button>
              </div>
            )}
          </div>
        </Container>
      </section>
    </main>
  );
}
