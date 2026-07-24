import type { StorageUsageSummary } from "@repo/shared";
import type { StorageBucketKey } from "./system.types";

const STORAGE_BUCKET_KEYS: StorageBucketKey[] = ["public", "private", "temp"];

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

export function getStorageBucketDistribution(usage: StorageUsageSummary) {
  return STORAGE_BUCKET_KEYS.map((key) => {
    const bucket = usage.buckets[key];
    const share =
      usage.totalBytes > 0
        ? Math.round((bucket.bytes / usage.totalBytes) * 1000) / 10
        : 0;

    return {
      ...bucket,
      key,
      share,
    };
  });
}
