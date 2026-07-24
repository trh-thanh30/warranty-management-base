"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Search,
  X,
  CheckCircle2,
  Car,
  Calendar,
  Phone,
  User,
  ShieldCheck,
  Building2,
  Sparkles,
  Hash,
  MapPin,
  Clock,
  FileText,
} from "lucide-react";
import { Input } from "@repo/ui/input";
import { demoWarrantyCustomer } from "@/src/constants/warranty.constants";
import { formControlFocusClassName } from "@/src/components/common/form-control.constants";

interface WarrantyLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

interface WarrantyLookupResult {
  serial: string;
  code: string;
  customerName: string;
  phone: string;
  address: string;
  carPlate: string;
  carModel: string;
  filmType: string;
  warrantyYears: string;
  installedDate: string;
  expiryDate: string;
  dealer: string;
  status: string;
  // Glass positions
  windshield: string;
  frontLeftGlass: string;
  frontRightGlass: string;
  rearLeftGlass: string;
  rearRightGlass: string;
  sunroof: string;
  rearGlass: string;
  notes: string;
}

export function WarrantyLookupModal({
  isOpen,
  onClose,
  initialQuery = "",
}: WarrantyLookupModalProps) {
  const t = useTranslations("WarrantyLookupModal");
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchResult, setSearchResult] = useState<WarrantyLookupResult | null>(
    null,
  );
  const [isSearched, setIsSearched] = useState(false);

  const performSearch = useCallback(
    (query: string) => {
      setIsSearched(true);
      if (query.trim().length > 0) {
        setSearchResult({
          serial: "BL/BHDT/000199",
          code: "FJ-8899-2026",
          customerName: demoWarrantyCustomer.name,
          phone: query.includes("09") ? query : "0988 123 456",
          address: demoWarrantyCustomer.address,
          carPlate: query.includes("30") ? query : "30H-888.88",
          carModel: "Lexus RX350 (2025)",
          filmType: "FUJITEK Sputtering Multi-Layer SP50",
          warrantyYears: t("mock.warrantyYears"),
          installedDate: "15/01/2026",
          expiryDate: "15/01/2041",
          dealer: t("mock.dealer"),
          status: t("mock.status"),
          windshield: "SP50",
          frontLeftGlass: "SP30",
          frontRightGlass: "SP30",
          rearLeftGlass: "SP30",
          rearRightGlass: "SP30",
          sunroof: "",
          rearGlass: "SP30",
          notes: "",
        });
      } else {
        setSearchResult(null);
      }
    },
    [t],
  );

  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
      performSearch(initialQuery);
    }
  }, [initialQuery, performSearch]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen, onClose]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div
        className="fixed inset-0 bg-deep-black/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
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
                className="text-base font-medium uppercase tracking-wide text-deep-black sm:text-lg"
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
            onClick={onClose}
            aria-label={t("closeAriaLabel")}
            className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-white text-stone-gray transition-colors hover:bg-light-gray hover:text-deep-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-red focus-visible:ring-offset-2"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="max-h-[80vh] space-y-6 overflow-y-auto p-5 sm:p-6">
          <form onSubmit={handleSearchSubmit} className="space-y-3">
            <div className="flex flex-col gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-stone-gray" />
                <Input
                  type="text"
                  autoFocus
                  placeholder={t("placeholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`h-12 rounded-xl border-border-gray bg-white pl-12 text-base sm:h-14 ${formControlFocusClassName}`}
                />
              </div>
              <button
                type="submit"
                className="h-12 w-full cursor-pointer rounded-xl bg-premium-red px-6 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-warm-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-red focus-visible:ring-offset-2 sm:h-14"
              >
                {t("search")}
              </button>
            </div>
            <p className="text-xs text-stone-gray font-medium text-center">
              {t("tryPrefix")}{" "}
              <code className="bg-light-gray px-2 py-0.5 rounded font-mono text-premium-red font-medium">
                0988123456
              </code>{" "}
              {t("or")}{" "}
              <code className="bg-light-gray px-2 py-0.5 rounded font-mono text-premium-red font-medium">
                30H-888.88
              </code>
            </p>
          </form>

          {isSearched && searchResult && (
            <div className="space-y-6 rounded-2xl border border-border-gray bg-surface-muted p-5 shadow-md animate-in fade-in duration-300 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-gray pb-4">
                <div className="space-y-1">
                  <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-deep-black">
                    <CheckCircle2 className="size-4" />
                    <span>{searchResult.status}</span>
                  </span>
                  <h4 className="text-lg font-medium uppercase text-deep-black sm:text-xl">
                    {t("result.code")}: {searchResult.code}
                  </h4>
                </div>
                <span className="rounded-full bg-accent-gold px-3.5 py-1 text-xs font-medium uppercase tracking-wide text-deep-black">
                  {t("result.warranty")}: {searchResult.warrantyYears}
                </span>
              </div>

              {/* Info section */}
              <div className="divide-y divide-border-gray">
                {/* Số Serial */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 py-3">
                  <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-gray shrink-0 sm:min-w-[160px]">
                    <Hash className="size-4 shrink-0" /> {t("result.serial")}
                  </span>
                  <p className="font-semibold text-sm text-deep-black sm:text-right break-words">
                    {searchResult.serial}
                  </p>
                </div>

                {/* Mã E-Warranty */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 py-3">
                  <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-gray shrink-0 sm:min-w-[160px]">
                    <FileText className="size-4 shrink-0" /> {t("result.code")}
                  </span>
                  <p className="font-semibold text-sm text-deep-black sm:text-right break-words">
                    {searchResult.code}
                  </p>
                </div>

                {/* Biển số xe */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 py-3">
                  <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-gray shrink-0 sm:min-w-[160px]">
                    <Car className="size-4 shrink-0" /> {t("result.carPlate")}
                  </span>
                  <p className="font-semibold text-sm text-deep-black sm:text-right break-words">
                    {searchResult.carPlate}
                  </p>
                </div>

                {/* Loại xe */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 py-3">
                  <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-gray shrink-0 sm:min-w-[160px]">
                    <Car className="size-4 shrink-0" /> {t("result.carModel")}
                  </span>
                  <p className="font-semibold text-sm text-deep-black sm:text-right break-words">
                    {searchResult.carModel}
                  </p>
                </div>

                {/* Khách hàng */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 py-3">
                  <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-gray shrink-0 sm:min-w-[160px]">
                    <User className="size-4 shrink-0" /> {t("result.owner")}
                  </span>
                  <p className="font-semibold text-sm text-deep-black sm:text-right break-words">
                    {searchResult.customerName}
                  </p>
                </div>

                {/* Số điện thoại */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 py-3">
                  <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-gray shrink-0 sm:min-w-[160px]">
                    <Phone className="size-4 shrink-0" /> {t("result.phone")}
                  </span>
                  <p className="font-semibold text-sm text-deep-black sm:text-right break-words">
                    {searchResult.phone}
                  </p>
                </div>

                {/* Địa chỉ */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 py-3">
                  <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-gray shrink-0 sm:min-w-[160px]">
                    <MapPin className="size-4 shrink-0" /> {t("result.address")}
                  </span>
                  <p className="font-semibold text-sm text-deep-black sm:text-right break-words">
                    {searchResult.address}
                  </p>
                </div>

                {/* Đơn vị thi công */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 py-3">
                  <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-gray shrink-0 sm:min-w-[160px]">
                    <Building2 className="size-4 shrink-0" />{" "}
                    {t("result.dealer")}
                  </span>
                  <p className="font-semibold text-sm text-deep-black sm:text-right break-words">
                    {searchResult.dealer}
                  </p>
                </div>

                {/* Ngày thi công */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 py-3">
                  <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-gray shrink-0 sm:min-w-[160px]">
                    <Calendar className="size-4 shrink-0" />{" "}
                    {t("result.installedDate")}
                  </span>
                  <p className="font-semibold text-sm text-deep-black sm:text-right break-words">
                    {searchResult.installedDate}
                  </p>
                </div>

                {/* Tên gói dán */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 py-3">
                  <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-gray shrink-0 sm:min-w-[160px]">
                    <Sparkles className="size-4 shrink-0" /> {t("result.film")}
                  </span>
                  <p className="font-semibold text-sm text-deep-black sm:text-right break-words">
                    {searchResult.filmType}
                  </p>
                </div>

                {/* Thời gian bảo hành */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 py-3">
                  <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-gray shrink-0 sm:min-w-[160px]">
                    <Clock className="size-4 shrink-0" />{" "}
                    {t("result.warrantyYears")}
                  </span>
                  <p className="font-semibold text-sm text-deep-black sm:text-right break-words">
                    {searchResult.warrantyYears}
                  </p>
                </div>

                {/* Hạn bảo hành */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 py-3">
                  <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-gray shrink-0 sm:min-w-[160px]">
                    <ShieldCheck className="size-4 shrink-0" />{" "}
                    {t("result.expiryDate")}
                  </span>
                  <div className="sm:text-right">
                    <p className="font-semibold text-sm text-deep-black break-words">
                      {searchResult.expiryDate}
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-premium-red">
                      {searchResult.status}
                    </p>
                  </div>
                </div>
              </div>

              {/* Glass positions */}
              <div className="pt-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-gray mb-2">
                  {t("result.glassSection")}
                </p>
                <div className="divide-y divide-border-gray">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-4 py-2.5">
                    <span className="text-xs font-medium text-stone-gray shrink-0 sm:min-w-[160px]">
                      {t("result.windshield")}
                    </span>
                    <p className="font-semibold text-sm text-deep-black sm:text-right break-words">
                      {searchResult.windshield || "—"}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-4 py-2.5">
                    <span className="text-xs font-medium text-stone-gray shrink-0 sm:min-w-[160px]">
                      {t("result.frontLeftGlass")}
                    </span>
                    <p className="font-semibold text-sm text-deep-black sm:text-right break-words">
                      {searchResult.frontLeftGlass || "—"}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-4 py-2.5">
                    <span className="text-xs font-medium text-stone-gray shrink-0 sm:min-w-[160px]">
                      {t("result.frontRightGlass")}
                    </span>
                    <p className="font-semibold text-sm text-deep-black sm:text-right break-words">
                      {searchResult.frontRightGlass || "—"}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-4 py-2.5">
                    <span className="text-xs font-medium text-stone-gray shrink-0 sm:min-w-[160px]">
                      {t("result.rearLeftGlass")}
                    </span>
                    <p className="font-semibold text-sm text-deep-black sm:text-right break-words">
                      {searchResult.rearLeftGlass || "—"}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-4 py-2.5">
                    <span className="text-xs font-medium text-stone-gray shrink-0 sm:min-w-[160px]">
                      {t("result.rearRightGlass")}
                    </span>
                    <p className="font-semibold text-sm text-deep-black sm:text-right break-words">
                      {searchResult.rearRightGlass || "—"}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-4 py-2.5">
                    <span className="text-xs font-medium text-stone-gray shrink-0 sm:min-w-[160px]">
                      {t("result.sunroof")}
                    </span>
                    <p className="font-semibold text-sm text-deep-black sm:text-right break-words">
                      {searchResult.sunroof || "—"}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-4 py-2.5">
                    <span className="text-xs font-medium text-stone-gray shrink-0 sm:min-w-[160px]">
                      {t("result.rearGlass")}
                    </span>
                    <p className="font-semibold text-sm text-deep-black sm:text-right break-words">
                      {searchResult.rearGlass || "—"}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-4 py-2.5">
                    <span className="text-xs font-medium text-stone-gray shrink-0 sm:min-w-[160px]">
                      {t("result.notes")}
                    </span>
                    <p className="font-semibold text-sm text-deep-black sm:text-right break-words">
                      {searchResult.notes || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* CSKH Support Contact Banner */}
              <div className="mt-6 border-t border-border-gray text-center space-y-3 bg-surface-muted/60 rounded-xl p-5 sm:p-6">
                <p className="text-xs text-stone-gray font-medium leading-relaxed max-w-md mx-auto">
                  {t("supportMessage")}
                </p>
                <div>
                  <a
                    href="tel:19009169"
                    className="inline-flex items-center gap-2 bg-premium-red hover:bg-warm-red text-white px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all shadow-md hover:scale-105"
                  >
                    <Phone className="size-3.5 animate-bounce" />
                    <span>Hotline: 1900.9169</span>
                  </a>
                </div>
                <p className="text-xs font-semibold text-deep-black uppercase tracking-wide">
                  {t("supportClosing")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
