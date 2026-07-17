export function toOptionalValue(
  value: string | null | undefined,
): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

export function toNullableValue(
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed || null;
}

export function toRequiredValue(value: string | null | undefined): string {
  if (!value) return "";
  return value.trim();
}
