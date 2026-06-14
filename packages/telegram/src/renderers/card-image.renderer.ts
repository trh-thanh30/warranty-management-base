import sharp from "sharp";
import type { CiCdNotificationPayload } from "@/telegram.types.js";
import { statusColors, statusLabels, statusSymbols } from "@/templates/shared.js";
import { escapeHtml } from "@/utils/escape-html.js";

function truncate(value: string | undefined, maxLength: number): string {
  if (!value) return "-";
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;
}

function metric(label: string, value: string | undefined, x: number, y: number): string {
  return `<g>
    <rect x="${x}" y="${y}" width="408" height="92" rx="18" fill="#f8fafc" stroke="#e2e8f0" />
    <text x="${x + 22}" y="${y + 34}" fill="#64748b" font-size="15" font-weight="700">${escapeHtml(label.toUpperCase())}</text>
    <text x="${x + 22}" y="${y + 66}" fill="#0f172a" font-size="24" font-weight="800">${escapeHtml(truncate(value, 25))}</text>
  </g>`;
}

export function renderCardSvg(payload: CiCdNotificationPayload): string {
  const colors = statusColors[payload.status];
  const title = payload.event === "deploy" ? "Deployment" : "CI Pipeline";
  const subtitle = `${payload.project} · ${payload.environment}`;

  return `<svg width="960" height="540" viewBox="0 0 960 540" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="960" height="540" rx="28" fill="#ffffff"/>
    <rect x="0.5" y="0.5" width="959" height="539" rx="27.5" stroke="#e2e8f0"/>
    <rect x="48" y="48" width="176" height="44" rx="22" fill="${colors.background}" stroke="${colors.border}"/>
    <text x="70" y="77" fill="${colors.text}" font-family="Arial, sans-serif" font-size="18" font-weight="800">${statusSymbols[payload.status]} ${statusLabels[payload.status]}</text>
    <text x="48" y="170" fill="#0f172a" font-family="Arial, sans-serif" font-size="58" font-weight="800">${escapeHtml(title)}</text>
    <text x="52" y="216" fill="#475569" font-family="Arial, sans-serif" font-size="24">${escapeHtml(truncate(subtitle, 58))}</text>
    ${metric("Branch", payload.branch, 48, 274)}
    ${metric("Commit", payload.commitSha?.slice(0, 8), 504, 274)}
    ${metric("Author", payload.author, 48, 392)}
    ${metric("Duration", payload.duration, 504, 392)}
  </svg>`;
}

export async function renderCardPng(payload: CiCdNotificationPayload): Promise<Buffer> {
  return sharp(Buffer.from(renderCardSvg(payload))).png().toBuffer();
}
