import type { VietnamProvince } from "@/src/services/locations/locations.types";

type VietnamAddressSelection = {
  province: string;
  ward: string;
};

type FillVietnamAddressSelectionInput = VietnamAddressSelection & {
  currentAddress: string;
  previousSelection: string;
};

export function getVietnamAddressSelection({
  province,
  ward,
}: VietnamAddressSelection): string {
  return [ward.trim(), province.trim()].filter(Boolean).join(", ");
}

export function fillVietnamAddressSelection({
  currentAddress,
  previousSelection,
  province,
  ward,
}: FillVietnamAddressSelectionInput): string {
  const current = currentAddress.trim();
  const previous = previousSelection.trim();
  const next = getVietnamAddressSelection({ province, ward });

  if (!next) return current;
  if (!current || current === previous) return next;
  if (current.endsWith(next)) return current;

  if (previous && current.endsWith(previous)) {
    const detail = current
      .slice(0, -previous.length)
      .replace(/,\s*$/, "")
      .trim();
    return [detail, next].filter(Boolean).join(", ");
  }

  return `${current}, ${next}`;
}

export function parseVietnamAddress(
  address: string,
  provinces: VietnamProvince[],
) {
  const province = provinces.find((item) => address.includes(item.name));
  const parts = address
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const provinceName = province?.name;
  const provinceIndex = provinceName ? parts.indexOf(provinceName) : -1;
  const wardName =
    provinceIndex > 0
      ? parts[provinceIndex - 1]
      : parts.length >= 2
        ? parts.at(-2)
        : null;
  const detail = parts
    .filter((part) => part !== provinceName && part !== wardName)
    .join(", ");

  return {
    detail: detail || address,
    province,
    wardName,
  };
}
