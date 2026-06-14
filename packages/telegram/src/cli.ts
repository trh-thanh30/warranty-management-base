#!/usr/bin/env node
/* eslint-disable turbo/no-undeclared-env-vars */
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { renderCardHtml } from "@/renderers/card-html.renderer.js";
import { renderCardPng } from "@/renderers/card-image.renderer.js";
import { renderTelegramHtmlMessage } from "@/renderers/html-message.renderer.js";
import { TelegramClient } from "@/telegram.client.js";
import type {
  CiCdNotificationPayload,
  TelegramEventType,
  TelegramJobSummary,
  TelegramNotifyMode,
  TelegramStatus,
} from "@/telegram.types.js";
import { requiredEnv } from "@/utils/env.js";

type CliOptions = Record<string, string | boolean>;

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token?.startsWith("--")) continue;

    const [rawKey, inlineValue] = token.slice(2).split("=");
    const nextValue = argv[index + 1];

    if (!rawKey) continue;

    if (inlineValue !== undefined) {
      options[rawKey] = inlineValue;
    } else if (nextValue && !nextValue.startsWith("--")) {
      options[rawKey] = nextValue;
      index += 1;
    } else {
      options[rawKey] = true;
    }
  }

  return options;
}

function stringOption(options: CliOptions, key: string, fallback?: string): string | undefined {
  const value = options[key];
  return typeof value === "string" ? value : fallback;
}

function modeOption(value: string | undefined): TelegramNotifyMode {
  if (value === "image" || value === "both") return value;
  return "text";
}

function statusOption(value: string | undefined): TelegramStatus {
  if (value === "failed" || value === "running" || value === "cancelled") return value;
  return "success";
}

function eventOption(value: string | undefined): TelegramEventType {
  return value === "deploy" ? "deploy" : "ci";
}

function parseJobs(value: string | undefined): TelegramJobSummary[] | undefined {
  if (!value) return undefined;

  const parsed = JSON.parse(value) as TelegramJobSummary[];
  if (!Array.isArray(parsed)) {
    throw new Error("--jobs-json must be a JSON array");
  }

  return parsed;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const mode = modeOption(stringOption(options, "mode"));
  const repository = stringOption(options, "repository", process.env.GITHUB_REPOSITORY);
  const repositoryUrl =
    stringOption(options, "repository-url") ??
    (repository ? `${process.env.GITHUB_SERVER_URL ?? "https://github.com"}/${repository}` : undefined);
  const commitSha = stringOption(options, "commit", process.env.GITHUB_SHA);
  const author = stringOption(options, "author", process.env.GITHUB_ACTOR);
  const payload: CiCdNotificationPayload = {
    event: eventOption(stringOption(options, "event")),
    status: statusOption(stringOption(options, "status")),
    project: stringOption(options, "project") ?? repository ?? "unknown-project",
    environment: stringOption(options, "environment") ?? "ci",
    branch: stringOption(options, "branch", process.env.GITHUB_REF_NAME),
    repository,
    repositoryUrl,
    commitSha,
    commitUrl: commitSha && repositoryUrl ? `${repositoryUrl}/commit/${commitSha}` : undefined,
    commitMessage: stringOption(options, "message"),
    author,
    actorUrl: stringOption(options, "actor-url") ?? (author ? `${process.env.GITHUB_SERVER_URL ?? "https://github.com"}/${author}` : undefined),
    workflow: stringOption(options, "workflow", process.env.GITHUB_WORKFLOW),
    job: stringOption(options, "job", process.env.GITHUB_JOB),
    jobs: parseJobs(stringOption(options, "jobs-json")),
    duration: stringOption(options, "duration"),
    totals: {
      passed: Number(stringOption(options, "passed") ?? 0),
      failed: Number(stringOption(options, "failed") ?? 0),
      running: Number(stringOption(options, "running") ?? 0),
      cancelled: Number(stringOption(options, "cancelled") ?? 0),
    },
    runUrl: stringOption(options, "run-url"),
    dashboardUrl: stringOption(options, "dashboard-url"),
    createdAt: new Date(),
  };

  if (options["dry-run"]) {
    console.log(renderTelegramHtmlMessage(payload));

    if (mode === "image" || mode === "both") {
      const previewDir = process.env.INIT_CWD ?? process.cwd();
      await writeFile(join(previewDir, "telegram-notification.preview.html"), renderCardHtml(payload));
      await writeFile(join(previewDir, "telegram-notification.preview.png"), await renderCardPng(payload));
      console.log("Wrote telegram-notification.preview.html and telegram-notification.preview.png");
    }

    return;
  }

  const client = new TelegramClient({
    botToken: requiredEnv("CI_TELEGRAM_BOT_TOKEN"),
    chatId: requiredEnv("CI_TELEGRAM_CHAT_ID"),
  });

  if (mode === "text" || mode === "both") {
    await client.sendMessage({ text: renderTelegramHtmlMessage(payload) });
  }

  if (mode === "image" || mode === "both") {
    await client.sendPhoto({
      photo: await renderCardPng(payload),
      filename: `${payload.event}-${payload.status}.png`,
      caption: renderTelegramHtmlMessage(payload),
    });
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
