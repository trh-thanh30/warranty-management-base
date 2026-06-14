import type { CiCdNotificationPayload } from "@/telegram.types.js";
import { statusColors, statusLabels, statusSymbols } from "@/templates/shared.js";
import { escapeHtml } from "@/utils/escape-html.js";

export function renderCardHtml(payload: CiCdNotificationPayload): string {
  const colors = statusColors[payload.status];
  const title = payload.event === "deploy" ? "Deployment" : "CI Pipeline";

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body {
        margin: 0;
        background: #f8fafc;
        color: #0f172a;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      .card {
        width: 960px;
        min-height: 540px;
        padding: 48px;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 24px;
      }
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        border-radius: 999px;
        border: 1px solid ${colors.border};
        background: ${colors.background};
        color: ${colors.text};
        padding: 10px 16px;
        font-size: 18px;
        font-weight: 700;
      }
      .title {
        margin: 32px 0 12px;
        font-size: 56px;
        line-height: 1;
        font-weight: 800;
      }
      .subtitle {
        color: #475569;
        font-size: 24px;
      }
      .grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 18px;
        margin-top: 36px;
      }
      .item {
        padding: 18px;
        border-radius: 18px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
      }
      .label {
        color: #64748b;
        font-size: 15px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .value {
        margin-top: 8px;
        color: #0f172a;
        font-size: 22px;
        font-weight: 700;
      }
    </style>
  </head>
  <body>
    <main class="card">
      <div class="badge">${statusSymbols[payload.status]} ${statusLabels[payload.status]}</div>
      <h1 class="title">${escapeHtml(title)}</h1>
      <p class="subtitle">${escapeHtml(payload.project)} · ${escapeHtml(payload.environment)}</p>
      <section class="grid">
        <div class="item"><div class="label">Branch</div><div class="value">${escapeHtml(payload.branch ?? "-")}</div></div>
        <div class="item"><div class="label">Commit</div><div class="value">${escapeHtml(payload.commitSha?.slice(0, 8) ?? "-")}</div></div>
        <div class="item"><div class="label">Author</div><div class="value">${escapeHtml(payload.author ?? "-")}</div></div>
        <div class="item"><div class="label">Duration</div><div class="value">${escapeHtml(payload.duration ?? "-")}</div></div>
      </section>
    </main>
  </body>
</html>`;
}
