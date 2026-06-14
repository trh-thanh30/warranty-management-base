import type { CiCdNotificationPayload } from "@/telegram.types.js";
import { statusSymbols } from "@/templates/shared.js";
import { escapeHtml } from "@/utils/escape-html.js";

function link(label: string, url: string | undefined): string {
  if (!url) return escapeHtml(label);
  return `<a href="${escapeHtml(url)}">${escapeHtml(label)}</a>`;
}

function renderCommit(payload: CiCdNotificationPayload): string | undefined {
  if (!payload.commitSha) return undefined;
  return link(payload.commitSha.slice(0, 8), payload.commitUrl);
}

function renderJobStatus(status: string): string {
  if (status === "success") return "SUCCESS";
  if (status === "failed") return "FAILED";
  if (status === "running") return "IN PROGRESS";
  return "CANCELLED";
}

function renderJobs(payload: CiCdNotificationPayload): string[] {
  const jobs = payload.jobs?.length
    ? payload.jobs
    : payload.job
      ? [{ name: payload.job, status: payload.status, duration: payload.duration }]
      : [];

  if (!jobs.length) return [];

  const lines = ["", `<b>Jobs (${jobs.length}):</b>`];

  for (const job of jobs) {
    lines.push(
      `- ${statusSymbols[job.status]} ${link(job.name, job.url)} ${escapeHtml(job.duration ?? "N/A")} · ${renderJobStatus(job.status)}:`,
    );

    if (job.steps?.length) {
      const steps = job.steps
        .map((step) => `  - ${statusSymbols[step.status]} ${step.name} (${step.duration ?? "N/A"})`)
        .join("\n");
      lines.push(`<pre><code>${escapeHtml(steps)}</code></pre>`);
    }
  }

  return lines;
}

function renderTotals(payload: CiCdNotificationPayload): string | undefined {
  const totals = payload.totals;
  if (!totals) return undefined;

  return [
    "Totals",
    `✅ ${totals.passed ?? 0}`,
    `❌ ${totals.failed ?? 0}`,
    `🔄 ${totals.running ?? 0}`,
    `⏹ ${totals.cancelled ?? 0}`,
  ].join(" · ");
}

export function renderCiMessage(payload: CiCdNotificationPayload): string {
  const commit = renderCommit(payload);
  const repositoryLabel = payload.repository ?? payload.project;
  const lines = [
    `<b>${statusSymbols[payload.status]} CI/CD Notification</b>`,
    "",
    `<b>Workflow:</b> ${escapeHtml(payload.workflow ?? "CI")}`,
    `<b>Project:</b> ${escapeHtml(payload.project)}`,
    `<b>Status:</b> ${statusSymbols[payload.status]} ${renderJobStatus(payload.status)}`,
    "",
    `- <b>Repository:</b> ${link(repositoryLabel, payload.repositoryUrl)}`,
  ];

  if (payload.branch) lines.push(`- <b>Branch:</b> <code>${escapeHtml(payload.branch)}</code>`);
  if (payload.author) lines.push(`- <b>Actor:</b> ${link(payload.author, payload.actorUrl)}`);
  if (commit) lines.push(`- <b>Commit:</b> ${commit}`);
  if (payload.commitMessage) {
    lines.push("- <b>Message:</b>", `<pre><code>${escapeHtml(payload.commitMessage)}</code></pre>`);
  }

  lines.push(...renderJobs(payload));

  const totals = renderTotals(payload);
  if (totals) lines.push("", escapeHtml(totals));

  if (payload.runUrl) lines.push("", link("View Workflow Run", payload.runUrl));

  if (payload.repositoryUrl) {
    lines.push("", payload.repositoryUrl);
  }

  return lines.join("\n");
}
