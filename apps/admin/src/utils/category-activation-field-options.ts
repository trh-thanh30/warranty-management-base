import type { CategoryActivationFieldOption } from "@repo/shared";

export function parseActivationFieldOptionsText(
  value: string,
): CategoryActivationFieldOption[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [rawLabel, rawValue] = line.split("|").map((item) => item.trim());
      const label = rawLabel ?? "";
      const optionValue = rawValue ?? "";
      return {
        label,
        value: optionValue || label,
      };
    });
}
