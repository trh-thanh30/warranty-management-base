"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  CheckCircle2,
  Car,
  Calendar,
  Phone,
  User,
  Building2,
  Hash,
  MapPin,
  Clock,
  ShieldCheck,
  Sparkles,
  FileText,
  Layers,
} from "lucide-react";
import { Input } from "@repo/ui/input";
import { formControlFocusClassName } from "@/src/components/common/form-control.constants";
import { demoWarrantyCustomer } from "@/src/constants/warranty.constants";
import { APP_ROUTES } from "@/src/constants/routes.constants";
import { Link } from "@/src/i18n/navigation";
import { demoWarrantyRecord } from "./warranty.constants";
import type { WarrantyLookupResult } from "./warranty.types";

function ResultRow({
  icon,
  label,
  value,
  valueClassName = "",
  subValue,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  valueClassName?: string;
  subValue?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-4 py-3.5 border-b border-border-gray last:border-b-0">
      <span className="flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-wide text-stone-gray shrink-0 sm:min-w-[180px]">
        {icon}
        {label}
      </span>
      <div className="sm:text-right">
        <p
          className={`font-semibold text-sm sm:text-base text-deep-black break-words ${valueClassName}`}
        >
          {value || "—"}
        </p>
        {subValue && (
          <p className="text-xs font-medium text-green-600 mt-0.5">
            {subValue}
          </p>
        )}
      </div>
    </div>
  );
}

