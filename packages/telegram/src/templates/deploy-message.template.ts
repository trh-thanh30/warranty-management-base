import type { CiCdNotificationPayload } from "@/telegram.types.js";
import { statusLabels, statusSymbols } from "@/templates/shared.js";
import { escapeHtml } from "@/utils/escape-html.js";

export function renderDeployMessage(payload: CiCdNotificationPayload): string {
  const lines = [
    `<b>${statusSymbols[payload.status]} Deploy ${statusLabels[payload.status]}</b>`,
    `<b>Project:</b> ${escapeHtml(payload.project)}`,
    `<b>Environment:</b> ${escapeHtml(payload.environment)}`,
  ];

  if (payload.branch) lines.push(`<b>Branch:</b> <code>${escapeHtml(payload.branch)}</code>`);
  if (payload.commitSha) lines.push(`<b>Commit:</b> <code>${escapeHtml(payload.commitSha.slice(0, 8))}</code>`);
  if (payload.author) lines.push(`<b>Author:</b> ${escapeHtml(payload.author)}`);
  if (payload.duration) lines.push(`<b>Duration:</b> ${escapeHtml(payload.duration)}`);
  if (payload.dashboardUrl) lines.push("", `<a href="${escapeHtml(payload.dashboardUrl)}">Open deployment</a>`);
  if (payload.runUrl) lines.push(`<a href="${escapeHtml(payload.runUrl)}">Open CI run</a>`);

  return lines.join("\n");
}
