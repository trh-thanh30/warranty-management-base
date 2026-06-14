import type { CiCdNotificationPayload } from "@/telegram.types.js";
import { renderCiMessage } from "@/templates/ci-message.template.js";
import { renderDeployMessage } from "@/templates/deploy-message.template.js";

export function renderTelegramHtmlMessage(payload: CiCdNotificationPayload): string {
  return payload.event === "deploy" ? renderDeployMessage(payload) : renderCiMessage(payload);
}
