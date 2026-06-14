import type { TelegramStatus } from "@/telegram.types.js";

export const statusLabels: Record<TelegramStatus, string> = {
  success: "Success",
  failed: "Failed",
  running: "Running",
  cancelled: "Cancelled",
};

export const statusSymbols: Record<TelegramStatus, string> = {
  success: "✅",
  failed: "❌",
  running: "🔄",
  cancelled: "⏹",
};

export const statusColors: Record<TelegramStatus, { background: string; border: string; text: string }> = {
  success: {
    background: "#ecfdf5",
    border: "#10b981",
    text: "#047857",
  },
  failed: {
    background: "#fef2f2",
    border: "#ef4444",
    text: "#b91c1c",
  },
  running: {
    background: "#eff6ff",
    border: "#3b82f6",
    text: "#1d4ed8",
  },
  cancelled: {
    background: "#f8fafc",
    border: "#64748b",
    text: "#475569",
  },
};