export function WarrantyLookupView() {
  const t = useTranslations("Warranty.lookup");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<WarrantyLookupResult | null>(
    null,
  );
  const [isSearched, setIsSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearched(true);
    if (searchQuery.trim().length > 0) {
      setSearchResult({
        ...demoWarrantyRecord,
        customerName: demoWarrantyCustomer.name,
        phone: searchQuery.includes("09")
          ? searchQuery
          : demoWarrantyRecord.phone,
        address: "TP. Hồ Chí Minh",
        warrantyYears: t("mock.warrantyYears"),
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
  };

  return (
    <main className="min-h-screen bg-surface-muted text-deep-black pb-16 sm:pb-24">
      {/* 1. Hero Banner matching Dealers & About pages */}
      <section className="relative w-full h-[260px] sm:h-[360px] bg-deep-black overflow-hidden flex items-center">
        <Image
          src="/708986914_976804048389364_3900113787497783781_n.jpg"
          alt={t("heroImageAlt")}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-deep-black via-deep-black/80 to-transparent z-10" />
        <div className="relative z-20 mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-12 w-full space-y-3">
          <span className="inline-block bg-premium-red text-white px-4 py-1 rounded-md text-xs font-semibold uppercase tracking-[0.25em]">
            {t("eyebrow")}
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-condensed font-semibold uppercase text-white tracking-wider leading-tight">
            {t("title")}
          </h1>
          <p className="text-sm sm:text-base text-white/80 font-medium max-w-xl">
            {t("description")}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-12 space-y-16 mt-12 sm:mt-16">
        {/* 2. Registration Methods Section */}
        <section className="space-y-8 text-center max-w-4xl lg:max-w-5xl mx-auto">
          <div className="space-y-3">
            <h2 className="text-xl sm:text-3xl font-condensed font-semibold uppercase tracking-wider text-deep-black">
              Mã bảo hành điện tử của Quý khách có thể được đăng ký bằng một
              trong các dãy số
            </h2>
            <p className="text-sm text-stone-gray font-medium max-w-xl mx-auto">
              Sử dụng một trong 3 phương thức dưới đây để tra cứu thông tin tem
              E-Warranty
            </p>
            <div className="mt-4 mx-auto h-[3px] w-20 bg-premium-red" />
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {/* Card 01 - Phone */}
            <div className="group bg-white rounded-[24px] border border-border-gray shadow-md hover:shadow-xl hover:border-premium-red transition-all p-6 sm:p-7 text-left flex flex-col justify-between h-[230px]">
              <div className="flex items-center justify-between">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-surface-muted border border-border-gray text-stone-gray group-hover:text-premium-red group-hover:border-premium-red/30 transition-colors">
                  <Phone className="size-6" strokeWidth={1.8} />
                </div>
                <span className="text-3xl sm:text-4xl font-condensed font-bold text-stone-gray/20 group-hover:text-premium-red/30 transition-colors">
                  01
                </span>
              </div>
              <div className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-gray">
                  Phương thức 01
                </span>
                <h3 className="text-lg sm:text-xl font-semibold uppercase text-deep-black group-hover:text-premium-red transition-colors">
                  Số điện thoại
                </h3>
                <p className="text-xs text-stone-gray font-medium">
                  SĐT chính chủ đã đăng ký khi dán phim
                </p>
              </div>
            </div>

            {/* Card 02 - QR / Email */}
            <div className="group bg-white rounded-[24px] border border-border-gray shadow-md hover:shadow-xl hover:border-premium-red transition-all p-6 sm:p-7 text-left flex flex-col justify-between h-[230px]">
              <div className="flex items-center justify-between">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-surface-muted border border-border-gray text-stone-gray group-hover:text-premium-red group-hover:border-premium-red/30 transition-colors">
                  <FileText className="size-6" strokeWidth={1.8} />
                </div>
                <span className="text-3xl sm:text-4xl font-condensed font-bold text-stone-gray/20 group-hover:text-premium-red/30 transition-colors">
                  02
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-gray">
                    Phương thức 02
                  </span>
                  <span className="rounded-full bg-accent-gold px-2.5 py-0.5 text-[10px] font-bold uppercase text-deep-black">
                    E-Warranty
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold uppercase text-deep-black group-hover:text-premium-red transition-colors">
                  Mã QR / Email
                </h3>
                <p className="text-xs text-stone-gray font-medium">
                  Mã tem bảo hành nhận qua tin nhắn hoặc email
                </p>
              </div>
            </div>

            {/* Card 03 - Serial Number */}
            <div className="group bg-white rounded-[24px] border border-border-gray shadow-md hover:shadow-xl hover:border-premium-red transition-all p-6 sm:p-7 text-left flex flex-col justify-between h-[230px]">
              <div className="flex items-center justify-between">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-surface-muted border border-border-gray text-stone-gray group-hover:text-premium-red group-hover:border-premium-red/30 transition-colors">
                  <Hash className="size-6" strokeWidth={1.8} />
                </div>
                <span className="text-3xl sm:text-4xl font-condensed font-bold text-stone-gray/20 group-hover:text-premium-red/30 transition-colors">
                  03
                </span>
              </div>
              <div className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-gray">
                  Phương thức 03
                </span>
                <h3 className="text-lg sm:text-xl font-semibold uppercase text-deep-black group-hover:text-premium-red transition-colors">
                  Serial Number
                </h3>
                <p className="text-xs font-mono text-stone-gray">
                  Mã dạng: BL/BHDT/000199
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Search Section */}
        <section className="space-y-6 max-w-3xl sm:max-w-4xl lg:max-w-5xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-4xl font-condensed font-bold uppercase tracking-wider text-deep-black">
              TRA CỨU
            </h2>
            <p className="text-xs sm:text-sm text-stone-gray font-medium max-w-lg mx-auto">
              Vui lòng nhập đầy đủ thông tin mã hoặc Số Điện Thoại cung cấp trên
              phiếu bảo hành.
            </p>
          </div>

          {/* Unified Search & Result Card */}
          <motion.div
            layout
            className="bg-white rounded-[28px] p-6 sm:p-10 border border-border-gray shadow-xl max-w-3xl sm:max-w-4xl lg:max-w-5xl mx-auto overflow-hidden"
          >
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-stone-gray" />
                  <Input
                    type="text"
                    placeholder={t("placeholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`pl-12 h-14 rounded-[16px] text-base border-border-gray ${formControlFocusClassName}`}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 bg-premium-red hover:bg-warm-red text-white h-14 rounded-[16px] text-base font-semibold uppercase tracking-wider transition-colors cursor-pointer shrink-0 shadow-md"
                >
                  {t("search")}
                </button>
              </div>
              <p className="text-xs text-stone-gray font-medium text-center">
                {t("tryPrefix")}{" "}
                <code className="bg-light-gray px-2 py-0.5 rounded font-mono text-premium-red">
                  0988123456
                </code>{" "}
                {t("or")}{" "}
                <code className="bg-light-gray px-2 py-0.5 rounded font-mono text-premium-red">
                  30H-888.88
                </code>
              </p>
            </form>

            {/* Expanded Result inside the same Card */}
            <AnimatePresence>
              {isSearched && searchResult && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden border-t border-border-gray pt-6"
                >
                  {/* Result Status & Code Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-surface-muted border border-border-gray mb-6">
                    <div className="space-y-1">
                      <span className="text-xs font-semibold uppercase text-premium-red tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="size-4" />
                        <span>{searchResult.status}</span>
                      </span>
                      <h3 className="text-lg sm:text-xl font-semibold uppercase">
                        {t("result.code")}: {searchResult.code}
                      </h3>
                    </div>
                    <span className="bg-premium-red text-white px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                      {t("result.duration")}: {searchResult.warrantyYears}
                    </span>
                  </div>

                  {/* Table — thông tin chính */}
                  <div className="divide-y divide-border-gray">
                    <ResultRow
                      icon={<Hash className="size-4 shrink-0" />}
                      label={t("result.serial")}
                      value={searchResult.serial}
                    />
                    <ResultRow
                      icon={<Car className="size-4 shrink-0" />}
                      label={t("result.carPlate")}
                      value={searchResult.carPlate}
                    />
                    <ResultRow
                      icon={<Car className="size-4 shrink-0" />}
                      label={t("result.carModel")}
                      value={searchResult.carModel}
                    />
                    <ResultRow
                      icon={<User className="size-4 shrink-0" />}
                      label={t("result.owner")}
                      value={searchResult.customerName}
                    />
                    <ResultRow
                      icon={<Phone className="size-4 shrink-0" />}
                      label={t("result.phone")}
                      value={searchResult.phone}
                    />
                    <ResultRow
                      icon={<MapPin className="size-4 shrink-0" />}
                      label={t("result.address")}
                      value={searchResult.address}
                    />
                    <ResultRow
                      icon={<Building2 className="size-4 shrink-0" />}
                      label={t("result.dealer")}
                      value={searchResult.dealer}
                    />
                    <ResultRow
                      icon={<Calendar className="size-4 shrink-0" />}
                      label={t("result.installedDate")}
                      value={searchResult.installedDate}
                    />
                    <ResultRow
                      icon={<Sparkles className="size-4 shrink-0" />}
                      label={t("result.film")}
                      value={searchResult.filmType}
                    />
                    <ResultRow
                      icon={<Clock className="size-4 shrink-0" />}
                      label={t("result.warrantyYears")}
                      value={searchResult.warrantyYears}
                    />
                    <ResultRow
                      icon={<ShieldCheck className="size-4 shrink-0" />}
                      label={t("result.expiryDate")}
                      value={searchResult.expiryDate}
                      subValue={searchResult.status}
                    />
                  </div>

                  {/* Glass positions section */}
                  <div className="border-t border-border-gray pt-6 mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-stone-gray mb-2 flex items-center gap-1.5">
                      <Layers className="size-4" />
                      {t("result.glassSection")}
                    </p>
                    <div className="divide-y divide-border-gray">
                      <ResultRow
                        label={t("result.windshield")}
                        value={searchResult.windshield}
                      />
                      <ResultRow
                        label={t("result.frontLeftGlass")}
                        value={searchResult.frontLeftGlass}
                      />
                      <ResultRow
                        label={t("result.frontRightGlass")}
                        value={searchResult.frontRightGlass}
                      />
                      <ResultRow
                        label={t("result.rearLeftGlass")}
                        value={searchResult.rearLeftGlass}
                      />
                      <ResultRow
                        label={t("result.rearRightGlass")}
                        value={searchResult.rearRightGlass}
                      />
                      <ResultRow
                        label={t("result.sunroof")}
                        value={searchResult.sunroof}
                      />
                      <ResultRow
                        label={t("result.rearGlass")}
                        value={searchResult.rearGlass}
                      />
                      <ResultRow
                        label={t("result.notes")}
                        value={searchResult.notes}
                      />
                    </div>
                  </div>

                  {/* CSKH Support Contact Banner */}
                  <div className="mt-8 border-t border-border-gray pt-6 pb-6 text-center space-y-4 bg-surface-muted/60 rounded-2xl p-6 sm:p-8">
                    <p className="text-sm sm:text-base text-stone-gray font-medium leading-relaxed max-w-lg mx-auto">
                      Bất cứ khi nào cần sự hỗ trợ từ FUJITEK, Quý khách vui
                      lòng liên hệ hotline CSKH.
                    </p>
                    <div className="flex justify-center">
                      <a
                        href="tel:19009169"
                        className="inline-flex items-center gap-2 bg-premium-red hover:bg-warm-red text-white px-6 py-3.5 rounded-full text-sm font-semibold uppercase tracking-wider transition-all shadow-md hover:shadow-lg hover:scale-105 whitespace-nowrap shrink-0"
                      >
                        <Phone className="size-4 animate-bounce shrink-0" />
                        <span className="whitespace-nowrap">
                          Hotline: 1900.9169
                        </span>
                      </a>
                    </div>
                    <p className="text-xs font-semibold text-deep-black uppercase tracking-wide">
                      FUJITEK Films hân hạnh được phục vụ Quý khách!
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* No result inside same Card */}
            <AnimatePresence>
              {isSearched && !searchResult && (
                <motion.div
                  key="no-result"
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden border-t border-border-gray pt-6 text-center text-stone-gray font-medium"
                >
                  {t("noResult")}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Permanent Quick Guide & Trust Badges Section */}
            <div className="mt-10 border-t border-border-gray pt-8 space-y-8">
              {/* Steps Guide */}
              <div>
                <p className="text-center text-xs font-semibold uppercase tracking-wider text-stone-gray mb-6">
                  Hướng dẫn tra cứu E-Warranty trong 3 bước
                </p>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="bg-surface-muted/70 p-4 rounded-2xl border border-border-gray space-y-1 text-center">
                    <span className="inline-block text-xs font-condensed font-bold text-premium-red uppercase tracking-widest bg-premium-red/10 px-2.5 py-0.5 rounded-full">
                      Bước 01
                    </span>
                    <h4 className="text-sm font-semibold uppercase text-deep-black pt-1">
                      Nhập thông tin
                    </h4>
                    <p className="text-xs text-stone-gray font-medium">
                      Nhập Số điện thoại, Biển số xe hoặc Mã tem E-Warranty.
                    </p>
                  </div>

                  <div className="bg-surface-muted/70 p-4 rounded-2xl border border-border-gray space-y-1 text-center">
                    <span className="inline-block text-xs font-condensed font-bold text-premium-red uppercase tracking-widest bg-premium-red/10 px-2.5 py-0.5 rounded-full">
                      Bước 02
                    </span>
                    <h4 className="text-sm font-semibold uppercase text-deep-black pt-1">
                      Nhấn Tra Cứu
                    </h4>
                    <p className="text-xs text-stone-gray font-medium">
                      Hệ thống tự động truy xuất dữ liệu bảo hành chính hãng.
                    </p>
                  </div>

                  <div className="bg-surface-muted/70 p-4 rounded-2xl border border-border-gray space-y-1 text-center">
                    <span className="inline-block text-xs font-condensed font-bold text-premium-red uppercase tracking-widest bg-premium-red/10 px-2.5 py-0.5 rounded-full">
                      Bước 03
                    </span>
                    <h4 className="text-sm font-semibold uppercase text-deep-black pt-1">
                      Xem chi tiết
                    </h4>
                    <p className="text-xs text-stone-gray font-medium">
                      Xem thông tin chủ xe, gói dán, các vị trí kính & thời hạn
                      15 năm.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Links / Other Actions */}
              <div className="border-t border-border-gray pt-6">
                <p className="text-center text-xs font-semibold uppercase tracking-wider text-stone-gray mb-4">
                  Dịch vụ bảo hành khác
                </p>
                <div className="grid gap-3 sm:grid-cols-3 text-xs font-semibold uppercase tracking-wide text-center">
                  <Link
                    href={APP_ROUTES.warrantyActivate}
                    className="p-3.5 rounded-xl bg-surface-muted hover:bg-premium-red hover:text-white border border-border-gray transition-colors text-deep-black flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="size-4 shrink-0" />
                    <span>Kích hoạt tem mới</span>
                  </Link>
                  <Link
                    href={APP_ROUTES.warrantyRequest}
                    className="p-3.5 rounded-xl bg-surface-muted hover:bg-premium-red hover:text-white border border-border-gray transition-colors text-deep-black flex items-center justify-center gap-2"
                  >
                    <FileText className="size-4 shrink-0" />
                    <span>Gửi yêu cầu sự cố</span>
                  </Link>
                  <Link
                    href={APP_ROUTES.dealers}
                    className="p-3.5 rounded-xl bg-surface-muted hover:bg-premium-red hover:text-white border border-border-gray transition-colors text-deep-black flex items-center justify-center gap-2"
                  >
                    <Building2 className="size-4 shrink-0" />
                    <span>Tìm trạm thi công</span>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* 4. Policy Shortcut Banner Section */}
        <section className="max-w-3xl sm:max-w-4xl lg:max-w-5xl mx-auto">
          <div className="bg-white rounded-[24px] border border-border-gray p-6 sm:p-8 shadow-md hover:shadow-xl transition-all flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-premium-red">
                <ShieldCheck className="size-4" />
                <span>Chính sách & Điều khoản</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold uppercase text-deep-black">
                Bạn muốn tìm hiểu chi tiết về phạm vi & quy định bảo hành?
              </h3>
              <p className="text-xs sm:text-sm text-stone-gray font-medium">
                Xem quy định thời gian bảo hành (10 - 15 năm), trường hợp được
                bảo hành & lưu ý sau khi dán phim.
              </p>
            </div>

            <Link
              href={APP_ROUTES.policyWarrantyReturn}
              className="inline-flex items-center gap-2.5 bg-premium-red hover:bg-warm-red text-white px-6 py-3.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shrink-0 shadow-md"
            >
              <span>Xem chính sách bảo hành</span>
              <FileText className="size-4" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
