"use client";

import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import { MapPin, Search } from "lucide-react";
import type { NearbyDealerStatus } from "../dealers.types";
import { dealerFilterAll } from "../dealers.utils";

type DealerFiltersProps = {
  districts: readonly string[];
  nearMeOnly: boolean;
  nearbyStatus: NearbyDealerStatus;
  onNearMeChange: (value: boolean) => void;
  onProvinceChange: (value: string) => void;
  onDistrictChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  provinces: readonly string[];
  resultCountLabel: string;
  searchQuery: string;
  selectedDistrict: string;
  selectedProvince: string;
  translations: {
    allDistricts: string;
    allProvinces: string;
    districtAriaLabel: string;
    nearMe: string;
    nearMeError: string;
    nearMeLoading: string;
    nearMeUnsupported: string;
    provinceAriaLabel: string;
    searchAriaLabel: string;
    searchPlaceholder: string;
  };
};

export function DealerFilters({
  districts,
  nearMeOnly,
  nearbyStatus,
  onDistrictChange,
  onNearMeChange,
  onProvinceChange,
  onSearchChange,
  provinces,
  resultCountLabel,
  searchQuery,
  selectedDistrict,
  selectedProvince,
  translations,
}: DealerFiltersProps) {
  return (
    <div className="space-y-4 border-b border-border-gray bg-surface-muted p-6">
      <div className="relative flex items-center">
        <label className="sr-only" htmlFor="dealer-search">
          {translations.searchAriaLabel}
        </label>
        <Input
          id="dealer-search"
          type="search"
          placeholder={translations.searchPlaceholder}
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          className="h-12 rounded-[14px] border-border-gray bg-white pr-10 text-sm focus-visible:ring-premium-red"
        />
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute right-3.5 size-5 text-stone-gray"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Select value={selectedProvince} onValueChange={onProvinceChange}>
          <SelectTrigger
            aria-label={translations.provinceAriaLabel}
            className="h-11 rounded-[12px] border-border-gray bg-white text-xs font-medium text-deep-black focus:ring-2 focus:ring-premium-red sm:text-sm"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={dealerFilterAll}>
              {translations.allProvinces}
            </SelectItem>
            {provinces.map((province) => (
              <SelectItem key={province} value={province}>
                {province}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          disabled={selectedProvince === dealerFilterAll}
          value={selectedDistrict}
          onValueChange={onDistrictChange}
        >
          <SelectTrigger
            aria-label={translations.districtAriaLabel}
            className="h-11 rounded-[12px] border-border-gray bg-white text-xs font-medium text-deep-black focus:ring-2 focus:ring-premium-red sm:text-sm"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={dealerFilterAll}>
              {translations.allDistricts}
            </SelectItem>
            {districts.map((district) => (
              <SelectItem key={district} value={district}>
                {district}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        type="button"
        aria-pressed={nearMeOnly}
        disabled={nearbyStatus === "loading"}
        onClick={() => onNearMeChange(!nearMeOnly)}
        className={
          nearMeOnly
            ? "min-h-11 w-full rounded-[12px] bg-premium-red text-xs font-semibold uppercase tracking-wider text-white hover:bg-warm-red"
            : "min-h-11 w-full rounded-[12px] bg-accent-gold text-xs font-semibold uppercase tracking-wider text-deep-black hover:bg-accent-gold-hover"
        }
      >
        <MapPin aria-hidden="true" className="size-4 shrink-0" />
        <span>{translations.nearMe}</span>
      </Button>

      {nearbyStatus === "loading" ||
      nearbyStatus === "error" ||
      nearbyStatus === "unsupported" ? (
        <p
          aria-live="polite"
          className={`text-center text-xs font-medium ${
            nearbyStatus === "loading" ? "text-stone-gray" : "text-premium-red"
          }`}
        >
          {nearbyStatus === "loading"
            ? translations.nearMeLoading
            : nearbyStatus === "unsupported"
              ? translations.nearMeUnsupported
              : translations.nearMeError}
        </p>
      ) : null}

      <p
        aria-live="polite"
        className="pt-1 text-center text-xs font-semibold uppercase text-stone-gray"
      >
        {resultCountLabel}
      </p>
    </div>
  );
}
