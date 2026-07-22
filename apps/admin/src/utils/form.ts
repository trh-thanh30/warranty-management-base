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

export function translateFieldError(
  message: string | undefined,
  translate: (key: string) => string,
  translationKeys: ReadonlySet<string> | readonly string[],
) {
  if (!message) return undefined;

  const hasTranslation =
    "has" in translationKeys
      ? translationKeys.has(message)
      : translationKeys.includes(message);

  return hasTranslation ? translate(message) : message;
}

export function createFieldErrorFormatter(
  translationKeys: ReadonlySet<string> | readonly string[],
) {
  return (message: string | undefined, translate: (key: string) => string) =>
    translateFieldError(message, translate, translationKeys);
}
