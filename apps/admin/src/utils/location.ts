import type { VietnamProvince } from "@/src/services/locations/locations.types";

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
