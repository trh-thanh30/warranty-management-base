import type { CiCdNotificationPayload } from "@/telegram.types.js";
import { renderCiMessage } from "@/templates/ci-message.template.js";
import { renderDeployMessage } from "@/templates/deploy-message.template.js";
import { renderPublishMessage } from "@/templates/publish-message.template.js";

export function renderTelegramHtmlMessage(
  payload: CiCdNotificationPayload,
): string {
  if (payload.event === "deploy") return renderDeployMessage(payload);
  if (payload.event === "publish") return renderPublishMessage(payload);
  return renderCiMessage(payload);
}
