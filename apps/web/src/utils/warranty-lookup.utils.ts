import type { WarrantyLookupFilmItems } from "@repo/shared";

export const warrantyFilmPositionKeys = [
  "windshield",
  "frontLeftSide",
  "frontRightSide",
  "rearLeftSide",
  "rearRightSide",
  "sunroof",
  "rearGlass",
] as const satisfies ReadonlyArray<keyof WarrantyLookupFilmItems>;

export function getPopulatedWarrantyFilmItems(
  filmItems: WarrantyLookupFilmItems | null,
) {
  if (!filmItems) return [];

  return warrantyFilmPositionKeys.flatMap((key) => {
    const value = filmItems[key]?.trim();
    return value ? [{ key, value }] : [];
  });
}
