export function getNavigationBadge(count: number, hasError: boolean) {
  if (hasError || count <= 0) return null;
  return count > 99 ? "99+" : String(count);
}
