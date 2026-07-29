export function getInitials(value: string, maxCharacters = 2): string {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, maxCharacters)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}
