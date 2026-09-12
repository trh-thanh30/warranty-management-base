import type {
  WarrantyLookupFilmItems,
  WarrantyLookupResult,
} from "@repo/shared";

export function formatWarrantyDealerAddress(
  dealer:
    | NonNullable<WarrantyLookupResult["installation"]>["dealer"]
    | undefined,
): string | null {
  if (!dealer) return null;

  const seen = new Set<string>();
  const parts = [dealer.address, dealer.district, dealer.province].flatMap(
    (value) =>
      (value ?? "").split(",").flatMap((part) => {
        const text = part.trim().replace(/\s+/g, " ");
        const key = text.normalize("NFC").toLocaleLowerCase("vi");
        if (!text || seen.has(key)) return [];
        seen.add(key);
        return [text];
      }),
  );

  return parts.length ? parts.join(", ") : null;
}

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
