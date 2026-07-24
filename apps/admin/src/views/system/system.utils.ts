export function formatBytes(bytes: number, locale: string): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"] as const;
  const unitIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** unitIndex;

  return `${new Intl.NumberFormat(locale, {
    maximumFractionDigits: value >= 100 ? 0 : value >= 10 ? 1 : 2,
  }).format(value)} ${units[unitIndex]}`;
}

export function formatCount(value: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(value);
}

export function clampPercentage(value: number | null): number {
  if (value === null || !Number.isFinite(value)) return 0;
  return Math.min(Math.max(value, 0), 100);
}
