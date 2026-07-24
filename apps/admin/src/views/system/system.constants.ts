import type { StorageAlertLevel } from "@repo/shared";
import {
  CircleCheck,
  CircleHelp,
  Globe2,
  LockKeyhole,
  ShieldAlert,
  Siren,
  TimerReset,
  TriangleAlert,
} from "lucide-react";

export const storageBuckets = [
  { icon: Globe2, key: "public" },
  { icon: LockKeyhole, key: "private" },
  { icon: TimerReset, key: "temp" },
] as const;

export const storageBucketChartStyles = {
  public: {
    dotClassName: "bg-blue-600 dark:bg-blue-400",
    theme: { dark: "#60a5fa", light: "#2563eb" },
  },
  private: {
    dotClassName: "bg-slate-600 dark:bg-slate-400",
    theme: { dark: "#94a3b8", light: "#475569" },
  },
  temp: {
    dotClassName: "bg-amber-600 dark:bg-amber-400",
    theme: { dark: "#fbbf24", light: "#d97706" },
  },
} as const;

export const storageAlertConfig = {
  UNCONFIGURED: {
    badgeVariant: "secondary",
    barClassName: "bg-slate-400 dark:bg-slate-500",
    icon: CircleHelp,
  },
  NORMAL: {
    badgeVariant: "success",
    barClassName: "bg-emerald-500",
    icon: CircleCheck,
  },
  WARNING: {
    badgeVariant: "warning",
    barClassName: "bg-amber-500",
    icon: TriangleAlert,
  },
  CRITICAL: {
    badgeVariant: "destructive",
    barClassName: "bg-orange-600",
    icon: ShieldAlert,
  },
  EMERGENCY: {
    badgeVariant: "destructive",
    barClassName: "bg-red-600",
    icon: Siren,
  },
} as const satisfies Record<
  StorageAlertLevel,
  {
    badgeVariant: "secondary" | "success" | "warning" | "destructive";
    barClassName: string;
    icon: typeof CircleCheck;
  }
>;
