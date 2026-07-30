import type { CiCdNotificationPayload } from "@/telegram.types.js";
import { statusLabels, statusSymbols } from "@/templates/shared.js";
import { escapeHtml } from "@/utils/escape-html.js";

export function renderPublishMessage(payload: CiCdNotificationPayload): string {
  const lines = [
    `<b>${statusSymbols[payload.status]} Build &amp; Push Images ${statusLabels[payload.status]}</b>`,
    `<b>Project:</b> ${escapeHtml(payload.project)}`,
    `<b>Registry:</b> ${escapeHtml(payload.environment)}`,
  ];

  if (payload.channel)
    lines.push(`<b>Channel:</b> <code>${escapeHtml(payload.channel)}</code>`);
  if (payload.branch)
    lines.push(`<b>Branch:</b> <code>${escapeHtml(payload.branch)}</code>`);
  if (payload.commitSha)
    lines.push(
      `<b>Image tag:</b> <code>${escapeHtml(payload.commitSha.slice(0, 8))}</code>`,
    );
  if (payload.commitMessage)
    lines.push(`<b>Images:</b> ${escapeHtml(payload.commitMessage)}`);
  if (payload.author)
    lines.push(`<b>Author:</b> ${escapeHtml(payload.author)}`);
  if (payload.duration)
    lines.push(`<b>Duration:</b> ${escapeHtml(payload.duration)}`);
  if (payload.runUrl)
    lines.push(`<a href="${escapeHtml(payload.runUrl)}">Open CI run</a>`);

  return lines.join("\n");
}
